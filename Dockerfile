FROM golang:1.25-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOEXPERIMENT=jsonv2 \
    go build -o /go/bin/app ./main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /app

COPY --from=build /go/bin/app /app/app

EXPOSE 4000

ENV POSTGRES_URL=""
ENV ENV="production"

ENTRYPOINT ["/app/app"]
