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
      <h1 className="mb-6 text-3xl font-bold">{t(language, "contact")}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold">{profile.companyName}</p>
          <p className="mt-2 text-slate-600">{pick(language, profile.address)}</p>
          <p className="mt-2 text-slate-600">{profile.phone}</p>
          <p className="mt-1 text-slate-600">{profile.email}</p>
          <a
            href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-md bg-green-600 px-4 py-2 font-semibold text-white"
          >
            {t(language, "whatsapp")}
          </a>
        </div>
        <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-lg font-semibold">{language === "bn" ? "মেসেজ পাঠান" : "Send a message"}</p>
          <div className="space-y-3">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "নাম" : "Name"} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "ফোন" : "Phone"} />
            <textarea className="h-24 w-full rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "বার্তা" : "Message"} />
            <button type="button" className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white">
              {language === "bn" ? "পাঠান" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </SiteShell>
  );
}
