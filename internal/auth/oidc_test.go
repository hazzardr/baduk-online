package auth_test

import (
	"errors"
	"net/url"
	"testing"

	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/auth/authtest"
	"golang.org/x/oauth2"
)

const redirectURL = "http://app.test/callback"

func newProvider(t *testing.T) (*auth.Provider, *authtest.Server) {
	t.Helper()
	idp := authtest.NewServer(t, "client-id")
	p, err := auth.NewProvider(t.Context(), "test", idp.URL, "client-id", "client-secret", redirectURL)
	if err != nil {
		t.Fatalf("NewProvider: %s", err)
	}
	return p, idp
}

// signIn runs the flow against the fake provider and returns the claims Exchange produced.
func signIn(t *testing.T, identity authtest.Identity, exchangeVerifier string) (*auth.Claims, error) {
	t.Helper()
	p, idp := newProvider(t)
	verifier := oauth2.GenerateVerifier()
	if exchangeVerifier == "" {
		exchangeVerifier = verifier
	}
	callback := idp.Authorize(t, p.AuthCodeURL("state", "nonce", verifier), identity)
	return p.Exchange(t.Context(), callback.Query().Get("code"), exchangeVerifier, "nonce")
}

func TestAuthCodeURL(t *testing.T) {
	p, idp := newProvider(t)
	u, err := url.Parse(p.AuthCodeURL("the-state", "the-nonce", oauth2.GenerateVerifier()))
	if err != nil {
		t.Fatal(err)
	}
	q := u.Query()
	want := map[string]string{
		"client_id":             "client-id",
		"redirect_uri":          redirectURL,
		"response_type":         "code",
		"scope":                 "openid email profile",
		"state":                 "the-state",
		"nonce":                 "the-nonce",
		"code_challenge_method": "S256",
	}
	for k, v := range want {
		if got := q.Get(k); got != v {
			t.Errorf("%s = %q, want %q", k, got, v)
		}
	}
	if q.Get("code_challenge") == "" {
		t.Error("code_challenge is missing")
	}
	if u.Scheme+"://"+u.Host+u.Path != idp.URL+"/authorize" {
		t.Errorf("authorization endpoint = %s", u)
	}
}

func TestExchange(t *testing.T) {
	tests := []struct {
		name         string
		verified     any
		wantVerified bool
	}{
		{name: "boolean claim", verified: true, wantVerified: true},
		{name: "string claim", verified: "true", wantVerified: true},
		{name: "unverified", verified: false, wantVerified: false},
		{name: "missing claim", verified: nil, wantVerified: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := signIn(t, authtest.Identity{
				Subject:       "sub-1",
				Email:         "a@example.com",
				EmailVerified: tt.verified,
				Name:          "A Player",
			}, "")
			if err != nil {
				t.Fatalf("Exchange: %s", err)
			}
			want := auth.Claims{
				Subject:       "sub-1",
				Email:         "a@example.com",
				EmailVerified: tt.wantVerified,
				Name:          "A Player",
			}
			if *claims != want {
				t.Errorf("claims = %+v, want %+v", *claims, want)
			}
		})
	}
}

func TestExchangeRejectsWrongNonce(t *testing.T) {
	_, err := signIn(t, authtest.Identity{Subject: "sub-1", Nonce: "someone-elses-nonce"}, "")
	if !errors.Is(err, auth.ErrNonceMismatch) {
		t.Fatalf("err = %v, want ErrNonceMismatch", err)
	}
}

func TestExchangeRejectsWrongPKCEVerifier(t *testing.T) {
	_, err := signIn(t, authtest.Identity{Subject: "sub-1"}, oauth2.GenerateVerifier())
	if err == nil {
		t.Fatal("expected an error for a PKCE verifier that does not match the challenge")
	}
}
