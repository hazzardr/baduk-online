package api

import (
	"net/http"
	"sync"
	"time"
)

// rateLimiter implements a simple in-memory rate limiter using a sliding window approach.
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	attempts []time.Time
	lastSeen time.Time
}

// newRateLimiter creates a new rate limiter with the specified limit and time window.
func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}

	// Start a background goroutine to clean up old visitors
	go rl.cleanupVisitors()

	return rl
}

// cleanupVisitors removes visitors that haven't been seen in 3x the window duration.
func (rl *rateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.window*3 {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// allow checks if a request from the given IP should be allowed.
func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	v, exists := rl.visitors[ip]

	if !exists {
		rl.visitors[ip] = &visitor{
			attempts: []time.Time{now},
			lastSeen: now,
		}
		return true
	}

	// Update last seen
	v.lastSeen = now

	// Filter out attempts outside the window
	cutoff := now.Add(-rl.window)
	validAttempts := make([]time.Time, 0, len(v.attempts))
	for _, attempt := range v.attempts {
		if attempt.After(cutoff) {
			validAttempts = append(validAttempts, attempt)
		}
	}

	// Check if we're under the limit
	if len(validAttempts) < rl.limit {
		validAttempts = append(validAttempts, now)
		v.attempts = validAttempts
		return true
	}

	// Update attempts even if we're denying (for accurate tracking)
	v.attempts = validAttempts
	return false
}

// rateLimitMiddleware returns a middleware that rate limits requests based on IP address.
func (api *API) rateLimitMiddleware(rl *rateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get the real IP (already extracted by middleware.RealIP)
			ip := r.RemoteAddr

			if !rl.allow(ip) {
				api.rateLimitExceededResponse(w, r)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
