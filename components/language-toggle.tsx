"use client";

import { useLanguage } from "@/components/language-provider";
import { labels } from "@/lib/i18n";

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      {labels[language].language}
    </button>
  );
};
