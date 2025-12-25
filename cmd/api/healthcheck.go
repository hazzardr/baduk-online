package api

import (
	"context"
	"log/slog"
	"net/http"
	"time"
)

const CoalesceInterval = 5 * time.Second

// checkHealth performs a health check on the application's dependencies at a maximum of once every `CoalesceInterval`.
func (api *API) checkHealth(ctx context.Context) map[string]string {
	// Check if we have a cached result that's still valid
	api.healthMu.RLock()
	if time.Since(api.healthCachedAt) < CoalesceInterval && api.cachedHealth != nil {
		cached := make(map[string]string, len(api.cachedHealth))
		for k, v := range api.cachedHealth {
			cached[k] = v
		}
		api.healthMu.RUnlock()
		slog.DebugContext(ctx, "returning cached health check result", slog.Any("statuses", cached))
		return cached
	}
	api.healthMu.RUnlock()

	// Acquire write lock to perform the actual health check
	api.healthMu.Lock()
	defer api.healthMu.Unlock()

	// Double-check in case another goroutine just updated the cache
	if time.Since(api.healthCachedAt) < CoalesceInterval && api.cachedHealth != nil {
		cached := make(map[string]string, len(api.cachedHealth))
		for k, v := range api.cachedHealth {
			cached[k] = v
		}
		return cached
	}

	// Perform the actual health checks
	statuses := make(map[string]string)

	err := api.db.Ping(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "db conn failed", "err", err)
		statuses["db"] = "DOWN"
	} else {
		statuses["db"] = "OK"
	}

	err = api.mailer.Ping(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "mail server conn failed", "err", err)
		statuses["ses"] = "DOWN"
	} else {
		statuses["ses"] = "OK"
	}

	// Update cache
	api.cachedHealth = statuses
	api.healthCachedAt = time.Now()

	return statuses
}

func (api *API) handleHealthCheck(w http.ResponseWriter, _ *http.Request) {
	ctx := context.Background()
	statuses := api.checkHealth(ctx)

	hc := map[string]any{
		"status":  statuses,
		"env":     api.environment,
		"version": api.version,
	}
	err := api.writeJSON(w, http.StatusOK, hc, nil)
	if err != nil {
		slog.Error("failed to marshal health check response", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
