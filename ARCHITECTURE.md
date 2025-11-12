# Application Architecture

Deployment files are in the `deploy` folder.

This application is a **backend-only** Go REST API service. When in production, it is accessed over HTTPS using Cloudflare as DNS to a Caddy reverse proxy for TLS termination and other reverse proxy features. This project uses PostgreSQL as the database backend.

## Infrastructure Stack

- **Podman** - Container runtime for all services
- **Caddy** - Reverse proxy and TLS termination
- **PostgreSQL** - Database
- **systemd + quadlets** - Service orchestration
- **Ansible** - Deployment and configuration management
- **Terraform** - Cloudflare network access configuration only

Currently, Caddy, the Go API binary, and PostgreSQL are all deployed on the same server using podman containers orchestrated by systemd.

## Application Structure

```
cmd/api/          - API handlers, routes, middleware
internal/data/    - Database models and operations
internal/mail/    - AWS SES email service (registration emails)
internal/validator/ - Input validation
migrations/       - Database migrations (goose)
deploy/           - Ansible playbooks and Terraform configs
```

## Key Services

- **API Server** (port 4000) - REST API endpoints under `/api/v1`
- **Session Management** - PostgreSQL-backed sessions (24hr lifetime)
- **Email Service** - AWS SES for transactional emails
- **Database** - PostgreSQL with pgx driver
