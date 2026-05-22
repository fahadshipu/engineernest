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
      <h1 className="mb-6 text-3xl font-bold">{t(language, "resources")}</h1>
      <div className="space-y-3">
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
          >
            <p className="font-semibold">{pick(language, document.title)}</p>
            <p className="text-sm text-slate-600">{document.type}</p>
          </a>
        ))}
      </div>
    </SiteShell>
  );
}
