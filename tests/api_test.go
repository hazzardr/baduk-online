package tests

import (
	"context"
	"fmt"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/hazzardr/baduk-online/cmd/api"
	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/nalgeon/be"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestAPIStandsUp(t *testing.T) {
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
	defer testcontainers.CleanupContainer(t, pg)
	if err != nil {
		t.Fatal(err)
	}
	err = pg.Start(ctx)
	if err != nil {
		t.Fatal(err)
	}
	endpoint, err := pg.Endpoint(ctx, "")
	if err != nil {
		t.Fatal(err)
	}

	db, err := data.New(
		fmt.Sprintf(
			"postgres://%s:%s@%s/%s?sslmode=disable",
			user,
			pass,
			endpoint,
			user,
		))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	err = db.Ping(ctx)
	be.Err(t, err, nil)

	mockMailer := NewMockMailer()
	testAPI := api.New(
		"production",
		"0.1.0-testing",
		db,
		&mockMailer,
		[]string{"http://localhost:3000"},
	)
	httptest.NewRequest()
	testAPI.Routes().h
	testAPI.Shutdown(true)
}
