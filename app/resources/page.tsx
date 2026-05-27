"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { DocumentItem } from "@/lib/types";

export default function ResourcesPage() {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    void dataLayer.list<DocumentItem>("documents").then(setDocuments);
  }, []);

  return (
    <SiteShell>
      <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-950 to-blue-800 p-6 text-white">
        <h1 className="text-3xl font-bold">{t(language, "resources")}</h1>
        <p className="mt-2 text-sm text-blue-100">
          {language === "bn"
            ? "ড্রইং, ইনভয়েস এবং প্রজেক্ট ডকুমেন্ট একত্রে সংগঠিত করুন।"
            : "Keep drawings, invoices, and project documents organized in one place."}
        </p>
      </section>
      <div className="space-y-3">
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="font-semibold text-blue-950">{pick(language, document.title)}</p>
            <p className="text-sm text-slate-600">{document.type}</p>
          </a>
        ))}
      </div>
    </SiteShell>
  );
}
