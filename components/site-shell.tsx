"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

const publicLinks = [
  { href: "/", key: "home" as const },
  { href: "/services", key: "services" as const },
  { href: "/portfolio", key: "portfolio" as const },
  { href: "/estimator", key: "estimator" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/contact", key: "contact" as const },
];

export const SiteShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-blue-950/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-950 to-blue-700 text-xs font-bold text-white shadow-md">
                SKBA
              </span>
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold tracking-wide text-blue-950">S.K.B.A Enterprise</span>
                <span className="block text-xs text-slate-500">{t(language, "brand")}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Link
                href="/admin/login"
                className="rounded-full bg-blue-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-900"
              >
                {t(language, "admin")}
              </Link>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:mt-4 md:justify-center">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-900"
                }`}
              >
                {t(language, link.key)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">{children}</main>
      <footer className="border-t border-slate-200 bg-blue-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm md:grid-cols-3">
          <div>
            <p className="text-base font-semibold">S.K.B.A Enterprise</p>
            <p className="mt-1 text-blue-100">EngineerNest Digital Operations</p>
          </div>
          <div className="text-blue-100">
            <p>Md Fahad Bin Anwar Shipu</p>
            <p>Managing Director</p>
          </div>
          <div className="text-blue-100 md:text-right">
            <p>01739-894079 · 01401-788009</p>
            <p>admin@skbaenterprise.me</p>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-blue-100 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} S.K.B.A Enterprise</p>
            <p>West Chattar, College Gate, BOF-1703, Gazipur City</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
