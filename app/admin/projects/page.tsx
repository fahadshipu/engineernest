"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { Project, ProjectStage } from "@/lib/types";

const emptyStage = (): ProjectStage => ({
  id: createId(),
  name: { en: "", bn: "" },
  startDate: "",
  endDate: "",
  status: { en: "", bn: "" },
  progressPercent: 0,
});

const emptyProject = (): Project => ({
  id: "",
  name: { en: "", bn: "" },
  location: { en: "", bn: "" },
  status: { en: "", bn: "" },
  budget: 0,
  spentCost: 0,
  startDate: "",
  endDate: "",
  progressPercent: 0,
  clientSummary: { en: "", bn: "" },
  stages: [emptyStage()],
});

export default function AdminProjectsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<Project>("projects");
  const [form, setForm] = useState<Project>(emptyProject());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const filteredStages = form.stages.filter(
      (stage) => stage.name.en.trim() || stage.name.bn.trim() || stage.startDate || stage.endDate,
    );

    await saveItem({
      ...form,
      id: form.id || createId(),
      stages: filteredStages,
    });
    setForm(emptyProject());
  };

  const updateStage = (stageId: string, updater: (stage: ProjectStage) => ProjectStage) => {
    setForm((current) => ({
      ...current,
      stages: current.stages.map((stage) => (stage.id === stageId ? updater(stage) : stage)),
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t(language, "projects")}</h1>
        <p className="text-sm text-slate-600">{t(language, "timeline")} + {t(language, "costVisibility")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name (EN)" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="নাম (BN)" value={form.name.bn} onChange={(e) => setForm({ ...form, name: { ...form.name, bn: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Location (EN)" value={form.location.en} onChange={(e) => setForm({ ...form, location: { ...form.location, en: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="লোকেশন (BN)" value={form.location.bn} onChange={(e) => setForm({ ...form, location: { ...form.location, bn: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Status (EN)" value={form.status.en} onChange={(e) => setForm({ ...form, status: { ...form.status, en: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="স্ট্যাটাস (BN)" value={form.status.bn} onChange={(e) => setForm({ ...form, status: { ...form.status, bn: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Spent cost" value={form.spentCost} onChange={(e) => setForm({ ...form, spentCost: Number(e.target.value) })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" type="number" min={0} max={100} placeholder="Progress %" value={form.progressPercent} onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Client summary (EN)" value={form.clientSummary.en} onChange={(e) => setForm({ ...form, clientSummary: { ...form.clientSummary, en: e.target.value } })} rows={3} />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="ক্লায়েন্ট সারাংশ (BN)" value={form.clientSummary.bn} onChange={(e) => setForm({ ...form, clientSummary: { ...form.clientSummary, bn: e.target.value } })} rows={3} />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">{t(language, "timeline")}</h2>
              <p className="text-sm text-slate-600">{t(language, "progressPercent")} per stage</p>
            </div>
            <button type="button" className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setForm((current) => ({ ...current, stages: [...current.stages, emptyStage()] }))}>
              {t(language, "addNew")}
            </button>
          </div>

          {form.stages.map((stage) => (
            <div key={stage.id} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Stage name (EN)" value={stage.name.en} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, name: { ...current.name, en: e.target.value } }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="স্টেজ নাম (BN)" value={stage.name.bn} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, name: { ...current.name, bn: e.target.value } }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={stage.startDate} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, startDate: e.target.value }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={stage.endDate} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, endDate: e.target.value }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Stage status (EN)" value={stage.status.en} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, status: { ...current.status, en: e.target.value } }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="স্টেজ স্ট্যাটাস (BN)" value={stage.status.bn} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, status: { ...current.status, bn: e.target.value } }))} />
              <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={0} max={100} placeholder="Progress %" value={stage.progressPercent} onChange={(e) => updateStage(stage.id, (current) => ({ ...current, progressPercent: Number(e.target.value) }))} />
              <button
                type="button"
                className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    stages: current.stages.length === 1 ? [emptyStage()] : current.stages.filter((entry) => entry.id !== stage.id),
                  }))
                }
              >
                {t(language, "del")}
              </button>
            </div>
          ))}
        </div>

        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">
          {form.id ? t(language, "save") : t(language, "addNew")}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((project) => (
          <article key={project.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold">{pick(language, project.name)}</p>
                <p className="text-sm text-slate-600">
                  {pick(language, project.location)} · {pick(language, project.status)}
                </p>
              </div>
              <div className="text-sm text-slate-600">
                <p>{project.startDate} → {project.endDate}</p>
                <p>{project.progressPercent}% • ৳ {project.spentCost.toLocaleString()} / ৳ {project.budget.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3 h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-blue-900" style={{ width: `${Math.min(project.progressPercent, 100)}%` }} />
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {project.stages.map((stage) => (
                <div key={stage.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{pick(language, stage.name)}</p>
                  <p className="text-xs text-slate-500">{stage.startDate} → {stage.endDate}</p>
                  <p className="mt-1 text-sm text-slate-600">{pick(language, stage.status)} • {stage.progressPercent}%</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm({ ...project, stages: project.stages.length > 0 ? project.stages : [emptyStage()] })} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(project.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
