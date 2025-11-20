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
		"Title":       "Home - Go Baduk",
		"Description": "Your modern web application built with Go",
		"Features": []map[string]string{
			{
				"Icon":        "🚀",
				"Title":       "Fast Performance",
				"Description": "Built with Go for lightning-fast response times",
			},
			{
				"Icon":        "🔒",
				"Title":       "Secure",
				"Description": "Security best practices built-in from the ground up",
			},
			{
				"Icon":        "📱",
				"Title":       "Responsive",
				"Description": "Works seamlessly on desktop, tablet, and mobile devices",
			},
		},
	}

	err = tmpl.ExecuteTemplate(w, "index.gohtml", data)
	if err != nil {
		api.errorResponse(w, r, http.StatusInternalServerError, "Failed to render template")
		return
	}
}
