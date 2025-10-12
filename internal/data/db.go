package data

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Database provides access to the database connection pool and data stores.
type Database struct {
	Pool         *pgxpool.Pool
	Users        *userStore
	Registration *registrationStore
}

// userStore handles database operations for users.
type userStore struct {
	db *pgxpool.Pool
}

// New initializes a new database connection pool and returns a Database instance.
func New(dsn string) (*Database, error) {
	pool, err := pgxpool.New(context.Background(), dsn)

	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %v", err)
	}

	err = pool.Ping(context.Background())
	if err != nil {
		return nil, fmt.Errorf("unable to initialize connection pool: %v", err)
	}
	return &Database{
		pool,
		&userStore{db: pool},
		&registrationStore{db: pool},
	}, nil
}

// Close closes the database connection pool.
func (db *Database) Close() {
	db.Pool.Close()
}

// Ping verifies the database connection is alive.
func (db *Database) Ping(ctx context.Context) error {
	return db.Pool.Ping(ctx)
}
