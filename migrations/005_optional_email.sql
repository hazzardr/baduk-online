-- +goose Up
-- Some providers (OGS) don't share an email address. users.email stays unique among users that
-- have one; Postgres treats NULLs as distinct.
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE identities ALTER COLUMN email DROP NOT NULL;

-- +goose Down
DELETE FROM users WHERE email IS NULL;
DELETE FROM identities WHERE email IS NULL;
ALTER TABLE identities ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
