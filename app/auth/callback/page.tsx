"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

/**
 * OAuth callback page for Supabase Google sign-in.
 *
 * Supabase redirects here after a successful Google OAuth flow
 * (implicit token flow, `response_type=token`).  The access token
 * arrives in the URL hash fragment so it is never visible to the server.
 *
 * This page:
 *  1. Reads the access_token (or error) from the hash.
 *  2. Sends the token to /api/admin/login which validates it against
 *     Supabase and sets a secure, httpOnly session cookie.
 *  3. Hard-navigates to /admin/dashboard via window.location.replace so
 *     that the browser issues a fresh HTTP request that includes the
 *     newly-set cookie — the middleware can then verify the session
 *     without a race condition.
 *
 * Required Supabase configuration:
 *   Add <origin>/auth/callback to Authentication → URL Configuration →
 *   Redirect URLs in your Supabase project dashboard.
 */
export default function AuthCallbackPage() {
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const errorDesc = params.get("error_description") ?? params.get("error");
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc));
        return;
      }

      const accessToken = params.get("access_token");
      if (!accessToken) {
        setError(language === "bn" ? "অ্যাক্সেস টোকেন পাওয়া যায়নি" : "No access token received from Google.");
        return;
      }

      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message ?? (language === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login failed"));
        }

        // Hard-redirect so the browser sends a fresh request with the
        // newly set httpOnly cookie, giving middleware a clean slate.
        window.location.replace("/admin/dashboard");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : language === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login failed");
      }
    })();
  }, [language]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
          <h1 className="mb-3 text-xl font-semibold text-slate-900">
            {language === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login Failed"}
          </h1>
          <p className="mb-5 text-sm text-red-600">{error}</p>
          <a
            href="/admin/login"
            className="inline-block rounded-md bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            {language === "bn" ? "আবার চেষ্টা করুন" : "Try Again"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <p className="text-slate-600">{language === "bn" ? "লগইন হচ্ছে..." : "Signing in…"}</p>
    </div>
  );
}
