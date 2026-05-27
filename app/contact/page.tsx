"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { CompanyProfile } from "@/lib/types";

export default function ContactPage() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    void dataLayer.getProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <SiteShell>{null}</SiteShell>;
  }

  return (
    <SiteShell>
      <section className="rounded-3xl bg-gradient-to-br from-blue-950 to-blue-800 p-6 text-white md:p-8">
        <p className="text-sm text-blue-200">S.K.B.A Enterprise</p>
        <h1 className="mt-2 text-3xl font-bold">{t(language, "contact")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          {language === "bn"
            ? "মডার্ন প্রকল্প পরিকল্পনা, নির্মাণ তত্ত্বাবধান এবং কস্ট কন্ট্রোলের জন্য আমাদের সাথে যোগাযোগ করুন।"
            : "Connect with us for modern project planning, construction supervision, and cost control support."}
        </p>
      </section>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-blue-950">{profile.companyName}</p>
          <p className="mt-1 text-sm text-slate-500">Md Fahad Bin Anwar Shipu · Managing Director</p>
          <p className="mt-3 text-slate-600">{pick(language, profile.address)}</p>
          <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-slate-700">{profile.phone}</p>
          <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-700">{profile.email}</p>
          <a
            href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {t(language, "whatsapp")}
          </a>
        </div>
        <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-lg font-semibold">{language === "bn" ? "মেসেজ পাঠান" : "Send a message"}</p>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none ring-blue-200 focus:ring"
              placeholder={language === "bn" ? "নাম" : "Name"}
            />
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none ring-blue-200 focus:ring"
              placeholder={language === "bn" ? "ফোন" : "Phone"}
            />
            <textarea
              className="h-24 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none ring-blue-200 focus:ring"
              placeholder={language === "bn" ? "বার্তা" : "Message"}
            />
            <button type="button" className="rounded-full bg-blue-950 px-5 py-2.5 text-sm font-semibold text-white">
              {language === "bn" ? "পাঠান" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </SiteShell>
  );
}
