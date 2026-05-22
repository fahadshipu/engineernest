import { NextResponse } from "next/server";
import { AUTH_COOKIE, ADMIN_PASSWORD, ADMIN_USERNAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as { username?: string; password?: string };

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
