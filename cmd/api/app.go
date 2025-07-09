package api

type API struct {
	environment string
	version     string
}

func NewAPI(environment, version string) *API {
	return &API{
		environment: environment,
		version:     version,
	}
}
