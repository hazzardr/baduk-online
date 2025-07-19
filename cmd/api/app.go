package api

import (
	"github.com/labstack/echo/v4"
)

type API struct {
	environment string
	version     string
	echo        *echo.Echo
}

func NewAPI(environment, version string) *API {
	e := echo.New()
	return &API{
		environment: environment,
		version:     version,
		echo:        e,
	}
}
