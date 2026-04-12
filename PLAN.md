# Migration Plan: Chi → Echo

## Will Echo Actually Reduce Boilerplate?

**Yes, meaningfully.** Here's a concrete accounting of what goes away vs. what stays:

### What Echo eliminates from your codebase

| File | What's Removed | Why |
|---|---|---|
| `helpers.go` | `writeJSON` (20 lines) | Replaced by `c.JSON(status, data)` |
| `helpers.go` | `readJSON` (50 lines) | Replaced by `c.Bind(&input)` |
| `helpers.go` | `errorResponse`, `badRequestResponse`, `serverErrorResponse`, etc. (40 lines) | Replaced by returning `echo.NewHTTPError(...)` from handlers + a single global error handler |
| `helpers_test.go` | `TestWriteJSON`, `TestReadJSON`, `TestErrorResponses` (~130 lines) | These tests cover code that no longer exists |
| `context.go` | Entire file (5 lines) | `c.Set()`/`c.Get()` replaces manual context keys |

**~245 lines deleted.** The overall `cmd/api` package will shrink by roughly 35%.

### What stays (your business logic is unaffected)
- All of `ratelimit.go` (the `rateLimiter` struct/logic) — only the middleware wrapper changes shape
- All of `sessions.go` — `scs` session manager wraps as Echo middleware the same way
- All of `csrf.go` — wraps as Echo middleware the same way
- All of `app.go` — no changes needed
- All of `internal/` — zero changes

---

## Step-by-Step Migration

### Step 1 — Add Echo, remove Chi

```bash
go get github.com/labstack/echo/v4
go get github.com/labstack/echo/v4/middleware
go mod tidy
# Remove chi after migration is complete:
# go get github.com/go-chi/chi/v5@none
```

**Files changed:** `go.mod`, `go.sum`

---

### Step 2 — Rewrite `routes.go`

This is the central switchover. Replace the entire file.

**Before:**
```go
func (api *API) Routes() http.Handler {
    r := chi.NewRouter()
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(api.sessionManager.LoadAndSave)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(10 * time.Second))

    r.Route("/api/v1", func(r chi.Router) {
        r.Use(api.csrfMiddleware(api.trustedOrigins))
        r.Get("/health", api.handleHealthCheck)
        r.With(api.rateLimitMiddleware(userCreationRateLimiter)).Post("/users", api.handleCreateUser)
        // ...
    })
    return r
}
```

**After:**
```go
func (api *API) Routes() http.Handler {
    e := echo.New()

    e.Use(middleware.RequestID())
    e.Use(middleware.RealIP())
    e.Use(echo.WrapMiddleware(api.sessionManager.LoadAndSave))
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{Timeout: 10 * time.Second}))

    // Global error handler replaces all your errorResponse helpers
    e.HTTPErrorHandler = api.errorHandler

    v1 := e.Group("/api/v1")
    v1.Use(api.csrfMiddleware(api.trustedOrigins))

    v1.GET("/health", api.handleHealthCheck)
    v1.POST("/users", api.handleCreateUser, api.rateLimitMiddleware(userCreationRateLimiter))
    v1.POST("/users/register", api.handleSendRegistrationEmail)
    v1.PUT("/users/activated", api.handleRegisterUser, api.rateLimitMiddleware(activationRateLimiter))
    v1.POST("/login", api.handleLogin, api.rateLimitMiddleware(loginRateLimiter))
    v1.POST("/logout", api.handleLogout)
    v1.GET("/user", api.handleGetLoggedInUser)

    return e
}
```

> **Note on `scs`:** `scs` ships an `http.Handler` middleware (`LoadAndSave`). Echo's
> `echo.WrapMiddleware()` adapts standard `func(http.Handler) http.Handler` middleware
> to Echo's format with no extra code.

**Files changed:** `routes.go`

---

### Step 3 — Replace `helpers.go` with a single error handler

Delete `writeJSON`, `readJSON`, and all the `*Response` helper methods. Replace the entire
file with just the background helper, the session helper, and a new global error handler:

```go
// Global error handler — replaces errorResponse, badRequestResponse, serverErrorResponse, etc.
func (api *API) errorHandler(err error, c echo.Context) {
    var he *echo.HTTPError
    if errors.As(err, &he) {
        c.JSON(he.Code, map[string]any{"error": he.Message})
        return
    }
    slog.Error("internal server error", "error", err,
        "method", c.Request().Method, "uri", c.Request().RequestURI())
    c.JSON(http.StatusInternalServerError, map[string]any{"error": "internal server error"})
}

// getUserFromContext — unchanged
func (api *API) getUserFromContext(r *http.Request) (*data.User, error) { ... }

// background — unchanged
func (api *API) background(fn func()) { ... }
```

Validation errors from your `validator` package get returned from handlers like:
```go
return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
```

**Files changed:** `helpers.go` (major reduction)  
**Files deleted:** `helpers_test.go` (the code it tested no longer exists)

---

### Step 4 — Convert handler signatures

Every handler changes from `func(w http.ResponseWriter, r *http.Request)` to
`func(c echo.Context) error`. This is mechanical but touches every handler file.

**Pattern — reading JSON:**
```go
// Before
var input struct { Email string `json:"email"` }
if err := api.readJSON(w, r, &input); err != nil {
    api.badRequestResponse(w, r, err)
    return
}

// After
var input struct { Email string `json:"email"` }
if err := c.Bind(&input); err != nil {
    return echo.NewHTTPError(http.StatusBadRequest, err.Error())
}
```

**Pattern — writing JSON:**
```go
// Before
api.writeJSON(w, http.StatusCreated, user, nil)

// After
return c.JSON(http.StatusCreated, user)
```

**Pattern — error responses:**
```go
// Before
api.serverErrorResponse(w, r, err)
return

// After
return err  // global error handler catches it
```

**Pattern — validation errors:**
```go
// Before
api.failedValidationResponse(w, r, v.Errors)
return

// After
return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
```

**Files changed:** `users.go`, `healthcheck.go`, `sessions.go`

---

### Step 5 — Adapt middleware signatures

Middleware changes from Chi's `func(http.Handler) http.Handler` to Echo's
`echo.MiddlewareFunc`.

**`ratelimit.go`:**
```go
// Before
func (api *API) rateLimitMiddleware(rl *rateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ip := r.RemoteAddr
            if !rl.allow(ip) {
                api.rateLimitExceededResponse(w, r)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

// After
func (api *API) rateLimitMiddleware(rl *rateLimiter) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            if !rl.allow(c.RealIP()) {
                return echo.NewHTTPError(http.StatusTooManyRequests,
                    "rate limit exceeded, please try again later")
            }
            return next(c)
        }
    }
}
```

**`csrf.go`:**
```go
// Before
func (api *API) csrfMiddleware(trustedOrigins []string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        cop := http.NewCrossOriginProtection()
        // ...
        return cop.Handler(next)
    }
}

// After
func (api *API) csrfMiddleware(trustedOrigins []string) echo.MiddlewareFunc {
    return echo.WrapMiddleware(func(next http.Handler) http.Handler {
        cop := http.NewCrossOriginProtection()
        for _, origin := range trustedOrigins {
            if err := cop.AddTrustedOrigin(origin); err != nil {
                slog.Warn("failed to add trusted origin", "origin", origin, "err", err)
            }
        }
        cop.SetDenyHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Write directly here since we're inside a stdlib handler
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusForbidden)
            w.Write([]byte(`{"error":"CSRF check failed"}`))
        }))
        return cop.Handler(next)
    })
}
```

**Files changed:** `ratelimit.go`, `csrf.go`

---

### Step 6 — Update `context.go`

`context.go` exists only to define `userContextKey`. Since session data is still read via
`api.sessionManager.GetString(r.Context(), ...)`, the key is still needed. However, the
file becomes even smaller — it can be inlined into `sessions.go` and the file deleted, or
just left as-is. Either way, no functional change is required here.

**Files changed:** Optional cleanup only.

---

### Step 7 — Update tests

The integration tests in `users_test.go` use `httptest.NewServer(api.Routes())` and make
real HTTP requests — **these tests need zero changes** because `api.Routes()` still
returns an `http.Handler` and the HTTP contract (URLs, methods, status codes) is identical.

The unit tests in `helpers_test.go` test `writeJSON`, `readJSON`, and `*Response` helpers
which will no longer exist. **Delete this file.**

**Files changed:** none  
**Files deleted:** `helpers_test.go`

---

## Summary

| Step | File(s) | Action |
|---|---|---|
| 1 | `go.mod` | Add Echo, eventually remove Chi |
| 2 | `routes.go` | Full rewrite to Echo router |
| 3 | `helpers.go` | Remove ~110 lines, add 1 `errorHandler` |
| 4 | `users.go`, `healthcheck.go`, `sessions.go` | Signature + return pattern conversion |
| 5 | `ratelimit.go`, `csrf.go` | Middleware signature conversion |
| 6 | `context.go` | Optional cleanup |
| 7 | `helpers_test.go` | Delete |

**Net result: ~245 lines deleted, ~0 lines of new boilerplate added.**
