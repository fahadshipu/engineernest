"use client";

import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

const rates = {
  standard: 2600,
  premium: 3400,
  industrial: 4200,
};

export default function EstimatorPage() {
  const { language } = useLanguage();
  const [area, setArea] = useState(1200);
  const [category, setCategory] = useState<keyof typeof rates>("standard");

  const estimate = useMemo(() => Math.round(area * rates[category]), [area, category]);

  return (
    <SiteShell>
      <h1 className="mb-6 text-3xl font-bold">{t(language, "estimator")}</h1>
      <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            {language === "bn" ? "এরিয়া (বর্গফুট)" : "Area (sqft)"}
            <input
              type="number"
              min={100}
              value={area}
              onChange={(event) => setArea(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {language === "bn" ? "প্রকল্প ধরন" : "Project category"}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as keyof typeof rates)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="standard">{language === "bn" ? "স্ট্যান্ডার্ড" : "Standard"}</option>
              <option value="premium">{language === "bn" ? "প্রিমিয়াম" : "Premium"}</option>
              <option value="industrial">{language === "bn" ? "ইন্ডাস্ট্রিয়াল" : "Industrial"}</option>
            </select>
          </label>
        </div>
        <div className="rounded-lg bg-blue-900 p-6 text-white">
          <p className="text-sm text-blue-200">{language === "bn" ? "প্রাথমিক খরচ" : "Estimated construction cost"}</p>
          <p className="mt-3 text-4xl font-bold">৳ {estimate.toLocaleString()}</p>
          <p className="mt-2 text-sm text-blue-100">
            {language === "bn"
              ? "এটি একটি প্রাথমিক অনুমান। বিস্তারিত এস্টিমেটের জন্য যোগাযোগ করুন।"
              : "This is a preliminary estimate. Contact us for a detailed BOQ."}
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
