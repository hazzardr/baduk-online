package api

import (
	"errors"
	"net/http"

	"github.com/hazzardr/go-baduk/internal/data"

	"github.com/go-chi/chi/v5"
)

func (api *API) handleGetUserByEmail(w http.ResponseWriter, r *http.Request) {
	email := chi.URLParam(r, "email")
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, data.ErrNoUserFound) {
			api.errorResponse(w, r, 404, err)
			return
		}
		api.errorResponse(w, r, 500, "failed to retrieve user")
		return
	}
	api.writeJSON(w, 200, user, nil)
}
