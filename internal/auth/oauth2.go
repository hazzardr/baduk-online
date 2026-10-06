package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"golang.org/x/oauth2"
)

// OGSURL is online-go.com's base URL.
const OGSURL = "https://online-go.com"

// maxProfileBytes caps how much of a profile response is read.
const maxProfileBytes = 1 << 20

// ProfileParser reads the signed-in user's identity from a provider's profile response.
type ProfileParser func(body []byte) (*Claims, error)

// OAuth2Provider is a plain OAuth2 provider without OpenID Connect: after the token exchange,
// the identity comes from a profile endpoint called with the access token.
type OAuth2Provider struct {
	name       string
	config     oauth2.Config
	profileURL string
	parse      ProfileParser
}

var _ Provider = (*OAuth2Provider)(nil)

// NewOAuth2Provider returns a provider that reads identities from profileURL with parse.
func NewOAuth2Provider(name string, config oauth2.Config, profileURL string, parse ProfileParser) *OAuth2Provider {
	return &OAuth2Provider{name: name, config: config, profileURL: profileURL, parse: parse}
}

// NewOGSProvider returns a provider for the OGS server at baseURL (normally OGSURL).
func NewOGSProvider(baseURL, clientID, clientSecret, redirectURL string) *OAuth2Provider {
	return NewOAuth2Provider(OGS, oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  baseURL + "/oauth2/authorize/",
			TokenURL: baseURL + "/oauth2/token/",
		},
		RedirectURL: redirectURL,
		Scopes:      []string{"read"},
	}, baseURL+"/api/v1/me/", parseOGSProfile)
}

// Name implements Provider.
func (p *OAuth2Provider) Name() string {
	return p.name
}

// AuthCodeURL implements Provider. nonce is unused: there is no ID token to carry it.
func (p *OAuth2Provider) AuthCodeURL(state, _, pkceVerifier string) string {
	return p.config.AuthCodeURL(state, oauth2.S256ChallengeOption(pkceVerifier))
}

// Exchange implements Provider.
func (p *OAuth2Provider) Exchange(ctx context.Context, code, pkceVerifier, _ string) (*Claims, error) {
	token, err := p.config.Exchange(ctx, code, oauth2.VerifierOption(pkceVerifier))
	if err != nil {
		return nil, fmt.Errorf("exchanging code: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, p.profileURL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := p.config.Client(ctx, token).Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetching profile: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, maxProfileBytes))
	if err != nil {
		return nil, fmt.Errorf("reading profile: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fetching profile: status %d", resp.StatusCode)
	}

	claims, err := p.parse(body)
	if err != nil {
		return nil, fmt.Errorf("parsing profile: %w", err)
	}
	if claims.Subject == "" {
		return nil, errors.New("profile has no user ID")
	}
	return claims, nil
}

// parseOGSProfile reads GET /api/v1/me/. OGS doesn't share email addresses here, so OGS
// identities have none.
func parseOGSProfile(body []byte) (*Claims, error) {
	var me struct {
		ID       json.Number `json:"id"` // a number; decoded exactly rather than as a float
		Username string      `json:"username"`
	}
	if err := json.Unmarshal(body, &me); err != nil {
		return nil, err
	}
	id, err := me.ID.Int64()
	if err != nil || id <= 0 {
		return nil, fmt.Errorf("invalid user id %q", me.ID)
	}
	return &Claims{Subject: strconv.FormatInt(id, 10), Name: me.Username}, nil
}
