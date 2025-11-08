# TODO

## Completed Today

- Started Infrastructure work but did not complete it (on second step)
- Created missing postgres.env.j2 template for database role
- Fixed health check endpoint path in container configuration
- Verified Dockerfile builds successfully
- Implemented PostgreSQL backup strategy with systemd timers
- Created backup/restore documentation

## Open Items

### Infrastructure

- [x] Add database migration task to Ansible service role
- [x] Deploy environment files (postgres.env, baduk_env/prod.yml) via Ansible templates
- [x] Verify health check endpoint accessibility in containers
- [x] Verify Dockerfile is correct
- [x] Add backup strategy for Postgres data
- [x] Document backup/restore procedures

### Low Priority

- [ ] Add explicit network creation tasks in Ansible
- [ ] Consider moving postgres.env to user space for consistency
