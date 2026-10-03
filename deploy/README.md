# Deployment

This project primarily uses ansible to manage its deployment configuration. Terraform is only used to manage cloudflare access to the private network the server is hosted on, rather than the entire VM.

# Infrastructure

`baduk-online` uses the following infra stack:

- `podman` containers, volumes, and networks
- `caddy` for reverse proxy
- `postgres` for database access
- `systemd` and `quadlets` to orchestrate relevant services

# Routing

The frontend is embedded in the Go binary, so the backend serves the whole site from one origin:

- `/api/*` is the JSON API.
- Everything else is the static Astro build (`frontend/dist`), compiled in with `-tags embedfrontend`.

Caddy terminates TLS and proxies all of `*.baduk.online` to the backend (`baduk_port`).

# Deploying

1. Cut a release (merge the release-please PR). GoReleaser builds the frontend, embeds it, and publishes `baduk-linux-<arch>.tar.gz`.
2. Run the playbook from `deploy/ansible/`. The `service` role downloads the latest release to `/opt/baduk/baduk`.
3. Check `https://play.baduk.online/api/v1/health`. `"ses": "OK"` means email works. `"ses": "unavailable"` means AWS credentials are missing or wrong, and registration is disabled.

The backend reads its configuration from `/opt/baduk/baduk.env` (`roles/service/templates/baduk.env.j2`). `BASE_URL` (from `baduk_base_url`) sets the host used in activation email links. With `ENV=production`, the server refuses to start if it was built without the frontend.
