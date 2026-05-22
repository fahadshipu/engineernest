"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { ContentSection } from "@/lib/types";

const emptySection = (): ContentSection => ({
  id: "",
  headline: { en: "", bn: "" },
  body: { en: "", bn: "" },
  cta: { en: "", bn: "" },
});

export default function AdminContentPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<ContentSection>("contentSections");
  const [form, setForm] = useState<ContentSection>(emptySection());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptySection());
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "content")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Headline (EN)" value={form.headline.en} onChange={(e) => setForm({ ...form, headline: { ...form.headline, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="হেডলাইন (BN)" value={form.headline.bn} onChange={(e) => setForm({ ...form, headline: { ...form.headline, bn: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Body (EN)" value={form.body.en} onChange={(e) => setForm({ ...form, body: { ...form.body, en: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="বডি (BN)" value={form.body.bn} onChange={(e) => setForm({ ...form, body: { ...form.body, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="CTA (EN)" value={form.cta.en} onChange={(e) => setForm({ ...form, cta: { ...form.cta, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="CTA (BN)" value={form.cta.bn} onChange={(e) => setForm({ ...form, cta: { ...form.cta, bn: e.target.value } })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{form.id ? t(language, "save") : t(language, "addNew")}</button>
      </form>
      <div className="space-y-3">
        {items.map((section) => (
          <article key={section.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{pick(language, section.headline)}</p>
            <p className="text-sm text-slate-600">{pick(language, section.body)}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(section)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(section.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
