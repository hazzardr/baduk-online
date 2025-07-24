package api

import (
	"context"
	"log/slog"
	"net/http"
)

func (api *API) HealthCheckHandler(w http.ResponseWriter, _ *http.Request) {
	statuses := make(map[string]string)
	err := api.db.Ping(context.Background())

	if err != nil {
		slog.Error("db conn failed", "err", err)
		statuses["db"] = "DOWN"
	} else {
		statuses["db"] = "OK"
	}

	hc := map[string]any{
		"status":  statuses,
		"env":     api.environment,
		"version": api.version,
	}
	err = api.writeJSON(w, http.StatusOK, hc, nil)
	if err != nil {
		slog.Error("failed to marshal health check response", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
