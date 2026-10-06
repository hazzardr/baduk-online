# baduk.online

A full-stack web application for baduk (Go/Weiqi) online play. Built with Go REST API backend and Astro.js frontend.

## Overview

**baduk.online** provides user registration, authentication, and online baduk gameplay.

### MVP Scope

The current milestone is playing an online-go.com (OGS) game from baduk.online ([MVP epic #20](https://github.com/hazzardr/baduk-online/issues/20), [milestone #4](https://github.com/hazzardr/baduk-online/milestone/4)): sign in with Google, connect an OGS account, open an active OGS game, and play it to completion. baduk.online does not run its own game server. Games are played on third-party servers through a provider interface (OGS first), and clients talk only to baduk.online's relay so a physical board can use the same protocol later.

Non-goals for MVP: physical board hardware, providers other than OGS, sign-in providers other than Google, creating challenges from baduk.online, our own rules engine or matchmaking, puzzles (tsumego), chat.

### Planning

GitHub issues, task lists, labels, and milestones are the source of truth for tracking work. See [milestone #4 — MVP: Play an OGS game from baduk.online](https://github.com/hazzardr/baduk-online/milestone/4).

### Tech Stack

**Backend:**
- Go 1.26 with chi HTTP router
- PostgreSQL with pgx driver
- AWS SES for transactional emails
- Session management with alexedwards/scs
- Rate limiting and CSRF protection

**Frontend:**
- Astro 5 with TypeScript
- TailwindCSS 4 with DaisyUI 5
- pnpm package manager
- Vitest for unit testing

## Development

### Prerequisites

- Go 1.26.2+
- PostgreSQL 17.5+
- pnpm 9.15.4+
- Podman (for local testing)
- AWS credentials for SES (optional locally — without them the server starts with email disabled, and registration returns 503)

### Quick Start

**Terminal 1 - Backend:**

```bash
# Set database URL
export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"

# Start database
make db/start

# Run migrations
make db/migrate

# Run the server
make run
```

The API will be available at `http://localhost:4000`

**Terminal 2 - Frontend:**

```bash
cd frontend/

# Install dependencies (first time only)
pnpm install

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:5173` and proxies API requests to the backend.

### Useful Commands

**Backend:**

```bash
make build              # Build the frontend and a binary with it embedded (bin/)
make test               # Run all tests
make tests/setup        # Setup test environment (podman socket)
make update            # Update dependencies
rm -rf bin/ dist/      # Clean build artifacts
```

**Frontend:**

```bash
cd frontend/
pnpm build             # Build production bundle
pnpm preview           # Preview production build
pnpm test              # Run vitest
pnpm lint              # Run eslint
pnpm fmt               # Format code with Prettier
```

**Database:**

```bash
make db/migrate        # Run pending migrations
make db/migration/status  # Check migration status
```

## Architecture

### Project Structure

```
cmd/api/               # HTTP handlers, routes, middleware, API struct
internal/data/         # Database models, queries, stores
internal/mail/         # AWS SES email service
internal/validator/    # Input validation helpers
migrations/            # Goose SQL migrations
frontend/              # Astro.js frontend
  src/
    pages/             # Route files (file-based routing)
    components/        # Reusable UI components
    layouts/           # Page layouts
    lib/               # Utility functions
    middleware/        # Authentication middleware
    types/             # TypeScript type definitions
    styles/            # Global styles
    assets/            # Static assets
deploy/                # Ansible & Terraform configs
```

### Backend Architecture

**API Structure** (`cmd/api/app.go`):
- HTTP routes with chi router
- Session management with PostgreSQL backend
- Rate limiting per IP
- CSRF protection with trusted origins
- Background job queue with graceful shutdown

**Database Layer** (`internal/data/`):
- Store pattern for data operations (Users, Registration)
- pgxpool for connection pooling
- Goose migrations for schema management

**Error Handling**:
- Structured error responses with proper HTTP status codes
- Validation error aggregation
- Panic recovery with logging

### Frontend Architecture

**Islands Architecture**:
- Server-first rendering by default
- JavaScript only for interactive components
- File-based routing in `src/pages/`

**Authentication Flow**:
- Middleware checks `session_id` cookie on each request
- Populates `Astro.locals` with user info for pages
- Protected pages redirect if not authenticated
- CSRF tokens in cookies for state-changing requests

## API Endpoints

All endpoints are under `/api/v1`:

### Authentication

- `POST /login` - Authenticate user (email, password)
  - Rate limit: 10 attempts/hour per IP
  - Returns: user info (name, email, validated)
  - Sets session cookie (24-hour lifetime)

- `POST /logout` - Destroy user session
  - Returns: success message

- `GET /user` - Get logged-in user info
  - Requires: valid session
  - Returns: user info

### User Management

- `POST /users` - Create new user account (register)
  - Rate limit: 10 attempts/hour per IP
  - Sends registration email asynchronously
  - Returns: user info

- `PUT /users/activated` - Activate account with token
  - Rate limit: 5 attempts/hour per IP
  - Requires: activation token from email
  - Returns: user info

- `POST /users/register` - Resend registration email
  - Requires: valid session
  - Returns: success message

### Health

- `GET /health` - Health check
  - Returns: `{"status": "OK"}`

## Authentication

### Session Management

- **Lifetime**: 24 hours
- **Storage**: PostgreSQL
- **Cookies**: HttpOnly, Secure (in production), SameSite
- **CSRF**: Cross-origin token in header

### Password Security

- **Algorithm**: bcrypt with cost 12
- **Validation**: 8-72 characters
- **Hashing**: Immediate on input, never stored plaintext

### User Activation

- **Token**: Cryptographically secure random token
- **TTL**: 30 minutes
- **Delivery**: Via AWS SES email
- **Validation**: User marked as validated on successful activation

## Environment Variables

**Required:**
- `POSTGRES_URL` - PostgreSQL connection string (e.g., `postgres://user:pass@localhost:5432/baduk?sslmode=disable`)

**Optional (with defaults):**
- `PORT` - API server port (default: 4000)
- `ENV` - Environment name: `development`, `production` (default: development). `production` marks session cookies `Secure`.
- `LOG_FMT` - Log format: `text`, `json` (default: text)
- `BASE_URL` - Public URL of the frontend, used for links in emails (default: `https://play.baduk.online`). Must be an absolute `http(s)` URL or the server exits.
- `TRUSTED_ORIGINS` - Comma-separated origins trusted for CSRF protection (default: `https://play.baduk.online` plus localhost dev ports)

Each variable can also be set with the matching flag (`-port`, `-env`, `-logFmt`, `-base-url`, `-trusted-origins`, `-dsn`); a flag overrides the environment.

**AWS Credentials** (for email):
- Configure via standard AWS SDK methods:
  - Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
  - Credentials file: `~/.aws/credentials`
  - IAM role (on EC2/Lambda)
- At startup the server loads AWS config and pings SES. If either fails, it logs a warning and starts with **email disabled**:
  - `POST /api/v1/users` and `POST /api/v1/users/register` return `503 Service Unavailable` (no account can be created or activated)
  - `GET /api/v1/health` reports `"ses": "unavailable"`
- Production must have working SES credentials; check the health endpoint after deploy.

**Frontend:**
- The frontend is a static Astro build. The browser always calls the API at the relative path `/api/v1`, so the frontend and API share an origin:
  - **Production:** the build is embedded in the Go binary (`-tags embedfrontend`; `make build` and GoReleaser do this) and served by the backend for every path outside `/api`.
  - **Local dev:** `pnpm dev` serves the frontend and proxies `/api` to `go run .`. A plain `go build`/`go run` serves only the API.
- `API_URL` - Where the dev proxy (`pnpm dev`) sends `/api` requests (default: `http://localhost:4000`)
- `SITE_URL` - Canonical site URL used by Astro at build time (default: `https://play.baduk.online`)

## Testing

### Backend Integration Tests

Tests use testcontainers with Podman to spin up PostgreSQL:

```bash
make tests/setup  # Start podman socket (one time)
make test         # Run all tests
```

Tests are located in `cmd/api/*_test.go` and cover:
- User registration flow
- Account activation
- Session management
- Email sending

### Frontend Tests

A Vitest scaffold exists at `frontend/test/basic.test.ts`. No application tests are written yet.

## Database

### Migrations

Migrations use Goose and are located in `migrations/`:

1. `001_users.sql` - Users table with email uniqueness
2. `002_sessions.sql` - Session storage (scs)
3. `003_registration.sql` - Registration tokens

### Running Migrations

```bash
export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"
make db/migrate
```

### Schema

**users** table:
- `id` (UUID primary key)
- `name` (text)
- `email` (text, unique, citext)
- `password_hash` (bytea)
- `validated` (boolean)
- `created_at` (timestamp)
- `version` (integer, for optimistic locking)

**registration_tokens** table:
- `hash` (bytea, primary key)
- `user_id` (UUID)
- `expiry` (timestamp)

**sessions** table:
- Created automatically by scs session manager

## Deployment

See `deploy/README.md` for deployment instructions. Infrastructure includes:
- Podman containers with systemd quadlets
- Caddy reverse proxy with TLS
- Cloudflare DNS
- Ansible provisioning

## Release Process

This project uses **semantic versioning** with **conventional commits** for automated releases via release-please and GoReleaser.

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `fix:` - Bug fix (patch: 0.1.0 → 0.1.1)
- `feat:` - New feature (minor: 0.1.0 → 0.2.0)
- `feat!:` / `BREAKING CHANGE:` - Breaking change (major: 0.1.0 → 1.0.0)
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:`

### Automated Release

1. Push commits to `main` with conventional messages
2. release-please analyzes commits and creates Release PR
3. Merge Release PR to trigger release
4. GoReleaser builds binaries and publishes a GitHub release

## Documentation

- **AGENTS.md** - Detailed architecture patterns, conventions, and development guide
- **TODO.md** - Planned features and improvements
- **deploy/README.md** - Deployment and infrastructure documentation

## Code Style & Conventions

### Frontend
- **Formatting**: `pnpm fmt` (Prettier)
- **Linting**: `pnpm lint` (eslint)
- **Type checking**: `pnpm exec tsc --noEmit` (TypeScript), `pnpm exec astro check` (Astro)
- **Styling**: TailwindCSS 4 + DaisyUI 5
- **Testing**: `pnpm test` (Vitest)

### Backend
- **Logging**: structured logging with slog
- **Error handling**: Explicit error responses with proper HTTP status codes
- **Testing**: Integration tests with testcontainers
- **Rate limiting**: Per-IP sliding window
- **Timeouts**: read timeout 10 seconds (middleware), read timeout 5 seconds (HTTP), write timeout 10 seconds (HTTP), database operation timeout 3 seconds, graceful shutdown 10 seconds

## Contributing

1. Create a feature branch from `main`
2. Make changes following code conventions
3. Commit with conventional commit messages that reference the issues they affect (see AGENTS.md)
4. Push branch and create a pull request that links its issues
5. CI runs Go tests, linting, and type checking (frontend CI tracked in issue #27)
6. Merge when all checks pass

## License

[Add your license here]
