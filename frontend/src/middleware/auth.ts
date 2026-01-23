import { defineMiddleware } from "astro:middleware";
import { getCurrentUser } from "../lib/api";

export const onRequest = defineMiddleware(async (context, next) => {
  // Get cookies from the request
  const cookies = context.request.headers.get("cookie") || "";
  
  // Skip API call if no session cookie is present
  // This avoids errors during static build and unnecessary calls for guests
  if (!cookies.includes("session_id=")) {
    context.locals.isAuthenticated = false;
    context.locals.userName = "";
    context.locals.userEmail = "";
    context.locals.userValidated = false;
    return next();
  }

  // Try to get the current user from the API
  try {
    const { user, headers } = await getCurrentUser(cookies);
    // ... rest of the logic

    // Forward Set-Cookie headers from API to the browser
    if (headers) {
      const setCookie = headers.get("set-cookie");
      if (setCookie) {
        // Multiple set-cookie headers are joined with commas in fetch headers.get()
        // We need to split them carefully or just forward as is if possible.
        // Astro's context.response.headers.append is usually what we want.
        // But we are in middleware before the response is created.
      }
    }

    if (user) {
      // User is authenticated
      context.locals.isAuthenticated = true;
      context.locals.userName = user.name;
      context.locals.userEmail = user.email;
      context.locals.userValidated = user.validated;
    } else {
      // User is not authenticated
      context.locals.isAuthenticated = false;
      context.locals.userName = "";
      context.locals.userEmail = "";
      context.locals.userValidated = false;
    }

    const response = await next();

    // After calling next(), we can add headers to the response
    if (headers) {
      const setCookies = headers.getSetCookie();
      for (const cookie of setCookies) {
        response.headers.append("set-cookie", cookie);
      }
    }

    return response;
  } catch (error) {
    // If there's an error fetching user data, treat as not authenticated
    console.error("Error fetching user in middleware:", error);
    context.locals.isAuthenticated = false;
    context.locals.userName = "";
    context.locals.userEmail = "";
    context.locals.userValidated = false;
    return next();
  }
});
