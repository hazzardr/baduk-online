package api

import (
	"context"
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
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

func TestFrontendRoutingIntegration(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	api := New("test", "1.0.0", db, nil, []string{"http://localhost:3000"}, testFrontendFS())
	server := httptest.NewServer(api.Routes())
	defer server.Close()

	tests := []struct {
		path       string
		wantStatus int
		wantJSON   bool
	}{
		{path: "/", wantStatus: http.StatusOK, wantJSON: false},
		{path: "/about", wantStatus: http.StatusOK, wantJSON: false},
		{path: "/api/v1/health", wantStatus: http.StatusOK, wantJSON: true},
		// Unknown API paths must not fall through to the frontend's 404 page.
		{path: "/api/v1/nope", wantStatus: http.StatusNotFound, wantJSON: false},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			resp, err := http.Get(server.URL + tt.path)
			if err != nil {
				t.Fatalf("failed to make request: %s", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Fatalf("status = %d, want %d", resp.StatusCode, tt.wantStatus)
			}
			isJSON := resp.Header.Get("Content-Type") == "application/json"
			if isJSON != tt.wantJSON {
				t.Errorf("Content-Type = %q, wantJSON %v", resp.Header.Get("Content-Type"), tt.wantJSON)
			}
			if tt.path == "/api/v1/nope" {
				body, _ := io.ReadAll(resp.Body)
				if string(body) == "not found page" {
					t.Error("unknown API path was served the frontend 404 page")
				}
			}
		})
	}
}
