"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { dataLayer } from "@/lib/data-layer";
import { CompanyProfile, ContentSection, Project } from "@/lib/types";

export default function HomePage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<ContentSection | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    void dataLayer.list<Project>("projects").then(setProjects);
    void dataLayer.list<ContentSection>("contentSections").then((items) => setContent(items[0] ?? null));
    void dataLayer.getProfile().then(setProfile);
  }, []);

  return (
    <SiteShell>
      <section className="grid gap-6 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-white md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-blue-200">EngineerNest</p>
          <h1 className="text-3xl font-bold md:text-4xl">
            {content ? pick(language, content.headline) : "EngineerNest"}
          </h1>
          <p className="text-blue-100">{content ? pick(language, content.body) : ""}</p>
          <div className="flex gap-3">
            <Link href="/contact" className="rounded-md bg-white px-4 py-2 font-semibold text-blue-900">
              {content ? pick(language, content.cta) : t(language, "freeConsultation")}
            </Link>
            <Link href="/estimator" className="rounded-md border border-white px-4 py-2 font-semibold text-white">
              {t(language, "estimateNow")}
            </Link>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-5">
          <h2 className="mb-3 text-lg font-semibold">{profile?.companyName ?? "EngineerNest"}</h2>
          <p className="text-sm text-blue-100">{profile ? pick(language, profile.tagline) : ""}</p>
          <p className="mt-4 text-sm text-blue-100">{profile ? pick(language, profile.about) : ""}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">{t(language, "services")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              en: "Architectural & Structural Design",
              bn: "আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন",
            },
            { en: "Construction Management", bn: "কনস্ট্রাকশন ম্যানেজমেন্ট" },
            { en: "BOQ & Cost Engineering", bn: "বিওকিউ ও কস্ট ইঞ্জিনিয়ারিং" },
          ].map((service) => (
            <div key={service.en} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold">{pick(language, service)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">{t(language, "portfolio")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{pick(language, project.name)}</h3>
              <p className="text-sm text-slate-600">{pick(language, project.location)}</p>
              <p className="mt-2 text-sm font-medium text-blue-900">{pick(language, project.status)}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
