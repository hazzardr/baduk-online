PROJECT_NAME := "gobaduk"

.PHONY: help ## print this
help:
	@echo ""
	@echo "$(PROJECT_NAME) Development CLI"
	@echo ""
	@echo "Usage:"
	@echo "  make <command>"
	@echo ""
	@echo "Commands:"
	@grep '^.PHONY: ' Makefile | sed 's/.PHONY: //' | awk '{split($$0,a," ## "); printf "  \033[34m%0-10s\033[0m %s\n", a[1], a[2]}'


.PHONY: update ## update dependencies
update:
	@echo "Updating dependencies..."
	@go get -u
	@go mod tidy
	@echo "Done!"


.PHONY: build ## build the project
build:
	@echo "Building..."
	@go build -o ./bin/$(EXEC_NAME) .
	@echo "Done!"

.PHONY: clean ## delete generated code
clean:
	rm -rf bin/
	@echo "Done!"


.PHONY: run ## run the project
run:
	go run .
