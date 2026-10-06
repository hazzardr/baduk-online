package main

import (
	"context"
	"embed"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/charmbracelet/log"
	"github.com/hazzardr/baduk-online/cmd/api"
	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/data"
)

const version = "0.1.0"

//go:embed migrations/*.sql
var embedMigrations embed.FS

type config struct {
	port           int
	env            string
	logFmt         string
	dsn            string
	migrate        bool
	trustedOrigins string
	baseURL        string
	googleClientID string
	// Client secrets are read from the environment only, so they never appear in -help output.
	googleClientSecret string
	ogsClientID        string
	ogsClientSecret    string
}

func main() {
	var cfg config

	// Flags default to environment variables so the systemd EnvironmentFile
	// (deploy/ansible/roles/service/templates/baduk.env.j2) configures the server.
	flag.IntVar(&cfg.port, "port", envInt("PORT", 4000), "API server port (env PORT)")
	flag.StringVar(&cfg.env, "env", envString("ENV", "development"), "Environment (development|production) (env ENV)")
	flag.StringVar(&cfg.logFmt, "logFmt", envString("LOG_FMT", "text"), "Log format (text|json) (env LOG_FMT)")
	flag.StringVar(&cfg.dsn, "dsn", os.Getenv("POSTGRES_URL"), "Database URL (env POSTGRES_URL)")
	flag.BoolVar(&cfg.migrate, "migrate", false, "Run database migrations and exit")
	flag.StringVar(
		&cfg.trustedOrigins,
		"trusted-origins",
		envString(
			"TRUSTED_ORIGINS",
			"https://play.baduk.online,http://localhost:5173,http://localhost:4321,http://localhost:4000",
		),
		"Comma-separated list of trusted origins for CSRF protection (env TRUSTED_ORIGINS)",
	)
	flag.StringVar(
		&cfg.baseURL,
		"base-url",
		envString("BASE_URL", "https://play.baduk.online"),
		"Public URL of the site, used for OAuth redirect URLs (env BASE_URL)",
	)
	flag.StringVar(
		&cfg.googleClientID,
		"google-client-id",
		os.Getenv("GOOGLE_CLIENT_ID"),
		"Google OAuth client ID; Google sign-in is disabled without it (env GOOGLE_CLIENT_ID)",
	)
	cfg.googleClientSecret = os.Getenv("GOOGLE_CLIENT_SECRET")
	flag.StringVar(
		&cfg.ogsClientID,
		"ogs-client-id",
		os.Getenv("OGS_CLIENT_ID"),
		"online-go.com OAuth client ID; OGS sign-in is disabled without it (env OGS_CLIENT_ID)",
	)
	cfg.ogsClientSecret = os.Getenv("OGS_CLIENT_SECRET")

	flag.Parse()

	if cfg.dsn == "" {
		slog.Error("database URL is required")
		os.Exit(1)
	}
	if err := validateBaseURL(cfg.baseURL); err != nil {
		slog.Error("invalid base URL", "baseURL", cfg.baseURL, "err", err)
		os.Exit(1)
	}

	ctx := context.Background()
	configureLogger(cfg)
	db := configureDB(cfg)
	providers := configureSignIn(ctx, cfg)

	frontend := frontendFS()
	if frontend == nil {
		if cfg.env == "production" {
			slog.Error("production binary built without the frontend; rebuild with -tags embedfrontend")
			os.Exit(1)
		}
		slog.Warn("built without -tags embedfrontend; serving the API only")
	}

	trustedOrigins := parseTrustedOrigins(cfg.trustedOrigins)
	apiInstance := api.New(cfg.env, version, db, providers, trustedOrigins, frontend)
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      apiInstance.Routes(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	errs := make(chan error)
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit
		slog.Info("shutting down server", "signal", s.String())

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		err := srv.Shutdown(ctx)
		if err != nil {
			errs <- err
		}

		apiInstance.Shutdown(true)
		errs <- nil
	}()

	slog.Info("starting server", "address", srv.Addr, "env", cfg.env)
	err := srv.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("server error", "err", err)
		os.Exit(1)
	}
	os.Exit(0)
}

// configureSignIn returns the sign-in providers that have credentials and, for Google, a
// reachable discovery document. A provider that doesn't is left out (its sign-in redirects back
// to the sign-in page with an error), so the server can boot without credentials, e.g. in local
// dev. In production it exits instead, and systemd restarts it until every provider works,
// rather than serving a site some people can't sign in to.
func configureSignIn(ctx context.Context, cfg config) []auth.Provider {
	var providers []auth.Provider
	ok := func(name string, err error) bool {
		if err == nil {
			return true
		}
		if cfg.env == "production" {
			slog.ErrorContext(ctx, "sign-in provider unavailable", "provider", name, "err", err)
			os.Exit(1)
		}
		slog.WarnContext(ctx, "sign-in provider disabled", "provider", name, "err", err)
		return false
	}
	callback := func(provider string) string {
		return strings.TrimSuffix(cfg.baseURL, "/") + "/api/v1/auth/" + provider + "/callback"
	}

	if google, err := configureGoogle(ctx, cfg, callback(auth.Google)); ok(auth.Google, err) {
		providers = append(providers, google)
	}
	if cfg.ogsClientID == "" || cfg.ogsClientSecret == "" {
		ok(auth.OGS, errors.New("OGS_CLIENT_ID or OGS_CLIENT_SECRET unset"))
	} else {
		providers = append(providers,
			auth.NewOGSProvider(auth.OGSURL, cfg.ogsClientID, cfg.ogsClientSecret, callback(auth.OGS)))
	}
	return providers
}

func configureGoogle(ctx context.Context, cfg config, redirectURL string) (*auth.OIDCProvider, error) {
	if cfg.googleClientID == "" || cfg.googleClientSecret == "" {
		return nil, errors.New("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET unset")
	}
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return auth.NewOIDCProvider(
		ctx, auth.Google, auth.GoogleIssuer, cfg.googleClientID, cfg.googleClientSecret, redirectURL,
	)
}

func configureDB(cfg config) *data.Database {
	if cfg.migrate {
		if err := data.RunMigrations(cfg.dsn, embedMigrations); err != nil {
			slog.Error("migration failed", "err", err)
			os.Exit(1)
		}
		slog.Info("migrations completed successfully")
		os.Exit(0)
	}
	db, err := data.New(cfg.dsn)
	if err != nil {
		slog.Error("db init failed", slog.Any("err", err))
		os.Exit(1)
	}
	err = db.Ping(context.Background())
	if err != nil {
		slog.Error("db init failed", slog.Any("err", err))
		os.Exit(1)
	}
	return db
}

// envString returns the value of the environment variable key, or def if it is unset or empty.
func envString(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// envInt returns the integer value of the environment variable key, or def if it is unset or not an integer.
func envInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		slog.Warn("ignoring non-integer environment variable", "key", key, "value", v)
		return def
	}
	return n
}

// validateBaseURL checks that the base URL is absolute, so OAuth redirect URLs resolve.
func validateBaseURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil {
		return err
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return errors.New("scheme must be http or https")
	}
	if u.Host == "" {
		return errors.New("host is required")
	}
	return nil
}

func parseTrustedOrigins(origins string) []string {
	if origins == "" {
		return []string{}
	}

	parts := strings.Split(origins, ",")
	result := make([]string, 0, len(parts))
	for _, origin := range parts {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// configureLogger configures the global logger. Can add json logging as a flag later.
func configureLogger(_ config) {
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
	})

	slog.SetDefault(slog.New(logger))
}
