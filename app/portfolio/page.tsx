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
      <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-950 to-blue-800 p-6 text-white">
        <h1 className="text-3xl font-bold">{t(language, "portfolio")}</h1>
        <p className="mt-2 text-sm text-blue-100">
          {language === "bn"
            ? "সম্পন্ন এবং চলমান প্রকল্পগুলোর অগ্রগতি, বাজেট এবং অবস্থান এক নজরে দেখুন।"
            : "Explore completed and active projects with progress, budget, and location snapshots."}
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-40 rounded-xl bg-gradient-to-br from-blue-100 via-cyan-100 to-slate-200" />
            <h2 className="text-lg font-semibold">{pick(language, project.name)}</h2>
            <p className="text-sm text-slate-600">{pick(language, project.location)}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-950 to-cyan-500" style={{ width: `${project.progressPercent}%` }} />
            </div>
            <p className="mt-2 text-sm font-medium text-blue-900">{pick(language, project.status)}</p>
            <p className="text-xs text-slate-500">{project.progressPercent}% progress</p>
            <p className="mt-2 text-sm text-slate-700">৳ {project.budget.toLocaleString()}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
