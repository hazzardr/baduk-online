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
- ✅ Fixed bug in handleRegisterUser (missing pointer in readJSON call)
- ✅ Fixed SQL bug in users.Update (removed incorrect table aliases)
- ✅ Verified registration token verification endpoint in cmd/api/users.go
- ✅ Verified register user flow in internal/data/registration.go
- ✅ Added comprehensive integration tests for registration token workflow
  - Complete registration workflow (create user → activate with token)
  - Invalid token rejection
  - Token length validation
  - Empty token validation
  - Token revocation after successful activation

## Open Items

### Infrastructure

- [ ] Add database migration task to Ansible service role
- [ ] Deploy environment files (postgres.env, baduk_env/prod.yml) via Ansible templates
- [ ] Verify health check endpoint accessibility in containers
- [ ] Verify Dockerfile is correct
- [ ] Add backup strategy for Postgres data
- [ ] Document backup/restore procedures

### Low Priority

- [ ] Add explicit network creation tasks in Ansible
- [ ] Consider moving postgres.env to user space for consistency
