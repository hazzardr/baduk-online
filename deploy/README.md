# Deployment

This project primarily uses ansible to manage its deployment configuration. Terraform is only used to manage cloudflare access to the private network the server is hosted on, rather than the entire VM.

# Infrastructure

`baduk-online` uses the following infra stack:

- `podman` containers, volumes, and networks
- `caddy` for reverse proxy
- `postgres` for database access
- `systemd` and `quadlets` to orchestrate relevant services

# Routing

Caddy serves everything on `*.baduk.online` from one origin:

- `/api/*` is proxied to the Go backend (`baduk_port`).
- Everything else is the static Astro build, copied from `frontend/dist` to `caddy_www_host_dir` and mounted read-only into the Caddy container.

# Deploying

1. Build the frontend first. The `proxy` role copies `frontend/dist` and fails if it is missing:
   ```bash
   cd frontend && pnpm install && pnpm build
   ```
2. Run the playbook from `deploy/ansible/`.
3. Check `https://play.baduk.online/api/v1/health`. `"ses": "OK"` means email works. `"ses": "unavailable"` means AWS credentials are missing or wrong, and registration is disabled.

The backend reads its configuration from `/opt/baduk/baduk.env` (`roles/service/templates/baduk.env.j2`). `BASE_URL` (from `baduk_base_url`) sets the host used in activation email links.
