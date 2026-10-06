// Package auth signs users in with external OpenID Connect providers.
package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// GoogleIssuer is Google's OpenID Connect issuer URL.
const GoogleIssuer = "https://accounts.google.com"

// ErrNonceMismatch is returned when the ID token's nonce differs from the one sent with the
// authorization request, which means the token was not issued for this sign-in attempt.
var ErrNonceMismatch = errors.New("id token nonce mismatch")

// Provider is an OpenID Connect provider configured for the authorization code flow with PKCE.
type Provider struct {
	// Name identifies the provider in the identities table, e.g. "google".
	Name     string
	config   oauth2.Config
	verifier *oidc.IDTokenVerifier
}

// Claims are the identity claims read from a verified ID token.
type Claims struct {
	Subject       string
	Email         string
	EmailVerified bool
	Name          string
}

// NewProvider discovers the provider's endpoints from issuer and returns a Provider that
// redirects back to redirectURL.
func NewProvider(ctx context.Context, name, issuer, clientID, clientSecret, redirectURL string) (*Provider, error) {
	p, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		return nil, fmt.Errorf("discovering %s: %w", issuer, err)
	}
	return &Provider{
		Name: name,
		config: oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Endpoint:     p.Endpoint(),
			RedirectURL:  redirectURL,
			Scopes:       []string{oidc.ScopeOpenID, "email", "profile"},
		},
		verifier: p.Verifier(&oidc.Config{ClientID: clientID}),
	}, nil
}

// AuthCodeURL returns the URL to send the browser to. state and nonce must be random and
// single-use; pkceVerifier comes from oauth2.GenerateVerifier.
func (p *Provider) AuthCodeURL(state, nonce, pkceVerifier string) string {
	return p.config.AuthCodeURL(state, oidc.Nonce(nonce), oauth2.S256ChallengeOption(pkceVerifier))
}

// Exchange trades an authorization code for tokens, verifies the ID token's signature,
// issuer, audience, expiry and nonce, and returns its claims.
func (p *Provider) Exchange(ctx context.Context, code, pkceVerifier, nonce string) (*Claims, error) {
	token, err := p.config.Exchange(ctx, code, oauth2.VerifierOption(pkceVerifier))
	if err != nil {
		return nil, fmt.Errorf("exchanging code: %w", err)
	}
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		return nil, errors.New("token response has no id_token")
	}
	idToken, err := p.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, fmt.Errorf("verifying id token: %w", err)
	}
	if idToken.Nonce != nonce {
		return nil, ErrNonceMismatch
	}

	var raw struct {
		Email         string       `json:"email"`
		EmailVerified flexibleBool `json:"email_verified"`
		Name          string       `json:"name"`
	}
	if err := idToken.Claims(&raw); err != nil {
		return nil, fmt.Errorf("reading id token claims: %w", err)
	}
	return &Claims{
		Subject:       idToken.Subject,
		Email:         raw.Email,
		EmailVerified: bool(raw.EmailVerified),
		Name:          raw.Name,
	}, nil
}

// flexibleBool accepts a JSON boolean or a quoted one ("true"), since some providers send
// email_verified as a string.
type flexibleBool bool

func (b *flexibleBool) UnmarshalJSON(data []byte) error {
	var v any
	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}
	switch t := v.(type) {
	case bool:
		*b = flexibleBool(t)
	case string:
		parsed, err := strconv.ParseBool(t)
		if err != nil {
			return fmt.Errorf("invalid boolean %q: %w", t, err)
		}
		*b = flexibleBool(parsed)
	case nil:
		*b = false
	default:
		return fmt.Errorf("invalid boolean %s", data)
	}
	return nil
}
