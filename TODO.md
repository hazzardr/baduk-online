# TODO

## Open Items

### Features

#### Registration Security Improvements

**High Priority:**
- [ ] Add rate limiting (5 attempts/hour per IP) on activation endpoint (PUT /users/activated)
- [ ] Move activation token from query params to POST body to prevent URL logging
- [ ] Extend registration token TTL from 15 minutes to 30-60 minutes
- [ ] Add rate limiting on user creation endpoint (POST /users) to prevent spam

**Medium Priority:**
- [ ] Log failed activation attempts for security auditing
- [ ] Send "account activated" confirmation email after successful activation
- [ ] Add CSRF protection to activation endpoint
- [ ] Consider additional confirmation factor (email + explicit click confirmation)

**Low Priority:**
- [ ] Implement audit logging for security events (failed logins, activations, etc.)
- [ ] Add maximum failed activation attempts per user with temporary lockout
- [ ] Add notification when suspicious activation attempts detected
- [ ] Provide user-facing way to invalidate/regenerate token if compromised

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
