package api

import (
	"errors"
	"io/fs"
	"log/slog"
	"net/http"
	"path"
	"strings"
)

// frontendHandler serves the static Astro build. Astro emits one directory per
// page (about/index.html), so /about resolves to about/index.html. Unknown paths
// get 404.html with a 404 status.
func frontendHandler(fsys fs.FS) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

		name, ok := resolveFrontendFile(fsys, r.URL.Path)
		if !ok {
			serveFrontendNotFound(w, r, fsys)
			return
		}

		// Files under _astro/ have content hashes in their names, so they never change.
		if strings.HasPrefix(name, "_astro/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		} else {
			w.Header().Set("Cache-Control", "no-cache")
		}
		http.ServeFileFS(w, r, fsys, name)
	})
}

// resolveFrontendFile maps a URL path to a regular file in fsys: the file itself,
// or index.html inside a directory of that name.
func resolveFrontendFile(fsys fs.FS, urlPath string) (string, bool) {
	name := strings.TrimPrefix(path.Clean("/"+urlPath), "/")
	if name == "" {
		name = "."
	}

	info, err := fs.Stat(fsys, name)
	if err != nil {
		return "", false
	}
	if !info.IsDir() {
		return name, true
	}

	index := path.Join(name, "index.html")
	info, err = fs.Stat(fsys, index)
	if err != nil || info.IsDir() {
		return "", false
	}
	return index, true
}

func serveFrontendNotFound(w http.ResponseWriter, r *http.Request, fsys fs.FS) {
	body, err := fs.ReadFile(fsys, "404.html")
	if err != nil {
		if !errors.Is(err, fs.ErrNotExist) {
			slog.ErrorContext(r.Context(), "failed to read 404 page", "err", err)
		}
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusNotFound)
	if r.Method != http.MethodHead {
		_, _ = w.Write(body)
	}
}
