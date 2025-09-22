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
	@grep '^.PHONY: ' Makefile | sed 's/.PHONY: //' | awk '{split($$0,a," ## "); printf "  \033[34m%0-10s\033[0m %s\n", a[1], a[2]}'

.PHONY: update ## update dependencies for the project
update:
	go get -u
	go mod tidy

.PHONY: build ## builds the project into a binary
build:
	go build -o ./bin/$(PROJECT_NAME) .

.PHONY: clean ## delete generated code
clean:
	rm -rf bin/ dist/

.PHONY: run ## run the project
run:
	go run .
	
.PHONY: db/migration/create ## create a migration script
db/migration/create:
	goose postgres $(POSTGRES_URL) -dir migrations create $(migrationName) sql

	
.PHONY: db/migration/status ## get the status of the db migrations
db/migration/status:
	goose postgres $(POSTGRES_URL) -dir migrations status

.PHONY: db/migrate ## run database migrations
db/migrate:
	goose postgres $(POSTGRES_URL) -dir migrations up
 .PHONY: db/start ## start the database
db/start:
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

.PHONY: deploy/bootstrap ## bootstrap infrastructure
deploy/bootstrap:
	ansible-playbook deploy/ansible/bootstrap.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.bootstrap_vault_pass


