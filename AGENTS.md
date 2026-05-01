# AGENTS.md

## Overview

Full-stack baduk (Go) app. Go 1.26 backend with chi + pgx + embedded Goose migrations. Astro 5 frontend with Tailwind 4 + DaisyUI 5. Deployed via Ansible/Podman quadlets.

## Monorepo boundaries

- Root: Go backend (`main.go`, `cmd/api/`, `internal/`, `migrations/`)
- `frontend/`: Astro app (pnpm). Own `package.json`, `tsconfig.json`, `astro.config.ts`.

## Backend

- **Entrypoint**: `main.go` → `cmd/api.New(...)` → `api.Routes()`.
- **Run locally**:
  ```bash
  export POSTGRES_URL="postgres://postgres:postgres@localhost:5432/baduk?sslmode=disable"
  make db/start   # spins postgres:17.5 via podman
  make db/migrate # runs goose CLI migrations
  make run        # go run .
  ```
  Server listens on `:4000`.
- **AWS SES is mandatory at startup**. `main.go` initializes an SES mailer and pings it; missing AWS creds will cause immediate exit. In tests, use the `mockMailer` pattern from `cmd/api/users_test.go`.
- **Migrations**: SQL files are `//go:embed`-ed. You can also run them in-process with `./baduk.online -migrate`. Goose CLI is used by `make db/migrate`.
- **Go version**: `go.mod` specifies `1.26.2`. CI workflows use `1.26.2`.

## Frontend

- **Package manager**: pnpm.
- **Dev server**: `cd frontend && pnpm dev` (port 5173). Proxies `/api` to `localhost:4000` via `astro.config.ts`.
- **No tests currently exist** (`*.test.ts` files are absent). `pnpm test` runs `vitest`.
- **Build**: `pnpm build` outputs to `frontend/dist/`.

## Testing

- **Unit / helpers**: `go test ./...` or `make test`.
- **Integration tests**: Require a running Podman socket.
  ```bash
  make tests/setup        # systemctl --user start podman.socket
  make tests/integration  # sets DOCKER_HOST and TESTCONTAINERS_RYUK_DISABLED
  ```
  Integration tests live in `cmd/api/*_test.go` and spin up `postgres:17.5` containers via testcontainers-go.

## Lint & typecheck

- **Backend**: `make lint` (golangci-lint). Config is `.golangci.yml` — very strict, ~60 linters enabled. `make fmt` runs `go fmt`.
- **Frontend**: `pnpm lint` (eslint), `pnpm typecheck` (tsc --noEmit), `pnpm astro check`.

## Release & deploy

- **Commits**: Use Conventional Commits (`feat:`, `fix:`, etc.). `release-please-config.json` drives versioning and updates `main.go` (the `version` constant).
- **CI**: `.github/workflows/ci.yml` runs `go test -race`, `go vet`, golangci-lint, and CodeQL on Go changes.
- **Release**: Merging a release-please PR creates a tag, which triggers `goreleaser.yml` to build binaries and publish Docker images to `ghcr.io/hazzardr/baduk-online`.
- **Deploy**: Ansible playbooks in `deploy/ansible/`. Target is Fedora with Podman quadlets, Caddy, and Postgres. Cloudflare access is managed via Terraform in `deploy/`.

## Style & conventions

- Backend logging uses `slog` (often via `charmbracelet/log` adapter).
- JSON helpers (`writeJSON`, `readJSON`) are in `cmd/api/helpers.go`; prefer them over raw `json.NewEncoder`.
- Frontend auth state is populated in `Astro.locals` by `src/middleware/auth.ts`, which checks the `session_id` cookie and calls `/api/v1/user`.
- CSRF: backend sets `cross-origin-token` cookie; frontend reads it and sends `X-Cross-Origin-Token` header for mutating requests.
