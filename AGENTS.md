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
- **AWS SES is optional at startup**. `main.go` loads AWS config and pings SES; on failure it logs a warning and passes a nil mailer, so registration returns 503 and `/api/v1/health` reports `ses: unavailable`. Handlers must nil-check `api.mailer`. In tests, use the `mockMailer` pattern from `cmd/api/users_test.go`, or pass `nil` to test email-disabled behaviour.
- **Configuration**: flags default to env vars (`PORT`, `ENV`, `LOG_FMT`, `POSTGRES_URL`, `BASE_URL`, `TRUSTED_ORIGINS`). `BASE_URL` is the frontend's public URL, used for email links.
- **Migrations**: SQL files are `//go:embed`-ed. You can also run them in-process with `./baduk.online -migrate`. Goose CLI is used by `make db/migrate`.
- **Go version**: `go.mod` specifies `1.26.2`. CI workflows use `1.26.2`.

## Frontend

- **Package manager**: pnpm.
- **Dev server**: `cd frontend && pnpm dev` (port 5173). Proxies `/api` to `localhost:4000` via `astro.config.ts`.
- **Frontend tests**: a Vitest scaffold at `frontend/test/basic.test.ts`. No application tests yet. `pnpm test` runs `vitest`.
- **Build**: `pnpm build` outputs to `frontend/dist/`, which is embedded in the Go binary when built with `-tags embedfrontend` (`make build`, GoReleaser). Without the tag (`go run .`, `go test ./...`) the server serves only the API; `frontend_stub.go` vs `frontend_embed.go`.

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
- **Frontend**: `pnpm lint` (eslint), `pnpm exec tsc --noEmit` (TypeScript), `pnpm exec astro check` (Astro).

## Release & deploy

- **Commits**: Use Conventional Commits (`feat:`, `fix:`, etc.). `release-please-config.json` drives versioning and updates `main.go` (the `version` constant).
- **CI**: `.github/workflows/ci.yml` runs `go test -race`, `go vet`, golangci-lint, and CodeQL on Go changes.
- **Release**: Merging a release-please PR creates a tag, which triggers `goreleaser.yml` to build binaries and publish a GitHub release.
- **Deploy**: Ansible playbooks in `deploy/ansible/`. Target is Fedora with Podman quadlets, Caddy, and Postgres. Cloudflare access is managed via Terraform in `deploy/`.

## Planning

GitHub issues, task lists, labels, and milestones are the source of truth. See [milestone #4 — MVP: Play a complete game](https://github.com/hazzardr/baduk-online/milestone/4).

## Style & conventions

- Backend logging uses `slog` (often via `charmbracelet/log` adapter).
- JSON helpers (`writeJSON`, `readJSON`) are in `cmd/api/helpers.go`; prefer them over raw `json.NewEncoder`.
- The frontend is a **static** build (no SSR adapter), served by the Go backend (`cmd/api/frontend.go`) from the same origin as the API. Never rely on `Astro.locals` or `Astro.request` for auth: resolve it in the browser with `getCurrentUser()` from `src/lib/api.ts`. `Header.astro` toggles `[data-auth-guest]` / `[data-auth-user]` elements. Set user-controlled text with `textContent`, not `innerHTML`.
- CSRF: the backend uses Go's `http.CrossOriginProtection` (Sec-Fetch-Site/Origin checks against `TRUSTED_ORIGINS`), so same-origin browser requests pass without a token.
