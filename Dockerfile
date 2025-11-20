# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=${TARGETARCH} GOEXPERIMENT=jsonv2 \
    go build -ldflags="-w -s" -o /app/baduk .

# Runtime stage
FROM alpine:3.20

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Copy the binary
COPY --from=builder /app/baduk /usr/local/bin/baduk

# Expose port
EXPOSE 4000

# Run the binary
ENTRYPOINT ["baduk"]
