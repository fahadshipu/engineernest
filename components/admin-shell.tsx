"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dashboardRoles } from "@/lib/dashboard-roles";

const publicLinks = [
  { href: "/", key: "home" as const },
  { href: "/services", key: "services" as const },
  { href: "/portfolio", key: "portfolio" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/contact", key: "contact" as const },
];

const adminLinks = [
  { href: "/admin/dashboard", key: "dashboard" as const },
  { href: "/admin/projects", key: "projects" as const },
  { href: "/admin/work-logs", key: "workLogs" as const },
  { href: "/admin/inventory", key: "inventory" as const },
  { href: "/admin/boq", key: "boq" as const },
  { href: "/admin/reports", key: "reports" as const },
  { href: "/admin/documents", key: "documents" as const },
  { href: "/admin/site-compliance", key: "siteCompliance" as const },
  { href: "/admin/profile", key: "profile" as const },
  { href: "/admin/content", key: "content" as const },
  { href: "/admin/rates", key: "rates" as const },
  { href: "/admin/estimator", key: "estimator" as const },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const role = dashboardRoles.engineer;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold text-blue-900">{t(language, "engineerDashboard")}</h1>
          <p className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{pick(language, role.description)}</p>
          <nav className="mt-4 space-y-1">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm ${pathname === link.href ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {t(language, link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{t(language, "publicSite")}</p>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              {t(language, "home")}
            </Link>
            <nav className="mt-1 space-y-1">
              {publicLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-blue-900"
                >
                  {t(language, link.key)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <LanguageToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {t(language, "logout")}
            </button>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
};
