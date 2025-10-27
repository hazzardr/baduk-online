# TODO

## Completed Today

- ✅ Set up testcontainers integration tests with Podman
- ✅ Configured Makefile with proper environment variables for tests
- ✅ Added database migrations to test setup using goose
- ✅ Created mock mailer for testing
- ✅ Implemented comprehensive user registration integration tests
- ✅ Updated GitHub Actions workflows to run integration tests
- ✅ Fixed Ansible deployment: unified network configuration (baduk.network)
- ✅ Added systemd handlers for proper service reload/restart

## Open Items

### Infrastructure

- [ ] Add database migration task to Ansible service role
- [ ] Deploy environment files (postgres.env, baduk_env/prod.yml) via Ansible templates
- [ ] Verify health check endpoint accessibility in containers
- [ ] Verify Dockerfile is correct
- [ ] Add backup strategy for Postgres data
- [ ] Document backup/restore procedures

### Features

- [ ] Implement automated registration token verification endpoint
- [ ] Implement manual registration token verification endpoint
- [ ] Verify register user flow in internal/data/registration.go

### Low Priority

- [ ] Add explicit network creation tasks in Ansible
- [ ] Consider moving postgres.env to user space for consistency
- [ ] Add more integration tests for edge cases
