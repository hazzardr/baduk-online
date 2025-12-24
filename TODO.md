# TODO

## Open Items

### Features

#### Registration Security Improvements

**High Priority:**
- [ ] Integrate login logic with Go codebase to astro frontend
  - **Phase 1: Backend - Add Login/Logout Endpoints** ✅
    - [x] Create `handleLogin` handler in `cmd/api/users.go`
      - Accept email and password in JSON body
      - Validate credentials using `Users.GetByEmail()` and `password.Matches()`
      - Check if user is validated (`user.Validated == true`)
      - Set session using `sessionManager.Put(ctx, "userEmail", email)`
      - Return user info (name, email, validated)
      - Add rate limiting (10 attempts/hour per IP)
    - [x] Create `handleLogout` handler in `cmd/api/users.go`
      - Destroy session using `sessionManager.Destroy(ctx)`
      - Return success response
    - [x] Update routes in `cmd/api/routes.go`
      - Add `POST /api/v1/login` with rate limiting and CSRF protection
      - Add `POST /api/v1/logout` with CSRF protection
  - **Phase 2: Frontend - Build Login UI**
    - [ ] Create login page at `frontend/src/pages/signin.astro`
      - Form with email and password fields
      - Client-side validation
      - Error message display
      - Link to signup page
    - [ ] Create API client utilities at `frontend/src/lib/api.ts`
      - `login(email, password)` function
      - `logout()` function
      - `getCurrentUser()` function
      - CSRF token handling from cookies
      - Error handling
    - [ ] Add authentication middleware at `frontend/src/middleware/auth.ts`
      - Check session server-side
      - Fetch user data from API
      - Pass `isAuthenticated` and `userName` to pages
    - [ ] Create logout page at `frontend/src/pages/logout.astro`
      - Server-side logout action
      - Redirect to home page
    - [ ] Add TypeScript types at `frontend/src/types/api.ts`
      - `User` interface
      - API response types
      - Error types
  - **Phase 3: Integration & Polish**
    - [ ] Update `frontend/src/pages/index.astro` to show user info when authenticated
    - [ ] Add error handling for login failures
      - Invalid credentials
      - Account not activated
      - Network errors
      - Session expiration
    - [ ] Test complete authentication flow
      - Login with valid credentials
      - Login with invalid credentials (should fail)
      - Login with unactivated account (should fail)
      - Rate limiting triggers after 10 failed attempts
      - Session persists across page reloads
      - Logout clears session
      - CSRF protection works

**Medium Priority:**
- [x] Log failed activation attempts for security auditing
- [x] Send "account activated" confirmation email after successful activation
- [x] Add CSRF protection to activation endpoint

**Low Priority:**
- [ ] Implement audit logging for security events (failed logins, activations, etc.)
- [ ] Add maximum failed activation attempts per user with temporary lockout
- [ ] Add notification when suspicious activation attempts detected
- [ ] Provide user-facing way to invalidate/regenerate token if compromised

### Infrastructure

- [ ] Add explicit network creation tasks in Ansible
- [ ] Consider moving postgres.env to user space for consistency
