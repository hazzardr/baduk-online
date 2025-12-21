-- +goose Up
CREATE TABLE registration (
	hash bytea PRIMARY KEY,
	user_id bigint NOT NULL REFERENCES users ON DELETE CASCADE,
	expiry timestamp(0) with time zone NOT NULL
);

-- +goose Down
DROP TABLE registration; 
