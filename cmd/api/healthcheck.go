package api

import (
	"fmt"
	"net/http"
)

func (api *API) HealthCheckHandler(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "OK")
}
