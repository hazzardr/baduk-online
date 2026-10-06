# baduk.online

A full-stack web application for baduk (Go/Weiqi) online play. Built with Go REST API backend and Astro.js frontend.

## Overview

**baduk.online** lets you sign in with Google and play your online baduk games.

### MVP Scope

The current milestone is playing an online-go.com (OGS) game from baduk.online ([MVP epic #20](https://github.com/hazzardr/baduk-online/issues/20), [milestone #4](https://github.com/hazzardr/baduk-online/milestone/4)): sign in with Google or OGS, connect an OGS account, open an active OGS game, and play it to completion. baduk.online does not run its own game server. Games are played on third-party servers through a provider interface (OGS first), and clients talk only to baduk.online's relay so a physical board can use the same protocol later.

Non-goals for MVP: physical board hardware, providers other than OGS (Tygem and Fox are being researched in #46 and #47), sign-in providers other than Google and OGS, creating challenges from baduk.online, our own rules engine or matchmaking, puzzles (tsumego), chat.

### Planning

GitHub issues, task lists, labels, and milestones are the source of truth for tracking work. See [milestone #4 — MVP: Play an OGS game from baduk.online](https://github.com/hazzardr/baduk-online/milestone/4).

### Tech Stack

**Backend:**
- Go 1.26 with chi HTTP router
- PostgreSQL with pgx driver
- Google sign-in (OpenID Connect) with coreos/go-oidc
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
- A Google OAuth client (optional locally — without one the server starts with Google sign-in disabled). See [Environment Variables](#environment-variables).

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
internal/auth/         # OpenID Connect sign-in (Google); authtest/ is a fake provider for tests
internal/data/         # Database models, queries, stores
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

**Database Layer** (`internal/data/`):
- Store pattern for data operations (Users, Identities)
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
- Pages are static; the browser resolves auth state with `GET /api/v1/user` (`getCurrentUser()` in `src/lib/api.ts`)
- "Sign in with Google" is a full-page link to `/api/v1/auth/google/start`; the backend handles the redirects and sends the browser back to `/` (or `/signin?error=<code>`)

## API Endpoints

All endpoints are under `/api/v1`:

### Authentication

- `GET /auth/google/start` - Browser navigation: redirects to Google to sign in
  - Rate limit: 20 attempts/hour per IP
  - Redirects to `/` if already signed in
- `GET /auth/google/callback` - Google redirects here after sign-in
  - On success: creates the user on first sign-in, sets the session cookie (24-hour lifetime), and redirects to `/`
  - On failure: redirects to `/signin?error=<code>` (`unavailable`, `cancelled`, `expired`, `failed`, `email_unverified`, `email_in_use`)

- `POST /logout` - Destroy user session
  - Returns: success message

- `GET /user` - Get signed-in user info
  - Requires: valid session (401 otherwise)
  - Returns: `name`, `email`, `created_at`

### Health

- `GET /health` - Health check
  - Returns: `status` (`db`, `google`), `env`, `version`

## Authentication

### Session Management

- **Lifetime**: 24 hours
- **Storage**: PostgreSQL
- **Cookies**: HttpOnly, Secure (in production), SameSite
- **CSRF**: Go's `http.CrossOriginProtection` (Sec-Fetch-Site/Origin checks against `TRUSTED_ORIGINS`)
- **Session fixation**: the session token is renewed at sign-in

### Sign-in

- **Providers**: Google (OpenID Connect). baduk.online's `users` row is the account; sign-in identities in `identities` link to it by `(provider, subject)`, so more providers can be added later.
- **Flow**: authorization code with PKCE. `state`, `nonce` and the PKCE verifier are single-use values kept in the session.
- **Lookup**: users are found by `(provider, subject)`, never by email. The first sign-in creates the user.
- **Email**: sign-in is rejected unless Google reports the email as verified. If another user already has the email, sign-in is rejected (`email_in_use`).

## Environment Variables

**Required:**
- `POSTGRES_URL` - PostgreSQL connection string (e.g., `postgres://user:pass@localhost:5432/baduk?sslmode=disable`)

**Optional (with defaults):**
- `PORT` - API server port (default: 4000)
- `ENV` - Environment name: `development`, `production` (default: development). `production` marks session cookies `Secure`.
- `LOG_FMT` - Log format: `text`, `json` (default: text)
- `BASE_URL` - Public URL of the site (default: `https://play.baduk.online`). Google redirects back to `BASE_URL/api/v1/auth/google/callback`, so set it to `http://localhost:5173` for local dev. Must be an absolute `http(s)` URL or the server exits.
- `TRUSTED_ORIGINS` - Comma-separated origins trusted for CSRF protection (default: `https://play.baduk.online` plus localhost dev ports)

Each variable can also be set with the matching flag (`-port`, `-env`, `-logFmt`, `-base-url`, `-trusted-origins`, `-dsn`, `-google-client-id`); a flag overrides the environment.

**Google sign-in:**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - an OAuth client of type "Web application" whose authorized redirect URIs include `BASE_URL/api/v1/auth/google/callback` (setup steps: `deploy/README.md`). The secret is read only from the environment, never a flag.
- At startup the server fetches Google's discovery document. If the credentials are unset or that fails, it logs a warning and starts with **Google sign-in disabled**:
  - `/api/v1/auth/google/*` redirect to `/signin?error=unavailable`
  - `GET /api/v1/health` reports `"google": "unavailable"`
- With `ENV=production` the server exits instead, and systemd restarts it until Google is reachable.

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
- Google sign-in against a fake OpenID Connect provider (`internal/auth/authtest`)
- Session management
- Frontend routing

### Frontend Tests

A Vitest scaffold exists at `frontend/test/basic.test.ts`. No application tests are written yet.

## Database

### Migrations

Migrations use Goose and are located in `migrations/`:

1. `001_users.sql` - Users table with email uniqueness
2. `002_sessions.sql` - Session storage (scs)
3. `003_registration.sql` - Registration tokens (dropped by 004)
4. `004_identities.sql` - Sign-in identities; removes passwords and existing password accounts

### Running Migrations

```bash
export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"
make db/migrate
```

### Schema

**users** table:
- `id` (bigserial primary key)
- `name` (text)
- `email` (text, unique, citext)
- `created_at` (timestamp)
- `version` (integer, for optimistic locking)

**identities** table:
- `provider`, `subject` (text, primary key together)
- `user_id` (references `users`)
- `email` (citext, as last reported by the provider), `email_verified` (boolean)
- `created_at` (timestamp)

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
