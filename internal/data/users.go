package data

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// User represents a user account in the system. Users sign in through an Identity at an
// external provider.
type User struct {
	ID        int64     `json:"-"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Version   int       `json:"-"`
}

// GetByID retrieves a user by ID.
// Returns ErrNoUserFound if no user exists with the given ID.
func (u *userStore) GetByID(ctx context.Context, id int64) (*User, error) {
	query := `
		SELECT id, created_at, name, email, version
		FROM users
		WHERE id = $1
	`
	var user User
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	err := u.db.QueryRow(c, query, id).Scan(
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
