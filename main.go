package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"

	"github.com/charmbracelet/log"
	"github.com/hazzardr/go-baduk/cmd/api"
	"github.com/hazzardr/go-baduk/internal/data"
	"github.com/hazzardr/go-baduk/internal/mail"
)

const version = "0.1.0"

type config struct {
	port   int
	env    string
	logFmt string
	dsn    string
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "Environment (development|production)")
	flag.StringVar(&cfg.logFmt, "logFmt", "text", "Log format (text|json)")
	flag.StringVar(&cfg.dsn, "dsn", os.Getenv("POSTGRES_URL"), "Database URL")

	flag.Parse()
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
	})

	slog.SetDefault(slog.New(logger))

	db, err := data.New(cfg.dsn)
	if err != nil {
		slog.Error("db init failed", slog.Any("err", err))
		os.Exit(1)
	}

	awsCfg, err := awsConfig.LoadDefaultConfig(context.Background())
	if err != nil {
		slog.Error("aws config not found", "err", err)
	}
	mailer := mail.NewSESMailer(awsCfg)
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

	slog.Info("starting server", "address", srv.Addr, "env", cfg.env)
	_ = srv.ListenAndServe()
	os.Exit(0)
}
