"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/language-provider";
import { pick } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import {
  convertUnit,
  estimateBrickCount,
  estimateBudget,
  estimateConcreteMaterials,
  estimateConcreteVolumeM3,
  estimateMasonryMaterials,
  estimatePlasterMaterials,
  estimatePlasterByArea,
  estimateRccMaterials,
  estimateSteelWeightKg,
  estimateTilesMaterials,
  MASONRY_PRESETS,
  PLASTER_PRESETS,
  RCC_MIX_PRESETS,
  TILE_SIZE_PRESETS,
  type ConversionUnit,
  type WallThickness,
  type PlasterPresetKey,
  type RccMixRatioKey,
  type TileSizePresetKey,
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

type TabKey = "overview" | "masonry" | "plaster" | "rcc" | "tiles";

const TABS: Array<{ key: TabKey; label: { en: string; bn: string } }> = [
  { key: "overview", label: { en: "Overview",       bn: "সার্বিক"           } },
  { key: "masonry",  label: { en: "Brick Masonry",  bn: "ইটের গাঁথুনি"     } },
  { key: "plaster",  label: { en: "Plaster",        bn: "প্লাস্টার"         } },
  { key: "rcc",      label: { en: "RCC Work",       bn: "আরসিসি কাজ"       } },
  { key: "tiles",    label: { en: "Tiles Work",     bn: "টাইলস কাজ"        } },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function SectionLabel({ en, bn, language }: { en: string; bn: string; language: string }) {
  return <span>{language === "bn" ? bn : en}</span>;
}

function ResultRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1 text-sm last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">
        {value.toFixed(value < 10 ? 2 : 0)} <span className="text-slate-400 font-normal">{unit}</span>
      </span>
    </div>
  );
}

function CostRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between border-b border-blue-800 pb-1 text-sm last:border-0">
      <span>{label}</span>
      <span>৳ {Math.round(amount).toLocaleString()}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EstimatorPage() {
  const { language } = useLanguage();

  const [config, setConfig] = useState<EstimatorConfig>(fallbackConfig);
  const [rates, setRates] = useState<MaterialRate[]>([]);

  // Overview tab state
  const [builtAreaSft, setBuiltAreaSft] = useState(1200);
  const [floors, setFloors] = useState(1);

  // Unit converter state
  const [converter, setConverter] = useState<{ value: number; from: ConversionUnit; to: ConversionUnit }>({
    value: 1,
    from: "m2",
    to: "sft",
  });

  // Masonry tab state
  const [masonryWallAreaSft, setMasonryWallAreaSft] = useState(800);
  const [masonryThickness, setMasonryThickness] = useState<WallThickness>("5inch");

  // Plaster tab state
  const [plasterAreaSft, setPlasterAreaSft] = useState(1000);
  const [plasterPreset, setPlasterPreset] = useState<PlasterPresetKey>("12mm");
  const [plasterCustomMm, setPlasterCustomMm] = useState(12);
  const [plasterUseCustom, setPlasterUseCustom] = useState(false);

  // RCC tab state
  const [rccAreaSft, setRccAreaSft] = useState(800);
  const [rccThicknessInch, setRccThicknessInch] = useState(5);
  const [rccMix, setRccMix] = useState<RccMixRatioKey>("M20");
  const [rccIncludeSteel, setRccIncludeSteel] = useState(false);
  const [rccSteelKgPerSft, setRccSteelKgPerSft] = useState(3.2);

  // Tiles tab state
  const [tilesAreaSft, setTilesAreaSft] = useState(500);
  const [tilesSizePreset, setTilesSizePreset] = useState<TileSizePresetKey | "custom">("600x600");
  const [tilesCustomWidthMm, setTilesCustomWidthMm] = useState(600);
  const [tilesCustomHeightMm, setTilesCustomHeightMm] = useState(600);
  const [tilesWastagePercent, setTilesWastagePercent] = useState(10);
  const [tilesRatePerSft, setTilesRatePerSft] = useState(80);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    void dataLayer.getEstimatorConfig().then(setConfig);
    void dataLayer.list<MaterialRate>("materialRates").then(setRates);
  }, []);

  const rateFor = (id: string) => rates.find((r) => r.id === id)?.rate ?? 0;

  // ── Overview calculations ──────────────────────────────────────────────────
  const budget = useMemo(() => {
    const concreteVolumeM3 = estimateConcreteVolumeM3(builtAreaSft, floors, config.slabThicknessInch);
    const concreteMaterials = estimateConcreteMaterials(concreteVolumeM3);
    const plasterMaterials = estimatePlasterMaterials(builtAreaSft, floors, config.wallAreaFactor, config.plasterThicknessMm);
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

  // ── Masonry calculations ───────────────────────────────────────────────────
  const masonry = useMemo(
    () => estimateMasonryMaterials(masonryWallAreaSft, masonryThickness),
    [masonryWallAreaSft, masonryThickness],
  );
  const masonryCost = useMemo(
    () => masonry.bricks * rateFor("brick") + masonry.cementBags * rateFor("cement") + masonry.sandCft * rateFor("sand"),
    [masonry, rates], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Plaster calculations ───────────────────────────────────────────────────
  const plasterThicknessMm = plasterUseCustom ? plasterCustomMm : PLASTER_PRESETS[plasterPreset].thicknessMm;
  const plaster = useMemo(
    () => estimatePlasterByArea(plasterAreaSft, plasterThicknessMm),
    [plasterAreaSft, plasterThicknessMm],
  );
  const plasterCost = useMemo(
    () => plaster.cementBags * rateFor("cement") + plaster.sandCft * rateFor("sand"),
    [plaster, rates], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── RCC calculations ───────────────────────────────────────────────────────
  const rccVolumeM3 = useMemo(
    () => estimateConcreteVolumeM3(rccAreaSft, 1, rccThicknessInch),
    [rccAreaSft, rccThicknessInch],
  );
  const rcc = useMemo(() => estimateRccMaterials(rccVolumeM3, rccMix), [rccVolumeM3, rccMix]);
  const rccSteelKg = rccIncludeSteel ? rccAreaSft * rccSteelKgPerSft : 0;
  const rccCost = useMemo(
    () =>
      rcc.cementBags * rateFor("cement") +
      rcc.sandCft * rateFor("sand") +
      rcc.stoneCft * rateFor("stone") +
      rccSteelKg * rateFor("rod"),
    [rcc, rccSteelKg, rates], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Tiles calculations ─────────────────────────────────────────────────────
  const tilesWidthMm  = tilesSizePreset === "custom" ? tilesCustomWidthMm  : TILE_SIZE_PRESETS[tilesSizePreset].widthMm;
  const tilesHeightMm = tilesSizePreset === "custom" ? tilesCustomHeightMm : TILE_SIZE_PRESETS[tilesSizePreset].heightMm;
  const tiles = useMemo(
    () => estimateTilesMaterials(tilesAreaSft, tilesWidthMm, tilesHeightMm, tilesWastagePercent),
    [tilesAreaSft, tilesWidthMm, tilesHeightMm, tilesWastagePercent],
  );
  const tilesCost = tiles.requiredAreaSft * tilesRatePerSft;

  const conversionValue = useMemo(
    () => convertUnit(converter.value, converter.from, converter.to, config),
    [converter, config],
  );

  // ── Shared disclaimer ──────────────────────────────────────────────────────
  const disclaimer = (
    <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      {language === "bn"
        ? "এই পেজের সব হিসাব প্রাথমিক (BNBC-inspired thumb-rule) অনুমান। চূড়ান্ত নকশা, পরিমাণ ও খরচ অবশ্যই যোগ্য প্রকৌশলী দ্বারা যাচাই করতে হবে।"
        : "All calculations on this page are preliminary BNBC-inspired thumb-rule estimates. Final design, quantities, and costs must be verified by a qualified engineer."}
    </p>
  );

  return (
    <SiteShell>
      <h1 className="mb-4 text-3xl font-bold">
        {language === "bn" ? "এস্টিমেটর" : "Estimator"}
      </h1>

      {disclaimer}

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-blue-800 bg-blue-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
            }`}
          >
            {pick(language, tab.label)}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: Overview
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {language === "bn" ? "প্রাথমিক কস্ট এস্টিমেটর" : "Preliminary cost estimator"}
            </h2>
            <label className="block text-sm font-medium text-slate-700">
              {language === "bn" ? "নির্মিত এলাকা (বর্গফুট)" : "Built area (sft)"}
              <input
                type="number"
                min={100}
                value={builtAreaSft}
                onChange={(e) => setBuiltAreaSft(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {language === "bn" ? "তলা সংখ্যা" : "Number of floors"}
              <input
                type="number"
                min={1}
                value={floors}
                onChange={(e) => setFloors(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <ResultRow
                label={language === "bn" ? "কংক্রিট ভলিউম (m³)" : "Concrete volume (m³)"}
                value={budget.concreteVolumeM3}
                unit="m³"
              />
              <ResultRow
                label={language === "bn" ? "স্টিল" : "Steel"}
                value={budget.quantities.rod}
                unit="kg"
              />
              <ResultRow
                label={language === "bn" ? "ইট" : "Bricks"}
                value={budget.quantities.brick}
                unit="pcs"
              />
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
                {language === "bn" ? "মার্কআপ" : "Markup"} ({config.markupPercent}%): ৳{" "}
                {budget.markup.toLocaleString()}
              </p>
              <p>
                {language === "bn" ? "ভ্যাট" : "VAT"} ({config.vatPercent}%): ৳{" "}
                {budget.vat.toLocaleString()}
              </p>
              <p className="pt-2 text-xl font-bold">
                {language === "bn" ? "মোট" : "Total"}: ৳ {budget.total.toLocaleString()}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: Brick Masonry / ইটের গাঁথুনি
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "masonry" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">
            {language === "bn" ? "ইটের গাঁথুনি" : "Brick Masonry"}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            {language === "bn"
              ? "দেয়ালের এলাকা ও পুরুত্ব দিন — ইট, সিমেন্ট ও বালুর পরিমাণ পাবেন।"
              : "Enter wall area and thickness to estimate bricks, cement, and sand."}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "মোট দেয়ালের এলাকা (বর্গফুট)" : "Total wall area (sft)"}
                <input
                  type="number"
                  min={1}
                  value={masonryWallAreaSft}
                  onChange={(e) => setMasonryWallAreaSft(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "দেয়ালের পুরুত্ব" : "Wall thickness"}
                </legend>
                {(Object.entries(MASONRY_PRESETS) as [WallThickness, (typeof MASONRY_PRESETS)[WallThickness]][]).map(
                  ([key, preset]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                      <input
                        type="radio"
                        name="masonryThickness"
                        value={key}
                        checked={masonryThickness === key}
                        onChange={() => setMasonryThickness(key)}
                      />
                      <span className="text-sm">{pick(language, preset.label)}</span>
                    </label>
                  ),
                )}
              </fieldset>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  {language === "bn" ? "পরিমাণ (প্রাথমিক অনুমান)" : "Quantities (preliminary estimate)"}
                </h3>
                <ResultRow label={language === "bn" ? "ইট" : "Bricks"}   value={masonry.bricks}      unit="pcs" />
                <ResultRow label={language === "bn" ? "সিমেন্ট" : "Cement"} value={masonry.cementBags} unit="bags" />
                <ResultRow label={language === "bn" ? "বালু" : "Sand"}    value={masonry.sandCft}    unit="cft" />
              </div>

              {rates.length > 0 && (
                <div className="rounded-lg bg-blue-900 p-4 text-white text-sm">
                  <h3 className="mb-2 font-semibold">
                    {language === "bn" ? "আনুমানিক খরচ" : "Approximate cost"}
                  </h3>
                  <CostRow label={language === "bn" ? "ইট" : "Bricks"}    amount={masonry.bricks      * rateFor("brick")}  />
                  <CostRow label={language === "bn" ? "সিমেন্ট" : "Cement"} amount={masonry.cementBags * rateFor("cement")} />
                  <CostRow label={language === "bn" ? "বালু" : "Sand"}     amount={masonry.sandCft    * rateFor("sand")}   />
                  <p className="mt-3 border-t border-blue-700 pt-2 text-base font-bold">
                    {language === "bn" ? "মোট উপকরণ খরচ" : "Total material cost"}: ৳{" "}
                    {Math.round(masonryCost).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: Plaster / প্লাস্টার
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "plaster" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">
            {language === "bn" ? "প্লাস্টার" : "Plaster"}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            {language === "bn"
              ? "এলাকা ও পুরুত্ব দিন — সিমেন্ট ও বালুর পরিমাণ পাবেন।"
              : "Enter surface area and thickness to estimate cement and sand."}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "প্লাস্টারের এলাকা (বর্গফুট)" : "Plaster area (sft)"}
                <input
                  type="number"
                  min={1}
                  value={plasterAreaSft}
                  onChange={(e) => setPlasterAreaSft(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "পুরুত্ব" : "Thickness"}
                </legend>
                {(Object.entries(PLASTER_PRESETS) as [PlasterPresetKey, (typeof PLASTER_PRESETS)[PlasterPresetKey]][]).map(
                  ([key, preset]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                      <input
                        type="radio"
                        name="plasterThickness"
                        value={key}
                        checked={!plasterUseCustom && plasterPreset === key}
                        onChange={() => { setPlasterPreset(key); setPlasterUseCustom(false); }}
                      />
                      <span className="text-sm">{pick(language, preset.label)}</span>
                    </label>
                  ),
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                  <input
                    type="radio"
                    name="plasterThickness"
                    checked={plasterUseCustom}
                    onChange={() => setPlasterUseCustom(true)}
                  />
                  <span className="text-sm">{language === "bn" ? "কাস্টম (মি.মি.)" : "Custom (mm)"}</span>
                  {plasterUseCustom && (
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={plasterCustomMm}
                      onChange={(e) => setPlasterCustomMm(Math.max(1, Number(e.target.value)))}
                      className="ml-2 w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  )}
                </label>
              </fieldset>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-slate-700">
                  {language === "bn" ? "পরিমাণ (প্রাথমিক অনুমান)" : "Quantities (preliminary estimate)"}
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  {language === "bn"
                    ? `পুরুত্ব: ${plasterThicknessMm} মি.মি.  |  মিশ্রণ: ১:৪`
                    : `Thickness: ${plasterThicknessMm} mm  |  Mix: 1:4`}
                </p>
                <ResultRow label={language === "bn" ? "সিমেন্ট" : "Cement"} value={plaster.cementBags} unit="bags" />
                <ResultRow label={language === "bn" ? "বালু" : "Sand"}      value={plaster.sandCft}    unit="cft"  />
              </div>

              {rates.length > 0 && (
                <div className="rounded-lg bg-blue-900 p-4 text-white text-sm">
                  <h3 className="mb-2 font-semibold">
                    {language === "bn" ? "আনুমানিক খরচ" : "Approximate cost"}
                  </h3>
                  <CostRow label={language === "bn" ? "সিমেন্ট" : "Cement"} amount={plaster.cementBags * rateFor("cement")} />
                  <CostRow label={language === "bn" ? "বালু" : "Sand"}      amount={plaster.sandCft    * rateFor("sand")}   />
                  <p className="mt-3 border-t border-blue-700 pt-2 text-base font-bold">
                    {language === "bn" ? "মোট উপকরণ খরচ" : "Total material cost"}: ৳{" "}
                    {Math.round(plasterCost).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: RCC Work / আরসিসি কাজ
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "rcc" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">
            {language === "bn" ? "আরসিসি কাজ" : "RCC Work"}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            {language === "bn"
              ? "এলাকা, পুরুত্ব ও মিশ্রণ অনুপাত দিন — সিমেন্ট, বালু, খোয়া ও রডের পরিমাণ পাবেন।"
              : "Enter area, thickness and mix ratio to estimate cement, sand, stone, and steel."}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "এলাকা (বর্গফুট)" : "Area (sft)"}
                <input
                  type="number"
                  min={1}
                  value={rccAreaSft}
                  onChange={(e) => setRccAreaSft(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "পুরুত্ব / গভীরতা (ইঞ্চি)" : "Thickness / depth (inch)"}
                <select
                  value={rccThicknessInch}
                  onChange={(e) => setRccThicknessInch(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  {[4, 5, 6, 8, 10, 12, 15, 18].map((v) => (
                    <option key={v} value={v}>
                      {v}&quot; ({(v * 25.4).toFixed(0)} mm)
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "মিশ্রণ অনুপাত" : "Mix ratio"}
                </legend>
                {(Object.entries(RCC_MIX_PRESETS) as [RccMixRatioKey, (typeof RCC_MIX_PRESETS)[RccMixRatioKey]][]).map(
                  ([key, preset]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                      <input
                        type="radio"
                        name="rccMix"
                        value={key}
                        checked={rccMix === key}
                        onChange={() => setRccMix(key)}
                      />
                      <span className="text-sm">{pick(language, preset.label)}</span>
                    </label>
                  ),
                )}
              </fieldset>

              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={rccIncludeSteel}
                  onChange={(e) => setRccIncludeSteel(e.target.checked)}
                />
                <span className="text-sm">
                  {language === "bn" ? "রড হিসাব অন্তর্ভুক্ত করুন" : "Include steel estimate"}
                </span>
              </label>
              {rccIncludeSteel && (
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "রড (কেজি / বর্গফুট)" : "Steel (kg / sft)"}
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    value={rccSteelKgPerSft}
                    onChange={(e) => setRccSteelKgPerSft(Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-slate-700">
                  {language === "bn" ? "পরিমাণ (প্রাথমিক অনুমান)" : "Quantities (preliminary estimate)"}
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  {language === "bn"
                    ? `কংক্রিট ভলিউম: ${rccVolumeM3.toFixed(2)} m³`
                    : `Concrete volume: ${rccVolumeM3.toFixed(2)} m³`}
                </p>
                <ResultRow label={language === "bn" ? "সিমেন্ট" : "Cement"}  value={rcc.cementBags} unit="bags" />
                <ResultRow label={language === "bn" ? "বালু" : "Sand"}        value={rcc.sandCft}    unit="cft"  />
                <ResultRow label={language === "bn" ? "খোয়া" : "Stone chips"} value={rcc.stoneCft}   unit="cft"  />
                {rccIncludeSteel && (
                  <ResultRow label={language === "bn" ? "রড" : "Steel"} value={rccSteelKg} unit="kg" />
                )}
              </div>

              {rates.length > 0 && (
                <div className="rounded-lg bg-blue-900 p-4 text-white text-sm">
                  <h3 className="mb-2 font-semibold">
                    {language === "bn" ? "আনুমানিক খরচ" : "Approximate cost"}
                  </h3>
                  <CostRow label={language === "bn" ? "সিমেন্ট" : "Cement"}  amount={rcc.cementBags * rateFor("cement")} />
                  <CostRow label={language === "bn" ? "বালু" : "Sand"}        amount={rcc.sandCft    * rateFor("sand")}   />
                  <CostRow label={language === "bn" ? "খোয়া" : "Stone chips"} amount={rcc.stoneCft   * rateFor("stone")}  />
                  {rccIncludeSteel && (
                    <CostRow label={language === "bn" ? "রড" : "Steel"} amount={rccSteelKg * rateFor("rod")} />
                  )}
                  <p className="mt-3 border-t border-blue-700 pt-2 text-base font-bold">
                    {language === "bn" ? "মোট উপকরণ খরচ" : "Total material cost"}: ৳{" "}
                    {Math.round(rccCost).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: Tiles Work / টাইলস কাজ
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "tiles" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">
            {language === "bn" ? "টাইলস কাজ" : "Tiles Work"}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            {language === "bn"
              ? "মেঝে/দেয়ালের এলাকা, টাইলসের সাইজ ও অপচয় দিন — টাইলসের সংখ্যা ও খরচ পাবেন।"
              : "Enter floor/wall area, tile size, and wastage to estimate tile count and cost."}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "টাইলসের এলাকা (বর্গফুট)" : "Tile area (sft)"}
                <input
                  type="number"
                  min={1}
                  value={tilesAreaSft}
                  onChange={(e) => setTilesAreaSft(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "টাইলসের সাইজ" : "Tile size"}
                </legend>
                {(Object.entries(TILE_SIZE_PRESETS) as [TileSizePresetKey, (typeof TILE_SIZE_PRESETS)[TileSizePresetKey]][]).map(
                  ([key, preset]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                      <input
                        type="radio"
                        name="tileSize"
                        value={key}
                        checked={tilesSizePreset === key}
                        onChange={() => setTilesSizePreset(key)}
                      />
                      <span className="text-sm">{pick(language, preset.label)}</span>
                    </label>
                  ),
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300">
                  <input
                    type="radio"
                    name="tileSize"
                    checked={tilesSizePreset === "custom"}
                    onChange={() => setTilesSizePreset("custom")}
                  />
                  <span className="text-sm">{language === "bn" ? "কাস্টম সাইজ (মি.মি.)" : "Custom size (mm)"}</span>
                </label>
                {tilesSizePreset === "custom" && (
                  <div className="flex gap-2 pl-7">
                    <label className="text-sm">
                      {language === "bn" ? "প্রস্থ" : "W"}
                      <input
                        type="number"
                        min={50}
                        value={tilesCustomWidthMm}
                        onChange={(e) => setTilesCustomWidthMm(Math.max(50, Number(e.target.value)))}
                        className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-sm">
                      {language === "bn" ? "উচ্চতা" : "H"}
                      <input
                        type="number"
                        min={50}
                        value={tilesCustomHeightMm}
                        onChange={(e) => setTilesCustomHeightMm(Math.max(50, Number(e.target.value)))}
                        className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1"
                      />
                    </label>
                  </div>
                )}
              </fieldset>

              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "অপচয় (%)" : "Wastage (%)"}
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={tilesWastagePercent}
                  onChange={(e) => setTilesWastagePercent(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "টাইলসের দর (৳/বর্গফুট)" : "Tile rate (৳/sft)"}
                <input
                  type="number"
                  min={0}
                  value={tilesRatePerSft}
                  onChange={(e) => setTilesRatePerSft(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-slate-700">
                  {language === "bn" ? "পরিমাণ (প্রাথমিক অনুমান)" : "Quantities (preliminary estimate)"}
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  {language === "bn"
                    ? `টাইলস: ${tilesWidthMm}×${tilesHeightMm} মি.মি.  |  অপচয়: ${tilesWastagePercent}%`
                    : `Tile: ${tilesWidthMm}×${tilesHeightMm} mm  |  Wastage: ${tilesWastagePercent}%`}
                </p>
                <ResultRow label={language === "bn" ? "প্রয়োজনীয় টাইলস" : "Tiles required"}      value={tiles.tilesRequired}    unit="pcs" />
                <ResultRow label={language === "bn" ? "মোট এলাকা (অপচয়সহ)" : "Total area (incl. wastage)"} value={tiles.requiredAreaSft}  unit="sft" />
                <ResultRow label={language === "bn" ? "অপচয় এলাকা" : "Wastage area"}          value={tiles.wastageAreaSft}   unit="sft" />
              </div>

              <div className="rounded-lg bg-blue-900 p-4 text-white text-sm">
                <h3 className="mb-2 font-semibold">
                  {language === "bn" ? "আনুমানিক খরচ" : "Approximate cost"}
                </h3>
                <CostRow
                  label={language === "bn" ? `টাইলস (${tiles.requiredAreaSft.toFixed(1)} sft × ৳${tilesRatePerSft})` : `Tiles (${tiles.requiredAreaSft.toFixed(1)} sft × ৳${tilesRatePerSft})`}
                  amount={tilesCost}
                />
                <p className="mt-3 border-t border-blue-700 pt-2 text-base font-bold">
                  {language === "bn" ? "মোট টাইলস খরচ" : "Total tiles cost"}: ৳{" "}
                  {Math.round(tilesCost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Unit conversions (always visible) ────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          {language === "bn" ? "ইউনিট কনভার্সন" : "Unit conversions"}
        </h2>

        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {conversionRows.map((row) => (
            <button
              key={`${row.from}-${row.to}`}
              type="button"
              onClick={() => setConverter((c) => ({ ...c, from: row.from, to: row.to }))}
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
              onChange={(e) => setConverter({ ...converter, value: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => setConverter((c) => ({ ...c, from: c.to, to: c.from }))}
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
    </SiteShell>
  );
}

