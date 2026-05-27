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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-4 h-44 w-44 rounded-full border border-white/20" />
        <div className="relative grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              S.K.B.A Enterprise · EngineerNest
            </div>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {content ? pick(language, content.headline) : "EngineerNest"}
            </h1>
            <p className="max-w-xl text-sm text-blue-100 md:text-base">{content ? pick(language, content.body) : ""}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-950">
                {content ? pick(language, content.cta) : t(language, "freeConsultation")}
              </Link>
              <Link
                href="/estimator"
                className="rounded-full border border-white/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-white"
              >
                {t(language, "estimateNow")}
              </Link>
            </div>
            <div className="grid gap-2 text-xs text-blue-100 sm:grid-cols-2">
              <p className="rounded-xl bg-white/10 px-3 py-2">01739-894079 · 01401-788009</p>
              <p className="rounded-xl bg-white/10 px-3 py-2">admin@skbaenterprise.me</p>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-200">Managing Director</p>
              <p className="mt-1 text-xl font-semibold">Md Fahad Bin Anwar Shipu</p>
            </div>
            <h2 className="text-lg font-semibold">{profile?.companyName ?? "S.K.B.A Enterprise"}</h2>
            <p className="text-sm text-blue-100">{profile ? pick(language, profile.tagline) : ""}</p>
            <p className="text-sm text-blue-100">{profile ? pick(language, profile.about) : ""}</p>
            <p className="rounded-xl border border-white/20 px-3 py-2 text-xs text-blue-100">
              {profile ? pick(language, profile.address) : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold text-blue-950">{t(language, "services")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              en: "Architectural & Structural Design",
              bn: "আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন",
            },
            { en: "Construction Management", bn: "কনস্ট্রাকশন ম্যানেজমেন্ট" },
            { en: "BOQ & Cost Engineering", bn: "বিওকিউ ও কস্ট ইঞ্জিনিয়ারিং" },
          ].map((service) => (
            <div
              key={service.en}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="font-semibold text-blue-950">{pick(language, service)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold text-blue-950">{t(language, "portfolio")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-950 to-cyan-500" style={{ width: `${project.progressPercent}%` }} />
              </div>
              <h3 className="text-lg font-semibold">{pick(language, project.name)}</h3>
              <p className="text-sm text-slate-600">{pick(language, project.location)}</p>
              <p className="mt-2 text-sm font-medium text-blue-900">{pick(language, project.status)}</p>
              <p className="mt-2 text-xs text-slate-500">{project.progressPercent}% complete</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
