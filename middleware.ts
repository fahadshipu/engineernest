import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, validateGoogleAdminToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const isLogin = request.nextUrl.pathname === "/admin/login";
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await validateGoogleAdminToken(token) : null;
  const isAuthed = session?.ok === true;

  if (!isAuthed && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAuthed && isLogin) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
