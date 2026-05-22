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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-xl font-bold text-blue-900">
            {t(language, "brand")}
          </Link>
          <nav className="hidden gap-4 md:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${pathname === link.href ? "text-blue-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t(language, link.key)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/admin/login" className="rounded-md bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white">
              {t(language, "admin")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-slate-600 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} EngineerNest</p>
          <p>Engineering & Construction Management Platform</p>
        </div>
      </footer>
    </div>
  );
};
