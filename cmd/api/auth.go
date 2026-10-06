package api

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/hazzardr/baduk-online/internal/auth"
	"github.com/hazzardr/baduk-online/internal/data"
	"golang.org/x/oauth2"
)

// Sign-in errors, passed to the sign-in page as /signin?error=<code>.
const (
	signInUnavailable     = "unavailable"
	signInCancelled       = "cancelled"
	signInExpired         = "expired"
	signInFailed          = "failed"
	signInEmailUnverified = "email_unverified"
	signInEmailInUse      = "email_in_use"
)

// handleGoogleStart stores single-use state, nonce and PKCE values in the session and sends the
// browser to Google to sign in.
func (api *API) handleGoogleStart(w http.ResponseWriter, r *http.Request) {
	if api.google == nil {
		redirectToSignIn(w, r, signInUnavailable)
		return
	}
	ctx := r.Context()
	if api.sessionManager.GetInt64(ctx, string(userIDSessionKey)) != 0 {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	state, nonce, verifier := rand.Text(), rand.Text(), oauth2.GenerateVerifier()
	api.sessionManager.Put(ctx, string(oauthStateSessionKey), state)
	api.sessionManager.Put(ctx, string(oauthNonceSessionKey), nonce)
	api.sessionManager.Put(ctx, string(oauthVerifierSessionKey), verifier)
	http.Redirect(w, r, api.google.AuthCodeURL(state, nonce, verifier), http.StatusFound)
}

// handleGoogleCallback completes a Google sign-in: it checks the state, exchanges the code,
// finds or creates the user for the Google identity, and starts a session.
func (api *API) handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	if api.google == nil {
		redirectToSignIn(w, r, signInUnavailable)
		return
	}
	ctx := r.Context()
	// Pop, so each sign-in attempt can complete at most once.
	state := api.sessionManager.PopString(ctx, string(oauthStateSessionKey))
	nonce := api.sessionManager.PopString(ctx, string(oauthNonceSessionKey))
	verifier := api.sessionManager.PopString(ctx, string(oauthVerifierSessionKey))

	q := r.URL.Query()
	if reason := q.Get("error"); reason != "" {
		slog.InfoContext(ctx, "google sign-in not completed", "error", reason)
		redirectToSignIn(w, r, signInCancelled)
		return
	}
	if state == "" || subtle.ConstantTimeCompare([]byte(q.Get("state")), []byte(state)) != 1 {
		slog.WarnContext(ctx, "google sign-in state mismatch", "ip", r.RemoteAddr)
		redirectToSignIn(w, r, signInExpired)
		return
	}

	claims, err := api.google.Exchange(ctx, q.Get("code"), verifier, nonce)
	if err != nil {
		slog.ErrorContext(ctx, "google sign-in failed", "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}
	if !claims.EmailVerified || claims.Email == "" {
		slog.WarnContext(ctx, "google sign-in rejected: email not verified", "subject", claims.Subject)
		redirectToSignIn(w, r, signInEmailUnverified)
		return
	}

	user, err := api.userForIdentity(ctx, api.google.Name, claims)
	if err != nil {
		if errors.Is(err, data.ErrDuplicateEmail) {
			slog.WarnContext(ctx, "google sign-in rejected: email belongs to another user", "subject", claims.Subject)
			redirectToSignIn(w, r, signInEmailInUse)
			return
		}
		slog.ErrorContext(ctx, "google sign-in failed", "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}

	// A new session token on sign-in prevents session fixation.
	if err := api.sessionManager.RenewToken(ctx); err != nil {
		slog.ErrorContext(ctx, "renewing session token failed", "err", err)
		redirectToSignIn(w, r, signInFailed)
		return
	}
	api.sessionManager.Put(ctx, string(userIDSessionKey), user.ID)
	slog.InfoContext(ctx, "user signed in", "user_id", user.ID, "provider", api.google.Name, "ip", r.RemoteAddr)
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

	user = &data.User{Name: displayName(claims), Email: claims.Email}
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
	local, _, _ := strings.Cut(claims.Email, "@")
	return local
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
