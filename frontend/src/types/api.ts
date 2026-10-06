// User represents an authenticated user
export interface User {
  name: string;
  // null when the user signed in with a provider that doesn't share email (OGS)
  email: string | null;
  created_at: string;
}

// LogoutResponse is returned on successful logout
export interface LogoutResponse {
  message: string;
}

// ErrorResponse represents an API error response
export interface ErrorResponse {
  error: string | Record<string, string>;
}

// APIError represents a structured error from the API
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "APIError";
  }
}
