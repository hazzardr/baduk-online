package auth_test

import (
	"net/url"
	"testing"

	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/auth/authtest"
	"golang.org/x/oauth2"
)

func newOGS(t *testing.T) (*auth.OAuth2Provider, *authtest.Server) {
	t.Helper()
	idp := authtest.NewServer(t, "client-id")
	return auth.NewOGSProvider(idp.URL, "client-id", "client-secret", redirectURL), idp
}

func TestOGSAuthCodeURL(t *testing.T) {
	p, idp := newOGS(t)
	u, err := url.Parse(p.AuthCodeURL("the-state", "unused-nonce", oauth2.GenerateVerifier()))
	if err != nil {
		t.Fatal(err)
	}
	if got := u.Scheme + "://" + u.Host + u.Path; got != idp.URL+"/oauth2/authorize/" {
		t.Errorf("authorization endpoint = %s", got)
	}
	q := u.Query()
	want := map[string]string{
		"client_id":             "client-id",
		"redirect_uri":          redirectURL,
		"response_type":         "code",
		"scope":                 "read",
		"state":                 "the-state",
		"code_challenge_method": "S256",
	}
	for k, v := range want {
		if got := q.Get(k); got != v {
			t.Errorf("%s = %q, want %q", k, got, v)
		}
	}
	if q.Has("nonce") {
		t.Error("nonce sent to a provider without OpenID Connect")
	}
}

func TestOGSExchange(t *testing.T) {
	p, idp := newOGS(t)
	verifier := oauth2.GenerateVerifier()
	callback := idp.Authorize(t, p.AuthCodeURL("state", "", verifier),
		authtest.Identity{Subject: "1234567", Name: "kageyama"})

	claims, err := p.Exchange(t.Context(), callback.Query().Get("code"), verifier, "")
	if err != nil {
		t.Fatalf("Exchange: %s", err)
	}
	want := auth.Claims{Subject: "1234567", Name: "kageyama"}
	if *claims != want {
		t.Errorf("claims = %+v, want %+v", *claims, want)
	}
}

func TestOGSExchangeRejectsWrongPKCEVerifier(t *testing.T) {
	p, idp := newOGS(t)
	callback := idp.Authorize(t, p.AuthCodeURL("state", "", oauth2.GenerateVerifier()),
		authtest.Identity{Subject: "1", Name: "a"})
	if _, err := p.Exchange(t.Context(), callback.Query().Get("code"), oauth2.GenerateVerifier(), ""); err == nil {
		t.Fatal("expected an error for a PKCE verifier that does not match the challenge")
	}
}

func TestOGSExchangeRejectsInvalidID(t *testing.T) {
	for _, id := range []string{"0", "-5", "1.5"} {
		t.Run(id, func(t *testing.T) {
			p, idp := newOGS(t)
			verifier := oauth2.GenerateVerifier()
			callback := idp.Authorize(t, p.AuthCodeURL("state", "", verifier),
				authtest.Identity{Subject: id, Name: "a"})
			if _, err := p.Exchange(t.Context(), callback.Query().Get("code"), verifier, ""); err == nil {
				t.Fatalf("expected an error for user id %s", id)
			}
		})
	}
}
