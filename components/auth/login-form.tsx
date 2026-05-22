"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

export const LoginForm = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError(language === "bn" ? "লগইন তথ্য সঠিক নয়" : "Invalid login credentials");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t(language, "loginTitle")}</h1>
        <LanguageToggle />
      </div>
      <p className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">{t(language, "adminHint")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-700">{t(language, "username")}</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">{t(language, "password")}</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-md bg-blue-900 px-4 py-2 font-semibold text-white">
          {t(language, "signIn")}
        </button>
      </form>
    </div>
  );
};
