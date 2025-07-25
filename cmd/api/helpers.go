package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func (api *API) writeJSON(w http.ResponseWriter, status int, data any, headers http.Header) error {
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	for key, val := range headers {
		w.Header()[key] = val
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	return err
}

func (api *API) errorResponse(w http.ResponseWriter, r *http.Request, status int, data any) {
	err := api.writeJSON(w, status, data, nil)
	if err != nil {
		slog.Error(err.Error(), "method", r.Method, "uri", r.URL.RequestURI())
		w.WriteHeader(500)
	}
}

func (api *API) failedValidation(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	api.errorResponse(w, r, http.StatusUnprocessableEntity, errors)
}
