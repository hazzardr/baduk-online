project_name := "gobaduk"

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
