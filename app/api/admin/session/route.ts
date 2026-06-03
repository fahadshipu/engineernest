import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, validateGoogleAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await validateGoogleAdminToken(token) : null;
  return NextResponse.json({ ok: true, isAdmin: session?.ok === true });
}
