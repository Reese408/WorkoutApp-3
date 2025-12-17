/**
 * Next.js Proxy Configuration for Route Protection
 *
 * This proxy function intercepts requests and handles authentication
 * before they reach your pages.
 */

export default async function proxy(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const { pathname } = url;

  // Get session cookie
  const cookies = req.headers.get("cookie") || "";
  const sessionCookie = cookies
    .split(";")
    .find((c) => c.trim().startsWith("better-auth.session_token="));
  const isAuthenticated = !!sessionCookie;

  // Protected routes - require authentication
  const protectedRoutes = ["/dashboard", "/home"];

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
