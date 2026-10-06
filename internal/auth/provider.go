// Package auth signs users in with external providers through a browser redirect: OpenID
// Connect providers (Google) and plain OAuth2 providers that expose a profile endpoint (OGS).
package auth

import "context"

// Provider names, as used in URLs and the identities table.
const (
	Google = "google"
	OGS    = "ogs"
)

// Provider signs users in with the authorization code flow and PKCE.
type Provider interface {
	// Name identifies the provider in URLs and in the identities table, e.g. "google".
	Name() string
	// AuthCodeURL returns the URL to send the browser to. state and nonce must be random and
	// single-use; pkceVerifier comes from oauth2.GenerateVerifier. Providers that don't
	// support OpenID Connect ignore nonce.
	AuthCodeURL(state, nonce, pkceVerifier string) string
	// Exchange trades an authorization code for tokens and returns the signed-in identity.
	Exchange(ctx context.Context, code, pkceVerifier, nonce string) (*Claims, error)
}

// Claims identify the user at a provider.
type Claims struct {
	// Subject is the provider's permanent ID for the user.
	Subject string
	// Email is empty when the provider doesn't share one.
	Email         string
	EmailVerified bool
	Name          string
}
