# Local Database Configuration

project_name := "gobaduk"
set dotenv-load := true
# print this
help:
    @echo ""
    @echo "{{project_name}} Development CLI"
    @echo ""
    @echo "Usage:"
    @echo "  just <command>"
    @echo ""
    @echo "Commands:"
    just --list

# update dependencies
update:
    go get -u
    go mod tidy

# build the project
build:
    go build -o ./bin/{{project_name}} .

# delete generated code
clean:
    rm -rf bin/ dist/

# run the project
run:
    go run .

# run database migrations against the specified environment
migrate dbUrl:
    goose postgres {{dbUrl}} -dir migrations up

# get the status of the db migrations for the specified environment
status dbUrl:
    goose postgres {{dbUrl}} -dir migrations status

