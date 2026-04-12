package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/validator"
	"github.com/labstack/echo/v5"
)

func (api *API) handleGetLoggedInUser(c *echo.Context) error {
	user, err := api.getUserFromContext(c.Request())
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			return api.unauthenticatedResponse(c)
		}
		return api.serverErrorResponse(c, errors.Join(errors.New("failed to retrieve user data from context"), err))
	}
	return c.JSON(http.StatusOK, user)
}

// handleCreateUser will create a user in the database and attempt to send a registration email asynchronously.
func (api *API) handleCreateUser(c *echo.Context) error {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := readJSON(c.Request(), &input)
	if err != nil {
		return api.badRequestResponse(c, err)
	}

	user := &data.User{
		Name:      input.Name,
		Email:     input.Email,
		Validated: false,
	}

	err = user.Password.Set(input.Password)
	if err != nil {
		return api.serverErrorResponse(c, err)
	}

	v := validator.New()
	if data.ValidateUser(v, user); !v.Valid() {
		return api.failedValidationResponse(c, v.Errors)
	}

	err = api.db.Users.Insert(c.Request().Context(), user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrDuplicateEmail):
			return api.errorResponse(c, http.StatusConflict, "a user with this email address already exists")
		default:
			return api.serverErrorResponse(c, err)
		}
	}

	api.background(func() {
		err = api.mailer.SendRegistrationEmail(context.Background(), user)
		if err != nil {
			slog.Error("failed to send registration email", "user", user.Email, "err", err)
		}
	})

	return c.JSON(http.StatusCreated, user)
}

// handleSendRegistrationEmail sends a registration email based on the email address in the payload.
func (api *API) handleSendRegistrationEmail(c *echo.Context) error {
	user, err := api.getUserFromContext(c.Request())
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			return api.unauthenticatedResponse(c)
		}
		return api.serverErrorResponse(c, errors.Join(errors.New("failed to retrieve user data from context"), err))
	}
	err = api.mailer.SendRegistrationEmail(c.Request().Context(), user)
	if err != nil {
		slog.Error("failed to send registration email", "user", user.Email, "err", err)
		return api.serverErrorResponse(c, err)
	}
	return nil
}

// handleRegisterUser takes an activation token and determines if there are any users
// associated with it. If so, the user is now activated.
func (api *API) handleRegisterUser(c *echo.Context) error {
	var input struct {
		Token string `json:"token"`
	}
	err := readJSON(c.Request(), &input)
	if err != nil {
		return api.badRequestResponse(c, err)
	}

	v := validator.New()
	data.ValidateRegistrationToken(v, input.Token)
	if !v.Valid() {
		return api.failedValidationResponse(c, v.Errors)
	}

	ctx := c.Request().Context()

	user, err := api.db.Registration.GetUserFromToken(ctx, input.Token)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			// Log failed activation attempt for security auditing
			slog.Warn("failed activation attempt",
				"ip", c.Request().RemoteAddr,
				"token_prefix", input.Token[:min(6, len(input.Token))],
				"error", "invalid or expired token")
			v.AddError("token", "invalid or expired access token")
			return api.failedValidationResponse(c, v.Errors)
		}
		return api.serverErrorResponse(c, err)
	}

	user.Validated = true

	err = api.db.Users.Update(ctx, user)
	if err != nil {
		if errors.Is(err, data.ErrEditConflict) {
			return api.dataConflictResponse(c, err)
		}
		return api.serverErrorResponse(c, err)
	}

	err = api.db.Registration.RevokeTokensForUser(ctx, int64(user.ID))
	if err != nil {
		return api.serverErrorResponse(c, err)
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

	return c.JSON(http.StatusOK, userDetails)
}

// handleLogin authenticates a user with email and password, creating a session on success.
func (api *API) handleLogin(c *echo.Context) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := readJSON(c.Request(), &input)
	if err != nil {
		return api.badRequestResponse(c, err)
	}

	// Check if user already has an active session
	if handled, resp := api.handleExistingSession(c, input.Email); handled {
		return resp
	}

	// Authenticate user credentials
	user, resp := api.authenticateUser(c, input.Email, input.Password)
	if user == nil {
		return resp
	}

	// Create session and send success response
	return api.createSessionAndRespond(c, user)
}

// handleLogout destroys the user's session.
func (api *API) handleLogout(c *echo.Context) error {
	// Get user email before destroying session (for logging)
	email := api.sessionManager.GetString(c.Request().Context(), string(userContextKey))

	// Destroy session
	err := api.sessionManager.Destroy(c.Request().Context())
	if err != nil {
		return api.serverErrorResponse(c, err)
	}

	// Log successful logout
	if email != "" {
		slog.Info("user logged out", "email", email, "ip", c.Request().RemoteAddr)
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "logged out successfully"})
}
