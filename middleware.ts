import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const isLogin = request.nextUrl.pathname === "/admin/login";
  const session = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthed = session === "authenticated";

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
