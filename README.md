# baduk.online

A Go-based web application for baduk (Go/Weiqi) online.

## Development

### Prerequisites

- Go 1.23 or higher
- PostgreSQL database
- AWS credentials (for SES email service)

### Running Locally

```bash
# Set database URL
export POSTGRES_URL="postgresql://user:pass@localhost:5432/baduk"

# Run migrations
go run . -migrate

# Start the server
go run . -port 4000
```

Visit `http://localhost:4000` to view the landing page.

## Release Process

This project uses **semantic versioning** with **conventional commits** for automated releases.

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `fix:` - Bug fixes (patch version bump: 0.1.0 → 0.1.1)
- `feat:` - New features (minor version bump: 0.1.0 → 0.2.0)
- `feat!:` or `BREAKING CHANGE:` - Breaking changes (major version bump: 0.1.0 → 1.0.0)
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `ci:` - CI/CD changes

**Examples:**
```bash
git commit -m "fix: resolve user authentication issue"
git commit -m "feat: add game replay functionality"
git commit -m "feat!: redesign API endpoints"
```

### How Releases Work

1. **Push commits to `main`** with conventional commit messages

2. **[release-please](https://github.com/googleapis/release-please)** automatically:
   - Analyzes commit messages
   - Creates/updates a "Release PR" with:
     - Version bump based on commit types
     - Generated CHANGELOG
     - Updated version in `main.go`

3. **Merge the Release PR** to trigger the release

4. **[GoReleaser](https://goreleaser.com/)** automatically:
   - Creates a git tag (e.g., `v0.2.0`)
   - Builds multi-architecture binaries (amd64, arm64)
   - Builds and publishes Docker images to GitHub Container Registry
   - Creates a GitHub Release with artifacts and changelog

### Docker Images

Released images are available at:

```bash
# Pull specific version
docker pull ghcr.io/<username>/go-baduk:v0.1.0

# Pull latest
docker pull ghcr.io/<username>/go-baduk:latest
```

Run the container:

```bash
docker run -p 4000:4000 \
  -e POSTGRES_URL="postgresql://user:pass@host:5432/baduk" \
  ghcr.io/<username>/go-baduk:latest
```

### Manual Release (if needed)

To create a release manually:

```bash
# Create and push a tag
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

This will trigger the GoReleaser workflow directly.

## Architecture

- **Backend**: Go with chi router
- **Frontend**: Vanilla JavaScript with Go HTML templates (embedded at compile time)
- **Database**: PostgreSQL
- **Email**: AWS SES
- **Sessions**: Cookie-based session management

## License

[Add your license here]
