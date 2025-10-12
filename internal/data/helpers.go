package data

import (
	"errors"
)

var (
	// ErrDuplicateEmail is returned when attempting to create a user with an email that already exists.
	ErrDuplicateEmail = errors.New("duplicate email")
	// ErrNoUserFound is returned when a user query returns no results.
	ErrNoUserFound = errors.New("no user found")
)
