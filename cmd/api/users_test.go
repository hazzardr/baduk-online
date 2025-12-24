package api

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/hazzardr/baduk-online/internal/data"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
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
	db         *data.Database
	mu         sync.Mutex
}

func (m *mockMailer) SendAccountActivatedEmail(ctx context.Context, user *data.User) error {
	//TODO implement me
	panic("implement me")
}

func (m *mockMailer) Ping(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (m *mockMailer) SendRegistrationEmail(_ context.Context, user *data.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.emailsSent = append(m.emailsSent, user)
	return nil
}

func (m *mockMailer) GetLastTokenForUser(ctx context.Context, userID int64) (string, error) {
	token, err := m.db.Registration.NewToken(ctx, userID, 15*time.Minute)
	if err != nil {
		return "", err
	}
	return token.Plaintext, nil
}

func TestUserRegistrationIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()
	origins := []string{"http://localhost:3000"}
	mailer := &mockMailer{db: db}
	api := NewAPI("test", "1.0.0", db, mailer, origins)
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

		mailer.mu.Lock()
		emailCount := len(mailer.emailsSent)
		mailer.mu.Unlock()
		if emailCount != 1 {
			t.Errorf("expected 1 email sent, got %d", emailCount)
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

func TestRegistrationTokenWorkflow(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	mailer := &mockMailer{db: db}
	origins := []string{"http://localhost:3000"}
	api := NewAPI("test", "1.0.0", db, mailer, origins)
	server := httptest.NewServer(api.Routes())
	defer server.Close()

	t.Run("complete registration workflow", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Token Test User",
			"email":    "tokentest@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to create user: %s", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			t.Fatalf("expected status 201, got %d", resp.StatusCode)
		}

		var user data.User
		if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
			t.Fatalf("failed to decode user: %s", err)
		}

		if user.Validated {
			t.Error("user should not be validated yet")
		}

		dbUser, err := db.Users.GetByEmail(context.Background(), "tokentest@example.com")
		if err != nil {
			t.Fatalf("failed to get user from database: %s", err)
		}

		token, err := mailer.GetLastTokenForUser(context.Background(), int64(dbUser.ID))
		if err != nil {
			t.Fatalf("failed to get token: %s", err)
		}

		activatePayload := map[string]string{
			"token": token,
		}
		activateBody, _ := json.Marshal(activatePayload)

		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		activateResp, err := client.Do(req)
		if err != nil {
			t.Fatalf("failed to activate user: %s", err)
		}
		defer activateResp.Body.Close()

		if activateResp.StatusCode != http.StatusOK {
			var errResp map[string]interface{}
			json.NewDecoder(activateResp.Body).Decode(&errResp)
			t.Fatalf("expected status 200, got %d: %+v", activateResp.StatusCode, errResp)
		}

		var activatedUser map[string]interface{}
		if err := json.NewDecoder(activateResp.Body).Decode(&activatedUser); err != nil {
			t.Fatalf("failed to decode activated user: %s", err)
		}

		if validated, ok := activatedUser["validated"].(bool); !ok || !validated {
			t.Error("user should be validated after activation")
		}

		dbUser, err = db.Users.GetByEmail(context.Background(), "tokentest@example.com")
		if err != nil {
			t.Fatalf("failed to get user from database: %s", err)
		}
		if !dbUser.Validated {
			t.Error("database user should be validated")
		}
	})

	t.Run("reject invalid token", func(t *testing.T) {
		activatePayload := map[string]string{
			"token": "INVALIDTOKEN1234567890ABCD",
		}
		activateBody, _ := json.Marshal(activatePayload)

		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		activateResp, err := client.Do(req)
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer activateResp.Body.Close()

		if activateResp.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422, got %d", activateResp.StatusCode)
		}
	})

	t.Run("reject token with wrong length", func(t *testing.T) {
		activatePayload := map[string]string{
			"token": "SHORT",
		}
		activateBody, _ := json.Marshal(activatePayload)

		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		activateResp, err := client.Do(req)
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer activateResp.Body.Close()

		if activateResp.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422, got %d", activateResp.StatusCode)
		}
	})

	t.Run("reject empty token", func(t *testing.T) {
		activatePayload := map[string]string{
			"token": "",
		}
		activateBody, _ := json.Marshal(activatePayload)

		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		activateResp, err := client.Do(req)
		if err != nil {
			t.Fatalf("failed to make request: %s", err)
		}
		defer activateResp.Body.Close()

		if activateResp.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422, got %d", activateResp.StatusCode)
		}
	})

	t.Run("token revoked after successful activation", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Revoke Test User",
			"email":    "revoketest@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)

		resp, err := http.Post(server.URL+"/api/v1/users", "application/json", bytes.NewBuffer(body))
		if err != nil {
			t.Fatalf("failed to create user: %s", err)
		}
		defer resp.Body.Close()

		var user data.User
		json.NewDecoder(resp.Body).Decode(&user)

		dbUser, err := db.Users.GetByEmail(context.Background(), "revoketest@example.com")
		if err != nil {
			t.Fatalf("failed to get user from database: %s", err)
		}

		token, err := mailer.GetLastTokenForUser(context.Background(), int64(dbUser.ID))
		if err != nil {
			t.Fatalf("failed to get token: %s", err)
		}

		activatePayload := map[string]string{
			"token": token,
		}
		activateBody, _ := json.Marshal(activatePayload)

		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		activateResp, err := client.Do(req)
		if err != nil {
			t.Fatalf("failed to activate user: %s", err)
		}
		activateResp.Body.Close()

		if activateResp.StatusCode != http.StatusOK {
			t.Fatalf("expected status 200, got %d", activateResp.StatusCode)
		}

		req2, _ := http.NewRequest(http.MethodPut, server.URL+"/api/v1/users/activated", bytes.NewBuffer(activateBody))
		req2.Header.Set("Content-Type", "application/json")
		activateResp2, err := client.Do(req2)
		if err != nil {
			t.Fatalf("failed to make second activation request: %s", err)
		}
		defer activateResp2.Body.Close()

		if activateResp2.StatusCode != http.StatusUnprocessableEntity {
			t.Errorf("expected status 422 for reused token, got %d", activateResp2.StatusCode)
		}
	})
}
