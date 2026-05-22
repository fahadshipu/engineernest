"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { DocumentItem } from "@/lib/types";

const emptyDocument = (): DocumentItem => ({
  id: "",
  title: { en: "", bn: "" },
  type: "",
  url: "",
});

export default function AdminDocumentsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<DocumentItem>("documents");
  const [form, setForm] = useState<DocumentItem>(emptyDocument());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptyDocument());
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "documents")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Title (EN)" value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="শিরোনাম (BN)" value={form.title.bn} onChange={(e) => setForm({ ...form, title: { ...form.title, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{form.id ? t(language, "save") : t(language, "addNew")}</button>
      </form>
      <div className="space-y-3">
        {items.map((document) => (
          <article key={document.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{pick(language, document.title)}</p>
            <p className="text-sm text-slate-600">{document.type}</p>
            <a href={document.url} target="_blank" rel="noreferrer" className="text-sm text-blue-900 underline">
              {document.url}
            </a>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(document)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(document.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
