"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Locale } from "@/lib/types";

type LanguageContextValue = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const saved = window.localStorage.getItem("engineernest:lang");
    return saved === "en" || saved === "bn" ? saved : "en";
  });

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    window.localStorage.setItem("engineernest:lang", lang);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "bn" : "en"),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
};
