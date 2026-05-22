"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { CompanyProfile } from "@/lib/types";

const emptyProfile: CompanyProfile = {
  companyName: "",
  tagline: { en: "", bn: "" },
  phone: "",
  email: "",
  whatsapp: "",
  address: { en: "", bn: "" },
  about: { en: "", bn: "" },
};

export default function AdminProfilePage() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void dataLayer.getProfile().then(setProfile);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await dataLayer.setProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "profile")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Company" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="WhatsApp" value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Tagline (EN)" value={profile.tagline.en} onChange={(e) => setProfile({ ...profile, tagline: { ...profile.tagline, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="ট্যাগলাইন (BN)" value={profile.tagline.bn} onChange={(e) => setProfile({ ...profile, tagline: { ...profile.tagline, bn: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Address (EN)" value={profile.address.en} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, en: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="ঠিকানা (BN)" value={profile.address.bn} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, bn: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="About (EN)" value={profile.about.en} onChange={(e) => setProfile({ ...profile, about: { ...profile.about, en: e.target.value } })} required />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="বিস্তারিত (BN)" value={profile.about.bn} onChange={(e) => setProfile({ ...profile, about: { ...profile.about, bn: e.target.value } })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{t(language, "save")}</button>
      </form>
      {saved && <p className="text-sm text-green-700">{language === "bn" ? "প্রোফাইল সেভ হয়েছে" : "Profile saved"}</p>}
    </div>
  );
}
