package api

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/validator"
	"github.com/labstack/echo/v5"
)

// handleExistingSession checks if a user already has an active session.
// Returns (true, response) if the request was fully handled, (false, nil) to continue processing.
func (api *API) handleExistingSession(c *echo.Context, inputEmail string) (bool, error) {
	existingEmail := api.sessionManager.GetString(c.Request().Context(), string(userContextKey))
	if existingEmail == "" {
		return false, nil // No existing session, continue with normal login
	}

	if existingEmail == inputEmail {
		// Same user trying to login again - just return success
		return true, api.respondWithExistingSession(c, existingEmail)
	}

	// Different user - require explicit logout first
	slog.Warn("login attempt while logged in as different user",
		"current_user", existingEmail,
		"attempted_user", inputEmail,
		"ip", c.Request().RemoteAddr)
	return true, api.errorResponse(c, http.StatusConflict,
		"already logged in as different user, please logout first")
}

// respondWithExistingSession returns user details for an already-logged-in user.
func (api *API) respondWithExistingSession(c *echo.Context, email string) error {
	user, err := api.db.Users.GetByEmail(c.Request().Context(), email)
	if err != nil {
		return api.serverErrorResponse(c, err)
	}

	slog.Info("user already logged in", "email", email, "ip", c.Request().RemoteAddr)

	userDetails := map[string]any{
		"name":      user.Name,
		"email":     user.Email,
		"validated": user.Validated,
	}

	return c.JSON(http.StatusOK, userDetails)
}

// authenticateUser validates credentials and returns the user.
// Returns (nil, errorResponse) if authentication fails.
func (api *API) authenticateUser(c *echo.Context, email, password string) (*data.User, error) {
	v := validator.New()
	data.ValidateEmail(v, email)
	data.ValidatePasswordPlaintext(v, password)
	if !v.Valid() {
		return nil, api.failedValidationResponse(c, v.Errors)
	}

	// Get user by email
	user, err := api.db.Users.GetByEmail(c.Request().Context(), email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			slog.Warn("failed login attempt", "ip", c.Request().RemoteAddr, "email", email, "error", "user not found")
			v.AddError("email", "invalid email or password")
			return nil, api.failedValidationResponse(c, v.Errors)
		}
		return nil, api.serverErrorResponse(c, err)
	}

	// Check password
	match, err := user.Password.Matches(password)
	if err != nil {
		return nil, api.serverErrorResponse(c, err)
	}

	if !match {
		slog.Warn("failed login attempt", "ip", c.Request().RemoteAddr, "email", email, "error", "invalid password")
		v.AddError("email", "invalid email or password")
		return nil, api.failedValidationResponse(c, v.Errors)
	}

	// Check if user is activated
	if !user.Validated {
		slog.Warn("failed login attempt", "ip", c.Request().RemoteAddr, "email", email, "error", "account not activated")
		v.AddError("email", "your account has not been activated yet. Please check your email.")
		return nil, api.failedValidationResponse(c, v.Errors)
	}

	return user, nil
}

// createSessionAndRespond creates a session for the user and sends the response.
func (api *API) createSessionAndRespond(c *echo.Context, user *data.User) error {
	api.sessionManager.Put(c.Request().Context(), string(userContextKey), user.Email)

	slog.Info("user logged in", "email", user.Email, "ip", c.Request().RemoteAddr)

	userDetails := map[string]any{
		"name":      user.Name,
		"email":     user.Email,
		"validated": user.Validated,
	}

	return c.JSON(http.StatusOK, userDetails)
}
