"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { Project } from "@/lib/types";

export default function PortfolioPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void dataLayer.list<Project>("projects").then(setProjects);
  }, []);

  return (
    <SiteShell>
      <h1 className="mb-6 text-3xl font-bold">{t(language, "portfolio")}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-40 rounded-lg bg-slate-200" />
            <h2 className="text-lg font-semibold">{pick(language, project.name)}</h2>
            <p className="text-sm text-slate-600">{pick(language, project.location)}</p>
            <p className="mt-2 text-sm font-medium text-blue-900">{pick(language, project.status)}</p>
            <p className="mt-2 text-sm text-slate-700">৳ {project.budget.toLocaleString()}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
