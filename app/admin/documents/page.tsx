"use client";

import { FormEvent, useMemo, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { DocumentItem } from "@/lib/types";
import { UploadCategory, uploadAdminFile } from "@/lib/file-storage";

const categories: Array<{ key: UploadCategory; label: { en: string; bn: string } }> = [
  { key: "project-image", label: { en: "Project image", bn: "প্রজেক্ট ইমেজ" } },
  { key: "drawing", label: { en: "Drawing", bn: "ড্রইং" } },
  { key: "invoice", label: { en: "Invoice", bn: "ইনভয়েস" } },
  { key: "estimate-pdf", label: { en: "Estimate PDF", bn: "এস্টিমেট পিডিএফ" } },
  { key: "company-document", label: { en: "Company document", bn: "কোম্পানি ডকুমেন্ট" } },
  { key: "pad-template-a", label: { en: "Pad template A", bn: "প্যাড টেমপ্লেট A" } },
  { key: "pad-template-b", label: { en: "Pad template B", bn: "প্যাড টেমপ্লেট B" } },
];

const emptyDocument = (): DocumentItem => ({
  id: "",
  title: { en: "", bn: "" },
  type: "",
  category: "company-document",
  url: "",
});

export default function AdminDocumentsPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<DocumentItem>("documents");
  const [form, setForm] = useState<DocumentItem>(emptyDocument());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const left = a.createdAt ? Date.parse(a.createdAt) : 0;
        const right = b.createdAt ? Date.parse(b.createdAt) : 0;
        return right - left;
      }),
    [items],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      let next: DocumentItem = {
        ...form,
        id: form.id || createId(),
        createdAt: form.createdAt ?? now,
      };

      if (selectedFile) {
        const uploaded = await uploadAdminFile(selectedFile, (form.category as UploadCategory) || "company-document");
        next = {
          ...next,
          url: uploaded.url,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
          storageProvider: uploaded.storageProvider,
        };
      } else if (!form.url.trim()) {
        setError(language === "bn" ? "ফাইল আপলোড করুন অথবা URL দিন" : "Upload a file or provide a URL");
        return;
      }

      await saveItem(next);
      setForm(emptyDocument());
      setSelectedFile(null);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : language === "bn" ? "ফাইল আপলোড ব্যর্থ হয়েছে" : "File upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "documents")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Title (EN)" value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="শিরোনাম (BN)" value={form.title.bn} onChange={(e) => setForm({ ...form, title: { ...form.title, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "টাইপ (যেমন Drawing)" : "Type (e.g. Drawing)"} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.category ?? "company-document"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((category) => (
            <option key={category.key} value={category.key}>
              {pick(language, category.label)}
            </option>
          ))}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" placeholder={language === "bn" ? "রিমোট URL (ঐচ্ছিক)" : "Remote URL (optional)"} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          {language === "bn" ? "ফাইল আপলোড (ঐচ্ছিক, URL না দিলে বাধ্যতামূলক)" : "Upload file (optional, required if URL is empty)"}
          <input
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
        </label>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400" type="submit" disabled={submitting}>
          {submitting ? (language === "bn" ? "সেভ হচ্ছে..." : "Saving...") : form.id ? t(language, "save") : t(language, "addNew")}
        </button>
      </form>
      <div className="space-y-3">
        {sortedItems.map((document) => (
          <article key={document.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{pick(language, document.title)}</p>
            <p className="text-sm text-slate-600">
              {document.type}
              {document.category ? ` • ${document.category}` : ""}
            </p>
            {document.url.startsWith("data:image") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={document.url} alt={pick(language, document.title)} className="mt-2 max-h-40 rounded border border-slate-200 object-contain" />
            )}
            <a href={document.url} target="_blank" rel="noreferrer" className="text-sm text-blue-900 underline">
              {document.url}
            </a>
            {document.fileName && (
              <p className="mt-1 text-xs text-slate-500">
                {document.fileName} {document.sizeBytes ? `(${Math.round(document.sizeBytes / 1024)} KB)` : ""}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setForm(document); setSelectedFile(null); }} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(document.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
