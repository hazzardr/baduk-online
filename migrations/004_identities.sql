-- +goose Up
-- Sign-in moves to external providers (Google first). Password accounts can no longer sign in,
-- and their emails would collide with users.email for a later Google sign-in, so they are removed.
DELETE FROM users;
DROP TABLE IF EXISTS registration;
ALTER TABLE users
    DROP COLUMN password_hash,
    DROP COLUMN validated;

-- A sign-in identity at an external provider. subject is the provider's permanent user ID;
-- email is what the provider reported at the last sign-in.
CREATE TABLE identities (
    provider text NOT NULL,
    subject text NOT NULL,
    user_id bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    email citext NOT NULL,
    email_verified bool NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY (provider, subject)
);

CREATE INDEX identities_user_id_idx ON identities (user_id);

-- +goose Down
DROP TABLE identities;
DELETE FROM users;
ALTER TABLE users
    ADD COLUMN password_hash bytea NOT NULL,
    ADD COLUMN validated bool NOT NULL;
CREATE TABLE registration (
	hash bytea PRIMARY KEY,
	user_id bigint NOT NULL REFERENCES users ON DELETE CASCADE,
	expiry timestamp(0) with time zone NOT NULL
);
