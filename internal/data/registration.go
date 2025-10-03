package data

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"time"

	"github.com/hazzardr/baduk-online/internal/validator"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RegistrationToken struct {
	Plaintext string
	Hash      []byte
	UserID    int64
	Expiry    time.Time
}

func ValidateRegistrationToken(v *validator.Validator, tokenPlaintext string) {
	v.Check(tokenPlaintext != "", "token", "must not be empty")
	v.Check(len(tokenPlaintext) != 26, "token", "must be exactly 26 bytes")
}

func generateRegistrationToken(userID int64, ttl time.Duration) *RegistrationToken {
	t := &RegistrationToken{
		Plaintext: rand.Text(),
		UserID:    userID,
		Expiry:    time.Now().Add(ttl),
	}
	hash := sha256.Sum256([]byte(t.Plaintext))
	t.Hash = hash[:]
	return t
}

type registrationStore struct {
	db *pgxpool.Pool
}

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

// New creates a token and inserts it into the database
func (r *registrationStore) New(ctx context.Context, userID int64, ttl time.Duration) (*RegistrationToken, error) {
	t := generateRegistrationToken(userID, ttl)

	err := r.Insert(ctx, t)
	return t, err
}

func (r *registrationStore) DeleteRegistrationTokensForUser(ctx context.Context, userID int64) error {
	query := `
		DELETE FROM registration
		WHERE user_id = $1
	`

	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := r.db.Exec(c, query, userID)
	return err
}
