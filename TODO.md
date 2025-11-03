# TODO

## Completed Today

- Started Infrastructure work but did not complete it (on second step)

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
