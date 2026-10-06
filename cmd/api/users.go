package api

import (
	"errors"
	"net/http"

	"github.com/hazzardr/baduk-online/internal/data"
)

func (api *API) handleGetLoggedInUser(w http.ResponseWriter, r *http.Request) {
	user, err := api.getUserFromContext(r)
	if err != nil {
		if errors.Is(err, errUserUnauthenticated) || errors.Is(err, data.ErrNoUserFound) {
			api.unauthenticatedResponse(w, r)
		} else {
			api.serverErrorResponse(w, r, errors.Join(errors.New("failed to retrieve user data from context"), err))
		}
		return
	}
	err = api.writeJSON(w, http.StatusOK, user, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}
