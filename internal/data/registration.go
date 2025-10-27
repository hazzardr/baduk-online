package data

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base32"
	"errors"
	"time"

	"github.com/hazzardr/baduk-online/internal/validator"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegistrationToken represents a time-limited token used for email verification during user registration.
type RegistrationToken struct {
	Plaintext string
	Hash      []byte
	UserID    int64
	Expiry    time.Time
}

// ValidateRegistrationToken checks that a registration token is provided and has the correct length.
func ValidateRegistrationToken(v *validator.Validator, tokenPlaintext string) {
	v.Check(tokenPlaintext != "", "token", "must not be empty")
	v.Check(len(tokenPlaintext) == 26, "token", "must be exactly 26 bytes")
}

// generateRandomToken creates a cryptographically secure random token encoded as base32.
func generateRandomToken() (string, error) {
	randomBytes := make([]byte, 16)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(randomBytes), nil
}

// generateRegistrationToken creates a new registration token with a SHA256 hash and expiry time.
func generateRegistrationToken(userID int64, ttl time.Duration) (*RegistrationToken, error) {
	plaintext, err := generateRandomToken()
	if err != nil {
		return nil, err
	}
	t := &RegistrationToken{
		Plaintext: plaintext,
		UserID:    userID,
		Expiry:    time.Now().Add(ttl),
	}
	hash := sha256.Sum256([]byte(t.Plaintext))
	t.Hash = hash[:]
	return t, nil
}

// registrationStore handles database operations for registration tokens.
type registrationStore struct {
	db *pgxpool.Pool
}

// Insert stores a registration token in the database.
func (r *registrationStore) Insert(ctx context.Context, token *RegistrationToken) error {
	query := `
		INSERT INTO registration (hash, user_id, expiry)
		VALUES ($1, $2, $3)
	`
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := r.db.Exec(c, query, token.Hash, token.UserID, token.Expiry)
	if err != nil {
		return err
	}
	return nil
}

// NewToken creates a registration token and inserts it into the database, returning the plaintext token.
func (r *registrationStore) NewToken(ctx context.Context, userID int64, ttl time.Duration) (*RegistrationToken, error) {
	t, err := generateRegistrationToken(userID, ttl)
	if err != nil {
		return nil, err
	}

	err = r.Insert(ctx, t)
	return t, err
}

// RevokeTokensForUser removes all registration tokens associated with a user.
func (r *registrationStore) RevokeTokensForUser(ctx context.Context, userID int64) error {
	query := `
		DELETE FROM registration
		WHERE user_id = $1
	`

	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := r.db.Exec(c, query, userID)
	return err
}

// GetUserFromToken retrieves any user associated with a valid, non-expired token
func (r *registrationStore) GetUserFromToken(ctx context.Context, plaintextToken string) (*User, error) {
	query := `
		SELECT
			u.id,
			u.created_at,
			u.name,
			u.email,
			u.password_hash,
			u.validated,
			u.version
		FROM
			users u
		INNER JOIN
			registration r
		ON
			u.id = r.user_id
		WHERE
			r.hash = $1
		AND
			r.expiry > $2
	`

	tokenHash := sha256.Sum256([]byte(plaintextToken))

	// Have to do some annoying magic to convert array -> slice for the pgx driver
	args := []any{tokenHash[:], time.Now()}

	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var user User
	err := r.db.QueryRow(c, query, args...).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.Name,
		&user.Email,
		&user.Password.hash,
		&user.Validated,
		&user.Version,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNoUserFound
		} else {
			return nil, err
		}
	}

	return &user, nil
}
