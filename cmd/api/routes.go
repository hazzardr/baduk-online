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

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", api.handleHealthCheck)
		r.Post("/users", api.handleCreateUser)
		r.Post("/users/register", api.handleSendRegistrationEmail)
		r.Put("/users/activated", api.handleRegisterUser)
		r.Get("/user", api.handleGetLoggedInUser)
	})
	return r
}
