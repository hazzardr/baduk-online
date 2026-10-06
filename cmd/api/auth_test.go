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

// authEnv is the API with Google and OGS both played by one fake provider, plus helpers that
// drive a browser-like client through sign-in.
type authEnv struct {
	server *httptest.Server
	idp    *authtest.Server
	db     *data.Database
}

func newAuthEnv(t *testing.T, db *data.Database) *authEnv {
	t.Helper()
	idp := authtest.NewServer(t, "client-id")

	// Providers need the server's URL for their redirect URLs, and the server needs the API, so
	// route through a handler that is set once both exist.
	var handler http.Handler
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeHTTP(w, r)
	}))
	t.Cleanup(server.Close)

	google, err := auth.NewOIDCProvider(t.Context(), "google", idp.URL, "client-id", "client-secret",
		server.URL+"/api/v1/auth/google/callback")
	if err != nil {
		t.Fatalf("NewOIDCProvider: %s", err)
	}
	ogs := auth.NewOGSProvider(idp.URL, "client-id", "client-secret", server.URL+"/api/v1/auth/ogs/callback")

	providers := []auth.Provider{google, ogs}
	handler = New("test", "1.0.0", db, providers, []string{server.URL}, nil).Routes()
	return &authEnv{server: server, idp: idp, db: db}
}

// newBrowser returns a client that keeps cookies and stops at each redirect so tests can
// inspect it.
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

// startSignIn begins a sign-in with provider and returns the provider's callback URL after the
// user approves.
func (e *authEnv) startSignIn(t *testing.T, browser *http.Client, provider string, identity authtest.Identity) string {
	t.Helper()
	status, location := e.get(t, browser, "/api/v1/auth/"+provider+"/start")
	if status != http.StatusFound || !strings.HasPrefix(location, e.idp.URL+"/") {
		t.Fatalf("start: status %d, Location %q; want a redirect to the provider", status, location)
	}
	return e.idp.Authorize(t, location, identity).String()
}

// signIn runs a whole sign-in and returns where the callback redirected the browser.
func (e *authEnv) signIn(t *testing.T, browser *http.Client, provider string, identity authtest.Identity) string {
	t.Helper()
	status, location := e.get(t, browser, e.startSignIn(t, browser, provider, identity))
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

func logout(t *testing.T, browser *http.Client, serverURL string) {
	t.Helper()
	resp, err := browser.Post(serverURL+"/api/v1/logout", "application/json", nil)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("logout status %d", resp.StatusCode)
	}
}

func deref(s *string) string {
	if s == nil {
		return "<nil>"
	}
	return *s
}

func TestSignInIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()
	env := newAuthEnv(t, db)

	ada := authtest.Identity{Subject: "sub-ada", Email: "ada@example.com", EmailVerified: true, Name: "Ada"}
	shusaku := authtest.Identity{Subject: "1001", Name: "shusaku"}

	t.Run("signed out user gets 401", func(t *testing.T) {
		if user := env.currentUser(t, newBrowser(t)); user != nil {
			t.Fatalf("got user %+v, want 401", user)
		}
	})

	t.Run("first Google sign-in creates the user", func(t *testing.T) {
		browser := newBrowser(t)
		if location := env.signIn(t, browser, "google", ada); location != "/" {
			t.Fatalf("callback redirected to %q, want /", location)
		}
		user := env.currentUser(t, browser)
		if user == nil || user.Name != "Ada" || deref(user.Email) != "ada@example.com" {
			t.Fatalf("current user = %+v", user)
		}
		if _, err := db.Identities.GetUser(t.Context(), "google", "sub-ada"); err != nil {
			t.Fatalf("identity not linked: %s", err)
		}
	})

	t.Run("first OGS sign-in creates a user without email", func(t *testing.T) {
		browser := newBrowser(t)
		if location := env.signIn(t, browser, "ogs", shusaku); location != "/" {
			t.Fatalf("callback redirected to %q, want /", location)
		}
		user := env.currentUser(t, browser)
		if user == nil {
			t.Fatal("not signed in")
		}
		if user.Name != "shusaku" || user.Email != nil {
			t.Fatalf("current user = %+v (email %s)", user, deref(user.Email))
		}
		if _, err := db.Identities.GetUser(t.Context(), "ogs", "1001"); err != nil {
			t.Fatalf("identity not linked: %s", err)
		}
	})

	t.Run("several users can have no email", func(t *testing.T) {
		browser := newBrowser(t)
		env.signIn(t, browser, "ogs", authtest.Identity{Subject: "1002", Name: "dosaku"})
		if user := env.currentUser(t, browser); user == nil || user.Name != "dosaku" {
			t.Fatalf("current user = %+v", user)
		}
	})

	t.Run("API returns email as null when there is none", func(t *testing.T) {
		browser := newBrowser(t)
		env.signIn(t, browser, "ogs", shusaku)
		resp, err := browser.Get(env.server.URL + "/api/v1/user")
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		var body map[string]any
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if email, ok := body["email"]; !ok || email != nil {
			t.Errorf("email = %v (present %t), want null", email, ok)
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
		env.signIn(t, browser, "google", changed)

		user := env.currentUser(t, browser)
		if user == nil || deref(user.Email) != "ada@example.com" {
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

	t.Run("identities at different providers are different users", func(t *testing.T) {
		// Same subject string at two providers.
		browser := newBrowser(t)
		env.signIn(t, browser, "google", authtest.Identity{
			Subject: "1001", Email: "g1001@example.com", EmailVerified: true, Name: "Google 1001",
		})
		user := env.currentUser(t, browser)
		if user == nil || user.Name != "Google 1001" {
			t.Fatalf("current user = %+v, want a new Google user", user)
		}
	})
}

func TestSignInSessionIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()
	env := newAuthEnv(t, db)

	ada := authtest.Identity{Subject: "sub-ada", Email: "ada@example.com", EmailVerified: true, Name: "Ada"}
	shusaku := authtest.Identity{Subject: "1001", Name: "shusaku"}

	t.Run("sign-in issues a new session token", func(t *testing.T) {
		browser := newBrowser(t)
		callback := env.startSignIn(t, browser, "ogs", shusaku)
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
		env.signIn(t, browser, "google", ada)
		if status, location := env.get(t, browser, "/api/v1/auth/ogs/start"); status != http.StatusFound ||
			location != "/" {
			t.Errorf("status %d, Location %q; want a redirect to /", status, location)
		}
	})

	t.Run("logout ends the session", func(t *testing.T) {
		browser := newBrowser(t)
		env.signIn(t, browser, "ogs", shusaku)
		logout(t, browser, env.server.URL)
		if user := env.currentUser(t, browser); user != nil {
			t.Errorf("still signed in as %+v", user)
		}
	})

	t.Run("unknown provider is 404", func(t *testing.T) {
		if status, _ := env.get(t, newBrowser(t), "/api/v1/auth/myspace/start"); status != http.StatusNotFound {
			t.Errorf("status %d, want 404", status)
		}
	})
}

func TestSignInRejectedIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()
	env := newAuthEnv(t, db)

	ada := authtest.Identity{Subject: "sub-ada", Email: "ada@example.com", EmailVerified: true, Name: "Ada"}
	shusaku := authtest.Identity{Subject: "1001", Name: "shusaku"}
	env.signIn(t, newBrowser(t), auth.Google, ada) // owns ada@example.com

	rejected := []struct {
		name      string
		provider  string
		identity  authtest.Identity
		tamper    func(callback string) string
		wantError string
	}{
		{
			name:      "unverified email",
			provider:  "google",
			identity:  authtest.Identity{Subject: "sub-unverified", Email: "u@example.com", EmailVerified: false},
			wantError: signInEmailUnverified,
		},
		{
			name:     "email already used by another identity",
			provider: "google",
			identity: authtest.Identity{
				Subject: "sub-other", Email: "ada@example.com", EmailVerified: true, Name: "Not Ada",
			},
			wantError: signInEmailInUse,
		},
		{
			name:     "state mismatch",
			provider: "ogs",
			identity: authtest.Identity{Subject: "2001", Name: "s"},
			tamper: func(callback string) string {
				return replaceQuery(callback, "state", "forged")
			},
			wantError: signInExpired,
		},
		{
			name:     "callback for a different provider than the one started",
			provider: "ogs",
			identity: authtest.Identity{Subject: "2002", Name: "x"},
			tamper: func(callback string) string {
				return strings.Replace(callback, "/auth/ogs/", "/auth/google/", 1)
			},
			wantError: signInExpired,
		},
		{
			name:     "user denied access",
			provider: "ogs",
			identity: authtest.Identity{Subject: "2003", Name: "d"},
			tamper: func(callback string) string {
				return replaceQuery(callback, "error", "access_denied")
			},
			wantError: signInCancelled,
		},
		{
			name:     "nonce mismatch",
			provider: "google",
			identity: authtest.Identity{
				Subject: "sub-nonce", Email: "n@example.com", EmailVerified: true, Nonce: "replayed",
			},
			wantError: signInFailed,
		},
	}
	for _, tt := range rejected {
		t.Run("rejects "+tt.name, func(t *testing.T) {
			browser := newBrowser(t)
			callback := env.startSignIn(t, browser, tt.provider, tt.identity)
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
			for _, provider := range signInProviders {
				if _, err := db.Identities.GetUser(t.Context(), provider, tt.identity.Subject); err == nil {
					t.Errorf("identity was linked at %s", provider)
				}
			}
		})
	}

	t.Run("rejects a replayed callback", func(t *testing.T) {
		browser := newBrowser(t)
		callback := env.startSignIn(t, browser, "ogs", shusaku)
		env.get(t, browser, callback)
		// Sign out but keep the cookie jar, then replay the same callback URL.
		logout(t, browser, env.server.URL)
		if _, location := env.get(t, browser, callback); location != "/signin?error="+signInExpired {
			t.Errorf("replay redirected to %q", location)
		}
	})
}

func TestSignInUnavailableIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	api := New("test", "1.0.0", db, nil, []string{"http://localhost:3000"}, nil)
	server := httptest.NewServer(api.Routes())
	defer server.Close()
	env := &authEnv{server: server, db: db}

	for _, provider := range signInProviders {
		for _, path := range []string{"/start", "/callback?code=x&state=y"} {
			target := "/api/v1/auth/" + provider + path
			t.Run(target, func(t *testing.T) {
				_, location := env.get(t, newBrowser(t), target)
				if want := "/signin?error=" + signInUnavailable; location != want {
					t.Errorf("redirected to %q, want %q", location, want)
				}
			})
		}
	}

	t.Run("health check reports providers unavailable", func(t *testing.T) {
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
		for _, provider := range signInProviders {
			if hc.Status[provider] != "unavailable" {
				t.Errorf("%s status = %q, want 'unavailable'", provider, hc.Status[provider])
			}
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
