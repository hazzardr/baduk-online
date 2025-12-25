package api

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/validator"
)

// handleExistingSession checks if a user already has an active session.
// Returns true if the request was fully handled (response sent), false to continue processing.
func (api *API) handleExistingSession(w http.ResponseWriter, r *http.Request, inputEmail string) bool {
	existingEmail := api.sessionManager.GetString(r.Context(), string(userContextKey))
	if existingEmail == "" {
		return false // No existing session, continue with normal login
	}

	if existingEmail == inputEmail {
		// Same user trying to login again - just return success
		api.respondWithExistingSession(w, r, existingEmail)
		return true
	}

	// Different user - require explicit logout first
	slog.Warn("login attempt while logged in as different user",
		"current_user", existingEmail,
		"attempted_user", inputEmail,
		"ip", r.RemoteAddr)
	api.errorResponse(w, r, http.StatusConflict,
		"already logged in as different user, please logout first")
	return true
}

// respondWithExistingSession returns user details for an already-logged-in user.
func (api *API) respondWithExistingSession(w http.ResponseWriter, r *http.Request, email string) {
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	slog.Info("user already logged in", "email", email, "ip", r.RemoteAddr)

	userDetails := map[string]any{
		"name":      user.Name,
		"email":     user.Email,
		"validated": user.Validated,
	}

	err = api.writeJSON(w, http.StatusOK, userDetails, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}

// authenticateUser validates credentials and returns the user.
// Returns nil user if authentication fails (response already sent).
func (api *API) authenticateUser(w http.ResponseWriter, r *http.Request, email, password string) *data.User {
	v := validator.New()
	data.ValidateEmail(v, email)
	data.ValidatePasswordPlaintext(v, password)
	if !v.Valid() {
		api.failedValidationResponse(w, r, v.Errors)
		return nil
	}

	// Get user by email
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			slog.Warn("failed login attempt", "ip", r.RemoteAddr, "email", email, "error", "user not found")
			v.AddError("email", "invalid email or password")
			api.failedValidationResponse(w, r, v.Errors)
		} else {
			api.serverErrorResponse(w, r, err)
		}
		return nil
	}

	// Check password
	match, err := user.Password.Matches(password)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return nil
	}

	if !match {
		slog.Warn("failed login attempt", "ip", r.RemoteAddr, "email", email, "error", "invalid password")
		v.AddError("email", "invalid email or password")
		api.failedValidationResponse(w, r, v.Errors)
		return nil
	}

	return user
}

// createSessionAndRespond creates a session for the user and sends the response.
func (api *API) createSessionAndRespond(w http.ResponseWriter, r *http.Request, user *data.User) {
	api.sessionManager.Put(r.Context(), string(userContextKey), user.Email)

	slog.Info("user logged in", "email", user.Email, "ip", r.RemoteAddr)

	userDetails := map[string]any{
		"name":      user.Name,
		"email":     user.Email,
		"validated": user.Validated,
	}

	err := api.writeJSON(w, http.StatusOK, userDetails, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}
