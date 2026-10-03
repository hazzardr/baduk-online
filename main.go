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

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/charmbracelet/log"
	"github.com/hazzardr/baduk-online/cmd/api"
	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/mail"
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
		"Public URL of the frontend, used for links in emails (env BASE_URL)",
	)

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
	mailer := configureMailer(ctx, db, cfg.baseURL)

	frontend := frontendFS()
	if frontend == nil {
		if cfg.env == "production" {
			slog.Error("production binary built without the frontend; rebuild with -tags embedfrontend")
			os.Exit(1)
		}
		slog.Warn("built without -tags embedfrontend; serving the API only")
	}

	trustedOrigins := parseTrustedOrigins(cfg.trustedOrigins)
	apiInstance := api.New(cfg.env, version, db, mailer, trustedOrigins, frontend)
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

// configureMailer returns a working SES mailer, or nil (email disabled) if AWS
// is unavailable. It never exits, so the server can boot without AWS
// credentials (e.g. local dev). With email disabled, registration returns 503.
func configureMailer(ctx context.Context, db *data.Database, baseURL string) mail.Mailer {
	awsCfg, err := awsConfig.LoadDefaultConfig(ctx)
	if err != nil {
		slog.WarnContext(ctx, "AWS config unavailable; email sending disabled", "err", err)
		return nil
	}

	mailer := mail.NewSESMailer(awsCfg, db, baseURL)
	if err := mailer.Ping(ctx); err != nil {
		slog.WarnContext(ctx, "SES unreachable; email sending disabled", "err", err)
		return nil
	}

	return mailer
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

// validateBaseURL checks that the base URL is absolute, so email links resolve.
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
