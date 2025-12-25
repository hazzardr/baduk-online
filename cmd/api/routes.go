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
	r.Use(api.sessionManager.LoadAndSave)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(10 * time.Second))

	// Create rate limiters
	activationRateLimiter := newRateLimiter(5, time.Hour)
	userCreationRateLimiter := newRateLimiter(10, time.Hour)
	loginRateLimiter := newRateLimiter(10, time.Hour)

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", api.handleHealthCheck)

		// Public endpoints (no CSRF, but rate limited)
		r.With(api.rateLimitMiddleware(userCreationRateLimiter)).Post("/users", api.handleCreateUser)

		// Protected endpoints (CSRF + rate limiting where applicable)
		r.Group(func(r chi.Router) {
			r.Use(api.csrfMiddleware(api.trustedOrigins))

			r.Post("/users/register", api.handleSendRegistrationEmail)
			r.With(api.rateLimitMiddleware(activationRateLimiter)).Put("/users/activated", api.handleRegisterUser)

			// Login/Logout
			r.With(api.rateLimitMiddleware(loginRateLimiter)).Post("/login", api.handleLogin)
			r.Post("/logout", api.handleLogout)
		})

		r.Get("/user", api.handleGetLoggedInUser)
	})
	return r
}
