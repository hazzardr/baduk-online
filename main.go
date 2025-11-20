package main

import (
	"context"
	"database/sql"
	"embed"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/pressly/goose/v3"

	"github.com/charmbracelet/log"
	"github.com/hazzardr/baduk-online/cmd/api"
	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/internal/mail"
)

const version = "0.1.0"

//go:embed migrations/*.sql
var embedMigrations embed.FS

type config struct {
	port    int
	env     string
	logFmt  string
	dsn     string
	migrate bool
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "Environment (development|production)")
	flag.StringVar(&cfg.logFmt, "logFmt", "text", "Log format (text|json)")
	flag.StringVar(&cfg.dsn, "dsn", os.Getenv("POSTGRES_URL"), "Database URL")
	flag.BoolVar(&cfg.migrate, "migrate", false, "Run database migrations and exit")

	flag.Parse()

	if cfg.dsn == "" {
		slog.Error("database URL is required")
		os.Exit(1)
	}

	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
	})

	slog.SetDefault(slog.New(logger))

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

	awsCfg, err := awsConfig.LoadDefaultConfig(context.Background())
	if err != nil {
		slog.Error("failed to load AWS config", "err", err)
		os.Exit(1)
	}
	mailer := mail.NewSESMailer(awsCfg, db)
	err = mailer.Ping()
	if err != nil {
		slog.Error("failed to initialize SES client", "err", err.Error())
		os.Exit(1)
	}
	api := api.NewAPI(cfg.env, version, db, mailer)
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      api.Routes(),
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

		err = srv.Shutdown(ctx)
		if err != nil {
			errs <- err
		}

		api.Shutdown(true)
		errs <- nil
	}()

	slog.Info("starting server", "address", srv.Addr, "env", cfg.env)
	err = srv.ListenAndServe()
	os.Exit(0)
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
