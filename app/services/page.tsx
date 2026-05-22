"use client";

import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";

const serviceCards = [
  {
    title: { en: "Architectural & Structural Design", bn: "আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন" },
    body: { en: "BNBC-aligned design with practical site execution plans.", bn: "BNBC অনুযায়ী ডিজাইন ও বাস্তব সাইট এক্সিকিউশন পরিকল্পনা।" },
  },
  {
    title: { en: "Construction Services", bn: "কনস্ট্রাকশন সার্ভিস" },
    body: { en: "Turn-key and contract-based delivery for residential and commercial projects.", bn: "আবাসিক ও বাণিজ্যিক প্রকল্পে টার্ন-কি ও কন্ট্রাক্ট বেসড সেবা।" },
  },
  {
    title: { en: "Estimation & BOQ", bn: "এস্টিমেশন ও বিওকিউ" },
    body: { en: "Accurate quantity takeoff, costing, and procurement planning.", bn: "সঠিক পরিমাণ নির্ধারণ, খরচ বিশ্লেষণ ও ক্রয় পরিকল্পনা।" },
  },
  {
    title: { en: "Soil Test Analysis", bn: "সয়েল টেস্ট এনালাইসিস" },
    body: { en: "Foundation recommendations based on field and lab data.", bn: "ফিল্ড ও ল্যাব ডেটা ভিত্তিক ফাউন্ডেশন সুপারিশ।" },
  },
  {
    title: { en: "Interior & Exterior Design", bn: "ইন্টেরিয়র ও এক্সটেরিয়র ডিজাইন" },
    body: { en: "Modern and durable design language aligned with your budget.", bn: "আপনার বাজেট অনুযায়ী আধুনিক ও স্থায়িত্বপূর্ণ ডিজাইন।" },
  },
];

export default function ServicesPage() {
  const { language } = useLanguage();

  return (
    <SiteShell>
      <h1 className="mb-6 text-3xl font-bold">{t(language, "services")}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {serviceCards.map((service) => (
          <article key={service.title.en} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{pick(language, service.title)}</h2>
            <p className="mt-2 text-sm text-slate-600">{pick(language, service.body)}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
