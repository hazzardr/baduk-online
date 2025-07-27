package api

import (
	"errors"
	"net/http"

	"github.com/hazzardr/go-baduk/internal/data"
	"github.com/hazzardr/go-baduk/internal/validator"

	"github.com/go-chi/chi/v5"
)

func (api *API) handleGetUserByEmail(w http.ResponseWriter, r *http.Request) {
	email := chi.URLParam(r, "email")
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			api.errorResponse(w, r, http.StatusNotFound, err.Error())
			return
		}
		api.errorResponse(w, r, http.StatusInternalServerError, "failed to retrieve user")
		return
	}
	api.writeJSON(w, 200, user, nil)
}

func (api *API) handleRegisterUser(w http.ResponseWriter, r *http.Request) {
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
		api.errorResponse(w, r, http.StatusInternalServerError, "internal server error occurred")
	}

	v := validator.New()
	if data.ValidateUser(v, user); !v.Valid() {
		api.failedValidation(w, r, v.Errors)
		return
	}

	err = api.db.Users.Insert(r.Context(), user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrDuplicateEmail):
			api.errorResponse(w, r, http.StatusConflict, "a user with this email address already exists")
		default:
			api.errorResponse(w, r, http.StatusInternalServerError, err.Error())
		}
		return
	}

	err = api.writeJSON(w, http.StatusCreated, user, nil)
	if err != nil {
		api.errorResponse(w, r, http.StatusInternalServerError, err.Error())
	}

}
