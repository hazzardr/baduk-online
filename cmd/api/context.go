package api

type contextKey string

// Session keys.
const (
	// userIDSessionKey holds the signed-in user's ID.
	userIDSessionKey = contextKey("userID")

	// Single-use values for an OAuth sign-in in progress.
	oauthStateSessionKey    = contextKey("oauthState")
	oauthNonceSessionKey    = contextKey("oauthNonce")
	oauthVerifierSessionKey = contextKey("oauthVerifier")
)
