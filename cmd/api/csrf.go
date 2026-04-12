package api

import (
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v5"
)

// csrfMiddleware returns a middleware that provides CSRF protection using Go's built-in
// cross-origin protection with configurable trusted origins.
func (api *API) csrfMiddleware(trustedOrigins []string) echo.MiddlewareFunc {
	return echo.WrapMiddleware(func(next http.Handler) http.Handler {
		cop := http.NewCrossOriginProtection()

		// Add each trusted origin to the protection
		for _, origin := range trustedOrigins {
			err := cop.AddTrustedOrigin(origin)
			if err != nil {
				slog.Warn("failed to add trusted origin", "origin", origin, "err", err)
			}
		}

		// Set custom deny handler that uses our error response pattern
		cop.SetDenyHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			api.csrfFailureResponse(w)
		}))

		return cop.Handler(next)
	})
}
