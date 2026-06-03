"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

const publicLinks = [
  { href: "/", key: "home" as const },
  { href: "/services", key: "services" as const },
  { href: "/portfolio", key: "portfolio" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/contact", key: "contact" as const },
];

export const SiteShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await response.json()) as { isAdmin?: boolean };
        if (mounted) {
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
        }
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const navLinks = useMemo(
    () => (isAdmin ? [...publicLinks, { href: "/estimator", key: "estimator" as const }] : publicLinks),
    [isAdmin]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top contact bar */}
      <div className="hidden border-b border-blue-950/10 bg-blue-950 text-xs text-blue-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-6 px-4 py-2">
          <a href="tel:+8801739894079" className="flex items-center gap-1.5 transition hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            +880 1739-894079
          </a>
          <a href="tel:+8801410788009" className="flex items-center gap-1.5 transition hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            +880 1410-788009
          </a>
          <a href="mailto:admin@skbaenterprise.me" className="flex items-center gap-1.5 transition hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            admin@skbaenterprise.me
          </a>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-20 border-b border-blue-950/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-950 to-blue-700 text-xs font-extrabold tracking-wider text-white shadow">
                SKBA
              </span>
              <span className="space-y-0.5">
                <span className="block text-sm font-bold tracking-wide text-blue-950">S.K.B.A Enterprise</span>
                <span className="block text-xs font-medium text-slate-500">{t(language, "brand")}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Link
                href="/admin/login"
                className="rounded-full bg-blue-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
              >
                {t(language, "admin")}
              </Link>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:mt-3 md:justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-900"
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
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-800 text-xs font-extrabold tracking-wider text-white">
                SKBA
              </span>
              <span className="font-bold tracking-wide">S.K.B.A Enterprise</span>
            </div>
            <p className="text-blue-200">EngineerNest Digital Operations</p>
            <p className="mt-1 text-blue-300 text-xs">West Chattar, College Gate, BOF-1703, Gazipur City</p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-white">Md Fahad Bin Anwar Shipu</p>
            <p className="text-blue-200 text-xs uppercase tracking-wide">Managing Director</p>
          </div>
          <div className="space-y-2 md:text-right">
            <a href="tel:+8801739894079" className="flex items-center gap-2 text-blue-200 transition hover:text-white md:justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              +880 1739-894079
            </a>
            <a href="tel:+8801410788009" className="flex items-center gap-2 text-blue-200 transition hover:text-white md:justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              +880 1410-788009
            </a>
            <a href="mailto:admin@skbaenterprise.me" className="flex items-center gap-2 text-blue-200 transition hover:text-white md:justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              admin@skbaenterprise.me
            </a>
            <a href="mailto:fahad.shipu@gmail.com" className="flex items-center gap-2 text-blue-200 transition hover:text-white md:justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              fahad.shipu@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-blue-300 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} S.K.B.A Enterprise. All rights reserved.</p>
            <p>West Chattar, College Gate, BOF-1703, Gazipur City</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
