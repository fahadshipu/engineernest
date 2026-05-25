"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick, t } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import {
  convertUnit,
  estimateBrickCount,
  estimateBudget,
  estimateConcreteMaterials,
  estimateConcreteVolumeM3,
  estimatePlasterMaterials,
  estimateSteelWeightKg,
  type ConversionUnit,
} from "@/lib/calculations";
import { EstimatorConfig, MaterialRate } from "@/lib/types";

const fallbackConfig: EstimatorConfig = {
  markupPercent: 10,
  vatPercent: 7.5,
  slabThicknessInch: 5,
  steelKgPerSft: 3.2,
  wallAreaFactor: 1.85,
  plasterThicknessMm: 12,
  landPreset: {
    shotokToSft: 435.6,
    kathaToSft: 720,
    bighaToSft: 14400,
  },
};

const conversionRows: Array<{ from: ConversionUnit; to: ConversionUnit; label: { en: string; bn: string } }> = [
  { from: "m2", to: "sft", label: { en: "m² ↔ sft", bn: "মি² ↔ বর্গফুট" } },
  { from: "m3", to: "cft", label: { en: "m³ ↔ cft", bn: "মি³ ↔ ঘনফুট" } },
  { from: "meter", to: "rft", label: { en: "meter ↔ running feet", bn: "মিটার ↔ রানিং ফুট" } },
  { from: "ton", to: "kg", label: { en: "ton ↔ kg", bn: "টন ↔ কেজি" } },
  { from: "shotok", to: "sft", label: { en: "shotok ↔ sft", bn: "শতক ↔ বর্গফুট" } },
  { from: "katha", to: "sft", label: { en: "katha ↔ sft", bn: "কাঠা ↔ বর্গফুট" } },
  { from: "bigha", to: "sft", label: { en: "bigha ↔ sft", bn: "বিঘা ↔ বর্গফুট" } },
];

export default function EstimatorPage() {
  const { language } = useLanguage();

  const [config, setConfig] = useState<EstimatorConfig>(fallbackConfig);
  const [rates, setRates] = useState<MaterialRate[]>([]);

  const [builtAreaSft, setBuiltAreaSft] = useState(1200);
  const [floors, setFloors] = useState(1);

  const [converter, setConverter] = useState<{
    value: number;
    from: ConversionUnit;
    to: ConversionUnit;
  }>({
    value: 1,
    from: "m2",
    to: "sft",
  });

  useEffect(() => {
    void dataLayer.getEstimatorConfig().then(setConfig);
    void dataLayer.list<MaterialRate>("materialRates").then(setRates);
  }, []);

  const conversionValue = useMemo(
    () => convertUnit(converter.value, converter.from, converter.to, config),
    [converter, config],
  );

  const budget = useMemo(() => {
    const concreteVolumeM3 = estimateConcreteVolumeM3(builtAreaSft, floors, config.slabThicknessInch);
    const concreteMaterials = estimateConcreteMaterials(concreteVolumeM3);
    const plasterMaterials = estimatePlasterMaterials(
      builtAreaSft,
      floors,
      config.wallAreaFactor,
      config.plasterThicknessMm,
    );
    const steelKg = estimateSteelWeightKg(builtAreaSft, floors, config.steelKgPerSft);
    const brickQty = estimateBrickCount(builtAreaSft, floors, config.wallAreaFactor);

    const quantities = {
      cement: concreteMaterials.cementBags + plasterMaterials.cementBags,
      rod: steelKg,
      sand: concreteMaterials.sandCft + plasterMaterials.sandCft,
      stone: concreteMaterials.stoneCft,
      brick: brickQty,
      labor: builtAreaSft * floors,
    };

    return {
      quantities,
      concreteVolumeM3,
      ...estimateBudget(quantities, rates, config.markupPercent, config.vatPercent),
    };
  }, [builtAreaSft, floors, config, rates]);

  return (
    <SiteShell>
      <h1 className="mb-6 text-3xl font-bold">{t(language, "estimator")}</h1>

      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {language === "bn"
          ? "এই পেজের সব হিসাব প্রাথমিক (BNBC-inspired thumb-rule) অনুমান। চূড়ান্ত নকশা, পরিমাণ ও খরচ অবশ্যই যোগ্য প্রকৌশলী দ্বারা যাচাই করতে হবে।"
          : "All calculations on this page are preliminary BNBC-inspired thumb-rule estimates. Final design, quantities, and costs must be verified by a qualified engineer."}
      </p>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">{language === "bn" ? "ইউনিট কনভার্সন" : "Unit conversions"}</h2>

        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {conversionRows.map((row) => (
            <button
              key={`${row.from}-${row.to}`}
              type="button"
              onClick={() => setConverter((current) => ({ ...current, from: row.from, to: row.to }))}
              className={`rounded-md border px-3 py-2 text-left text-sm ${
                converter.from === row.from && converter.to === row.to
                  ? "border-blue-800 bg-blue-900 text-white"
                  : "border-slate-300 bg-white text-slate-800"
              }`}
            >
              {pick(language, row.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          <label className="text-sm font-medium text-slate-700">
            {language === "bn" ? "ইনপুট" : "Input"} ({converter.from} → {converter.to})
            <input
              type="number"
              step="0.01"
              value={converter.value}
              onChange={(event) => setConverter({ ...converter, value: Number(event.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => setConverter((current) => ({ ...current, from: current.to, to: current.from }))}
            className="self-end rounded-md border border-slate-300 px-3 py-2 text-center text-sm text-slate-700"
          >
            {language === "bn" ? "দিক বদলান" : "Swap"}
          </button>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="text-slate-500">{language === "bn" ? "ফলাফল" : "Result"}</p>
            <p className="text-lg font-semibold">{conversionValue.toFixed(4)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{language === "bn" ? "প্রাথমিক কস্ট এস্টিমেটর" : "Preliminary cost estimator"}</h2>
          <label className="block text-sm font-medium text-slate-700">
            {language === "bn" ? "নির্মিত এলাকা (বর্গফুট)" : "Built area (sft)"}
            <input
              type="number"
              min={100}
              value={builtAreaSft}
              onChange={(event) => setBuiltAreaSft(Math.max(0, Number(event.target.value)))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {language === "bn" ? "তলা সংখ্যা" : "Number of floors"}
            <input
              type="number"
              min={1}
              value={floors}
              onChange={(event) => setFloors(Math.max(1, Number(event.target.value)))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p>{language === "bn" ? "কংক্রিট ভলিউম (m³)" : "Concrete volume (m³)"}: {budget.concreteVolumeM3.toFixed(2)}</p>
            <p>{language === "bn" ? "স্টিল (kg)" : "Steel (kg)"}: {budget.quantities.rod.toFixed(0)}</p>
            <p>{language === "bn" ? "ইট (pcs)" : "Bricks (pcs)"}: {budget.quantities.brick.toFixed(0)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-900 p-5 text-white">
          <h3 className="mb-3 text-lg font-semibold">
            {language === "bn" ? "রেট-ভিত্তিক এস্টিমেট সারাংশ" : "Material-rate-driven estimate summary"}
          </h3>
          <div className="space-y-2 text-sm">
            {budget.lines.map((line) => (
              <div key={line.key} className="flex items-center justify-between gap-4 border-b border-blue-800 pb-1">
                <span>
                  {pick(language, line.name)} ({line.quantity.toFixed(2)} {line.unit})
                </span>
                <span>৳ {line.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-blue-700 pt-3 text-sm">
            <p>{language === "bn" ? "সাব-টোটাল" : "Subtotal"}: ৳ {budget.subtotal.toLocaleString()}</p>
            <p>
              {language === "bn" ? "মার্কআপ" : "Markup"} ({config.markupPercent}%): ৳ {budget.markup.toLocaleString()}
            </p>
            <p>{language === "bn" ? "ভ্যাট" : "VAT"} ({config.vatPercent}%): ৳ {budget.vat.toLocaleString()}</p>
            <p className="pt-2 text-xl font-bold">{language === "bn" ? "মোট" : "Total"}: ৳ {budget.total.toLocaleString()}</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
