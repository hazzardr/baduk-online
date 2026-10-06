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
- **Sign-in is through external providers only; there are no passwords or email sending.** `internal/auth.Provider` has two implementations: `OIDCProvider` (Google, via `coreos/go-oidc`) and `OAuth2Provider` (OGS: plain OAuth2, identity from a profile endpoint; reuse it for Discord/Naver). Both use authorization code + PKCE. Routes are `/api/v1/auth/{provider}/start|callback`; new providers go in `signInProviders` (`cmd/api/auth.go`). `users` is the account; `identities` links `(provider, subject)` to it. Look users up by `(provider, subject)`, never by email alone. Email is optional (`users.email` is `*string`; OGS shares none). The session stores the user's ID (`userIDSessionKey`).
- **Providers are optional at startup**. `main.go` (`configureSignIn`) builds each provider from its `<NAME>_CLIENT_ID`/`<NAME>_CLIENT_SECRET`; a provider with no credentials (or, for Google, failed discovery) is left out with a warning (with `ENV=production` the server exits instead), so `/api/v1/auth/<name>/*` redirect to `/signin?error=unavailable` and `/api/v1/health` reports `<name>: unavailable`. Never append a nil provider to the list (a typed nil is a non-nil interface). In tests, use the fake provider in `internal/auth/authtest`, which plays both Google and OGS (see `cmd/api/auth_test.go`), or pass no providers.
- **Configuration**: flags default to env vars (`PORT`, `ENV`, `LOG_FMT`, `POSTGRES_URL`, `BASE_URL`, `TRUSTED_ORIGINS`, `GOOGLE_CLIENT_ID`, `OGS_CLIENT_ID`; the `*_CLIENT_SECRET`s are env-only). `BASE_URL` is the site's public URL; providers redirect back to `BASE_URL/api/v1/auth/<name>/callback`, so use `http://localhost:5173` locally.
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
  Integration tests live in `cmd/api/*_test.go` and spin up `postgres:17.5` containers via testcontainers-go. With Docker or OrbStack instead of Podman, set `DOCKER_HOST` to its socket (OrbStack: `unix://$HOME/.orbstack/run/docker.sock`) and run `go test ./...`.

## Lint & typecheck

- **Backend**: `make lint` (golangci-lint). Config is `.golangci.yml` — very strict, ~60 linters enabled. `make fmt` runs `go fmt`.
- **Frontend**: `pnpm lint` (eslint), `pnpm exec tsc --noEmit` (TypeScript), `pnpm exec astro check` (Astro).

## Release & deploy

- **Commits**: Use Conventional Commits (`feat:`, `fix:`, etc.). `release-please-config.json` drives versioning and updates `main.go` (the `version` constant). Every commit references the GitHub issues its changes affect, in a footer: `Closes #N` for an issue the commit completes, `Refs #N` for one it contributes to (one line per issue).
- **Pull requests**: The PR body lists every issue the code affects: `Closes #N` for each issue the PR completes (so merging closes it), `Refs #N` for related or partially addressed ones. Name branches `<type>/<issue>-<slug>`, e.g. `feat/36-google-signin`.
- **CI**: `.github/workflows/ci.yml` runs `go test -race`, `go vet`, golangci-lint, and CodeQL on Go changes.
- **Release**: Merging a release-please PR creates a tag, which triggers `goreleaser.yml` to build binaries and publish a GitHub release.
- **Deploy**: Ansible playbooks in `deploy/ansible/`. Target is Fedora with Podman quadlets, Caddy, and Postgres. Cloudflare access is managed via Terraform in `deploy/`.

## Planning

GitHub issues, task lists, labels, and milestones are the source of truth. See [milestone #4 — MVP: Play an OGS game from baduk.online](https://github.com/hazzardr/baduk-online/milestone/4).

## Style & conventions

- Backend logging uses `slog` (often via `charmbracelet/log` adapter).
- JSON helpers (`writeJSON`, `readJSON`) are in `cmd/api/helpers.go`; prefer them over raw `json.NewEncoder`.
- The frontend is a **static** build (no SSR adapter), served by the Go backend (`cmd/api/frontend.go`) from the same origin as the API. Never rely on `Astro.locals` or `Astro.request` for auth: resolve it in the browser with `getCurrentUser()` from `src/lib/api.ts`. `Header.astro` toggles `[data-auth-guest]` / `[data-auth-user]` elements. Set user-controlled text with `textContent`, not `innerHTML`.
- CSRF: the backend uses Go's `http.CrossOriginProtection` (Sec-Fetch-Site/Origin checks against `TRUSTED_ORIGINS`), so same-origin browser requests pass without a token.
