package database

import (
	"context"
	"time"
)

type User struct {
	ID           int       `json:"id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash []byte    `json:"-" db:"password_hash"`
	Validated    bool      `json:"validated"`
	Version      int       `json:"version"`
}

func (db *Database) GetAllUsers(ctx context.Context) ([]User, error) {
	query := `
        SELECT id, created_at, name, email, password_hash, validated, version
        FROM users
        ORDER BY id`

	rows, err := db.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.CreatedAt,
			&user.Name,
			&user.Email,
			&user.PasswordHash,
			&user.Validated,
			&user.Version,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
