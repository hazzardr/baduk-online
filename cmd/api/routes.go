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

	// Create rate limiters
	activationRateLimiter := newRateLimiter(5, time.Hour)
	userCreationRateLimiter := newRateLimiter(10, time.Hour)
	loginRateLimiter := newRateLimiter(10, time.Hour)

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Sessions only matter to the API; static files skip the session store lookup.
		r.Use(api.sessionManager.LoadAndSave)
		r.Use(api.csrfMiddleware(api.trustedOrigins))

		r.Get("/health", api.handleHealthCheck)

		// Public endpoints
		r.With(api.rateLimitMiddleware(userCreationRateLimiter)).Post("/users", api.handleCreateUser)
		r.Post("/users/register", api.handleSendRegistrationEmail)
		r.With(api.rateLimitMiddleware(activationRateLimiter)).Put("/users/activated", api.handleRegisterUser)

		// Login/Logout
		r.With(api.rateLimitMiddleware(loginRateLimiter)).Post("/login", api.handleLogin)
		r.Post("/logout", api.handleLogout)

		r.Get("/user", api.handleGetLoggedInUser)
	})

	// Everything outside /api is the static frontend, served from the same origin.
	if api.frontend != nil {
		r.Handle("/*", frontendHandler(api.frontend))
	}
	return r
}
