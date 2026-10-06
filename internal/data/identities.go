package data

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Identity is a sign-in identity at an external provider, such as a Google account.
type Identity struct {
	Provider string
	Subject  string
	// Email is empty when the provider doesn't share one; it's stored as NULL.
	Email         string
	EmailVerified bool
}

// identityStore handles database operations for sign-in identities.
type identityStore struct {
	db *pgxpool.Pool
}

// GetUser returns the user that signs in with the identity (provider, subject).
// Returns ErrNoUserFound if the identity has never signed in.
func (s *identityStore) GetUser(ctx context.Context, provider, subject string) (*User, error) {
	query := `
		SELECT u.id, u.created_at, u.name, u.email, u.version
		FROM identities i
		JOIN users u ON u.id = i.user_id
		WHERE i.provider = $1 AND i.subject = $2
	`
	var user User
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	err := s.db.QueryRow(c, query, provider, subject).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.Name,
		&user.Email,
		&user.Version,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNoUserFound
		}
		return nil, err
	}
	return &user, nil
}

// UpdateEmail records the email the provider reported at the latest sign-in.
func (s *identityStore) UpdateEmail(ctx context.Context, identity *Identity) error {
	query := `
		UPDATE identities
		SET email = NULLIF($3, ''), email_verified = $4
		WHERE provider = $1 AND subject = $2
	`
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	_, err := s.db.Exec(c, query, identity.Provider, identity.Subject, identity.Email, identity.EmailVerified)
	return err
}

// CreateUser creates user and links identity to it in one transaction, populating the user's
// ID, CreatedAt and Version. Returns ErrDuplicateEmail if another user already has the email,
// and ErrDuplicateIdentity if the identity is already linked.
func (s *identityStore) CreateUser(ctx context.Context, user *User, identity *Identity) error {
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	tx, err := s.db.Begin(c)
	if err != nil {
		return err
	}
	defer tx.Rollback(c) //nolint:errcheck // no-op after Commit

	err = tx.QueryRow(c, `
		INSERT INTO users (name, email)
		VALUES ($1, $2)
		RETURNING id, created_at, version`,
		user.Name, user.Email,
	).Scan(&user.ID, &user.CreatedAt, &user.Version)
	if err != nil {
		if isUniqueViolation(err) {
			return ErrDuplicateEmail
		}
		return fmt.Errorf("inserting user: %w", err)
	}

	_, err = tx.Exec(c, `
		INSERT INTO identities (provider, subject, user_id, email, email_verified)
		VALUES ($1, $2, $3, NULLIF($4, ''), $5)`,
		identity.Provider, identity.Subject, user.ID, identity.Email, identity.EmailVerified,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return ErrDuplicateIdentity
		}
		return fmt.Errorf("inserting identity: %w", err)
	}

	return tx.Commit(c)
}

func isUniqueViolation(err error) bool {
	var e *pgconn.PgError
	return errors.As(err, &e) && e.Code == pgerrcode.UniqueViolation
}
