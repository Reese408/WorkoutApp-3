/**
 * Next.js Proxy Configuration for Route Protection
 *
 * This proxy function intercepts requests and handles authentication
 * before they reach your pages.
 */

import { auth } from "@/lib/auth";

export default async function proxy(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const { pathname } = url;

  // Validate session with Better Auth (not just check if cookie exists)
  let isAuthenticated = false;
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    isAuthenticated = !!session;
  } catch (error) {
    // Session validation failed - user is not authenticated
    isAuthenticated = false;
  }

  // Protected routes - require authentication
  const protectedRoutes = ["/dashboard", "/home", "/routines", "/exercises", "/workouts"];

  // Auth routes - redirect if already authenticated
  const authRoutes = ["/signin", "/signup"];

  // Check if accessing protected route without auth
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", url.origin);
      signInUrl.searchParams.set("from", pathname);
      return Response.redirect(signInUrl.toString(), 302);
    }
  }

  // Check if accessing auth routes while authenticated
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const dashboardUrl = new URL("/dashboard", url.origin);
      return Response.redirect(dashboardUrl.toString(), 302);
    }
  }

  // Continue to next handler
  return null;
}
