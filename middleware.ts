import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, validateGoogleAdminToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isEstimatorRoute = pathname.startsWith("/estimator");

  if (!isAdminRoute && !isEstimatorRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await validateGoogleAdminToken(token) : null;
  const isAuthed = session?.ok === true;

  // Estimator is admin-only: redirect unauthenticated users to admin login
  if (isEstimatorRoute && !isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isEstimatorRoute) {
    return NextResponse.next();
  }

  // Admin routes
  const isLogin = pathname === "/admin/login";

  if (!isAuthed && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAuthed && isLogin) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/estimator", "/estimator/:path*"],
};
