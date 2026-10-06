// Package authtest provides a fake sign-in provider for tests. It serves both an OpenID Connect
// provider (discovery, JWKS, ID tokens) and OGS's OAuth2 endpoints and profile API, so one
// server can stand in for Google and OGS.
package authtest

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"time"
)

const (
	keyID = "authtest"
	alg   = "RS256"
)

// Identity is the user a test signs in as.
type Identity struct {
	// Subject is the user's ID. For OGS it must be a number.
	Subject       string
	Email         string
	EmailVerified any // bool, or a string to mimic providers that quote it
	Name          string
	// Nonce, when set, replaces the nonce from the authorization request in the ID token.
	Nonce string
}

// Server is a fake OpenID Connect provider. Its URL is the issuer.
type Server struct {
	*httptest.Server

	ClientID string
	key      *rsa.PrivateKey

	mu     sync.Mutex
	codes  map[string]grant
	tokens map[string]Identity // access token → user, for the profile endpoint
}

type grant struct {
	challenge   string
	nonce       string
	redirectURI string
	identity    Identity
}

// NewServer starts a fake provider that issues ID tokens for clientID. It is closed when the
// test ends.
func NewServer(t testing.TB, clientID string) *Server {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("generating key: %s", err)
	}
	s := &Server{ClientID: clientID, key: key, codes: map[string]grant{}, tokens: map[string]Identity{}}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /.well-known/openid-configuration", s.handleDiscovery)
	mux.HandleFunc("GET /jwks", s.handleJWKS)
	mux.HandleFunc("POST /token", s.handleToken)
	// OGS's paths.
	mux.HandleFunc("POST /oauth2/token/", s.handleToken)
	mux.HandleFunc("GET /api/v1/me/", s.handleOGSMe)
	s.Server = httptest.NewServer(mux)
	t.Cleanup(s.Close)
	return s
}

// Authorize stands in for the user approving the sign-in at the provider. authURL is where the
// app redirected the browser. It returns the redirect URI the provider would send the browser
// back to, carrying a code for identity and the app's state.
func (s *Server) Authorize(t testing.TB, authURL string, identity Identity) *url.URL {
	t.Helper()
	u, err := url.Parse(authURL)
	if err != nil {
		t.Fatalf("parsing authorization URL: %s", err)
	}
	q := u.Query()
	if got := q.Get("client_id"); got != s.ClientID {
		t.Fatalf("client_id = %q, want %q", got, s.ClientID)
	}
	if got := q.Get("code_challenge_method"); got != "S256" {
		t.Fatalf("code_challenge_method = %q, want S256", got)
	}

	code := rand.Text()
	s.mu.Lock()
	s.codes[code] = grant{
		challenge:   q.Get("code_challenge"),
		nonce:       q.Get("nonce"),
		redirectURI: q.Get("redirect_uri"),
		identity:    identity,
	}
	s.mu.Unlock()

	callback, err := url.Parse(q.Get("redirect_uri"))
	if err != nil {
		t.Fatalf("parsing redirect_uri: %s", err)
	}
	cq := callback.Query()
	cq.Set("code", code)
	cq.Set("state", q.Get("state"))
	callback.RawQuery = cq.Encode()
	return callback
}

func (s *Server) handleDiscovery(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"issuer":                                s.URL,
		"authorization_endpoint":                s.URL + "/authorize",
		"token_endpoint":                        s.URL + "/token",
		"jwks_uri":                              s.URL + "/jwks",
		"response_types_supported":              []string{"code"},
		"subject_types_supported":               []string{"public"},
		"id_token_signing_alg_values_supported": []string{alg},
	})
}

func (s *Server) handleJWKS(w http.ResponseWriter, _ *http.Request) {
	pub := s.key.PublicKey
	writeJSON(w, http.StatusOK, map[string]any{
		"keys": []map[string]string{{
			"kty": "RSA",
			"alg": alg,
			"use": "sig",
			"kid": keyID,
			"n":   b64(pub.N.Bytes()),
			"e":   b64(big.NewInt(int64(pub.E)).Bytes()),
		}},
	})
}

func (s *Server) handleToken(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		tokenError(w, "invalid_request")
		return
	}
	clientID, _, ok := r.BasicAuth()
	if !ok {
		clientID = r.PostForm.Get("client_id")
	}
	if clientID != s.ClientID {
		tokenError(w, "invalid_client")
		return
	}

	code := r.PostForm.Get("code")
	s.mu.Lock()
	g, found := s.codes[code]
	delete(s.codes, code) // codes are single-use
	s.mu.Unlock()

	sum := sha256.Sum256([]byte(r.PostForm.Get("code_verifier")))
	switch {
	case !found,
		r.PostForm.Get("grant_type") != "authorization_code",
		r.PostForm.Get("redirect_uri") != g.redirectURI,
		b64(sum[:]) != g.challenge:
		tokenError(w, "invalid_grant")
		return
	}

	nonce := g.nonce
	if g.identity.Nonce != "" {
		nonce = g.identity.Nonce
	}
	now := time.Now()
	idToken, err := s.sign(map[string]any{
		"iss":            s.URL,
		"aud":            s.ClientID,
		"sub":            g.identity.Subject,
		"iat":            now.Unix(),
		"exp":            now.Add(5 * time.Minute).Unix(),
		"nonce":          nonce,
		"email":          g.identity.Email,
		"email_verified": g.identity.EmailVerified,
		"name":           g.identity.Name,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	accessToken := rand.Text()
	s.mu.Lock()
	s.tokens[accessToken] = g.identity
	s.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]any{
		"access_token": accessToken,
		"token_type":   "Bearer",
		"expires_in":   3600,
		"id_token":     idToken,
	})
}

// handleOGSMe mimics OGS's GET /api/v1/me/ for the user the bearer token was issued to.
func (s *Server) handleOGSMe(w http.ResponseWriter, r *http.Request) {
	token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
	s.mu.Lock()
	identity, found := s.tokens[token]
	s.mu.Unlock()
	if !ok || !found {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"detail": "Invalid token."})
		return
	}
	// OGS sends the ID as a JSON number.
	writeJSON(w, http.StatusOK, map[string]any{
		"id":       json.Number(identity.Subject),
		"username": identity.Name,
	})
}

// sign returns claims as a compact RS256 JWT.
func (s *Server) sign(claims map[string]any) (string, error) {
	header, err := json.Marshal(map[string]string{"alg": alg, "typ": "JWT", "kid": keyID})
	if err != nil {
		return "", err
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	signingInput := b64(header) + "." + b64(payload)
	digest := sha256.Sum256([]byte(signingInput))
	sig, err := rsa.SignPKCS1v15(rand.Reader, s.key, crypto.SHA256, digest[:])
	if err != nil {
		return "", err
	}
	return signingInput + "." + b64(sig), nil
}

func tokenError(w http.ResponseWriter, code string) {
	writeJSON(w, http.StatusBadRequest, map[string]string{"error": code})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func b64(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}
