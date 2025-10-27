package data

import (
	"errors"
)

var (
	// ErrDuplicateEmail is returned when attempting to create a user with an email that already exists.
	ErrDuplicateEmail error = errors.New("duplicate email")
	// ErrNoUserFound is returned when a user query returns no results.
	ErrNoUserFound error = errors.New("no user found")
	//ErrEditConflict is returned when an edit is performed on stale data
	ErrEditConflict error = errors.New("record modified in flight")
)
