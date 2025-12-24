package main

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/charmbracelet/log"
	"github.com/pressly/goose/v3"

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
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "Environment (development|production)")
	flag.StringVar(&cfg.logFmt, "logFmt", "text", "Log format (text|json)")
	flag.StringVar(&cfg.dsn, "dsn", os.Getenv("POSTGRES_URL"), "Database URL")
	flag.BoolVar(&cfg.migrate, "migrate", false, "Run database migrations and exit")
	flag.StringVar(
		&cfg.trustedOrigins,
		"trusted-origins",
		"https://play.baduk.online",
		"Comma-separated list of trusted origins for CSRF protection",
	)

	flag.Parse()

	if cfg.dsn == "" {
		slog.Error("database URL is required")
		os.Exit(1)
	}

	ctx := context.Background()
	configureLogger(cfg)
	db := configureDB(cfg)
	mailer := configureMailer(ctx, db)

	trustedOrigins := parseTrustedOrigins(cfg.trustedOrigins)
	apiInstance := api.NewAPI(cfg.env, version, db, mailer, trustedOrigins)
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

func configureMailer(ctx context.Context, db *data.Database) *mail.SESMailer {
	awsCfg, err := awsConfig.LoadDefaultConfig(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "failed to load AWS config", "err", err)
		os.Exit(1)
	}
	mailer := mail.NewSESMailer(awsCfg, db)
	err = mailer.Ping(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "failed to initialize SES client", "err", err.Error())
		os.Exit(1)
	}
	return mailer
}
func configureDB(cfg config) *data.Database {
	if cfg.migrate {
		if err := runMigrations(cfg.dsn); err != nil {
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
	return db
}
func runMigrations(dsn string) error {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	goose.SetBaseFS(embedMigrations)

	if err := goose.Up(db, "migrations"); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
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
