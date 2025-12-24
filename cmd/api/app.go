package api

import (
	"net/http"
	"sync"
	"time"

	"github.com/alexedwards/scs/pgxstore"
	"github.com/alexedwards/scs/v2"
	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/mail"
)

type API struct {
	environment    string
	version        string
	db             *data.Database
	mailer         mail.Mailer
	sessionManager *scs.SessionManager
	trustedOrigins []string
	wg             sync.WaitGroup

	// Health check caching
	healthMu         sync.RWMutex
	cachedHealth     map[string]string
	healthCachedAt   time.Time
}

func NewAPI(environment, version string, db *data.Database, mailer mail.Mailer, trustedOrigins []string) *API {
	sm := scs.New()
	sm.Lifetime = 24 * time.Hour
	sm.Cookie.Name = "session_id"
	sm.Cookie.HttpOnly = true
	sm.Cookie.Secure = environment == "production"
	sm.Cookie.SameSite = http.SameSiteLaxMode
	sm.Store = pgxstore.New(db.Pool)
	return &API{
		environment:    environment,
		version:        version,
		db:             db,
		mailer:         mailer,
		sessionManager: sm,
		trustedOrigins: trustedOrigins,
	}
}

// Shutdown allows the caller to wait for the background tasks in our application to be completed before returning.
func (api *API) Shutdown(graceful bool) {
	if graceful {
		api.wg.Wait()
	}
}
