import { NextResponse } from "next/server";
import { AUTH_COOKIE, validateGoogleAdminToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { accessToken } = (await request.json()) as { accessToken?: string };
  const validation = await validateGoogleAdminToken(accessToken);

  if (!validation.ok) {
    return NextResponse.json({ ok: false, message: validation.message }, { status: validation.status });
  }

  const response = NextResponse.json({ ok: true, email: validation.email });
  response.cookies.set(AUTH_COOKIE, accessToken ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  return response;
}
