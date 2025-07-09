package main

import (
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/charmbracelet/log"
	"github.com/hazzardr/go-baduk/cmd/api"
)

const version = "0.1.0"

type config struct {
	port   int
	env    string
	logFmt string
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "Environment (development|staging|production)")
	flag.StringVar(&cfg.env, "logFmt", "text", "Log format (text|json)")

	flag.Parse()
	api := api.NewAPI(cfg.env)
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
	})

	slog.SetDefault(slog.New(logger))

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      api.Routes(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	slog.Info("starting server", "address", srv.Addr, "env", cfg.env)
	_ = srv.ListenAndServe()
	os.Exit(1)
}
