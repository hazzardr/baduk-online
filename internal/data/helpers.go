package data

import (
	"errors"
)

var (
	ErrDuplicateEmail = errors.New("duplicate email")
	ErrNoUserFound    = errors.New("no user found")
)
