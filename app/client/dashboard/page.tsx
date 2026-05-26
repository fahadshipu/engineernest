"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectProgressBoard } from "@/components/project-progress-board";
import { useLanguage } from "@/components/language-provider";
import { dataLayer } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { averageProjectProgress, sortWorkLogsByDate } from "@/lib/operations";
import { Project, WorkLog } from "@/lib/types";

export default function ClientDashboardPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  useEffect(() => {
    const load = async () => {
      const [projectItems, workLogItems] = await Promise.all([
        dataLayer.list<Project>("projects"),
        dataLayer.list<WorkLog>("workLogs"),
      ]);
      setProjects(projectItems);
      setWorkLogs(workLogItems);
    };

    void load();
  }, []);

  const sortedLogs = useMemo(() => sortWorkLogsByDate(workLogs), [workLogs]);
  const photoCount = useMemo(
    () => sortedLogs.reduce((sum, log) => sum + log.photos.length, 0),
    [sortedLogs],
  );
  const latestLog = sortedLogs[0];

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-wide text-blue-200">{t(language, "clientView")}</p>
        <h1 className="mt-2 text-2xl font-bold">{t(language, "clientDashboard")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-100">
          {t(language, "viewOnly")} — {t(language, "operationalNote")}.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t(language, "projects"), value: projects.length },
          { label: t(language, "progressPercent"), value: `${averageProjectProgress(projects)}%` },
          { label: t(language, "projectPhotos"), value: photoCount },
          { label: t(language, "latestUpdates"), value: latestLog?.date ?? "—" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "timeline")}</h2>
          <p className="text-sm text-slate-600">{t(language, "costVisibility")} + {t(language, "progressNotes")}</p>
        </div>
        <ProjectProgressBoard projects={projects} language={language} showClientSummary />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "projectPhotos")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {sortedLogs.flatMap((log) =>
              log.photos.map((photo, index) => (
                <figure key={`${log.id}-${index}`} className="overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={pick(language, log.summary)} className="h-44 w-full object-cover" />
                  <figcaption className="space-y-1 p-3 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">{pick(language, log.summary)}</p>
                    <p>{log.date}</p>
                  </figcaption>
                </figure>
              )),
            )}
            {sortedLogs.length === 0 && <p className="text-sm text-slate-600">{t(language, "noData")}</p>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "latestUpdates")}</h2>
          <div className="mt-4 space-y-4">
            {sortedLogs.map((log) => {
              const project = projects.find((entry) => entry.id === log.projectId);
              return (
                <article key={log.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{project ? pick(language, project.name) : t(language, "project")}</p>
                      <p className="text-xs text-slate-500">{log.date}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {log.laborCount} {t(language, "workerCount")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{pick(language, log.progressNotes)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t(language, "weather")}: {pick(language, log.weather)}
                  </p>
                </article>
              );
            })}
            {sortedLogs.length === 0 && <p className="text-sm text-slate-600">{t(language, "noData")}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
