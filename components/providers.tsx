"use client";

import { LanguageProvider } from "@/components/language-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <LanguageProvider>{children}</LanguageProvider>;
};
