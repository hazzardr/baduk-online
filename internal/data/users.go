package data

import (
	"context"
	"errors"
	"time"

	"github.com/hazzardr/go-baduk/internal/validator"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  password  `json:"-" db:"password_hash"`
	Validated bool      `json:"validated"`
	Version   int       `json:"-"`
}

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

func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "must be provided")
	v.Check(validator.Matches(email, validator.EmailRX), "email", "must be a valid email address")
}

func ValidatePasswordPlaintext(v *validator.Validator, password string) {
	v.Check(password != "", "password", "must be provided")
	v.Check(len(password) >= 8, "password", "must be at least 8 characters long")
	v.Check(len(password) <= 72, "password", "must not be more than 72 characters long")
}

func ValidateUser(v *validator.Validator, user *User) {
	v.Check(user.Name != "", "name", "must be provided")
	v.Check(len(user.Name) <= 50, "name", "must not be more than 50 characters long")

	ValidateEmail(v, user.Email)

	if user.Password.plaintext != nil {
		ValidatePasswordPlaintext(v, *user.Password.plaintext)
	}

	// If the password hash is ever nil, this will be due to a logic error in our
	// codebase (probably because we forgot to set a password for the user). It's a
	// useful sanity check to include here, but it's not a problem with the data
	// provided by the client. So rather than adding an error to the validation map we
	// panic instead.
	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}

func (u *userStore) Insert(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (name, email, password_hash, validated)
		VALUES ($1, $2, $3, $4)
        RETURNING id, created_at, version`
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	_, err := u.db.Exec(c, query, user.Name, user.Email, user.Password.hash, user.Validated)
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

func (u *userStore) GetByEmail(email string) (*User, error) {
	//TODO:
}
