package api

import "github.com/hazzardr/go-baduk/internal/data"

type API struct {
	environment string
	version     string
	db          *data.Database
}

func NewAPI(environment, version string, db *data.Database) *API {
	return &API{
		environment: environment,
		version:     version,
		db:          db,
	}
}
