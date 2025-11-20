package frontend

import (
	"embed"
	"html/template"
	"io/fs"
)

//go:embed templates/*.gohtml
var templatesFS embed.FS

//go:embed static
var staticFS embed.FS

// Templates returns the embedded template filesystem
func Templates() (embed.FS, error) {
	return templatesFS, nil
}

// ParseTemplates parses all embedded templates
func ParseTemplates() (*template.Template, error) {
	return template.ParseFS(templatesFS, "templates/*.gohtml")
}

// StaticFiles returns the embedded static files filesystem
// Returns the "static" subdirectory so files can be served from root
func StaticFiles() (fs.FS, error) {
	return fs.Sub(staticFS, "static")
}
