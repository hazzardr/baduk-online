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
          -e POSTGRES_DB=baduk \
          -v postgres_data:/var/lib/postgresql/data \
          --restart unless-stopped \
          --replace \
          postgres:17.5

.PHONY: deploy/bootstrap ## bootstrap infrastructure
deploy/bootstrap:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/bootstrap.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass
		
.PHONY: deploy/all ## deploy all components (fedora, proxy, db, service)
deploy/all:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/playbook.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass

.PHONY: deploy/fedora ## deploy fedora role only
deploy/fedora:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/playbook.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass \
		--tags fedora

.PHONY: deploy/proxy ## deploy proxy role only
deploy/proxy:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/playbook.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass \
		--tags proxy

.PHONY: deploy/db ## deploy database role only
deploy/db:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/playbook.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass \
		--tags db

.PHONY: deploy/service ## deploy service role only
deploy/service:
	uv run --with=ansible-core,passlib ansible-playbook deploy/ansible/playbook.yml \
		-i deploy/ansible/inventory \
		--vault-password-file deploy/ansible/.vault_pass \
		--tags service

.PHONY: lint ## run golangci-lint
lint:
	golangci-lint run

.PHONY: test ## run all tests
test:
	DOCKER_HOST=unix://$(XDG_RUNTIME_DIR)/podman/podman.sock \
	TESTCONTAINERS_RYUK_DISABLED=true \
	go test -v ./...

.PHONY: tests/integration ## run integration tests
tests/integration:
	DOCKER_HOST=unix://$(XDG_RUNTIME_DIR)/podman/podman.sock \
	TESTCONTAINERS_RYUK_DISABLED=true \
	go test -v ./cmd/api -run Integration

.PHONY: tests/setup ## ensure podman socket is running
tests/setup:
	systemctl --user start podman.socket
	systemctl --user status podman.socket

