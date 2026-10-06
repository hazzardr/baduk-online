package api

import (
	"encoding/json"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/auth/authtest"
	"github.com/hazzardr/baduk-online/internal/data"
)

// authEnv is the API wired to a fake Google, plus a browser-like client that keeps cookies and
// stops at each redirect so tests can inspect it.
type authEnv struct {
	server *httptest.Server
	idp    *authtest.Server
	db     *data.Database
}

func newAuthEnv(t *testing.T, db *data.Database) *authEnv {
	t.Helper()
	idp := authtest.NewServer(t, "client-id")

	// The provider needs the server's URL for its redirect URL, and the server needs the API, so
	// route through a handler that is set once both exist.
	var handler http.Handler
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeHTTP(w, r)
	}))
	t.Cleanup(server.Close)

	google, err := auth.NewProvider(t.Context(), "google", idp.URL, "client-id", "client-secret",
		server.URL+"/api/v1/auth/google/callback")
	if err != nil {
		t.Fatalf("NewProvider: %s", err)
	}
	handler = New("test", "1.0.0", db, google, []string{server.URL}, nil).Routes()
	return &authEnv{server: server, idp: idp, db: db}
}

func newBrowser(t *testing.T) *http.Client {
	t.Helper()
	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	return &http.Client{
		Jar: jar,
		CheckRedirect: func(*http.Request, []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
}

// get requests target (a path on the API server, or an absolute URL) and returns the response
// status and Location header.
func (e *authEnv) get(t *testing.T, browser *http.Client, target string) (int, string) {
	t.Helper()
	if strings.HasPrefix(target, "/") {
		target = e.server.URL + target
	}
	resp, err := browser.Get(target)
	if err != nil {
		t.Fatalf("GET %s: %s", target, err)
	}
	defer resp.Body.Close()
	return resp.StatusCode, resp.Header.Get("Location")
}

// startSignIn begins a sign-in and returns the provider's callback URL after the user approves.
func (e *authEnv) startSignIn(t *testing.T, browser *http.Client, identity authtest.Identity) string {
	t.Helper()
	status, location := e.get(t, browser, "/api/v1/auth/google/start")
	if status != http.StatusFound || !strings.HasPrefix(location, e.idp.URL+"/authorize?") {
		t.Fatalf("start: status %d, Location %q; want a redirect to the provider", status, location)
	}
	return e.idp.Authorize(t, location, identity).String()
}

// signIn runs a whole sign-in and returns where the callback redirected the browser.
func (e *authEnv) signIn(t *testing.T, browser *http.Client, identity authtest.Identity) string {
	t.Helper()
	status, location := e.get(t, browser, e.startSignIn(t, browser, identity))
	if status != http.StatusFound {
		t.Fatalf("callback: status %d, want 302", status)
	}
	return location
}

// currentUser returns the signed-in user from GET /api/v1/user, or nil if the response is 401.
func (e *authEnv) currentUser(t *testing.T, browser *http.Client) *data.User {
	t.Helper()
	resp, err := browser.Get(e.server.URL + "/api/v1/user")
	if err != nil {
		t.Fatalf("GET /api/v1/user: %s", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusUnauthorized {
		return nil
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /api/v1/user: status %d", resp.StatusCode)
	}
	var user data.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		t.Fatalf("decoding user: %s", err)
	}
	return &user
}

func sessionCookie(t *testing.T, browser *http.Client, serverURL string) string {
	t.Helper()
	u, _ := url.Parse(serverURL)
	for _, c := range browser.Jar.Cookies(u) {
		if c.Name == "session_id" {
			return c.Value
		}
	}
	return ""
}

func TestGoogleSignInIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()
	env := newAuthEnv(t, db)

	ada := authtest.Identity{Subject: "sub-ada", Email: "ada@example.com", EmailVerified: true, Name: "Ada"}

	t.Run("signed out user gets 401", func(t *testing.T) {
		if user := env.currentUser(t, newBrowser(t)); user != nil {
			t.Fatalf("got user %+v, want 401", user)
		}
	})

	t.Run("first sign-in creates the user", func(t *testing.T) {
		browser := newBrowser(t)
		if location := env.signIn(t, browser, ada); location != "/" {
			t.Fatalf("callback redirected to %q, want /", location)
		}
		user := env.currentUser(t, browser)
		if user == nil || user.Name != "Ada" || user.Email != "ada@example.com" {
			t.Fatalf("current user = %+v", user)
		}
		linked, err := db.Identities.GetUser(t.Context(), "google", "sub-ada")
		if err != nil {
			t.Fatalf("identity not linked: %s", err)
		}
		if linked.Email != "ada@example.com" {
			t.Errorf("linked user email = %q", linked.Email)
		}
	})

	t.Run("returning sign-in finds the user by subject, not email", func(t *testing.T) {
		before, err := db.Identities.GetUser(t.Context(), "google", "sub-ada")
		if err != nil {
			t.Fatal(err)
		}
		changed := ada
		changed.Email = "ada.lovelace@example.com"
		browser := newBrowser(t)
		env.signIn(t, browser, changed)

		user := env.currentUser(t, browser)
		if user == nil || user.Email != "ada@example.com" {
			t.Fatalf("current user = %+v, want the existing user", user)
		}
		after, err := db.Identities.GetUser(t.Context(), "google", "sub-ada")
		if err != nil {
			t.Fatal(err)
		}
		if after.ID != before.ID {
			t.Errorf("user ID changed from %d to %d", before.ID, after.ID)
		}
	})

	t.Run("sign-in issues a new session token", func(t *testing.T) {
		browser := newBrowser(t)
		callback := env.startSignIn(t, browser, ada)
		before := sessionCookie(t, browser, env.server.URL)
		if before == "" {
			t.Fatal("start did not set a session cookie")
		}
		env.get(t, browser, callback)
		after := sessionCookie(t, browser, env.server.URL)
		if after == "" || after == before {
			t.Errorf("session token not renewed: before %q, after %q", before, after)
		}
	})

	t.Run("start redirects home when already signed in", func(t *testing.T) {
		browser := newBrowser(t)
		env.signIn(t, browser, ada)
		if status, location := env.get(t, browser, "/api/v1/auth/google/start"); status != http.StatusFound ||
			location != "/" {
			t.Errorf("status %d, Location %q; want a redirect to /", status, location)
		}
	})

	t.Run("logout ends the session", func(t *testing.T) {
		browser := newBrowser(t)
		env.signIn(t, browser, ada)
		resp, err := browser.Post(env.server.URL+"/api/v1/logout", "application/json", nil)
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("logout status %d", resp.StatusCode)
		}
		if user := env.currentUser(t, browser); user != nil {
			t.Errorf("still signed in as %+v", user)
		}
	})

	rejected := []struct {
		name      string
		identity  authtest.Identity
		tamper    func(callback string) string
		wantError string
	}{
		{
			name:      "unverified email",
			identity:  authtest.Identity{Subject: "sub-unverified", Email: "u@example.com", EmailVerified: false},
			wantError: signInEmailUnverified,
		},
		{
			name: "email already used by another identity",
			identity: authtest.Identity{
				Subject: "sub-other", Email: "ada@example.com", EmailVerified: true, Name: "Not Ada",
			},
			wantError: signInEmailInUse,
		},
		{
			name:     "state mismatch",
			identity: authtest.Identity{Subject: "sub-state", Email: "s@example.com", EmailVerified: true},
			tamper: func(callback string) string {
				return replaceQuery(callback, "state", "forged")
			},
			wantError: signInExpired,
		},
		{
			name:     "user denied access",
			identity: authtest.Identity{Subject: "sub-denied", Email: "d@example.com", EmailVerified: true},
			tamper: func(callback string) string {
				return replaceQuery(callback, "error", "access_denied")
			},
			wantError: signInCancelled,
		},
		{
			name: "nonce mismatch",
			identity: authtest.Identity{
				Subject: "sub-nonce", Email: "n@example.com", EmailVerified: true, Nonce: "replayed",
			},
			wantError: signInFailed,
		},
	}
	for _, tt := range rejected {
		t.Run("rejects "+tt.name, func(t *testing.T) {
			browser := newBrowser(t)
			callback := env.startSignIn(t, browser, tt.identity)
			if tt.tamper != nil {
				callback = tt.tamper(callback)
			}
			_, location := env.get(t, browser, callback)
			if want := "/signin?error=" + tt.wantError; location != want {
				t.Errorf("callback redirected to %q, want %q", location, want)
			}
			if user := env.currentUser(t, browser); user != nil {
				t.Errorf("signed in as %+v", user)
			}
			if _, err := db.Identities.GetUser(t.Context(), "google", tt.identity.Subject); err == nil {
				t.Error("identity was linked")
			}
		})
	}

	t.Run("rejects a replayed callback", func(t *testing.T) {
		browser := newBrowser(t)
		callback := env.startSignIn(t, browser, ada)
		env.get(t, browser, callback)
		// Sign out but keep the cookie jar, then replay the same callback URL.
		resp, err := browser.Post(env.server.URL+"/api/v1/logout", "application/json", nil)
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		if _, location := env.get(t, browser, callback); location != "/signin?error="+signInExpired {
			t.Errorf("replay redirected to %q", location)
		}
	})
}

func TestGoogleUnavailableIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	api := New("test", "1.0.0", db, nil, []string{"http://localhost:3000"}, nil)
	server := httptest.NewServer(api.Routes())
	defer server.Close()
	env := &authEnv{server: server, db: db}

	for _, path := range []string{"/api/v1/auth/google/start", "/api/v1/auth/google/callback?code=x&state=y"} {
		t.Run(path, func(t *testing.T) {
			_, location := env.get(t, newBrowser(t), path)
			if want := "/signin?error=" + signInUnavailable; location != want {
				t.Errorf("redirected to %q, want %q", location, want)
			}
		})
	}

	t.Run("health check reports google unavailable", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/v1/health")
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		var hc struct {
			Status map[string]string `json:"status"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&hc); err != nil {
			t.Fatalf("failed to decode response: %s", err)
		}
		if hc.Status["google"] != "unavailable" {
			t.Errorf("expected google status 'unavailable', got %q", hc.Status["google"])
		}
	})
}

func replaceQuery(rawURL, key, value string) string {
	u, _ := url.Parse(rawURL)
	q := u.Query()
	q.Set(key, value)
	u.RawQuery = q.Encode()
	return u.String()
}
