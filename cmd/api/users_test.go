package api

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/pressly/goose/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func setupTestDB(t *testing.T) (*data.Database, func()) {
	ctx := context.Background()

	pgContainer, err := postgres.Run(ctx,
		"postgres:17.5",
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second)),
	)
	if err != nil {
		t.Fatalf("failed to start postgres container: %s", err)
	}

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("failed to get connection string: %s", err)
	}

	sqlDB, err := sql.Open("pgx", connStr)
	if err != nil {
		t.Fatalf("failed to open database connection for migrations: %s", err)
	}
	defer sqlDB.Close()

	if err := goose.Up(sqlDB, "../../migrations"); err != nil {
		t.Fatalf("failed to run migrations: %s", err)
	}

	db, err := data.New(connStr)
	if err != nil {
		t.Fatalf("failed to connect to test database: %s", err)
	}

	cleanup := func() {
		db.Close()
		if err := pgContainer.Terminate(ctx); err != nil {
			t.Logf("failed to terminate container: %s", err)
		}
	}

	return db, cleanup
}

type mockMailer struct {
	emailsSent []*data.User
}

func (m *mockMailer) SendRegistrationEmail(ctx context.Context, user *data.User) error {
	m.emailsSent = append(m.emailsSent, user)
	return nil
}

func TestUserRegistrationIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	mailer := &mockMailer{}
	api := NewAPI("test", "1.0.0", db, mailer)
	server := httptest.NewServer(api.Routes())
	defer server.Close()

	t.Run("create user successfully", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Test User",
			"email":    "test@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			var errResp map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&errResp)
			t.Fatalf("expected status 201, got %d: %+v", resp.StatusCode, errResp)
		}

		var user data.User
		if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
			t.Fatalf("failed to decode response: %s", err)
		}

		if user.Name != "Test User" {
			t.Errorf("expected name 'Test User', got '%s'", user.Name)
		}
		if user.Email != "test@example.com" {
			t.Errorf("expected email 'test@example.com', got '%s'", user.Email)
		}
		if user.Validated {
			t.Error("expected user to be unvalidated")
		}

		if len(mailer.emailsSent) != 1 {
			t.Errorf("expected 1 email sent, got %d", len(mailer.emailsSent))
		}

		dbUser, err := db.Users.GetByEmail(context.Background(), "test@example.com")
		if err != nil {
			t.Fatalf("failed to get user from database: %s", err)
		}
		if dbUser.Name != "Test User" {
			t.Errorf("database user name mismatch")
		}
		if dbUser.Validated {
			t.Error("database user should be unvalidated")
		}
		matches, err := dbUser.Password.Matches("password123")
		if err != nil {
			t.Fatalf("failed to check password: %s", err)
		}
		if !matches {
			t.Error("password should match")
		}
	})

	t.Run("prevent duplicate email", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Another User",
			"email":    "test@example.com",
			"password": "password456",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusConflict {
			t.Errorf("expected status 409, got %d", resp.StatusCode)
		}
	})

	t.Run("validate password length", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Short Pass User",
			"email":    "test@example.com",
			"password": "short",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422, got %d", resp.StatusCode)
		}
	})

	t.Run("validate email format", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Bad Email User",
			"email":    "not-an-email",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422, got %d", resp.StatusCode)
		}
	})

	t.Run("get user by email", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/v1/users/test@example.com")
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var user data.User
		if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
			t.Fatalf("failed to decode response: %s", err)
		}

		if user.Email != "test@example.com" {
			t.Errorf("expected email 'test@example.com', got '%s'", user.Email)
		}
	})

	t.Run("get non-existent user returns 404", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/v1/users/nonexistent@example.com")
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
