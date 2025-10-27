package api

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/validator"

	"github.com/go-chi/chi/v5"
)

func (api *API) handleGetUserByEmail(w http.ResponseWriter, r *http.Request) {
	email := chi.URLParam(r, "email")
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			api.errorResponse(w, r, http.StatusNotFound, "user not found")
			return
		}
		slog.Error("failed to query user details", "email", email, "err", err)
		api.errorResponse(w, r, http.StatusInternalServerError, "failed to retrieve user")
		return
	}
	api.writeJSON(w, 200, user, nil)
}

// handleCreateUser will create a user in the database and attempt to send a registration email asynchronously
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
		err = api.mailer.SendRegistrationEmail(r.Context(), user)
		if err != nil {
			slog.Error("failed to send registration email", "user", user.Email, "err", err)
		}
	})
}

// handleSendRegistrationEmail sends a registration email based on the email address in the payload
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
