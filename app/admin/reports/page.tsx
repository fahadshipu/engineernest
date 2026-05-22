"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { DailyReport } from "@/lib/types";

const emptyReport = (): DailyReport => ({
  id: "",
  date: "",
  summary: { en: "", bn: "" },
  laborCount: 0,
});

export default function AdminReportsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<DailyReport>("reports");
  const [form, setForm] = useState<DailyReport>(emptyReport());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptyReport());
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "reports")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Labor count" value={form.laborCount} onChange={(e) => setForm({ ...form, laborCount: Number(e.target.value) })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Summary (EN)" value={form.summary.en} onChange={(e) => setForm({ ...form, summary: { ...form.summary, en: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="সারাংশ (BN)" value={form.summary.bn} onChange={(e) => setForm({ ...form, summary: { ...form.summary, bn: e.target.value } })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{form.id ? t(language, "save") : t(language, "addNew")}</button>
      </form>
      <div className="space-y-3">
        {items.map((report) => (
          <article key={report.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{report.date}</p>
            <p className="text-sm text-slate-600">{pick(language, report.summary)}</p>
            <p className="text-sm text-slate-600">Labor: {report.laborCount}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(report)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(report.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
