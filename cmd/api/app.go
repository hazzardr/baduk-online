package api

import (
	"io/fs"
	"net/http"
	"sync"
	"time"

	"github.com/alexedwards/scs/pgxstore"
	"github.com/alexedwards/scs/v2"
	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/data"
)

type API struct {
	environment    string
	version        string
	db             *data.Database
	providers      map[string]auth.Provider // configured sign-in providers, by name
	sessionManager *scs.SessionManager
	trustedOrigins []string
	frontend       fs.FS
	wg             sync.WaitGroup

	// Health check caching
	healthMu       sync.RWMutex
	cachedHealth   map[string]string
	healthCachedAt time.Time
}

// New creates the API. providers are the sign-in providers that are configured; any of
// signInProviders that's missing is reported as unavailable. frontend is the static site to
// serve outside /api, or nil to serve only the API.
func New(
	environment, version string,
	db *data.Database,
	providers []auth.Provider,
	trustedOrigins []string,
	frontend fs.FS,
) *API {
	sm := scs.New()
	sm.Lifetime = 24 * time.Hour
	sm.Cookie.Name = "session_id"
	sm.Cookie.HttpOnly = true
	sm.Cookie.Secure = environment == "production"
	sm.Cookie.SameSite = http.SameSiteLaxMode
	sm.Store = pgxstore.New(db.Pool)
	byName := make(map[string]auth.Provider, len(providers))
	for _, p := range providers {
		byName[p.Name()] = p
	}
	return &API{
		environment:    environment,
		version:        version,
		db:             db,
		providers:      byName,
		sessionManager: sm,
		trustedOrigins: trustedOrigins,
		frontend:       frontend,
	}
}

// Shutdown allows the caller to wait for the background tasks in our application to be completed before returning.
func (api *API) Shutdown(graceful bool) {
	if graceful {
		api.wg.Wait()
	}
}
