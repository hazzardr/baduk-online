# Deployment

This project primarily uses ansible to manage its deployment configuration. Terraform is only used to manage cloudflare access to the private network the server is hosted on, rather than the entire VM.

# Infrastructure

`baduk-online` uses the following infra stack:

- `podman` containers, volumes, and networks
- `caddy` for reverse proxy
- `postgres` for database access
- `systemd` and `quadlets` to orchestrate relevant services
