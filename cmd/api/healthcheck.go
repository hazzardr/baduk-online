package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (api *API) HealthCheckHandler(c echo.Context) error {
	hc := map[string]string{
		"status":  "OK",
		"env":     api.environment,
		"version": api.version,
	}

	return c.JSON(http.StatusOK, hc)
}
