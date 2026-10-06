package api

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/data"
	"golang.org/x/oauth2"
)

// signInProviders are the providers people can sign in with. A provider that isn't configured
// (no credentials, or unreachable at startup) is reported as unavailable rather than unknown.
var signInProviders = []string{auth.Google, auth.OGS}

// Sign-in errors, passed to the sign-in page as /signin?error=<code>.
const (
	signInUnavailable     = "unavailable"
	signInCancelled       = "cancelled"
	signInExpired         = "expired"
	signInFailed          = "failed"
	signInEmailUnverified = "email_unverified"
	signInEmailInUse      = "email_in_use"
)

// signInProvider returns the configured provider named in the URL. Otherwise it responds,
// redirecting to the sign-in page for a known provider and 404 for an unknown one, and
// returns false.
func (api *API) signInProvider(w http.ResponseWriter, r *http.Request) (auth.Provider, bool) {
	name := chi.URLParam(r, "provider")
	if p, ok := api.providers[name]; ok {
		return p, true
	}
	if slices.Contains(signInProviders, name) {
		redirectToSignIn(w, r, signInUnavailable)
	} else {
		http.NotFound(w, r)
	}
	return nil, false
}

// handleSignInStart stores single-use state, nonce and PKCE values in the session and sends
// the browser to the provider to sign in.
func (api *API) handleSignInStart(w http.ResponseWriter, r *http.Request) {
	provider, ok := api.signInProvider(w, r)
	if !ok {
		return
	}
	ctx := r.Context()
	if api.sessionManager.GetInt64(ctx, string(userIDSessionKey)) != 0 {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	state, nonce, verifier := rand.Text(), rand.Text(), oauth2.GenerateVerifier()
	api.sessionManager.Put(ctx, string(oauthProviderSessionKey), provider.Name())
	api.sessionManager.Put(ctx, string(oauthStateSessionKey), state)
	api.sessionManager.Put(ctx, string(oauthNonceSessionKey), nonce)
	api.sessionManager.Put(ctx, string(oauthVerifierSessionKey), verifier)
	http.Redirect(w, r, provider.AuthCodeURL(state, nonce, verifier), http.StatusFound)
}

// handleSignInCallback completes a sign-in: it checks the state, exchanges the code, finds or
// creates the user for the identity, and starts a session.
func (api *API) handleSignInCallback(w http.ResponseWriter, r *http.Request) {
	provider, ok := api.signInProvider(w, r)
	if !ok {
		return
	}
	ctx := r.Context()
	// Pop, so each sign-in attempt can complete at most once.
	startedWith := api.sessionManager.PopString(ctx, string(oauthProviderSessionKey))
	state := api.sessionManager.PopString(ctx, string(oauthStateSessionKey))
	nonce := api.sessionManager.PopString(ctx, string(oauthNonceSessionKey))
	verifier := api.sessionManager.PopString(ctx, string(oauthVerifierSessionKey))

	q := r.URL.Query()
	if reason := q.Get("error"); reason != "" {
		slog.InfoContext(ctx, "sign-in not completed", "provider", provider.Name(), "error", reason)
		redirectToSignIn(w, r, signInCancelled)
		return
	}
	if state == "" || startedWith != provider.Name() ||
		subtle.ConstantTimeCompare([]byte(q.Get("state")), []byte(state)) != 1 {
		slog.WarnContext(ctx, "sign-in state mismatch", "provider", provider.Name(), "ip", r.RemoteAddr)
		redirectToSignIn(w, r, signInExpired)
		return
	}

	claims, err := provider.Exchange(ctx, q.Get("code"), verifier, nonce)
	if err != nil {
		slog.ErrorContext(ctx, "sign-in failed", "provider", provider.Name(), "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}
	// Email is optional, but one the provider hasn't verified can't be trusted.
	if claims.Email != "" && !claims.EmailVerified {
		slog.WarnContext(ctx, "sign-in rejected: email not verified", "provider", provider.Name(), "subject", claims.Subject)
		redirectToSignIn(w, r, signInEmailUnverified)
		return
	}

	user, err := api.userForIdentity(ctx, provider.Name(), claims)
	if err != nil {
		if errors.Is(err, data.ErrDuplicateEmail) {
			slog.WarnContext(ctx, "sign-in rejected: email belongs to another user",
				"provider", provider.Name(), "subject", claims.Subject)
			redirectToSignIn(w, r, signInEmailInUse)
			return
		}
		slog.ErrorContext(ctx, "sign-in failed", "provider", provider.Name(), "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}

	// A new session token on sign-in prevents session fixation.
	if err := api.sessionManager.RenewToken(ctx); err != nil {
		slog.ErrorContext(ctx, "renewing session token failed", "provider", provider.Name(), "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}
	api.sessionManager.Put(ctx, string(userIDSessionKey), user.ID)
	slog.InfoContext(ctx, "user signed in", "provider", provider.Name(), "user_id", user.ID, "ip", r.RemoteAddr)
	http.Redirect(w, r, "/", http.StatusFound)
}

// userForIdentity returns the user who signs in with the provider identity in claims, creating
// the user on first sign-in. Users are found by (provider, subject), never by email.
func (api *API) userForIdentity(ctx context.Context, provider string, claims *auth.Claims) (*data.User, error) {
	identity := &data.Identity{
		Provider:      provider,
		Subject:       claims.Subject,
		Email:         claims.Email,
		EmailVerified: claims.EmailVerified,
	}

	user, err := api.db.Identities.GetUser(ctx, provider, claims.Subject)
	if err == nil {
		return user, api.db.Identities.UpdateEmail(ctx, identity)
	}
	if !errors.Is(err, data.ErrNoUserFound) {
		return nil, err
	}

	user = &data.User{Name: displayName(claims)}
	if claims.Email != "" {
		user.Email = &claims.Email
	}
	err = api.db.Identities.CreateUser(ctx, user, identity)
	if errors.Is(err, data.ErrDuplicateIdentity) {
		// A concurrent callback for the same identity created the user first.
		return api.db.Identities.GetUser(ctx, provider, claims.Subject)
	}
	if err != nil {
		return nil, err
	}
	slog.InfoContext(ctx, "user created", "user_id", user.ID, "provider", provider)
	return user, nil
}

// displayName is the provider's name for the user, or the local part of their email.
func displayName(claims *auth.Claims) string {
	if name := strings.TrimSpace(claims.Name); name != "" {
		return name
	}
	if local, _, _ := strings.Cut(claims.Email, "@"); local != "" {
		return local
	}
	return "Player"
}

func redirectToSignIn(w http.ResponseWriter, r *http.Request, code string) {
	http.Redirect(w, r, "/signin?error="+code, http.StatusFound)
}

// handleLogout destroys the user's session.
func (api *API) handleLogout(w http.ResponseWriter, r *http.Request) {
	userID := api.sessionManager.GetInt64(r.Context(), string(userIDSessionKey))

	err := api.sessionManager.Destroy(r.Context())
	if err != nil {
		api.serverErrorResponse(w, r, err)
		return
	}

	if userID != 0 {
		slog.InfoContext(r.Context(), "user logged out", "user_id", userID, "ip", r.RemoteAddr)
	}

	response := map[string]string{
		"message": "logged out successfully",
	}

	err = api.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		api.serverErrorResponse(w, r, err)
	}
}
