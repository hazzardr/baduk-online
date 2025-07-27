package api

import (
	"time"

	"github.com/alexedwards/scs/v2"

	"github.com/alexedwards/scs/pgxstore"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func (api *API) Routes() http.Handler {
	sm := scs.New()
	sm.Lifetime = 24 * time.Hour
	sm.Cookie.Secure = true
	sm.Store = pgxstore.New(api.db.Pool)
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(sm.LoadAndSave)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(20 * time.Second))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", api.handleHealthCheck)

		r.Get("/users/{email}", api.handleGetUserByEmail)
		r.Post("/users", api.handleRegisterUser)
	})
	return r
}
