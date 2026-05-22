"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";

export default function AdminDashboardPage() {
  const { language } = useLanguage();
  const [counts, setCounts] = useState({ projects: 0, boqItems: 0, reports: 0, documents: 0, contentSections: 0 });

  useEffect(() => {
    const load = async () => {
      const [projects, boqItems, reports, documents, contentSections] = await Promise.all([
        dataLayer.list("projects"),
        dataLayer.list("boqItems"),
        dataLayer.list("reports"),
        dataLayer.list("documents"),
        dataLayer.list("contentSections"),
      ]);
      setCounts({
        projects: projects.length,
        boqItems: boqItems.length,
        reports: reports.length,
        documents: documents.length,
        contentSections: contentSections.length,
      });
    };
    void load();
  }, []);

  const cards = [
    { label: t(language, "projects"), value: counts.projects },
    { label: t(language, "boq"), value: counts.boqItems },
    { label: t(language, "reports"), value: counts.reports },
    { label: t(language, "documents"), value: counts.documents },
    { label: t(language, "content"), value: counts.contentSections },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{t(language, "dashboard")}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
