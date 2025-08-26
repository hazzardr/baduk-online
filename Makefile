PROJECT_NAME=baduk.online
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
	@echo "  db                - start the database container"

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

# start the database
db:
	podman run -d \
          --name postgres \
          -p 5432:5432 \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=go_baduk \
          -v postgres_data:/var/lib/postgresql/data \
          --restart unless-stopped \
          --replace \
          postgres:17.5

.PHONY: help update build clean run create-migration migrate status db-up
