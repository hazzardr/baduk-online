# Go-Baduk Development Guide

## Build Commands
- Build: `just build`
- Run: `just run`
- Update dependencies: `just update`
- Clean: `just clean`
- Database migrations: `just migrate`

## Testing
- Run all tests: `go test ./...`
- Run specific test: `go test ./path/to/package -run TestName`
- Run tests with verbose output: `go test -v ./...`
- Run tests with coverage: `go test -cover ./...`

## Code Style
- Use Go standard formatting: `gofmt -s -w .`
- Imports: Group standard library, third-party, and local imports
- Error handling: Always check errors and provide context
- Naming: Use CamelCase for exported names, camelCase for unexported
- Context: Pass context as first parameter in functions that perform I/O
- Timeouts: Use context with timeout for database operations (3s standard)
- JSON tags: Use snake_case for JSON field names
- Validation: Use validator package for input validation
- Errors: Define custom errors at package level with `var ErrXxx = errors.New()`
