# Frontend

This directory contains the frontend assets for Go Baduk, embedded in the Go binary at compile time.

## Structure

```
frontend/
├── templates/          # Go HTML templates
│   ├── base.html      # Base layout template
│   └── index.html     # Home page template
├── static/            # Static assets
│   ├── css/
│   │   └── style.css  # Main stylesheet
│   └── js/
│       └── main.js    # Main JavaScript file
├── embed.go           # Go embed configuration
└── README.md          # This file
```

## Usage in Go

```go
package main

import (
    "net/http"
    "your-module/frontend"
)

func main() {
    // Parse templates
    tmpl, err := frontend.ParseTemplates()
    if err != nil {
        panic(err)
    }

    // Serve static files
    staticFiles, err := frontend.StaticFiles()
    if err != nil {
        panic(err)
    }
    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFiles))))

    // Serve pages
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
        tmpl.ExecuteTemplate(w, "index.gohtml", data)
    })

    http.ListenAndServe(":8080", nil)
}
```

## Template Variables

### index.html expects:
- `Title` (string): Page title
- `Description` (string): Hero section description
- `Features` ([]struct): Array of feature objects with:
  - `Icon` (string): Emoji or icon
  - `Title` (string): Feature title
  - `Description` (string): Feature description

## Development

The files are embedded at compile time, so you need to rebuild the Go binary after making changes to see them reflected.

For development with live reload, you can serve the files directly from the filesystem instead of using embed.FS.
