"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

export const LoginForm = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [envReady, setEnvReady] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const ready = Boolean(url && anonKey);
    setSupabaseUrl(url);
    setEnvReady(ready);

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const authError = params.get("error_description") ?? params.get("error");
    if (authError) {
      setError(decodeURIComponent(authError));
      return;
    }
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError("");
    void fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || "Unable to sign in");
        }
        window.history.replaceState({}, document.title, "/admin/login");
        router.push("/admin/dashboard");
        router.refresh();
      })
      .catch((issue: unknown) => {
        setError(issue instanceof Error ? issue.message : language === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login failed");
      })
      .finally(() => setLoading(false));
  }, [language, router]);

  const startGoogleLogin = () => {
    if (!envReady || !supabaseUrl) {
      setError(language === "bn" ? "সুপাবেস কনফিগারেশন অসম্পূর্ণ" : "Supabase environment is not configured");
      return;
    }

    const redirectTo = `${window.location.origin}/admin/login`;
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
