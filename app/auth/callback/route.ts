import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, PKCE_VERIFIER_COOKIE, exchangePkceCode } from "@/lib/auth";

/**
 * Server-side OAuth callback handler for Supabase Google sign-in (PKCE flow).
 *
 * Supabase redirects here with ?code=AUTHORIZATION_CODE after the user
 * consents on the Google OAuth screen.  This handler:
 *   1. Reads the authorization code from the query string.
 *   2. Reads the PKCE code verifier stored in a short-lived cookie by the
 *      login form before the OAuth redirect started.
 *   3. Exchanges code + verifier with Supabase's token endpoint.
 *   4. Validates that the returned user email is on the admin allowlist.
 *   5. Sets a secure httpOnly session cookie and redirects to /.
 *
 * Required Supabase configuration:
 *   Add <origin>/auth/callback to Authentication → URL Configuration →
 *   Redirect URLs in your Supabase project dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Propagate OAuth errors (e.g. user denied consent) back to the login page.
  const oauthError = searchParams.get("error");
  if (oauthError) {
    const desc = searchParams.get("error_description") ?? oauthError;
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", desc);
    return NextResponse.redirect(loginUrl);
  }

  const code = searchParams.get("code");
  if (!code) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "No authorization code received — please try again.");
    return NextResponse.redirect(loginUrl);
  }

  const codeVerifier = request.cookies.get(PKCE_VERIFIER_COOKIE)?.value;
  if (!codeVerifier) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set(
      "error",
      "Login session expired — please click Continue with Google again."
    );
    return NextResponse.redirect(loginUrl);
  }

  const result = await exchangePkceCode(code, codeVerifier);

  // Always clear the short-lived PKCE verifier cookie regardless of outcome.
  const clearVerifier = (res: NextResponse) => {
    res.cookies.set(PKCE_VERIFIER_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  if (!result.ok) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", result.message);
    return clearVerifier(NextResponse.redirect(loginUrl));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  clearVerifier(response);

  response.cookies.set(AUTH_COOKIE, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour — matches Supabase access token lifetime
  });

  return response;
}
