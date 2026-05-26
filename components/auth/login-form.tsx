"use client";

import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

export const LoginForm = () => {
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const envReady = Boolean(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const startGoogleLogin = () => {
    if (!envReady || !supabaseUrl) {
      setError(language === "bn" ? "সুপাবেস কনফিগারেশন অসম্পূর্ণ" : "Supabase environment is not configured");
      return;
    }

    setLoading(true);
    // Redirect to the dedicated /auth/callback route so token exchange
    // happens outside the /admin/* middleware boundary, and a hard
    // window.location.replace in the callback guarantees the fresh
    // httpOnly cookie is included in the first /admin/dashboard request.
    const redirectTo = `${window.location.origin}/auth/callback`;
    const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    authUrl.searchParams.set("provider", "google");
    authUrl.searchParams.set("redirect_to", redirectTo);
    authUrl.searchParams.set("response_type", "token");
    window.location.href = authUrl.toString();
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
          onClick={startGoogleLogin}
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
