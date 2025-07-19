package main

import (
	"flag"
	"fmt"
	"log/slog"
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
	flag.StringVar(&cfg.env, "env", "development", "Environment (development|production)")
	flag.StringVar(&cfg.logFmt, "logFmt", "text", "Log format (text|json)")

	flag.Parse()
	api := api.NewAPI(cfg.env, version)
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
	})

	slog.SetDefault(slog.New(logger))

	// Echo server is configured in the API struct
	e := api.Routes()

	// Configure server timeouts
	e.Server.ReadTimeout = 5 * time.Second
	e.Server.WriteTimeout = 10 * time.Second

	slog.Info("starting server", "address", fmt.Sprintf(":%d", cfg.port), "env", cfg.env)

	// Start the server
	if err := e.Start(fmt.Sprintf(":%d", cfg.port)); err != nil {
		slog.Error("server error", "error", err.Error())
		os.Exit(1)
	}
}
