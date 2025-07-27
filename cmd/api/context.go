package api

type contextKey string

// userContextKey is used as a key for getting and setting user information in the request
// context.
const userContextKey = contextKey("user")
