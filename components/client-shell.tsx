"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dashboardRoles } from "@/lib/dashboard-roles";

const clientLinks = [{ href: "/client/dashboard", key: "clientDashboard" as const }];

export const ClientShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const role = dashboardRoles.client;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold text-blue-900">{t(language, "clientDashboard")}</h1>
          <p className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{pick(language, role.description)}</p>
          <nav className="mt-4 space-y-1">
            {clientLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm ${pathname === link.href ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {t(language, link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <LanguageToggle />
            <Link href="/" className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
              {t(language, "home")}
            </Link>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
};
