"use client";

import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";
import { PKCE_VERIFIER_COOKIE } from "@/lib/auth";

/** Generate a cryptographically random PKCE code verifier (base64url, 43-128 chars). */
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/** Derive the PKCE code challenge: BASE64URL(SHA-256(verifier)). */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const LoginForm = ({ initialError = "" }: { initialError?: string }) => {
  const { language } = useLanguage();
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const envReady = Boolean(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const startGoogleLogin = async () => {
    if (!envReady || !supabaseUrl) {
      setError(language === "bn" ? "সুপাবেস কনফিগারেশন অসম্পূর্ণ" : "Supabase environment is not configured");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate PKCE values for the authorization code flow.
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Persist the verifier in a short-lived cookie so the server-side
      // callback route handler can exchange the code without client JS.
      document.cookie = `${PKCE_VERIFIER_COOKIE}=${codeVerifier}; path=/; samesite=lax; max-age=300`;

      const redirectTo = `${window.location.origin}/auth/callback`;
      const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
      authUrl.searchParams.set("provider", "google");
      authUrl.searchParams.set("redirect_to", redirectTo);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "s256");
      window.location.href = authUrl.toString();
    } catch {
      setLoading(false);
      setError(language === "bn" ? "লগইন শুরু করতে ব্যর্থ হয়েছে" : "Failed to start login");
    }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t(language, "loginTitle")}</h1>
        <LanguageToggle />
      </div>
      <p className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">{t(language, "adminHint")}</p>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => void startGoogleLogin()}
          disabled={loading || !envReady}
          className="w-full rounded-md bg-blue-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? (language === "bn" ? "লগইন হচ্ছে..." : "Signing in...") : language === "bn" ? "Google দিয়ে লগইন করুন" : "Continue with Google"}
        </button>
        {!envReady && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {language === "bn"
              ? "NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY সেট করুন।"
              : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Google login."}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
