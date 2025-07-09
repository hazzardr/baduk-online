package api

import (
	"log/slog"
	"net/http"
)

func (api *API) HealthCheckHandler(w http.ResponseWriter, _ *http.Request) {
	hc := map[string]string{
		"status":  "OK",
		"env":     api.environment,
		"version": api.version,
	}
	err := api.writeJSON(w, http.StatusOK, hc, nil)
	if err != nil {
		slog.Error("failed to marshal health check response", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
