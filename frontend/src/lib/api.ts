import type {
  LoginResponse,
  LogoutResponse,
  User,
  ErrorResponse,
} from "../types/api";
import { APIError } from "../types/api";

const API_BASE_URL = "/api/v1";
const SERVER_API_BASE_URL = "http://localhost:4000/api/v1";

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
  clientCookies?: string,
): Promise<{ data: T; headers: Headers }> {
  const csrfToken = getCSRFToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add CSRF token header for state-changing requests
  if (csrfToken && ["POST", "PUT", "DELETE"].includes(options.method || "")) {
    headers["X-Cross-Origin-Token"] = csrfToken;
  }

  // Add cookies if provided (for SSR)
  if (clientCookies) {
    headers["Cookie"] = clientCookies;
  }

  // Use absolute URL on server, relative on client
  const baseUrl = (typeof window === "undefined" || !window.location.host) ? SERVER_API_BASE_URL : API_BASE_URL;
  const response = await fetch(`${baseUrl}${endpoint}`, {
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
    return { data: {} as T, headers: response.headers };
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

  return { data: data as T, headers: response.headers };
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string,
  clientCookies?: string,
): Promise<{ data: LoginResponse; headers: Headers }> {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, clientCookies);
}

/**
 * Logout the current user
 */
export async function logout(clientCookies?: string): Promise<{ data: LogoutResponse; headers: Headers }> {
  return apiRequest<LogoutResponse>("/logout", {
    method: "POST",
  }, clientCookies);
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(
  clientCookies?: string,
): Promise<{ user: User | null; headers?: Headers }> {
  try {
    const { data, headers } = await apiRequest<User>("/user", {
      method: "GET",
    }, clientCookies);
    return { user: data, headers };
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return { user: null }; // Not authenticated
    }
    throw error;
  }
}

/**
 * Activate a user account with a token
 */
export async function activate(token: string): Promise<User> {
  const { data } = await apiRequest<User>("/users/activated", {
    method: "PUT",
    body: JSON.stringify({ token }),
  });
  return data;
}

/**
 * Sign up a new user
 */
export async function signup(
  name: string,
  email: string,
  password: string,
  clientCookies?: string,
): Promise<{ data: User; headers: Headers }> {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  }, clientCookies);
}
