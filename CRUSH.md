# CRUSH.md - Agent Guide for go-baduk

## Instructions

You are an expert in Web application development, including CSS, JavaScript, AlpineJS, Tailwind, Node.JS and Markdown for frontend development, and Golang for backend development.

- Review the conversation history for mistakes and avoid repeating them
- Use native HTML, CSS, and Javascript functionality wherever possible, only using frameworks where required or when prompted
- Break things down into discrete changes, and suggest a small test after each stage to make sure things are on the right track
- Only produce code to illustrate examples, or when directed to in the conversation. If you can answer without code, that is preferred
- Request clarification for anything unclear or ambiguous
- **Before writing or suggesting code**, perform a comprehensive code review of the existing code and describe how it works between `<CODE_REVIEW>` tags
- **After completing the code review**, construct a plan for the change between `<PLANNING>` tags. Ask for additional source files or documentation that may be relevant. The plan should avoid duplication (DRY principle), and balance maintenance and flexibility. Present trade-offs and implementation choices at this step. Consider available Frameworks and Libraries and suggest their use when relevant. **STOP at this step if we have not agreed a plan**
- **Once agreed**, produce code between `<OUTPUT>` tags. Pay attention to Variable Names, Identifiers and String Literals, and check that they are reproduced accurately from the original source files unless otherwise directed. When naming by convention surround in double colons and in `::UPPERCASE::`. Maintain existing code style, use language appropriate idioms
- **When beginning a coding session**, refer to `ARCHITECTURE.md` to properly understand the architecture of this application

## Project Overview

**baduk.online** is a backend-only Go REST API service for user registration and authentication. The application uses:

- **Go 1.25** with standard library + chi router
- **PostgreSQL** (pgx driver) with session storage
- **AWS SES** for transactional emails (registration)
- **Podman** containers with systemd orchestration
- **Caddy** reverse proxy with TLS termination
- **Cloudflare** for DNS

**Architecture**: Review `ARCHITECTURE.md` at the start of any coding session to understand system design.

**Current State**: Registration flow is implemented. See `TODO.md` for upcoming security improvements (rate limiting, token security).

---

## Essential Commands

### Development

```bash
# Run the application (requires POSTGRES_URL env var)
make run

# Build binary
make build

# Run all tests (uses testcontainers with podman)
make test

# Run integration tests only
make tests/integration

# Run smoke tests (requires k6 and running server)
make tests/smoke

# Update dependencies
make update

# Clean build artifacts
rm -rf bin/ dist/
```

### Database

```bash
# Start local PostgreSQL in podman
make db/start

# Run migrations (requires POSTGRES_URL env var)
make db/migrate

# Or run migrations via binary
./bin/baduk.online -migrate

# Check migration status
make db/migration/status
```

**Important**: Set `POSTGRES_URL` environment variable before running database commands:

```bash
export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"
```

### Testing

Tests use **testcontainers** with podman. Before running tests:

```bash
# Ensure podman socket is running
make tests/setup

# Or manually:
systemctl --user start podman.socket
```

**Test Environment Variables**:

- `DOCKER_HOST=unix://$(XDG_RUNTIME_DIR)/podman/podman.sock`
- `TESTCONTAINERS_RYUK_DISABLED=true`

These are automatically set by the Makefile.

### Deployment

```bash
# Bootstrap infrastructure with Ansible
make deploy/bootstrap

# Deploy all components
make deploy/all

# Deploy individual components
make deploy/fedora   # System setup
make deploy/proxy    # Caddy reverse proxy (container)
make deploy/db       # PostgreSQL database (container)
make deploy/service  # Baduk application (binary)

# Build release binaries locally
make build/release
```

**Deployment Architecture**:
- **Baduk app**: Binary deployment with systemd service
- **PostgreSQL**: Container (podman quadlet)
- **Caddy**: Container (podman quadlet)

See `deploy/README.md` for deployment details.

---

## Code Organization

```
cmd/api/          - HTTP handlers, routes, middleware, API struct
internal/data/    - Database models (users, registration), queries
internal/mail/    - AWS SES email service
internal/validator/ - Input validation helpers
migrations/       - Goose SQL migrations
deploy/           - Ansible playbooks and Terraform configs
tests/smoke/      - k6 smoke tests
```

---

## Architecture Patterns

### API Structure

The main `API` struct (in `cmd/api/app.go`) contains:

- Database connection (`*data.Database`)
- Email service (`mail.Mailer` interface)
- Session manager (`*scs.SessionManager`)
- Wait group for background tasks (`sync.WaitGroup`)

**Routes** are defined in `cmd/api/routes.go` using chi router:

- All API endpoints under `/api/v1`
- Middleware: RequestID, RealIP, sessions, logger, recoverer, timeout (10s)

### Database Layer

**Connection**: Uses `pgxpool.Pool` for connection pooling.

**Store Pattern**: Database operations organized into stores:

- `userStore` - User CRUD operations
- `registrationStore` - Registration token management

**Access Pattern**:

```go
api.db.Users.Insert(ctx, user)
api.db.Registration.NewToken(ctx, userID, ttl)
```

### Error Handling

**Helper Functions** in `cmd/api/helpers.go`:

- `api.writeJSON(w, status, data, headers)` - Write JSON responses
- `api.readJSON(w, r, &input)` - Parse JSON with validation (max 1MB)
- `api.badRequestResponse(w, r, err)` - 400 errors
- `api.errorResponse(w, r, status, message)` - Generic errors
- `api.serverErrorResponse(w, r, err)` - 500 errors
- `api.failedValidationResponse(w, r, errors)` - 422 validation errors
- `api.unauthenticatedResponse(w, r)` - 401 errors
- `api.dataConflictResponse(w, r, err)` - 409 conflicts

**Error Constants** in `cmd/api/errors.go`:

- `errUserUnauthenticated`

**Data Layer Errors** in `internal/data/`:

- `data.ErrDuplicateEmail` - User with email already exists
- `data.ErrNoUserFound` - User not found in database
- `data.ErrRecordNotFound` - Generic record not found

### Session Management

**Library**: `alexedwards/scs/v2` with PostgreSQL backend.

**Configuration**:

- 24-hour lifetime
- Secure cookies in production
- Uses `pgxstore.New(db.Pool)`

**Usage Pattern**:

```go
// Get user from session
email := api.sessionManager.GetString(r.Context(), string(userContextKey))
exists := api.sessionManager.Exists(r.Context(), string(userContextKey))
```

**Context Key**: `userContextKey = contextKey("userEmail")` (in `cmd/api/context.go`)

### Background Jobs

**Pattern**: Use `api.background(fn func())` for async tasks.

**Features**:

- Runs function in goroutine
- Panic recovery with logging
- Tracked by `api.wg` for graceful shutdown

**Example**:

```go
api.background(func() {
    err = api.mailer.SendRegistrationEmail(r.Context(), user)
    if err != nil {
        slog.Error("failed to send registration email", "user", user.Email, "err", err)
    }
})
```

---

## Validation Patterns

### Validator Usage

**Create validator**:

```go
v := validator.New()
```

**Add checks**:

```go
v.Check(condition, "field", "error message")
```

**Check if valid**:

```go
if !v.Valid() {
    api.failedValidationResponse(w, r, v.Errors)
    return
}
```

### Common Validators

**Email** (in `internal/data/users.go`):

```go
data.ValidateEmail(v, email)
```

**Password** (8-72 chars):

```go
data.ValidatePasswordPlaintext(v, password)
```

**User struct**:

```go
data.ValidateUser(v, user)
```

---

## Database Patterns

### User Management

**Password Handling**:

```go
user := &data.User{Name: "...", Email: "..."}
err := user.Password.Set(plaintextPassword) // Hashes with bcrypt cost 12
```

**Insert User**:

```go
err := api.db.Users.Insert(ctx, user)
// Populates user.ID, user.CreatedAt, user.Version
```

**Common Errors**:

```go
switch {
case errors.Is(err, data.ErrDuplicateEmail):
    api.errorResponse(w, r, http.StatusConflict, "user already exists")
case errors.Is(err, data.ErrNoUserFound):
    api.unauthenticatedResponse(w, r)
default:
    api.serverErrorResponse(w, r, err)
}
```

### Migrations

**Tool**: Goose (`pressly/goose/v3`)

**Location**: `migrations/` directory

**Naming**: `001_description.sql`, `002_description.sql`, etc.

**Format**:

```sql
-- +goose Up
CREATE TABLE ...;

-- +goose Down
DROP TABLE ...;
```

**Current Migrations**:

1. `001_users.sql` - Users table with citext email, uuid-ossp extension
2. `002_sessions.sql` - Session storage (scs)
3. `003_registration.sql` - Registration tokens

---

## Testing

### Integration Tests

**Location**: `cmd/api/*_test.go`

**Pattern**: Uses testcontainers to spin up PostgreSQL:

```go
func setupTestDB(t *testing.T) (*data.Database, func()) {
    // Starts postgres:17.5 container
    // Runs migrations from ../../migrations
    // Returns db connection and cleanup function
}
```

**Mock Mailer**:

```go
type mockMailer struct {
    emailsSent []*data.User
    db         *data.Database
}
```

**Test Structure**:

```go
func TestUserRegistrationIntegration(t *testing.T) {
    db, cleanup := setupTestDB(t)
    defer cleanup()

    mailer := &mockMailer{db: db}
    api := NewAPI("test", "1.0.0", db, mailer)
    server := httptest.NewServer(api.Routes())
    defer server.Close()

    // Test cases...
}
```

### Smoke Tests

**Tool**: k6 load testing

**Location**: `tests/smoke/`

**Run**: `make tests/smoke` (requires running server on port 4000)

---

## Code Conventions

### Logging

**Library**: `log/slog` (standard library) + `charmbracelet/log` for formatting

**Levels**:

- `slog.Info()` - Informational (startup, shutdown)
- `slog.Debug()` - Debug info (not shown in production)
- `slog.Warn()` - Warnings (stale data attempts)
- `slog.Error()` - Errors (send email failures, server errors)

**Structured Logging**:

```go
slog.Error("message", "key", value, "err", err)
slog.Info("starting server", "address", srv.Addr, "env", cfg.env)
```

**Never log sensitive data**: Don't log passwords, tokens, or PII.

### HTTP Handlers

**Naming**: `api.handle<Action><Resource>`

- `api.handleCreateUser`
- `api.handleGetLoggedInUser`
- `api.handleSendRegistrationEmail`

**Structure**:

1. Parse input with `api.readJSON()`
2. Validate input
3. Perform business logic
4. Return response with `api.writeJSON()` or error helper

**Always use context from request**: `r.Context()` for database calls.

### JSON Struct Tags

**Pattern**:

- `json:"-"` - Never serialize (passwords, IDs, versions)
- `json:"field_name"` - Serialize with snake_case
- `db:"column_name"` - Map to database column (if different from field name)

**Example**:

```go
type User struct {
    ID        int       `json:"-"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    Email     string    `json:"email"`
    Password  password  `json:"-" db:"password_hash"`
}
```

### Timeouts

**Request Handler**: 10 seconds (in router middleware)
**Server ReadTimeout**: 5 seconds
**Server WriteTimeout**: 10 seconds
**Database Queries**: 3 seconds context timeout (pattern in data layer)
**Graceful Shutdown**: 10 seconds

### JSON Request Limits

**Max Body Size**: 1MB (`OneMB` constant in `cmd/api/helpers.go`)

**Unknown Fields**: Rejected (decoder has `DisallowUnknownFields()`)

**Multiple Values**: Only single JSON value allowed in request body

---

## Environment Variables

**Required**:

- `POSTGRES_URL` - PostgreSQL connection string

**Optional with Defaults**:

- `PORT` - API server port (default: 4000)
- `ENV` - Environment name (default: "development")
- `LOG_FMT` - Log format (default: "text", options: "text", "json")

**AWS Credentials**: Loaded via standard AWS SDK config (env vars, credentials file, IAM role)

---

## API Endpoints

All under `/api/v1`:

- `GET /health` - Health check
- `POST /users` - Create user (sends registration email async)
- `POST /users/register` - Resend registration email (requires session)
- `PUT /users/activated` - Activate user with token
- `GET /user` - Get logged-in user info (requires session)

---

## Dependencies

**Key Libraries**:

- `github.com/go-chi/chi/v5` - HTTP router
- `github.com/jackc/pgx/v5` - PostgreSQL driver
- `github.com/alexedwards/scs/v2` - Session management
- `github.com/aws/aws-sdk-go-v2` - AWS SDK (SES)
- `github.com/pressly/goose/v3` - Database migrations
- `github.com/charmbracelet/log` - Logging
- `golang.org/x/crypto/bcrypt` - Password hashing
- `github.com/testcontainers/testcontainers-go` - Testing with containers

**Go Version**: 1.25 (uses `GOEXPERIMENT=jsonv2` in Docker build)

---

## Deployment Architecture

**Baduk Application**: Binary deployment
- Built in CI/CD pipeline (GitHub Actions)
- Released as tarball with migrations
- Deployed to `/opt/baduk/`
- Runs as systemd service under `baduk` user
- Resource limits: 1GB memory, 512 tasks
- Migrations run via `-migrate` flag

**Infrastructure Containers**: Podman quadlets
- PostgreSQL 17.5 (container)
- Caddy reverse proxy (container)

**Binary Build**: 
- CGO disabled, static binary
- GOEXPERIMENT=jsonv2
- Multi-arch: amd64 and arm64

---

## CI/CD

**GitHub Actions**:

- `.github/workflows/test.yml` - Runs `go test -v ./...` on push/PR
- `.github/workflows/golangci-lint.yml` - Linting with golangci-lint v2.4.0
- `.github/workflows/build.yml` - Build and release binaries (amd64/arm64)

**Releases**: Tarballs contain binary and migrations

**Linter**: golangci-lint (no config file - uses defaults)

**CLI Flags**:
- `-port` - API server port (default: 4000)
- `-env` - Environment (development|production)
- `-logFmt` - Log format (text|json)
- `-dsn` - Database URL (default: POSTGRES_URL env var)
- `-migrate` - Run database migrations and exit

---

## Gotchas

### Binary Deployment

Application runs as systemd service at `/opt/baduk/`. Migrations run before service start using the `-migrate` flag.

**Service management**:
```bash
sudo systemctl status baduk
sudo systemctl restart baduk
sudo journalctl -u baduk -f
```

**Manual migration**:
```bash
/opt/baduk/baduk -migrate
```

### Testcontainers with Podman

Must set environment variables for podman compatibility:

```bash
DOCKER_HOST=unix://$(XDG_RUNTIME_DIR)/podman/podman.sock
TESTCONTAINERS_RYUK_DISABLED=true
```

Ensure podman socket is running: `systemctl --user start podman.socket`

### Database Context Timeouts

Database operations use 3-second context timeouts. Pattern:

```go
c, cancel := context.WithTimeout(ctx, 3*time.Second)
defer cancel()
err := db.QueryRow(c, query, args...).Scan(...)
```

### Password Type

The `password` type in `internal/data/users.go` has two fields:

- `plaintext *string` - Only set before hashing
- `hash []byte` - Bcrypt hash for storage

Always use `user.Password.Set(plaintext)` to populate both.

### Session Storage

Sessions are stored in PostgreSQL (not in-memory). The `sessions` table is created by migration `002_sessions.sql`.

### Graceful Shutdown

The application waits for background tasks to complete during shutdown. Always use `api.background()` for async work, not raw goroutines.

### Email Sending

Email sending happens **asynchronously** after user creation. Failures are logged but don't fail the request. Registration emails contain a token with 15-minute TTL.

### Container Network

PostgreSQL runs in `baduk.network` podman network. The baduk binary connects via `postgres:5432` hostname (container name resolution).

---

## File Naming Conventions

- `*_test.go` - Tests (integration tests in same package as handlers)
- `*.sql` - Migration files (numbered: `001_`, `002_`, etc.)
- `*.js` - Smoke tests (k6)
- `.yml` - GitHub Actions workflows, Ansible playbooks

---

## Future Work

See `TODO.md` for planned improvements. Key items:

- Rate limiting on registration endpoints
- Move activation token from query params to POST body
- Extend token TTL
- Security audit logging
- Database backups

---

## Quick Reference

**Start local development**:

```bash
export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"
make db/start
make db/migrate
make run
```

**Run tests**:

```bash
make tests/setup
make test
```

**Add a new endpoint**:

1. Add handler function in `cmd/api/` (e.g., `cmd/api/games.go`)
2. Add route in `cmd/api/routes.go`
3. Add data layer methods in `internal/data/` if needed
4. Add validation if needed
5. Write tests in `cmd/api/*_test.go`

**Add a database table**:

1. Create new migration: `migrations/00X_tablename.sql`
2. Add store struct in `internal/data/` (e.g., `gameStore`)
3. Add store to `Database` struct in `internal/data/db.go`
4. Initialize store in `New()` function
5. Run `make db/migrate`
