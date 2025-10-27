package data

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/hazzardr/baduk-online/internal/validator"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user account in the system.
type User struct {
	ID        int       `json:"-"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  password  `json:"-" db:"password_hash"`
	Validated bool      `json:"validated"`
	Version   int       `json:"-"`
}

// password holds both plaintext and bcrypt-hashed password values.
type password struct {
	plaintext *string
	hash      []byte `db:"password_hash"`
}

// Set calculates the hash of the password and stores both values in the struct
func (p *password) Set(plaintextPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), 12)
	if err != nil {
		return err
	}
	p.plaintext = &plaintextPassword
	p.hash = hash
	return nil
}

// Matches compares the hashed password to a hash of the plaintext input
func (p *password) Matches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plaintextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}

// ValidateEmail checks that an email address is provided and matches the expected format.
func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "must be provided")
	v.Check(validator.Matches(email, validator.EmailRX), "email", "must be a valid email address")
}

// ValidatePasswordPlaintext checks that a plaintext password meets length requirements (8-72 characters).
func ValidatePasswordPlaintext(v *validator.Validator, password string) {
	v.Check(password != "", "password", "must be provided")
	v.Check(len(password) >= 8, "password", "must be at least 8 characters long")
	v.Check(len(password) <= 72, "password", "must not be more than 72 characters long")
}

// ValidateUser performs validation checks on a User struct, including name, email, and password.
func ValidateUser(v *validator.Validator, user *User) {
	v.Check(user.Name != "", "name", "must be provided")
	v.Check(len(user.Name) <= 50, "name", "must not be more than 50 characters long")

	ValidateEmail(v, user.Email)

	if user.Password.plaintext != nil {
		ValidatePasswordPlaintext(v, *user.Password.plaintext)
	}

	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}

// Insert creates a new user in the database and populates the user's ID, CreatedAt, and Version fields.
// Returns ErrDuplicateEmail if a user with the same email already exists.
func (u *userStore) Insert(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (name, email, password_hash, validated)
		VALUES ($1, $2, $3, $4)
        RETURNING id, created_at, version`
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	err := u.db.QueryRow(c, query, user.Name, user.Email, user.Password.hash, user.Validated).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.Version,
	)
	if err != nil {
		var e *pgconn.PgError
		if errors.As(err, &e) {
			if e.Code == pgerrcode.UniqueViolation {
				return ErrDuplicateEmail
			}
		}
		return err
	}

	return nil
}

// GetByEmail retrieves a user by their email address.
// Returns ErrNoUserFound if no user exists with the given email.
func (u *userStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT
			u.id,
			u.created_at,
			u.name,
			u.email,
			u.password_hash,
			u.validated,
			u.version
		FROM users u
		WHERE
			u.email = $1
		;
	`
	var user User
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	err := u.db.QueryRow(c, query, email).Scan(
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
		}
		return nil, err
	}
	return &user, nil
}

// DeleteUser removes a user from the database by their email address.
// Returns ErrNoUserFound if no user exists with the given email.
func (u *userStore) DeleteUser(ctx context.Context, user *User) error {
	query := `
		DELETE
		FROM users
		WHERE
			email = $1
		;
	`
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	result, err := u.db.Exec(c, query, user.Email)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return ErrNoUserFound
	}

	return nil
}
