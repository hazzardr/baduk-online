# Local Database Configuration

PROJECT_NAME := baduk_online

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# print this
help:
	@echo ""
	@echo "$(PROJECT_NAME) Development CLI"
	@echo ""
	@echo "Usage:"
	@echo "  make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  update            - update dependencies"
	@echo "  build             - build the project"
	@echo "  clean             - delete generated code"
	@echo "  run               - run the project"
	@echo "  create-migration  - create a migration script"
	@echo "  migrate           - run database migrations"
	@echo "  status            - get the status of the db migrations"

# update dependencies
update:
	go get -u
	go mod tidy

# build the project
build:
	go build -o ./bin/$(PROJECT_NAME) .

# delete generated code
clean:
	rm -rf bin/ dist/

# run the project
run:
	go run .

# create a migration script
create-migration:
	goose postgres $(POSTGRES_URL) -dir migrations create $(migrationName) sql

# run database migrations
migrate:
	goose postgres $(POSTGRES_URL) -dir migrations up

# get the status of the db migrations
status:
	goose postgres $(POSTGRES_URL) -dir migrations status

.PHONY: help update build clean run create-migration migrate status