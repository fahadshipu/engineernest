"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { createId, dataLayer } from "@/lib/data-layer";
import { UploadCategory, uploadAdminFile } from "@/lib/file-storage";
import { pick, t } from "@/lib/i18n";
import { sortWorkLogsByDate } from "@/lib/operations";
import { Project, WorkLog } from "@/lib/types";

const emptyWorkLog = (): WorkLog => ({
  id: "",
  date: "",
  projectId: "",
  summary: { en: "", bn: "" },
  progressNotes: { en: "", bn: "" },
  laborCount: 0,
  weather: { en: "", bn: "" },
  photos: [],
  remarks: { en: "", bn: "" },
});

export default function AdminWorkLogsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<WorkLog>("workLogs");
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<WorkLog>(emptyWorkLog());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedLogId, setSelectedLogId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void dataLayer.list<Project>("projects").then((projectItems) => {
      setProjects(projectItems);
      setForm((current) => ({ ...current, projectId: current.projectId || projectItems[0]?.id || "" }));
    });
  }, []);

  const filteredLogs = useMemo(() => {
    const base = selectedProjectId === "all" ? items : items.filter((item) => item.projectId === selectedProjectId);
    return sortWorkLogsByDate(base);
  }, [items, selectedProjectId]);

  const selectedLog = filteredLogs.find((item) => item.id === selectedLogId) ?? filteredLogs[0];

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const id = form.id || createId();

    try {
      const uploadedPhotos = await Promise.all(
        selectedFiles.map((file) => uploadAdminFile(file, "work-log-photo" as UploadCategory)),
      );

      const next: WorkLog = {
        ...form,
        id,
        photos: [
          ...form.photos,
          ...uploadedPhotos.map((photo) => ({
            url: photo.url,
            fileName: photo.fileName,
            mimeType: photo.mimeType,
            sizeBytes: photo.sizeBytes,
            storageProvider: photo.storageProvider,
          })),
        ],
      };

      await saveItem(next);
      setSelectedLogId(id);
      setSelectedFiles([]);
      setForm({
        ...emptyWorkLog(),
        projectId: projects[0]?.id || "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t(language, "workLogs")}</h1>
        <p className="text-sm text-slate-600">
          {t(language, "updateLog")} · {t(language, "progressNotes")} · {t(language, "photos")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select className="rounded-md border border-slate-300 px-3 py-2" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
            <option value="">{language === "bn" ? "প্রজেক্ট নির্বাচন করুন" : "Select project"}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {pick(language, project.name)}
              </option>
            ))}
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={0} placeholder="Labor count" value={form.laborCount} onChange={(e) => setForm({ ...form, laborCount: Number(e.target.value) })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Weather (EN)" value={form.weather.en} onChange={(e) => setForm({ ...form, weather: { ...form.weather, en: e.target.value } })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2 md:col-start-2" placeholder="আবহাওয়া (BN)" value={form.weather.bn} onChange={(e) => setForm({ ...form, weather: { ...form.weather, bn: e.target.value } })} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Work summary (EN)" value={form.summary.en} onChange={(e) => setForm({ ...form, summary: { ...form.summary, en: e.target.value } })} rows={3} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="কাজের সারাংশ (BN)" value={form.summary.bn} onChange={(e) => setForm({ ...form, summary: { ...form.summary, bn: e.target.value } })} rows={3} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Progress notes (EN)" value={form.progressNotes.en} onChange={(e) => setForm({ ...form, progressNotes: { ...form.progressNotes, en: e.target.value } })} rows={3} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="অগ্রগতির নোট (BN)" value={form.progressNotes.bn} onChange={(e) => setForm({ ...form, progressNotes: { ...form.progressNotes, bn: e.target.value } })} rows={3} required />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Remarks (EN)" value={form.remarks.en} onChange={(e) => setForm({ ...form, remarks: { ...form.remarks, en: e.target.value } })} rows={2} />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="মন্তব্য (BN)" value={form.remarks.bn} onChange={(e) => setForm({ ...form, remarks: { ...form.remarks, bn: e.target.value } })} rows={2} />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700">
            {t(language, "photos")}
            <input
              type="file"
              multiple
              accept="image/*"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
            />
          </label>

          {form.photos.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.photos.map((photo) => (
                <div key={photo.url} className="rounded-lg border border-slate-200 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.fileName} className="h-32 w-full rounded object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">{photo.fileName}</span>
                    <button
                      type="button"
                      className="rounded border border-red-300 px-2 py-0.5 text-red-600"
                      onClick={() => setForm((current) => ({ ...current, photos: current.photos.filter((entry) => entry.url !== photo.url) }))}
                    >
                      {t(language, "del")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400" type="submit" disabled={submitting}>
          {submitting ? (language === "bn" ? "সেভ হচ্ছে..." : "Saving...") : form.id ? t(language, "save") : t(language, "addNew")}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t(language, "latestUpdates")}</h2>
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="all">{language === "bn" ? "সব প্রজেক্ট" : "All projects"}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {pick(language, project.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const project = projects.find((entry) => entry.id === log.projectId);
              return (
                <article
                  key={log.id}
                  className={`rounded-lg border p-4 ${selectedLog?.id === log.id ? "border-blue-400 bg-blue-50/40" : "border-slate-200"}`}
                >
                  <button type="button" className="w-full text-left" onClick={() => setSelectedLogId(log.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{project ? pick(language, project.name) : t(language, "project")}</p>
                        <p className="text-xs text-slate-500">{log.date}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                        {log.laborCount} {t(language, "workerCount")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{pick(language, log.summary)}</p>
                  </button>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setForm(log)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
                    <button
                      onClick={async () => {
                        await deleteItem(log.id);
                        if (selectedLogId === log.id) {
                          setSelectedLogId("");
                        }
                      }}
                      className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600"
                    >
                      {t(language, "del")}
                    </button>
                  </div>
                </article>
              );
            })}
            {filteredLogs.length === 0 && <p className="text-sm text-slate-600">{t(language, "noData")}</p>}
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t(language, "updateLog")}</h2>
          {selectedLog ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-900">{selectedLog.date}</span>
                <span>{t(language, "weather")}: {pick(language, selectedLog.weather)}</span>
                <span>{selectedLog.laborCount} {t(language, "workerCount")}</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{t(language, "project")}</h3>
                <p className="text-sm text-slate-600">
                  {pick(language, projects.find((project) => project.id === selectedLog.projectId)?.name ?? { en: "Unknown project", bn: "অজানা প্রজেক্ট" })}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{language === "bn" ? "কাজের সারাংশ" : "Work summary"}</h3>
                <p className="text-sm text-slate-600">{pick(language, selectedLog.summary)}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{t(language, "progressNotes")}</h3>
                <p className="text-sm text-slate-600">{pick(language, selectedLog.progressNotes)}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{t(language, "remarks")}</h3>
                <p className="text-sm text-slate-600">{pick(language, selectedLog.remarks)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedLog.photos.map((photo) => (
                  <figure key={photo.url} className="overflow-hidden rounded-lg border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.fileName} className="h-40 w-full object-cover" />
                    <figcaption className="truncate p-3 text-xs text-slate-500">{photo.fileName}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">{t(language, "noData")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
