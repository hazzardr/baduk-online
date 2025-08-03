# Go Baduk Development Guide

## Build/Test/Lint Commands
- **Build**: `just build` or `go build -o ./bin/gobaduk .`
- **Run**: `just run` or `go run .`
- **Test all**: `go test ./...`
- **Test single package**: `go test ./cmd/api` or `go test ./internal/validator`
- **Test with coverage**: `go test -cover ./...`
- **Clean**: `just clean`
- **Update deps**: `just update`

## Database Commands
- **Migrate**: `just migrate`
- **Create migration**: `just create-migration <name>`
- **Migration status**: `just status`

## Code Style Guidelines
- **Package naming**: lowercase, single word (e.g., `api`, `data`, `validator`)
- **Struct fields**: PascalCase with JSON tags (e.g., `CreatedAt time.Time \`json:"created_at"\``)
- **Private fields**: camelCase (e.g., `environment`, `version`)
- **Imports**: Standard library first, then third-party, then local packages
- **Error handling**: Always check errors, use `errors.Is()` for comparison
- **JSON responses**: Use indented formatting with `json.MarshalIndent`
- **Database**: Use pgx/v5 for PostgreSQL, context for queries
- **Testing**: Table-driven tests with descriptive test names
- **Validation**: Use custom validator package for input validation
- **Passwords**: Use bcrypt with cost 12, store as hash only
- **HTTP**: Use chi router, structured response helpers
- **Logging**: Use charmbracelet/log for structured logging