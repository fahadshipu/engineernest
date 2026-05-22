"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

const adminLinks = [
  { href: "/admin/dashboard", key: "dashboard" as const },
  { href: "/admin/projects", key: "projects" as const },
  { href: "/admin/boq", key: "boq" as const },
  { href: "/admin/reports", key: "reports" as const },
  { href: "/admin/documents", key: "documents" as const },
  { href: "/admin/profile", key: "profile" as const },
  { href: "/admin/content", key: "content" as const },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg bg-white p-4 shadow-sm">
          <h1 className="mb-4 text-lg font-bold text-blue-900">{t(language, "admin")}</h1>
          <nav className="space-y-1">
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
