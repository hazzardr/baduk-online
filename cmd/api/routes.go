package api

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (api *API) Routes() *echo.Echo {
	// Configure middleware
	api.echo.Use(middleware.RequestID())
	api.echo.Use(middleware.Logger())
	api.echo.Use(middleware.Recover())
	api.echo.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{
		Timeout: 30 * time.Second,
	}))

	// Group routes
	v1 := api.echo.Group("/api/v1")
	v1.GET("/health", api.HealthCheckHandler)

	return api.echo
}
