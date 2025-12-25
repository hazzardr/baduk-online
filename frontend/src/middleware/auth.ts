import { defineMiddleware } from "astro:middleware";
import { getCurrentUser } from "../lib/api";

export const onRequest = defineMiddleware(async (context, next) => {
  // Try to get the current user from the API
  try {
    const user = await getCurrentUser();

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
  } catch (error) {
    // If there's an error fetching user data, treat as not authenticated
    console.error("Error fetching user in middleware:", error);
    context.locals.isAuthenticated = false;
    context.locals.userName = "";
    context.locals.userEmail = "";
    context.locals.userValidated = false;
  }

  return next();
});
