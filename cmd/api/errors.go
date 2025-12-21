package api

import "errors"

var (
	errUserUnauthenticated = errors.New("user is not properly authenticated")
)
