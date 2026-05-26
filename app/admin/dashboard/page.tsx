"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectProgressBoard } from "@/components/project-progress-board";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { averageProjectProgress, calculateRemainingStock, sortWorkLogsByDate } from "@/lib/operations";
import { InventoryItem, Project, WorkLog } from "@/lib/types";

export default function AdminDashboardPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [documentsCount, setDocumentsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [projectItems, workLogItems, inventoryEntries, documents] = await Promise.all([
        dataLayer.list<Project>("projects"),
        dataLayer.list<WorkLog>("workLogs"),
        dataLayer.list<InventoryItem>("inventoryItems"),
        dataLayer.list("documents"),
      ]);
      setProjects(projectItems);
      setWorkLogs(workLogItems);
      setInventoryItems(inventoryEntries);
      setDocumentsCount(documents.length);
    };
    void load();
  }, []);

  const recentWorkLogs = useMemo(() => sortWorkLogsByDate(workLogs).slice(0, 3), [workLogs]);
  const averageProgress = averageProjectProgress(projects);
  const totalRemainingStock = inventoryItems.reduce((sum, item) => sum + calculateRemainingStock(item), 0);

  const cards = [
    { label: t(language, "projects"), value: projects.length },
    { label: t(language, "workLogs"), value: workLogs.length },
    { label: t(language, "inventory"), value: inventoryItems.length },
    { label: t(language, "progressPercent"), value: `${averageProgress}%` },
    { label: t(language, "documents"), value: documentsCount },
    { label: t(language, "remainingStock"), value: totalRemainingStock.toLocaleString() },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-gradient-to-r from-blue-950 to-blue-800 p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-wide text-blue-200">{t(language, "engineerView")}</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{t(language, "engineerDashboard")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-100">
          {t(language, "operationalNote")} — {t(language, "workLogs")}, {t(language, "inventory")}, {t(language, "timeline")}.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "timeline")}</h2>
          <p className="text-sm text-slate-600">{t(language, "progressPercent")} + {t(language, "costVisibility")}</p>
        </div>
        <ProjectProgressBoard projects={projects} language={language} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "latestUpdates")}</h2>
          <div className="mt-4 space-y-4">
            {recentWorkLogs.map((log) => {
              const project = projects.find((entry) => entry.id === log.projectId);
              return (
                <article key={log.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{project ? pick(language, project.name) : t(language, "project")}</p>
                      <p className="text-xs text-slate-500">{log.date}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-900">
                      {log.laborCount} {t(language, "workerCount")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{pick(language, log.summary)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t(language, "weather")}: {pick(language, log.weather)}
                  </p>
                </article>
              );
            })}
            {recentWorkLogs.length === 0 && <p className="text-sm text-slate-600">{t(language, "noData")}</p>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t(language, "inventory")}</h2>
          <div className="mt-4 space-y-3">
            {inventoryItems.map((item) => {
              const remaining = calculateRemainingStock(item);
              return (
                <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{pick(language, item.name)}</p>
                      <p className="text-xs text-slate-500">
                        {t(language, "supplier")}: {item.supplier ? pick(language, item.supplier) : "—"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${remaining < 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {remaining} {item.unit}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <p>{t(language, "stockReceived")}: {item.quantityReceived}</p>
                    <p>{t(language, "stockConsumed")}: {item.quantityConsumed}</p>
                    <p>{t(language, "rate")}: {item.rate ? `৳ ${item.rate}` : "—"}</p>
                  </div>
                </article>
              );
            })}
            {inventoryItems.length === 0 && <p className="text-sm text-slate-600">{t(language, "noData")}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
