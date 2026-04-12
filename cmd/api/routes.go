package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func (api *API) Routes() http.Handler {
	e := echo.New()
	e.Use(middleware.RequestID())
	e.Use(echo.WrapMiddleware(api.sessionManager.LoadAndSave))
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())
	e.Use(middleware.ContextTimeout(10 * time.Second))

	// Create rate limiters
	activationRateLimiter := middleware.RateLimiter(
		middleware.NewRateLimiterMemoryStore(1),
	)
	userCreationRateLimiter := middleware.RateLimiter(
		middleware.NewRateLimiterMemoryStore(1),
	)
	loginRateLimiter := middleware.RateLimiter(
		middleware.NewRateLimiterMemoryStore(5),
	)

	// API routes
	v1 := e.Group("/api/v1")
	v1.Use(api.csrfMiddleware(api.trustedOrigins))

	v1.GET("/health", api.handleHealthCheck)

	v1.POST("/users", api.handleCreateUser, userCreationRateLimiter)
	v1.POST("/users/register", api.handleSendRegistrationEmail)
	v1.PUT("/users/activated", api.handleRegisterUser, activationRateLimiter)

	// Login/Logout
	v1.POST("/login", api.handleLogin, loginRateLimiter)
	v1.POST("/logout", api.handleLogout)

	v1.GET("/user", api.handleGetLoggedInUser)

	return e
}
