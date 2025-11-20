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
