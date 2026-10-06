package api

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func (api *API) Routes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(10 * time.Second))

	signInRateLimiter := newRateLimiter(20, time.Hour)

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Sessions only matter to the API; static files skip the session store lookup.
		r.Use(api.sessionManager.LoadAndSave)
		r.Use(api.csrfMiddleware(api.trustedOrigins))

		r.Get("/health", api.handleHealthCheck)

		// Sign-in is a browser redirect flow: start sends the browser to the provider (google,
		// ogs), and the provider sends it back to callback.
		r.With(api.rateLimitMiddleware(signInRateLimiter)).Get("/auth/{provider}/start", api.handleSignInStart)
		r.Get("/auth/{provider}/callback", api.handleSignInCallback)
		r.Post("/logout", api.handleLogout)

		r.Get("/user", api.handleGetLoggedInUser)
	})

	// Everything outside /api is the static frontend, served from the same origin.
	if api.frontend != nil {
		r.Handle("/*", frontendHandler(api.frontend))
	}
	return r
}
