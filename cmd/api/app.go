package api

import (
	"github.com/hazzardr/go-baduk/internal/data"
	"github.com/hazzardr/go-baduk/internal/mail"
)

type API struct {
	environment string
	version     string
	db          *data.Database
	mailer      mail.Mailer
}

func NewAPI(environment, version string, db *data.Database, mailer mail.Mailer) *API {
	return &API{
		environment: environment,
		version:     version,
		db:          db,
		mailer:      mailer,
	}
}
