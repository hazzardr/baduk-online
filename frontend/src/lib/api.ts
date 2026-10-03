import type {
  LoginResponse,
  LogoutResponse,
  User,
  ErrorResponse,
} from "../types/api";
import { APIError } from "../types/api";

// The site is static and served from the same origin as the API: Caddy routes
// /api/* to the backend in production, and the Vite dev proxy does it locally
// (see astro.config.ts). Requests therefore always use a relative path.
const API_BASE_URL = "/api/v1";

/**
 * Get CSRF token from cookies
 */
function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "cross-origin-token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Make an authenticated API request with CSRF token
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Add CSRF token header for state-changing requests
  if (csrfToken && ["POST", "PUT", "DELETE"].includes(options.method || "")) {
    headers.set("X-Cross-Origin-Token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies for session
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new APIError(
        `HTTP error ${response.status}: ${response.statusText}`,
        response.status,
      );
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorResponse = data as ErrorResponse;
    let errorMessage = "An error occurred";
    let errors: Record<string, string> | undefined;

    if (typeof errorResponse.error === "string") {
      errorMessage = errorResponse.error;
    } else if (typeof errorResponse.error === "object") {
      errors = errorResponse.error;
      errorMessage = Object.values(errors).join(", ");
    }

    throw new APIError(errorMessage, response.status, errors);
  }

  return data as T;
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logout the current user
 */
export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/logout", { method: "POST" });
}

/**
 * Get the current authenticated user, or null if not signed in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiRequest<User>("/user", { method: "GET" });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return null; // Not authenticated
    }
    throw error;
  }
}

/**
 * Activate a user account with a token
 */
export async function activate(token: string): Promise<User> {
  return apiRequest<User>("/users/activated", {
    method: "PUT",
    body: JSON.stringify({ token }),
  });
}

/**
 * Sign up a new user
 */
export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}
