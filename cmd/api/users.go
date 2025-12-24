package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/validator"
)

func (api *API) handleGetLoggedInUser(w http.ResponseWriter, r *http.Request) {
	user, err := api.getUserFromContext(r)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			api.unauthenticatedResponse(w, r)
		} else {
			api.serverErrorResponse(w, r, errors.Join(errors.New("failed to retrieve user data from context"), err))
		}
		return
	}
	err = api.writeJSON(w, 200, user, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}

// handleCreateUser will create a user in the database and attempt to send a registration email asynchronously.
func (api *API) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := api.readJSON(w, r, &input)
	if err != nil {
		api.badRequestResponse(w, r, err)
		return
	}
	user := &data.User{
		Name:      input.Name,
		Email:     input.Email,
		Validated: false,
	}

	err = user.Password.Set(input.Password)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	v := validator.New()
	if data.ValidateUser(v, user); !v.Valid() {
		api.failedValidationResponse(w, r, v.Errors)
		return
	}

	err = api.db.Users.Insert(r.Context(), user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrDuplicateEmail):
			api.errorResponse(w, r, http.StatusConflict, "a user with this email address already exists")
		default:
			api.serverErrorResponse(w, r, err)
		}
		return
	}
	err = api.writeJSON(w, http.StatusCreated, user, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	api.background(func() {
		err = api.mailer.SendRegistrationEmail(context.Background(), user)
		if err != nil {
			slog.Error("failed to send registration email", "user", user.Email, "err", err)
		}
	})
}

// handleSendRegistrationEmail sends a registration email based on the email address in the payload.
func (api *API) handleSendRegistrationEmail(w http.ResponseWriter, r *http.Request) {
	user, err := api.getUserFromContext(r)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			api.unauthenticatedResponse(w, r)
		} else {
			api.serverErrorResponse(w, r, errors.Join(errors.New("failed to retrieve user data from context"), err))
		}
		return
	}
	err = api.mailer.SendRegistrationEmail(r.Context(), user)
	if err != nil {
		slog.Error("failed to send registration email", "user", user.Email, "err", err)
		api.serverErrorResponse(w, r, err)
		return
	}
}

// handleRegisterUser takes an activation token and determines if there are any users
// associated with it. If so, the user is now activated.
func (api *API) handleRegisterUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Token string `json:"token"`
	}
	err := api.readJSON(w, r, &input)
	if err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	v := validator.New()
	data.ValidateRegistrationToken(v, input.Token)
	if !v.Valid() {
		api.failedValidationResponse(w, r, v.Errors)
		return
	}

	ctx := context.Background()

	user, err := api.db.Registration.GetUserFromToken(ctx, input.Token)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			// Log failed activation attempt for security auditing
			slog.Warn("failed activation attempt",
				"ip", r.RemoteAddr,
				"token_prefix", input.Token[:min(6, len(input.Token))],
				"error", "invalid or expired token")
			v.AddError("token", "invalid or expired access token")
			api.failedValidationResponse(w, r, v.Errors)
		} else {
			api.serverErrorResponse(w, r, err)
		}
		return
	}

	user.Validated = true

	err = api.db.Users.Update(ctx, user)
	if err != nil {
		if errors.Is(err, data.ErrEditConflict) {
			api.dataConflictResponse(w, r, err)
		} else {
			api.serverErrorResponse(w, r, err)
		}
		return
	}

	err = api.db.Registration.RevokeTokensForUser(ctx, int64(user.ID))
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	// Send activation confirmation email asynchronously
	api.background(func() {
		err := api.mailer.SendAccountActivatedEmail(context.Background(), user)
		if err != nil {
			slog.Error("failed to send account activated email", "user", user.Email, "err", err)
		}
	})

	userDetails := map[string]any{
		"name":      user.Name,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
		"validated": user.Validated,
	}

	err = api.writeJSON(w, http.StatusOK, userDetails, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}
}

// handleLogin authenticates a user with email and password, creating a session on success.
func (api *API) handleLogin(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := api.readJSON(w, r, &input)
	if err != nil {
		api.badRequestResponse(w, r, err)
		return
	}

	// Check if user already has an active session
	existingEmail := api.sessionManager.GetString(r.Context(), string(userContextKey))
	if existingEmail != "" {
		// User is already logged in
		if existingEmail == input.Email {
			// Same user trying to login again - just return success
			user, err := api.db.Users.GetByEmail(r.Context(), existingEmail)
			if err != nil {
				api.serverErrorResponse(w, r, err)
				return
			}

			slog.Info("user already logged in", "email", existingEmail, "ip", r.RemoteAddr)

			userDetails := map[string]any{
				"name":      user.Name,
				"email":     user.Email,
				"validated": user.Validated,
			}

			err = api.writeJSON(w, http.StatusOK, userDetails, nil)
			if err != nil {
				api.serverErrorResponse(w, r, err)
			}
			return
		} else {
			// Different user - require explicit logout first
			slog.Warn("login attempt while logged in as different user",
				"current_user", existingEmail,
				"attempted_user", input.Email,
				"ip", r.RemoteAddr)
			api.errorResponse(w, r, http.StatusConflict,
				"already logged in as different user, please logout first")
			return
		}
	}

	// No existing session - proceed with normal login flow
	v := validator.New()
	data.ValidateEmail(v, input.Email)
	data.ValidatePasswordPlaintext(v, input.Password)
	if !v.Valid() {
		api.failedValidationResponse(w, r, v.Errors)
		return
	}

	// Get user by email
	user, err := api.db.Users.GetByEmail(r.Context(), input.Email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			// Log failed login attempt
			slog.Warn("failed login attempt", "ip", r.RemoteAddr, "email", input.Email, "error", "user not found")
			v.AddError("email", "invalid email or password")
			api.failedValidationResponse(w, r, v.Errors)
		} else {
			api.serverErrorResponse(w, r, err)
		}
		return
	}

	// Check password
	match, err := user.Password.Matches(input.Password)
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	if !match {
		// Log failed login attempt
		slog.Warn("failed login attempt", "ip", r.RemoteAddr, "email", input.Email, "error", "invalid password")
		v.AddError("email", "invalid email or password")
		api.failedValidationResponse(w, r, v.Errors)
		return
	}

	api.sessionManager.Put(r.Context(), string(userContextKey), user.Email)

	slog.Info("user logged in", "email", user.Email, "ip", r.RemoteAddr)

	// Return user info
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

// handleLogout destroys the user's session.
func (api *API) handleLogout(w http.ResponseWriter, r *http.Request) {
	// Get user email before destroying session (for logging)
	email := api.sessionManager.GetString(r.Context(), string(userContextKey))

	// Destroy session
	err := api.sessionManager.Destroy(r.Context())
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	// Log successful logout
	if email != "" {
		slog.Info("user logged out", "email", email, "ip", r.RemoteAddr)
	}

	// Return success response
	response := map[string]string{
		"message": "logged out successfully",
	}

	err = api.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}
