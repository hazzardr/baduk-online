package api

import "github.com/hazzardr/go-baduk/internal/database"

type API struct {
	environment string
	version     string
	db          *database.Database
}

func NewAPI(environment, version string, db *database.Database) *API {
	return &API{
		environment: environment,
		version:     version,
		db:          db,
	}
}
