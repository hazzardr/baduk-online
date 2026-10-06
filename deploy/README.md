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
3. Check `https://play.baduk.online/api/v1/health`. `"google": "OK"` means Google sign-in works. In production the server won't start without working Google credentials: if `baduk` keeps restarting, check `journalctl -u baduk` for `GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET unset` or `Google discovery failed`.

The backend reads its configuration from `/opt/baduk/baduk.env` (`roles/service/templates/baduk.env.j2`). `BASE_URL` (from `baduk_base_url`) is the host Google redirects back to after sign-in. With `ENV=production`, the server refuses to start if it was built without the frontend.

# Google sign-in setup

1. In the Google Cloud console, configure the OAuth consent screen: user type External, scopes `openid`, `email` and `profile`. These scopes don't need Google's app verification.
2. Create an OAuth client ID of type "Web application", with the authorized redirect URI `https://play.baduk.online/api/v1/auth/google/callback`. For local development, also add `http://localhost:5173/api/v1/auth/google/callback`.
3. Add the client ID and secret to the vault:
   ```yaml
   vault_google_client_id: "....apps.googleusercontent.com"
   vault_google_client_secret: "..."
   ```

The `vault_aws_*` variables are no longer used and can be removed from the vault.
