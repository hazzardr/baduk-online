# Deployment

This project uses Ansible to configure a single Fedora host (a local VM). Cloudflare Tunnel exposes it to the internet, so the host needs no inbound ports or public IP.

# Infrastructure

| Component | Runs as | Managed by |
|---|---|---|
| `baduk` (Go backend + embedded frontend) | system service, user `baduk`, port `baduk_port` | `roles/service` |
| Postgres 17 | rootless Podman quadlet under `baduk`, published on `127.0.0.1:5432` | `roles/db` |
| `cloudflared` | system service, user `cloudflared` | `roles/tunnel` |
| Backups | user timer under `baduk` (see `BACKUP.md`) | `roles/db` |

# Routing

```
browser ──HTTPS──▶ Cloudflare edge ──tunnel──▶ cloudflared ──HTTP──▶ localhost:4000 (baduk)
```

- Cloudflare terminates TLS and caches static assets. `cloudflared` keeps an outbound connection open and forwards requests for `cloudflared_hostnames` to the backend.
- The frontend is embedded in the Go binary, so the backend serves the whole site from one origin: `/api/*` is the JSON API, and everything else is the static Astro build.
- The tunnel's routing rules live in `roles/tunnel/templates/config.yml.j2`, so they are versioned here rather than in the Cloudflare dashboard.

# One-time tunnel setup

Run these on your own machine (`brew install cloudflared`). The tunnel needs creating only once; Ansible deploys its credentials.

1. Log in to the Cloudflare account that hosts the `baduk.online` zone:
   ```bash
   cloudflared tunnel login
   ```
2. Create the tunnel. This writes `~/.cloudflared/<tunnel-id>.json`:
   ```bash
   cloudflared tunnel create baduk
   ```
3. Point each hostname in `cloudflared_hostnames` at the tunnel. This creates a proxied CNAME. Delete any existing DNS record for the hostname first. If the hostname is attached to a Worker as a custom domain, detach it.
   ```bash
   cloudflared tunnel route dns baduk play.baduk.online
   ```
4. Add the credentials to the vault as `vault_cloudflared_credentials`, pasting the JSON file's contents:
   ```bash
   ansible-vault edit deploy/ansible/vars/vault.yml
   ```
   ```yaml
   vault_cloudflared_credentials: '{"AccountTag":"...","TunnelSecret":"...","TunnelID":"..."}'
   ```

`vault_cf_api_token` was only used by Caddy for ACME DNS challenges and is no longer needed.

# Deploying

1. Cut a release (merge the release-please PR). GoReleaser builds the frontend, embeds it, and publishes `baduk-linux-<arch>.tar.gz`.
2. Run `make deploy/all` (or a single role: `deploy/fedora`, `deploy/db`, `deploy/tunnel`, `deploy/service`). The `service` role downloads the latest release to `/opt/baduk/baduk` and runs migrations.
3. Check `https://play.baduk.online/api/v1/health`. `"ses": "OK"` means email works. `"ses": "unavailable"` means AWS credentials are missing or wrong, and registration is disabled.

The backend reads its configuration from `/opt/baduk/baduk.env` (`roles/service/templates/baduk.env.j2`). `BASE_URL` (from `baduk_base_url`) sets the host used in activation email links. With `ENV=production`, the server refuses to start if it was built without the frontend.

## Troubleshooting

```bash
sudo systemctl status cloudflared baduk                 # system services
systemctl --user status postgres                        # as baduk
journalctl -u cloudflared -u baduk -f                   # logs
cloudflared tunnel info baduk                           # from your machine: connector status
```

Hosts deployed before the switch to Cloudflare Tunnel had a Caddy socket on port 4000. The `tunnel` role stops it and removes its files.
