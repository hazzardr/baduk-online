package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/hazzardr/baduk-online/cmd/api"
	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/hazzardr/baduk-online/tests"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/nalgeon/be"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

var testDB *data.Database
var testContainer testcontainers.Container

func TestMain(m *testing.M) {
	ctx := context.Background()
	user := "baduk_online"
	pass := "not-real"

	pg, err := testcontainers.Run(ctx, "postgres:17.5-alpine",
		testcontainers.WithEnv(map[string]string{
			"POSTGRES_DB":       user,
			"POSTGRES_USER":     user,
			"POSTGRES_PASSWORD": pass,
		}),
		testcontainers.WithExposedPorts("5432"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second)),
	)
	if err != nil {
		panic(err)
	}
	testContainer = pg

	endpoint, err := pg.Endpoint(ctx, "")
	if err != nil {
		panic(err)
	}
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s/%s?sslmode=disable",
		user, pass, endpoint, user,
	)
	testDB, err = data.New(dsn)
	if err != nil {
		panic(err)
	}
	err = data.RunMigrations(dsn, embedMigrations)
	if err != nil {
		panic(err)
	}

	// Run all tests
	code := m.Run()

	// Cleanup
	testDB.Close()
	testContainer.Terminate(ctx)

	os.Exit(code)
}

// cleanupDB truncates all tables to reset the database state between tests
func cleanupDB(t *testing.T) {
	t.Helper()
	ctx := context.Background()

	// Truncate all tables in the correct order to handle foreign key constraints
	_, err := testDB.Pool.Exec(ctx, `
		TRUNCATE TABLE registration CASCADE;
		TRUNCATE TABLE sessions CASCADE;
		TRUNCATE TABLE users CASCADE;
	`)
	if err != nil {
		t.Fatalf("failed to clean database: %v", err)
	}
}

func TestAPIStandsUp(t *testing.T) {
	// Clean database before test
	cleanupDB(t)

	ctx := context.Background()
	err := testDB.Ping(ctx)
	be.Err(t, err, nil)

	mockMailer := tests.NewMockMailer()
	testAPI := api.New(
		"test",
		"0.1.0-testing",
		testDB,
		&mockMailer,
		[]string{"http://localhost:3000"},
	)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	testAPI.Routes().ServeHTTP(w, req)
	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("got %d, want %d", resp.StatusCode, http.StatusOK)
	}
}
