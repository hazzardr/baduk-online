package api

import (
	"net/http"

	"github.com/hazzardr/baduk-online/frontend"
)

func (api *API) handleHome(w http.ResponseWriter, r *http.Request) {
	tmpl, err := frontend.ParseTemplates()
	if err != nil {
		http.Error(w, "Failed to load templates", http.StatusInternalServerError)
		return
	}

	data := map[string]interface{}{
		"Title": "Home - baduk online",
	}

	err = tmpl.ExecuteTemplate(w, "index.gohtml", data)
	if err != nil {
		api.errorResponse(w, r, http.StatusInternalServerError, "Failed to render template")
		return
	}
}
