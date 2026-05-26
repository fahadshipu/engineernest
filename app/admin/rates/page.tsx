"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { EstimatorConfig, MaterialRate } from "@/lib/types";

const emptyConfig: EstimatorConfig = {
  markupPercent: 0,
  vatPercent: 0,
  slabThicknessInch: 5,
  steelKgPerSft: 3,
  wallAreaFactor: 1.8,
  plasterThicknessMm: 12,
  earthwork: {
    excavationRatePerM3: 320,
    backfillRatePerM3: 180,
    transportDisposalRatePerM3: 240,
    defaultSwellFactor: 1.2,
    defaultCompactionFactor: 0.9,
    defaultSideSlopePercent: 8,
  },
  landPreset: {
    shotokToSft: 435.6,
    kathaToSft: 720,
    bighaToSft: 14400,
  },
};

export default function AdminRatesPage() {
  const { language } = useLanguage();
  const { items, saveItem } = useCollectionManager<MaterialRate>("materialRates");
  const [config, setConfig] = useState<EstimatorConfig>(emptyConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void dataLayer.getEstimatorConfig().then(setConfig);
  }, []);

  const saveConfig = async (event: FormEvent) => {
    event.preventDefault();
    await dataLayer.setEstimatorConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "rates")}</h1>
      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        {language === "bn"
          ? "এখানকার রেট ও অনুমান সেটিংস প্রাথমিক হিসাবের জন্য। চূড়ান্ত নকশা ও পরিমাণ অবশ্যই যোগ্য প্রকৌশলী দ্বারা যাচাই করতে হবে।"
          : "Rates and assumptions here are for preliminary estimates only. Final design and quantities must be verified by a qualified engineer."}
      </p>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{language === "bn" ? "ম্যাটেরিয়াল রেট" : "Material rates"}</h2>
        <div className="space-y-3">
          {items.map((rate) => (
            <div key={rate.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[1fr_130px_120px]">
              <div>
                <p className="font-semibold">{pick(language, rate.name)}</p>
                <p className="text-xs text-slate-500">{rate.unit}</p>
              </div>
              <input
                type="number"
                min={0}
                step="0.01"
                value={rate.rate}
                onChange={(event) =>
                  void saveItem({
                    ...rate,
                    rate: Number(event.target.value),
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <p className="self-center text-sm text-slate-600">{language === "bn" ? "প্রতি ইউনিট" : "per unit"}</p>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={saveConfig} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">{language === "bn" ? "এস্টিমেশন কনফিগ" : "Estimation config"}</h2>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "মার্কআপ (%)" : "Markup (%)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.markupPercent}
            onChange={(event) => setConfig({ ...config, markupPercent: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ভ্যাট (%)" : "VAT (%)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.vatPercent}
            onChange={(event) => setConfig({ ...config, vatPercent: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "স্ল্যাব পুরুত্ব (ইঞ্চি)" : "Slab thickness (inch)"}
          <input
            type="number"
            min={1}
            step="0.1"
            value={config.slabThicknessInch}
            onChange={(event) => setConfig({ ...config, slabThicknessInch: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "স্টিল (কেজি/বর্গফুট)" : "Steel (kg/sft)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.steelKgPerSft}
            onChange={(event) => setConfig({ ...config, steelKgPerSft: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ওয়াল এরিয়া ফ্যাক্টর" : "Wall area factor"}
          <input
            type="number"
            min={1}
            step="0.01"
            value={config.wallAreaFactor}
            onChange={(event) => setConfig({ ...config, wallAreaFactor: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "প্লাস্টার পুরুত্ব (মিমি)" : "Plaster thickness (mm)"}
          <input
            type="number"
            min={1}
            step="1"
            value={config.plasterThicknessMm}
            onChange={(event) => setConfig({ ...config, plasterThicknessMm: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <h3 className="md:col-span-2 mt-3 text-base font-semibold">{language === "bn" ? "আর্থওয়ার্ক অনুমান (প্রাথমিক)" : "Earthwork assumptions (preliminary)"}</h3>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "খনন রেট (৳/m³)" : "Excavation rate (৳/m³)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.earthwork.excavationRatePerM3}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, excavationRatePerM3: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ব্যাকফিল রেট (৳/m³)" : "Backfill rate (৳/m³)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.earthwork.backfillRatePerM3}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, backfillRatePerM3: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ডিসপোজাল/ট্রান্সপোর্ট রেট (৳/m³)" : "Disposal/transport rate (৳/m³)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.earthwork.transportDisposalRatePerM3}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, transportDisposalRatePerM3: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ডিফল্ট swell factor" : "Default swell factor"}
          <input
            type="number"
            min={1}
            step="0.01"
            value={config.earthwork.defaultSwellFactor}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, defaultSwellFactor: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ডিফল্ট compaction factor" : "Default compaction factor"}
          <input
            type="number"
            min={0.5}
            max={1}
            step="0.01"
            value={config.earthwork.defaultCompactionFactor}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, defaultCompactionFactor: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "ডিফল্ট side slope allowance (%)" : "Default side slope allowance (%)"}
          <input
            type="number"
            min={0}
            step="0.1"
            value={config.earthwork.defaultSideSlopePercent}
            onChange={(event) =>
              setConfig({
                ...config,
                earthwork: { ...config.earthwork, defaultSideSlopePercent: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <h3 className="md:col-span-2 mt-3 text-base font-semibold">{language === "bn" ? "ভূমি কনভার্সন প্রিসেট" : "Land conversion presets"}</h3>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "১ শতক = কত বর্গফুট" : "1 shotok = sqft"}
          <input
            type="number"
            min={1}
            step="0.01"
            value={config.landPreset.shotokToSft}
            onChange={(event) =>
              setConfig({
                ...config,
                landPreset: { ...config.landPreset, shotokToSft: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {language === "bn" ? "১ কাঠা = কত বর্গফুট" : "1 katha = sqft"}
          <input
            type="number"
            min={1}
            step="0.01"
            value={config.landPreset.kathaToSft}
            onChange={(event) =>
              setConfig({
                ...config,
                landPreset: { ...config.landPreset, kathaToSft: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          {language === "bn" ? "১ বিঘা = কত বর্গফুট" : "1 bigha = sqft"}
          <input
            type="number"
            min={1}
            step="0.01"
            value={config.landPreset.bighaToSft}
            onChange={(event) =>
              setConfig({
                ...config,
                landPreset: { ...config.landPreset, bighaToSft: Number(event.target.value) },
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">
          {t(language, "save")}
        </button>
      </form>

      {saved && <p className="text-sm text-green-700">{language === "bn" ? "কনফিগ সেভ হয়েছে" : "Configuration saved"}</p>}
    </div>
  );
}
