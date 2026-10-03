package api

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func testFrontendFS() fstest.MapFS {
	return fstest.MapFS{
		"index.html":           {Data: []byte("home")},
		"about/index.html":     {Data: []byte("about")},
		"404.html":             {Data: []byte("not found page")},
		"favicon.png":          {Data: []byte("png")},
		"_astro/app.abc123.js": {Data: []byte("js")},
		"empty/.keep":          {Data: []byte("")},
	}
}

func TestFrontendHandler(t *testing.T) {
	tests := []struct {
		name         string
		method       string
		path         string
		wantStatus   int
		wantBody     string
		wantCacheHdr string
	}{
		{
			name:         "Root serves index",
			method:       http.MethodGet,
			path:         "/",
			wantStatus:   http.StatusOK,
			wantBody:     "home",
			wantCacheHdr: "no-cache",
		},
		{
			name:         "Page directory without slash",
			method:       http.MethodGet,
			path:         "/about",
			wantStatus:   http.StatusOK,
			wantBody:     "about",
			wantCacheHdr: "no-cache",
		},
		{
			name:         "Page directory with slash",
			method:       http.MethodGet,
			path:         "/about/",
			wantStatus:   http.StatusOK,
			wantBody:     "about",
			wantCacheHdr: "no-cache",
		},
		{
			name:         "Static file",
			method:       http.MethodGet,
			path:         "/favicon.png",
			wantStatus:   http.StatusOK,
			wantBody:     "png",
			wantCacheHdr: "no-cache",
		},
		{
			name:         "Hashed asset is immutable",
			method:       http.MethodGet,
			path:         "/_astro/app.abc123.js",
			wantStatus:   http.StatusOK,
			wantBody:     "js",
			wantCacheHdr: "public, max-age=31536000, immutable",
		},
		{
			name:       "Unknown path serves 404 page",
			method:     http.MethodGet,
			path:       "/nope",
			wantStatus: http.StatusNotFound,
			wantBody:   "not found page",
		},
		{
			name:       "Directory without index is 404",
			method:     http.MethodGet,
			path:       "/empty",
			wantStatus: http.StatusNotFound,
			wantBody:   "not found page",
		},
		{
			name:       "Path traversal stays inside the site",
			method:     http.MethodGet,
			path:       "/../../etc/passwd",
			wantStatus: http.StatusNotFound,
			wantBody:   "not found page",
		},
		{
			name:       "HEAD has no body",
			method:     http.MethodHead,
			path:       "/nope",
			wantStatus: http.StatusNotFound,
			wantBody:   "",
		},
		{
			name:       "POST is not allowed",
			method:     http.MethodPost,
			path:       "/",
			wantStatus: http.StatusMethodNotAllowed,
		},
	}

	handler := frontendHandler(testFrontendFS())
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantStatus == http.StatusMethodNotAllowed {
				return
			}
			body, _ := io.ReadAll(rec.Body)
			if string(body) != tt.wantBody {
				t.Errorf("body = %q, want %q", body, tt.wantBody)
			}
			if tt.wantCacheHdr != "" && rec.Header().Get("Cache-Control") != tt.wantCacheHdr {
				t.Errorf("Cache-Control = %q, want %q", rec.Header().Get("Cache-Control"), tt.wantCacheHdr)
			}
		})
	}
}

func TestFrontendHandlerWithout404Page(t *testing.T) {
	fsys := testFrontendFS()
	delete(fsys, "404.html")

	rec := httptest.NewRecorder()
	frontendHandler(fsys).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/nope", nil))

	if rec.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}
