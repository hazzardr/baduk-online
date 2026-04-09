// User represents an authenticated user
export interface User {
  name: string;
  email: string;
  validated: boolean;
}

// LoginResponse is returned on successful login
export interface LoginResponse {
  name: string;
  email: string;
  validated: boolean;
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
