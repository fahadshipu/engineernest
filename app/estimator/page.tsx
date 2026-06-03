"use client";

import Link from "next/link";
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
  estimateEarthwork,
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
  type EarthworkInputMode,
  type EarthworkLaborMode,
  type EarthworkSection,
  type EarthworkUnitSystem,
  type WallThickness,
  type PlasterPresetKey,
  type RccMixRatioKey,
  type TileSizePresetKey,
} from "@/lib/calculations";
import { CompanyProfile, DocumentItem, EstimatorConfig, MaterialRate } from "@/lib/types";

const fallbackConfig: EstimatorConfig = {
  markupPercent: 10,
  vatPercent: 7.5,
  slabThicknessInch: 5,
  steelKgPerSft: 3.2,
  wallAreaFactor: 1.85,
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

const conversionRows: Array<{ from: ConversionUnit; to: ConversionUnit; label: { en: string; bn: string } }> = [
  { from: "m2", to: "sft", label: { en: "m² ↔ sft", bn: "মি² ↔ বর্গফুট" } },
  { from: "m3", to: "cft", label: { en: "m³ ↔ cft", bn: "মি³ ↔ ঘনফুট" } },
  { from: "meter", to: "rft", label: { en: "meter ↔ running feet", bn: "মিটার ↔ রানিং ফুট" } },
  { from: "ton", to: "kg", label: { en: "ton ↔ kg", bn: "টন ↔ কেজি" } },
  { from: "shotok", to: "sft", label: { en: "shotok ↔ sft", bn: "শতক ↔ বর্গফুট" } },
  { from: "katha", to: "sft", label: { en: "katha ↔ sft", bn: "কাঠা ↔ বর্গফুট" } },
  { from: "bigha", to: "sft", label: { en: "bigha ↔ sft", bn: "বিঘা ↔ বর্গফুট" } },
];

type TabKey = "overview" | "masonry" | "plaster" | "rcc" | "tiles" | "earthwork";
type PrintTemplateMode = "pad-a" | "pad-b";

const TABS: Array<{ key: TabKey; label: { en: string; bn: string } }> = [
  { key: "overview", label: { en: "Overview",       bn: "সার্বিক"           } },
  { key: "masonry",  label: { en: "Brick Masonry",  bn: "ইটের গাঁথুনি"     } },
  { key: "plaster",  label: { en: "Plaster",        bn: "প্লাস্টার"         } },
  { key: "rcc",      label: { en: "RCC Work",       bn: "আরসিসি কাজ"       } },
  { key: "tiles",    label: { en: "Tiles Work",     bn: "টাইলস কাজ"        } },
  { key: "earthwork", label: { en: "Earthwork",      bn: "মাটি কাটার কাজ"    } },
];

const EARTHWORK_SECTIONS: Array<{ key: EarthworkSection; label: { en: string; bn: string } }> = [
  { key: "foundation", label: { en: "Foundation excavation", bn: "ফাউন্ডেশন খনন" } },
  { key: "trench", label: { en: "Trench / drain cutting", bn: "ট্রেঞ্চ / ড্রেন কাটিং" } },
  { key: "pit", label: { en: "Pit excavation", bn: "পিট খনন" } },
  { key: "leveling", label: { en: "Site leveling", bn: "সাইট লেভেলিং" } },
  { key: "backfilling", label: { en: "Backfilling", bn: "ব্যাকফিলিং" } },
];

const EARTHWORK_SOIL_TYPES: Array<{ key: string; label: { en: string; bn: string }; swellFactor: number }> = [
  { key: "dense-clay", label: { en: "Dense clay", bn: "ঘন কাদা মাটি" }, swellFactor: 1.2 },
  { key: "sandy", label: { en: "Sandy soil", bn: "বালুমাটি" }, swellFactor: 1.12 },
  { key: "mixed", label: { en: "Mixed soil", bn: "মিশ্র মাটি" }, swellFactor: 1.18 },
  { key: "loose-fill", label: { en: "Loose fill", bn: "ঢিলা ভরাট মাটি" }, swellFactor: 1.25 },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────
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
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

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

  // Earthwork tab state
  const [earthworkSection, setEarthworkSection] = useState<EarthworkSection>("foundation");
  const [earthworkMode, setEarthworkMode] = useState<EarthworkInputMode>("lwd");
  const [earthworkUnitSystem, setEarthworkUnitSystem] = useState<EarthworkUnitSystem>("metric");
  const [earthworkSoilType, setEarthworkSoilType] = useState(EARTHWORK_SOIL_TYPES[0].key);
  const [earthworkLength, setEarthworkLength] = useState(12);
  const [earthworkWidth, setEarthworkWidth] = useState(2);
  const [earthworkDepth, setEarthworkDepth] = useState(1.5);
  const [earthworkArea, setEarthworkArea] = useState(40);
  const [earthworkRepeatedUnits, setEarthworkRepeatedUnits] = useState(6);
  const [earthworkVolumePerUnit, setEarthworkVolumePerUnit] = useState(1.2);
  const [earthworkManualVolume, setEarthworkManualVolume] = useState(35);
  const [earthworkSwellFactor, setEarthworkSwellFactor] = useState(fallbackConfig.earthwork.defaultSwellFactor);
  const [earthworkCompactionFactor, setEarthworkCompactionFactor] = useState(fallbackConfig.earthwork.defaultCompactionFactor);
  const [earthworkSideSlopePercent, setEarthworkSideSlopePercent] = useState(fallbackConfig.earthwork.defaultSideSlopePercent);
  const [earthworkBackfillPercent, setEarthworkBackfillPercent] = useState(35);
  const [earthworkLaborMode, setEarthworkLaborMode] = useState<EarthworkLaborMode>("mixed");
  const [earthworkExcavationRate, setEarthworkExcavationRate] = useState(fallbackConfig.earthwork.excavationRatePerM3);
  const [earthworkBackfillRate, setEarthworkBackfillRate] = useState(fallbackConfig.earthwork.backfillRatePerM3);
  const [earthworkDisposalRate, setEarthworkDisposalRate] = useState(fallbackConfig.earthwork.transportDisposalRatePerM3);
  const [earthworkDisposalDistanceKm, setEarthworkDisposalDistanceKm] = useState(8);
  const [earthworkTruckCapacityM3, setEarthworkTruckCapacityM3] = useState(6);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [printTemplate, setPrintTemplate] = useState<PrintTemplateMode>("pad-a");
  const [estimateRefNo, setEstimateRefNo] = useState("EST-001");
  const [estimateDate, setEstimateDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [estimateClient, setEstimateClient] = useState("");
  const [estimateProject, setEstimateProject] = useState("");

  useEffect(() => {
    void dataLayer.getEstimatorConfig().then((nextConfig) => {
      setConfig(nextConfig);
      setEarthworkSwellFactor(nextConfig.earthwork.defaultSwellFactor);
      setEarthworkCompactionFactor(nextConfig.earthwork.defaultCompactionFactor);
      setEarthworkSideSlopePercent(nextConfig.earthwork.defaultSideSlopePercent);
      setEarthworkExcavationRate(nextConfig.earthwork.excavationRatePerM3);
      setEarthworkBackfillRate(nextConfig.earthwork.backfillRatePerM3);
      setEarthworkDisposalRate(nextConfig.earthwork.transportDisposalRatePerM3);
    });
    void dataLayer.list<MaterialRate>("materialRates").then(setRates);
    void dataLayer.getProfile().then(setCompany);
    void dataLayer.list<DocumentItem>("documents").then(setDocuments);
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

  // ── Earthwork calculations ─────────────────────────────────────────────────
  const earthwork = useMemo(
    () =>
      estimateEarthwork({
        mode: earthworkMode,
        unitSystem: earthworkUnitSystem,
        length: earthworkLength,
        width: earthworkWidth,
        depth: earthworkDepth,
        area: earthworkArea,
        repeatedUnits: earthworkRepeatedUnits,
        volumePerUnit: earthworkVolumePerUnit,
        manualTotalVolume: earthworkManualVolume,
        sideSlopeAllowancePercent: earthworkSideSlopePercent,
        swellFactor: earthworkSwellFactor,
        compactionFactor: earthworkCompactionFactor,
        backfillPercent: earthworkBackfillPercent,
        laborMode: earthworkLaborMode,
        excavationRatePerM3: earthworkExcavationRate,
        backfillRatePerM3: earthworkBackfillRate,
        transportDisposalRatePerM3: earthworkDisposalRate,
        disposalDistanceKm: earthworkDisposalDistanceKm,
        truckCapacityM3: earthworkTruckCapacityM3,
      }),
    [
      earthworkMode,
      earthworkUnitSystem,
      earthworkLength,
      earthworkWidth,
      earthworkDepth,
      earthworkArea,
      earthworkRepeatedUnits,
      earthworkVolumePerUnit,
      earthworkManualVolume,
      earthworkSideSlopePercent,
      earthworkSwellFactor,
      earthworkCompactionFactor,
      earthworkBackfillPercent,
      earthworkLaborMode,
      earthworkExcavationRate,
      earthworkBackfillRate,
      earthworkDisposalRate,
      earthworkDisposalDistanceKm,
      earthworkTruckCapacityM3,
    ],
  );

  const volumeToUi = (volumeM3: number) => (earthworkUnitSystem === "metric" ? volumeM3 : volumeM3 * 35.3147);
  const volumeUnit = earthworkUnitSystem === "metric" ? "m³" : "cft";

  const conversionValue = useMemo(
    () => convertUnit(converter.value, converter.from, converter.to, config),
    [converter, config],
  );

  const padTemplateA = useMemo(
    () => documents.find((item) => item.category === "pad-template-a"),
    [documents],
  );
  const padTemplateB = useMemo(
    () => documents.find((item) => item.category === "pad-template-b"),
    [documents],
  );

  const printLineItems = useMemo(
    () => [
      {
        name: language === "bn" ? "সিমেন্ট" : "Cement",
        qty: budget.quantities.cement,
        unit: "bag",
        amount: budget.lines.find((line) => line.key === "cement")?.amount ?? 0,
      },
      {
        name: language === "bn" ? "রড" : "Steel",
        qty: budget.quantities.rod,
        unit: "kg",
        amount: budget.lines.find((line) => line.key === "rod")?.amount ?? 0,
      },
      {
        name: language === "bn" ? "বালু" : "Sand",
        qty: budget.quantities.sand,
        unit: "cft",
        amount: budget.lines.find((line) => line.key === "sand")?.amount ?? 0,
      },
      {
        name: language === "bn" ? "খোয়া" : "Stone chips",
        qty: budget.quantities.stone,
        unit: "cft",
        amount: budget.lines.find((line) => line.key === "stone")?.amount ?? 0,
      },
      {
        name: language === "bn" ? "ইট" : "Brick",
        qty: budget.quantities.brick,
        unit: "pcs",
        amount: budget.lines.find((line) => line.key === "brick")?.amount ?? 0,
      },
      {
        name: language === "bn" ? "শ্রম" : "Labor",
        qty: budget.quantities.labor,
        unit: "sft",
        amount: budget.lines.find((line) => line.key === "labor")?.amount ?? 0,
      },
    ],
    [budget, language],
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

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <h2 className="mb-4 text-xl font-semibold">{language === "bn" ? "এস্টিমেট প্রিন্ট সেটআপ" : "Estimate print setup"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {language === "bn" ? "রেফারেন্স নং" : "Ref no"}
            <input value={estimateRefNo} onChange={(e) => setEstimateRefNo(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {language === "bn" ? "তারিখ" : "Date"}
            <input type="date" value={estimateDate} onChange={(e) => setEstimateDate(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {language === "bn" ? "ক্লায়েন্টের নাম" : "Client name"}
            <input value={estimateClient} onChange={(e) => setEstimateClient(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {language === "bn" ? "প্রজেক্টের নাম" : "Project name"}
            <input value={estimateProject} onChange={(e) => setEstimateProject(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            {language === "bn" ? "প্যাড টেমপ্লেট" : "Pad template"}
            <select value={printTemplate} onChange={(e) => setPrintTemplate(e.target.value as PrintTemplateMode)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="pad-a">{language === "bn" ? "টেমপ্লেট A (ক্লাসিক হেডার)" : "Template A (classic header)"}</option>
              <option value="pad-b">{language === "bn" ? "টেমপ্লেট B (সাইড-অ্যাকসেন্ট)" : "Template B (side accent)"}</option>
            </select>
          </label>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 md:col-span-2">
            {language === "bn"
              ? "Admin > Documents থেকে Pad template A/B ক্যাটাগরিতে ইমেজ আপলোড করুন। সেগুলো প্রিন্ট হেডারে রেফারেন্স হিসেবে দেখানো হবে।"
              : "Upload images in Admin > Documents under Pad template A/B categories. Those images are used as print-header references."}
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="mt-4 rounded-md bg-blue-900 px-4 py-2 font-semibold text-white">
          {language === "bn" ? "প্রিন্ট প্রিভিউ / প্রিন্ট" : "Print preview / Print"}
        </button>
      </section>

      <section
        className={`estimate-print-root mb-6 rounded-xl border bg-white p-6 shadow-sm ${
          printTemplate === "pad-a" ? "border-slate-200" : "border-blue-300"
        }`}
      >
        <div className={`mb-4 ${printTemplate === "pad-b" ? "border-l-4 border-blue-700 pl-4" : ""}`}>
          {(printTemplate === "pad-a" ? padTemplateA : padTemplateB)?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(printTemplate === "pad-a" ? padTemplateA : padTemplateB)?.url}
              alt={language === "bn" ? "প্যাড হেডার রেফারেন্স" : "Pad header reference"}
              className="mb-3 max-h-36 w-full rounded object-contain"
            />
          )}
          <h2 className="text-xl font-bold">{company?.companyName ?? "EngineerNest"}</h2>
          <p className="text-sm text-slate-600">{company ? pick(language, company.tagline) : ""}</p>
        </div>

        <div className="mb-4 grid gap-2 text-sm md:grid-cols-2">
          <p><strong>{language === "bn" ? "রেফ নং:" : "Ref no:"}</strong> {estimateRefNo}</p>
          <p><strong>{language === "bn" ? "তারিখ:" : "Date:"}</strong> {estimateDate}</p>
          <p><strong>{language === "bn" ? "ক্লায়েন্ট:" : "Client:"}</strong> {estimateClient || "-"}</p>
          <p><strong>{language === "bn" ? "প্রজেক্ট:" : "Project:"}</strong> {estimateProject || "-"}</p>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-2 py-2 text-left">{language === "bn" ? "আইটেম" : "Item"}</th>
              <th className="border border-slate-300 px-2 py-2 text-right">{language === "bn" ? "পরিমাণ" : "Qty"}</th>
              <th className="border border-slate-300 px-2 py-2 text-right">{language === "bn" ? "রেট" : "Rate"}</th>
              <th className="border border-slate-300 px-2 py-2 text-right">{language === "bn" ? "পরিমাণ (৳)" : "Amount (৳)"}</th>
            </tr>
          </thead>
          <tbody>
            {printLineItems.map((line) => (
              <tr key={line.name}>
                <td className="border border-slate-300 px-2 py-2">{line.name}</td>
                <td className="border border-slate-300 px-2 py-2 text-right">{line.qty.toFixed(2)} {line.unit}</td>
                <td className="border border-slate-300 px-2 py-2 text-right">৳ {(line.qty ? line.amount / line.qty : 0).toFixed(2)}</td>
                <td className="border border-slate-300 px-2 py-2 text-right">৳ {Math.round(line.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-sm space-y-1 text-sm">
          <p className="flex justify-between"><span>{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span><strong>৳ {Math.round(budget.subtotal).toLocaleString()}</strong></p>
          <p className="flex justify-between"><span>{language === "bn" ? "প্রফিট" : "Profit"} ({config.markupPercent}%)</span><strong>৳ {Math.round(budget.markup).toLocaleString()}</strong></p>
          <p className="flex justify-between"><span>{language === "bn" ? "ভ্যাট" : "VAT"} ({config.vatPercent}%)</span><strong>৳ {Math.round(budget.vat).toLocaleString()}</strong></p>
          <p className="flex justify-between border-t border-slate-300 pt-2 text-base"><span>{language === "bn" ? "গ্র্যান্ড টোটাল" : "Grand total"}</span><strong>৳ {Math.round(budget.total).toLocaleString()}</strong></p>
        </div>

        <div className="mt-8 grid gap-6 text-sm md:grid-cols-2">
          <p className="rounded-md bg-amber-50 p-3 text-amber-900">
            {language === "bn"
              ? "এই এস্টিমেটটি প্রাথমিক। চূড়ান্ত পরিমাণ, সাইট কন্ডিশন ও কোড কমপ্লায়েন্স অবশ্যই যোগ্য প্রকৌশলী যাচাই করবেন।"
              : "This estimate is preliminary only. Final quantity, site conditions, and code compliance must be verified by a qualified engineer."}
          </p>
          <div className="pt-10 text-right">
            <div className="inline-block border-t border-slate-400 px-6 pt-1">
              {language === "bn" ? "স্বাক্ষর / অথরাইজড" : "Signature / Authorized"}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-blue-950">
                {language === "bn" ? "কাস্টম এস্টিমেট সাব-সেকশন" : "Custom estimate sub-section"}
              </h2>
              <p className="mt-1 text-sm text-blue-900">
                {language === "bn"
                  ? "যেকোনো আইটেম/সেকশন যোগ-বিয়োগ ও ফ্রি এডিট করে প্রিন্টযোগ্য কাস্টম এস্টিমেট তৈরি করতে Custom Estimator ব্যবহার করুন।"
                  : "Use Custom Estimator for fully flexible add/remove/edit line items and clean printable estimates."}
              </p>
            </div>
            <Link
              href="/admin/estimator"
              className="inline-flex rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {language === "bn" ? "কাস্টম এস্টিমেটর খুলুন" : "Open Custom Estimator"}
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-green-950">
                {language === "bn" ? "ইঞ্জিনিয়ারিং এস্টিমেটর (BNBC-2020)" : "Engineering Estimator (BNBC-2020)"}
              </h2>
              <p className="mt-1 text-sm text-green-900">
                {language === "bn"
                  ? "স্ল্যাব, বিম ও কলামের রড, সিমেন্ট, বালু ও খোয়ার BNBC-2020 ভিত্তিক পরিমাণ নির্ণয় করুন।"
                  : "Calculate slab, beam & column quantities (rod, cement, sand, stone) using BNBC-2020-informed logic."}
              </p>
            </div>
            <Link
              href="/admin/engineering-estimator"
              className="inline-flex rounded-md bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              {language === "bn" ? "ইঞ্জিনিয়ারিং এস্টিমেটর খুলুন" : "Open Engineering Estimator"}
            </Link>
          </div>
        </div>
      </section>

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

      {/* ══════════════════════════════════════════════════════════════════
          TAB: Earthwork / মাটি কাটার কাজ
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "earthwork" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">
            {language === "bn" ? "আর্থওয়ার্ক / মাটি কাটার কাজ" : "Earthwork / Excavation"}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            {language === "bn"
              ? "BNBC-aware সাইট গাইডলাইন ধরে প্রাথমিক earthwork quantity ও cost সহায়তা। চূড়ান্ত পরিমাপ ও method statement প্রকৌশলী দ্বারা নিশ্চিত করুন।"
              : "BNBC-aware site guidance based preliminary earthwork quantity and cost support. Final measurements and method statements must be verified by an engineer."}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "সাব-সেকশন" : "Subsection"}
                <select
                  value={earthworkSection}
                  onChange={(e) => setEarthworkSection(e.target.value as EarthworkSection)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  {EARTHWORK_SECTIONS.map((section) => (
                    <option key={section.key} value={section.key}>
                      {pick(language, section.label)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "ইউনিট সিস্টেম" : "Unit system"}
                  <select
                    value={earthworkUnitSystem}
                    onChange={(e) => setEarthworkUnitSystem(e.target.value as EarthworkUnitSystem)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option value="metric">{language === "bn" ? "মেট্রিক" : "Metric"}</option>
                    <option value="imperial">{language === "bn" ? "ইম্পেরিয়াল" : "Imperial"}</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "ইনপুট মোড" : "Input mode"}
                  <select
                    value={earthworkMode}
                    onChange={(e) => setEarthworkMode(e.target.value as EarthworkInputMode)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option value="lwd">{language === "bn" ? "দৈর্ঘ্য × প্রস্থ × গভীরতা" : "Length × Width × Depth"}</option>
                    <option value="areaDepth">{language === "bn" ? "এরিয়া × গভীরতা" : "Area × Depth"}</option>
                    <option value="repeated">{language === "bn" ? "একাধিক ইউনিট" : "Repeated / multiple units"}</option>
                    <option value="manual">{language === "bn" ? "ম্যানুয়াল মোট ভলিউম" : "Manual total volume"}</option>
                  </select>
                </label>
              </div>

              {earthworkMode === "lwd" && (
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "দৈর্ঘ্য" : "Length"}
                    <input type="number" min={0} value={earthworkLength} onChange={(e) => setEarthworkLength(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "প্রস্থ" : "Width"}
                    <input type="number" min={0} value={earthworkWidth} onChange={(e) => setEarthworkWidth(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "গভীরতা" : "Depth"}
                    <input type="number" min={0} value={earthworkDepth} onChange={(e) => setEarthworkDepth(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                </div>
              )}
              {earthworkMode === "areaDepth" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "এরিয়া" : "Area"}
                    <input type="number" min={0} value={earthworkArea} onChange={(e) => setEarthworkArea(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "গভীরতা" : "Depth"}
                    <input type="number" min={0} value={earthworkDepth} onChange={(e) => setEarthworkDepth(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                </div>
              )}
              {earthworkMode === "repeated" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "ইউনিট সংখ্যা" : "Number of units"}
                    <input type="number" min={0} value={earthworkRepeatedUnits} onChange={(e) => setEarthworkRepeatedUnits(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    {language === "bn" ? "প্রতি ইউনিট ভলিউম" : "Volume per unit"}
                    <input type="number" min={0} value={earthworkVolumePerUnit} onChange={(e) => setEarthworkVolumePerUnit(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>
                </div>
              )}
              {earthworkMode === "manual" && (
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "মোট ভলিউম (ম্যানুয়াল)" : "Manual total volume"}
                  <input type="number" min={0} value={earthworkManualVolume} onChange={(e) => setEarthworkManualVolume(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "মাটির ধরন" : "Soil type"}
                  <select
                    value={earthworkSoilType}
                    onChange={(e) => {
                      const nextSoilType = e.target.value;
                      setEarthworkSoilType(nextSoilType);
                      const soil = EARTHWORK_SOIL_TYPES.find((item) => item.key === nextSoilType);
                      if (soil) {
                        setEarthworkSwellFactor(soil.swellFactor);
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {EARTHWORK_SOIL_TYPES.map((soil) => (
                      <option key={soil.key} value={soil.key}>{pick(language, soil.label)}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "লেবার মোড" : "Labor mode"}
                  <select
                    value={earthworkLaborMode}
                    onChange={(e) => setEarthworkLaborMode(e.target.value as EarthworkLaborMode)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option value="manual">{language === "bn" ? "ম্যানুয়াল" : "Manual"}</option>
                    <option value="machine">{language === "bn" ? "মেশিন" : "Machine"}</option>
                    <option value="mixed">{language === "bn" ? "মিক্সড" : "Mixed"}</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "Swell / loose factor" : "Swell / loose factor"}
                  <input type="number" min={1} step={0.01} value={earthworkSwellFactor} onChange={(e) => setEarthworkSwellFactor(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "Compaction factor" : "Compaction factor"}
                  <input type="number" min={0.5} max={1} step={0.01} value={earthworkCompactionFactor} onChange={(e) => setEarthworkCompactionFactor(Math.min(1, Math.max(0.5, Number(e.target.value))))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "Side slope allowance (%)" : "Side slope allowance (%)"}
                  <input type="number" min={0} step={0.1} value={earthworkSideSlopePercent} onChange={(e) => setEarthworkSideSlopePercent(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {language === "bn" ? "Backfill (%)" : "Backfill (%)"}
                  <input type="number" min={0} max={100} step={0.1} value={earthworkBackfillPercent} onChange={(e) => setEarthworkBackfillPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {language === "bn"
                  ? "রেট/ফ্যাক্টরগুলো admin Rates & Config থেকে সেট করা যায়। এখানে প্রয়োজনে কাজভিত্তিক মান এডিট করতে পারবেন।"
                  : "Rates/factors can be set in admin Rates & Config. You can still edit them here per-job as needed."}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  {language === "bn" ? "ভলিউম সারাংশ (প্রাথমিক অনুমান)" : "Volume summary (preliminary estimate)"}
                </h3>
                <ResultRow label={language === "bn" ? "গ্রস এক্সকাভেশন ভলিউম" : "Gross excavation volume"} value={volumeToUi(earthwork.grossExcavationVolumeM3)} unit={volumeUnit} />
                <ResultRow label={language === "bn" ? "সাইড স্লোপসহ ভলিউম" : "Adjusted excavation volume"} value={volumeToUi(earthwork.adjustedExcavationVolumeM3)} unit={volumeUnit} />
                <ResultRow label={language === "bn" ? "লুজ মাটি ভলিউম" : "Loose soil volume"} value={volumeToUi(earthwork.looseSoilVolumeM3)} unit={volumeUnit} />
                <ResultRow label={language === "bn" ? "ব্যাকফিল ভলিউম" : "Backfill volume"} value={volumeToUi(earthwork.backfillVolumeM3)} unit={volumeUnit} />
                <ResultRow label={language === "bn" ? "ডিসপোজাল পরিমাণ" : "Disposal quantity"} value={volumeToUi(earthwork.disposalQuantityM3)} unit={volumeUnit} />
                <ResultRow label={language === "bn" ? "আনুমানিক ট্রিপ" : "Estimated trips"} value={earthwork.estimatedTrips} unit={language === "bn" ? "ট্রিপ" : "trips"} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "খনন রেট (৳/m³)" : "Excavation rate (৳/m³)"}
                  <input type="number" min={0} step={0.1} value={earthworkExcavationRate} onChange={(e) => setEarthworkExcavationRate(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "ব্যাকফিল রেট (৳/m³)" : "Backfill rate (৳/m³)"}
                  <input type="number" min={0} step={0.1} value={earthworkBackfillRate} onChange={(e) => setEarthworkBackfillRate(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "ডিসপোজাল/ট্রান্সপোর্ট রেট (৳/m³)" : "Disposal/transport rate (৳/m³)"}
                  <input type="number" min={0} step={0.1} value={earthworkDisposalRate} onChange={(e) => setEarthworkDisposalRate(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {language === "bn" ? "ডিসপোজাল দূরত্ব (km)" : "Disposal distance (km)"}
                  <input type="number" min={0} step={0.1} value={earthworkDisposalDistanceKm} onChange={(e) => setEarthworkDisposalDistanceKm(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                {language === "bn" ? "ট্রাক ক্যাপাসিটি (m³)" : "Truck capacity (m³)"}
                <input type="number" min={0} step={0.1} value={earthworkTruckCapacityM3} onChange={(e) => setEarthworkTruckCapacityM3(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>

              <div className="rounded-lg bg-blue-900 p-4 text-sm text-white">
                <h3 className="mb-2 font-semibold">
                  {language === "bn" ? "আনুমানিক খরচ সারাংশ" : "Approximate costing summary"}
                </h3>
                <CostRow label={language === "bn" ? "খনন" : "Excavation"} amount={earthwork.costs.excavationCost} />
                <CostRow label={language === "bn" ? "ব্যাকফিলিং" : "Backfilling"} amount={earthwork.costs.backfillCost} />
                <CostRow label={language === "bn" ? "ডিসপোজাল/ট্রান্সপোর্ট" : "Disposal/transport"} amount={earthwork.costs.disposalCost} />
                <CostRow label={language === "bn" ? "লেবার মোড অ্যাডজাস্টমেন্ট" : "Labor mode adjustment"} amount={earthwork.costs.laborAdjustedCost} />
                <p className="mt-3 border-t border-blue-700 pt-2 text-base font-bold">
                  {language === "bn" ? "মোট আর্থওয়ার্ক খরচ" : "Total earthwork cost"}: ৳ {Math.round(earthwork.costs.totalCost).toLocaleString()}
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
