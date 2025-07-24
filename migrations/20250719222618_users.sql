-- +goose Up
CREATE TABLE IF NOT EXISTS users (
    id bigserial PRIMARY KEY,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    name text NOT NULL,
    email citext UNIQUE NOT NULL, -- citext = case insensitive
    password_hash bytea NOT NULL,
    validated bool NOT NULL,
    version integer NOT NULL DEFAULT 1
);


-- +goose Down
DROP TABLE IF EXISTS users;
