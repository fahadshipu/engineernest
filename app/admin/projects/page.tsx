"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { Project } from "@/lib/types";

const emptyProject = (): Project => ({
  id: "",
  name: { en: "", bn: "" },
  location: { en: "", bn: "" },
  status: { en: "", bn: "" },
  budget: 0,
});

export default function AdminProjectsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<Project>("projects");
  const [form, setForm] = useState<Project>(emptyProject());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptyProject());
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "projects")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name (EN)" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="নাম (BN)" value={form.name.bn} onChange={(e) => setForm({ ...form, name: { ...form.name, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Location (EN)" value={form.location.en} onChange={(e) => setForm({ ...form, location: { ...form.location, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="লোকেশন (BN)" value={form.location.bn} onChange={(e) => setForm({ ...form, location: { ...form.location, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Status (EN)" value={form.status.en} onChange={(e) => setForm({ ...form, status: { ...form.status, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="স্ট্যাটাস (BN)" value={form.status.bn} onChange={(e) => setForm({ ...form, status: { ...form.status, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{form.id ? t(language, "save") : t(language, "addNew")}</button>
      </form>
      <div className="space-y-3">
        {items.map((project) => (
          <article key={project.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{pick(language, project.name)}</p>
            <p className="text-sm text-slate-600">{pick(language, project.location)} · ৳ {project.budget.toLocaleString()}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(project)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(project.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
