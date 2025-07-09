package api

type API struct {
	environment string
}

func NewAPI(environment string) *API {
	return &API{
		environment: environment,
	}
}
