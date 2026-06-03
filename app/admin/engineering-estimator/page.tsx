"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import {
  calcSlab,
  calcBeam,
  calcColumn,
  lapLengthReference,
  ENGINEERING_MIX_PRESETS,
  CLEAR_COVER_DEFAULTS_MM,
  ftToM,
  mToFt,
  sftToM2,
  m2ToSft,
  cftToM3,
  m3ToCft,
  rodWeightKgFt,
  rodWeightKgM,
  type EngineeringMixKey,
  type SlabInput,
  type BeamInput,
  type ColumnInput,
  type SlabMode,
  type AggregateType,
  type SteelGrade,
  type SeismicMode,
} from "@/lib/calculations/engineering";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "slab" | "beam" | "column" | "converter";

const TABS: Array<{ key: TabKey; label: { en: string; bn: string } }> = [
  { key: "slab",      label: { en: "Slab",              bn: "ছাদ / স্ল্যাব"       } },
  { key: "beam",      label: { en: "Beam",              bn: "বিম"                  } },
  { key: "column",    label: { en: "Column",            bn: "কলাম"                 } },
  { key: "converter", label: { en: "Unit Converter",    bn: "একক রূপান্তর"         } },
];

const MIX_KEYS: EngineeringMixKey[] = ["M25", "M20", "M15", "M10"];

const escapeHtml = (v: string) =>
  v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
   .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const fmt2 = (n: number) => n.toFixed(2);
const fmt1 = (n: number) => n.toFixed(1);
const fmt0 = (n: number) => Math.round(n).toLocaleString();

// ─── Small helpers ────────────────────────────────────────────────────────────

function Row({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  const display = typeof value === "number" ? (value < 10 ? fmt2(value) : fmt0(value)) : value;
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1.5 text-sm last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold tabular-nums">
        {display}{unit ? <span className="ml-1 font-normal text-slate-400">{unit}</span> : null}
      </span>
    </div>
  );
}

function WarnBox({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="mb-1 font-semibold">⚠ Engineering Notes / Warnings</p>
      <ul className="list-inside list-disc space-y-1">
        {warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    >
      {children}
    </select>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-blue-900">{title}</h3>
      {children}
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────

const DISCLAIMER_EN =
  "DISCLAIMER: All outputs are for preliminary quantity estimation and BNBC-2020-informed engineering guidance only. " +
  "They must be reviewed and verified by a qualified licensed structural engineer before use in any construction activity. " +
  "EngineerNest and its operators accept no liability for decisions made solely based on these estimates.";

const DISCLAIMER_BN =
  "দায়মুক্তি বিবৃতি: সমস্ত আউটপুট শুধুমাত্র প্রাথমিক পরিমাণ অনুমান এবং BNBC-2020-ভিত্তিক ইঞ্জিনিয়ারিং গাইডেন্সের জন্য। " +
  "যেকোনো নির্মাণ কাজে ব্যবহারের আগে একজন যোগ্য লাইসেন্সপ্রাপ্ত স্ট্রাকচারাল ইঞ্জিনিয়ার দ্বারা যাচাই করা আবশ্যক।";

// ─── Print helper ─────────────────────────────────────────────────────────────

function buildPrintHtml(title: string, sections: Array<{ heading: string; rows: Array<{ label: string; value: string }> }>, warnings: string[], disclaimer: string): string {
  const sectionHtml = sections
    .map(
      (sec) =>
        `<h3 style="margin:12px 0 4px;font-size:14px;color:#1e3a8a">${escapeHtml(sec.heading)}</h3>` +
        `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px">` +
        sec.rows
          .map(
            (r) =>
              `<tr><td style="border:1px solid #cbd5e1;padding:4px 8px;width:55%">${escapeHtml(r.label)}</td>` +
              `<td style="border:1px solid #cbd5e1;padding:4px 8px;text-align:right;font-weight:600">${escapeHtml(r.value)}</td></tr>`
          )
          .join("") +
        `</table>`
    )
    .join("");

  const warnHtml =
    warnings.length > 0
      ? `<div style="margin-top:12px;padding:10px;background:#fffbeb;border:1px solid #fbbf24;border-radius:4px;font-size:11px;color:#92400e">` +
        `<strong>Engineering Notes / Warnings:</strong><ul style="margin:4px 0 0 16px;padding:0">` +
        warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("") +
        `</ul></div>`
      : "";

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<style>
  body{font-family:Arial,sans-serif;color:#0f172a;margin:24px;font-size:13px}
  h1{margin:0 0 4px;font-size:18px} h2{margin:0 0 16px;font-size:13px;color:#475569;font-weight:normal}
  .disclaimer{margin-top:16px;padding:8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:4px;font-size:10px;color:#713f12}
</style></head><body>
<h1>EngineerNest – Engineering Estimator</h1>
<h2>${escapeHtml(title)}</h2>
${sectionHtml}
${warnHtml}
<div class="disclaimer"><strong>DISCLAIMER:</strong> ${escapeHtml(disclaimer)}</div>
</body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLAB FORM
// ═══════════════════════════════════════════════════════════════════════════════

function SlabForm({ language }: { language: Locale }) {
  const [length, setLength]           = useState(20);
  const [width, setWidth]             = useState(15);
  const [thickness, setThickness]     = useState(5);
  const [floors, setFloors]           = useState(1);
  const [lengthUnit, setLengthUnit]   = useState<"ft" | "m">("ft");
  const [thicknessUnit, setThickUnit] = useState<"inch" | "mm">("inch");
  const [slabMode, setSlabMode]       = useState<SlabMode>("two-way");
  const [aggregateType]               = useState<AggregateType>("stone");
  const [mixKey, setMixKey]           = useState<EngineeringMixKey>("M20");
  const [wastage, setWastage]         = useState(5);
  const [mainDiam, setMainDiam]       = useState(12);
  const [mainSpacing, setMainSpacing] = useState(150);
  const [binderDiam, setBinderDiam]   = useState(10);
  const [binderSpacing, setBSpacing]  = useState(200);
  const [steelGrade, setSteelGrade]   = useState<SteelGrade>("Grade420");
  const [coverMm, setCoverMm]         = useState<number>(CLEAR_COVER_DEFAULTS_MM.slabInterior);

  const result = useMemo<SlabInput & { result: ReturnType<typeof calcSlab> }>(() => {
    const input: SlabInput = {
      length, width, thickness, lengthUnit, thicknessUnit,
      floors, slabMode, aggregateType, mixKey, wastagePercent: wastage,
      mainBarDiamMm: mainDiam, mainBarSpacingMm: mainSpacing,
      binderBarDiamMm: binderDiam, binderBarSpacingMm: binderSpacing,
      steelGrade, clearCoverMm: coverMm,
    };
    return { ...input, result: calcSlab(input) };
  }, [length, width, thickness, lengthUnit, thicknessUnit, floors, slabMode, aggregateType, mixKey, wastage, mainDiam, mainSpacing, binderDiam, binderSpacing, steelGrade, coverMm]);

  const r = result.result;

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const sections = [
      {
        heading: "Slab Inputs",
        rows: [
          { label: "Dimensions", value: `${length} × ${width} ${lengthUnit}` },
          { label: "Thickness",  value: `${thickness} ${thicknessUnit}` },
          { label: "Floors",     value: `${floors}` },
          { label: "Mode",       value: slabMode },
          { label: "Mix",        value: mixKey },
        ],
      },
      {
        heading: "Concrete Quantities (per floor)",
        rows: [
          { label: "Wet volume",    value: `${fmt2(r.wetVolumeM3)} m³` },
          { label: "Dry volume",    value: `${fmt2(r.dryVolumeM3)} m³` },
          { label: "Cement",        value: `${fmt1(r.cementBags)} bags` },
          { label: "Sand",          value: `${fmt2(r.sandM3)} m³ (${fmt1(r.sandCft)} cft)` },
          { label: "Stone/Agg.",    value: `${fmt2(r.stoneM3)} m³ (${fmt1(r.stoneCft)} cft)` },
        ],
      },
      {
        heading: `Total (× ${floors} floor${floors > 1 ? "s" : ""})`,
        rows: [
          { label: "Total wet volume", value: `${fmt2(r.totalWetVolumeM3)} m³` },
          { label: "Total cement",     value: `${fmt1(r.totalCementBags)} bags` },
          { label: "Total sand",       value: `${fmt1(r.totalSandCft)} cft` },
          { label: "Total stone/agg.", value: `${fmt1(r.totalStoneCft)} cft` },
          { label: "Total steel (w/ wastage)", value: `${fmt1(r.totalSteelKg)} kg` },
        ],
      },
    ];
    w.document.write(buildPrintHtml("Slab Estimate", sections, r.warnings, DISCLAIMER_EN));
    w.document.close();
    w.print();
  };

  const bn = language === "bn";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title={bn ? "ইনপুট — মাত্রা" : "Input — Dimensions"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "দৈর্ঘ্য" : "Length"}</Label>
                <Input type="number" min={1} value={length} onChange={(e) => setLength(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "প্রস্থ" : "Width"}</Label>
                <Input type="number" min={1} value={width} onChange={(e) => setWidth(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{bn ? "একক" : "Length unit"}</Label>
              <Select value={lengthUnit} onChange={(e) => setLengthUnit(e.target.value as "ft" | "m")}>
                <option value="ft">Feet (ft)</option>
                <option value="m">Metres (m)</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "পুরুত্ব" : "Thickness"}</Label>
                <Input type="number" min={1} value={thickness} onChange={(e) => setThickness(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "পুরুত্ব একক" : "Thickness unit"}</Label>
                <Select value={thicknessUnit} onChange={(e) => setThickUnit(e.target.value as "inch" | "mm")}>
                  <option value="inch">Inches</option>
                  <option value="mm">mm</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>{bn ? "তলার সংখ্যা" : "Number of floors"}</Label>
              <Input type="number" min={1} value={floors} onChange={(e) => setFloors(Math.max(1, +e.target.value))} />
            </div>
            <div>
              <Label>{bn ? "স্ল্যাব মোড" : "Slab mode"}</Label>
              <Select value={slabMode} onChange={(e) => setSlabMode(e.target.value as SlabMode)}>
                <option value="two-way">{bn ? "দুই-দিক (Two-way)" : "Two-way"}</option>
                <option value="one-way">{bn ? "এক-দিক (One-way)" : "One-way"}</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — কংক্রিট" : "Input — Concrete"}>
          <div className="space-y-3">
            <div>
              <Label>{bn ? "মিক্স অনুপাত" : "Mix ratio"}</Label>
              <Select value={mixKey} onChange={(e) => setMixKey(e.target.value as EngineeringMixKey)}>
                {MIX_KEYS.map((k) => (
                  <option key={k} value={k}>{pick(language, ENGINEERING_MIX_PRESETS[k].label)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{bn ? "ওয়েস্টেজ %" : "Wastage %"}</Label>
              <Input type="number" min={0} max={30} value={wastage} onChange={(e) => setWastage(+e.target.value)} />
            </div>
            <div>
              <Label>{bn ? "ক্লিয়ার কভার (mm)" : "Clear cover (mm)"}</Label>
              <Input type="number" min={10} value={coverMm} onChange={(e) => setCoverMm(+e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">{bn ? "ডিফল্ট: স্ল্যাব ইন্টেরিয়র ২০ মিমি" : "Default: slab interior 20 mm"}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — রড" : "Input — Reinforcement"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "মেইন বার Ø (mm)" : "Main bar Ø (mm)"}</Label>
                <Input type="number" min={6} value={mainDiam} onChange={(e) => setMainDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "মেইন স্পেসিং (mm)" : "Main spacing (mm)"}</Label>
                <Input type="number" min={50} value={mainSpacing} onChange={(e) => setMainSpacing(+e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "বাইন্ডার Ø (mm)" : "Binder Ø (mm)"}</Label>
                <Input type="number" min={6} value={binderDiam} onChange={(e) => setBinderDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "বাইন্ডার স্পেসিং (mm)" : "Binder spacing (mm)"}</Label>
                <Input type="number" min={50} value={binderSpacing} onChange={(e) => setBSpacing(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{bn ? "স্টিল গ্রেড" : "Steel grade"}</Label>
              <Select value={steelGrade} onChange={(e) => setSteelGrade(e.target.value as SteelGrade)}>
                <option value="Grade275">Grade 275 (40 ksi)</option>
                <option value="Grade350">Grade 350 (50 ksi)</option>
                <option value="Grade420">Grade 420 (60 ksi) — ASTM A615</option>
                <option value="Grade500">Grade 500 (72 ksi)</option>
              </Select>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={bn ? "ফলাফল — প্রতি তলা" : "Results — Per Floor"}>
          <Row label={bn ? "ওয়েট ভলিউম" : "Wet volume"}    value={r.wetVolumeM3}    unit="m³" />
          <Row label={bn ? "ড্রাই ভলিউম" : "Dry volume"}    value={r.dryVolumeM3}    unit="m³" />
          <Row label={bn ? "সিমেন্ট" : "Cement"}            value={r.cementBags}      unit="bags" />
          <Row label={bn ? "বালু" : "Sand"}                  value={r.sandCft}         unit="cft" />
          <Row label={bn ? "পাথর/খোয়া" : "Stone/aggregate"} value={r.stoneCft}        unit="cft" />
          <Row label={bn ? "মেইন বার দৈর্ঘ্য" : "Main bar length"}    value={r.mainBarLengthM}   unit="m" />
          <Row label={bn ? "মেইন বার ওজন" : "Main bar weight"}        value={r.mainBarWeightKg}  unit="kg" />
          <Row label={bn ? "বাইন্ডার দৈর্ঘ্য" : "Binder bar length"} value={r.binderBarLengthM} unit="m" />
          <Row label={bn ? "বাইন্ডার ওজন" : "Binder bar weight"}      value={r.binderBarWeightKg} unit="kg" />
          <Row label={bn ? `মোট স্টিল (ওয়েস্টেজ ${wastage}%)` : `Total steel (wastage ${wastage}%)`} value={r.totalSteelKgPerFloor} unit="kg" />
        </SectionCard>

        <SectionCard title={bn ? `মোট ফলাফল — ${floors} তলা` : `Total Results — ${floors} Floor${floors > 1 ? "s" : ""}`}>
          <Row label={bn ? "মোট ওয়েট ভলিউম" : "Total wet volume"}    value={r.totalWetVolumeM3}  unit="m³" />
          <Row label={bn ? "মোট ড্রাই ভলিউম" : "Total dry volume"}    value={r.totalDryVolumeM3}  unit="m³" />
          <Row label={bn ? "মোট সিমেন্ট" : "Total cement"}            value={r.totalCementBags}   unit="bags" />
          <Row label={bn ? "মোট বালু" : "Total sand"}                  value={r.totalSandCft}      unit="cft" />
          <Row label={bn ? "মোট পাথর" : "Total stone"}                 value={r.totalStoneCft}     unit="cft" />
          <Row label={bn ? "মোট স্টিল" : "Total steel"}               value={r.totalSteelKg}      unit="kg" />
        </SectionCard>
      </div>

      <WarnBox warnings={r.warnings} />

      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {bn ? "প্রিন্ট করুন" : "Print estimate"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEAM FORM
// ═══════════════════════════════════════════════════════════════════════════════

function BeamForm({ language }: { language: Locale }) {
  const [widthMm, setWidthMm]             = useState(230);
  const [depthMm, setDepthMm]             = useState(450);
  const [lengthM, setLengthM]             = useState(5);
  const [mixKey, setMixKey]               = useState<EngineeringMixKey>("M20");
  const [wastage, setWastage]             = useState(5);
  const [fcMpa, setFcMpa]                 = useState(20);
  const [fyMpa, setFyMpa]                 = useState(420);
  const [topDiam, setTopDiam]             = useState(16);
  const [topCount, setTopCount]           = useState(2);
  const [botDiam, setBotDiam]             = useState(16);
  const [botCount, setBotCount]           = useState(3);
  const [stirDiam, setStirDiam]           = useState(10);
  const [stirSpacing, setStirSpacing]     = useState(150);
  const [seismicMode, setSeismicMode]     = useState<SeismicMode>("ordinary");
  const [coverMm, setCoverMm]             = useState<number>(CLEAR_COVER_DEFAULTS_MM.beamInterior);

  const r = useMemo(() => {
    const input: BeamInput = {
      widthMm, depthMm, lengthM, mixKey, wastagePercent: wastage,
      fcMpa, fyMpa, topBarDiamMm: topDiam, topBarCount: topCount,
      botBarDiamMm: botDiam, botBarCount: botCount,
      stirrupDiamMm: stirDiam, stirrupSpacingMm: stirSpacing,
      seismicMode, clearCoverMm: coverMm,
    };
    return calcBeam(input);
  }, [widthMm, depthMm, lengthM, mixKey, wastage, fcMpa, fyMpa, topDiam, topCount, botDiam, botCount, stirDiam, stirSpacing, seismicMode, coverMm]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const sections = [
      {
        heading: "Beam Inputs",
        rows: [
          { label: "Size (w × d)", value: `${widthMm} × ${depthMm} mm` },
          { label: "Length",       value: `${lengthM} m` },
          { label: "Mix",          value: mixKey },
          { label: "fc' / fy",     value: `${fcMpa} MPa / ${fyMpa} MPa` },
          { label: "Seismic mode", value: seismicMode },
        ],
      },
      {
        heading: "Concrete",
        rows: [
          { label: "Wet volume",  value: `${fmt2(r.wetVolumeM3)} m³` },
          { label: "Dry volume",  value: `${fmt2(r.dryVolumeM3)} m³` },
          { label: "Cement",      value: `${fmt1(r.cementBags)} bags` },
          { label: "Sand",        value: `${fmt1(r.sandCft)} cft` },
          { label: "Stone/agg.",  value: `${fmt1(r.stoneCft)} cft` },
        ],
      },
      {
        heading: "Steel",
        rows: [
          { label: "Top bars",           value: `${fmt1(r.topBarWeightKg)} kg` },
          { label: "Bottom bars",        value: `${fmt1(r.botBarWeightKg)} kg` },
          { label: "Stirrups",           value: `${fmt1(r.stirrupWeightKg)} kg (${r.stirrupCount} pcs)` },
          { label: "Total steel (w/ wastage)", value: `${fmt1(r.totalSteelKg)} kg` },
          { label: "ρ_min / ρ_provided", value: `${(r.rhoMin * 100).toFixed(3)}% / ${(r.rhoProvided * 100).toFixed(3)}%` },
        ],
      },
    ];
    w.document.write(buildPrintHtml("Beam Estimate", sections, r.warnings, DISCLAIMER_EN));
    w.document.close();
    w.print();
  };

  const bn = language === "bn";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title={bn ? "ইনপুট — মাত্রা" : "Input — Dimensions"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "প্রস্থ (mm)" : "Width (mm)"}</Label>
                <Input type="number" min={100} value={widthMm} onChange={(e) => setWidthMm(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "গভীরতা (mm)" : "Depth (mm)"}</Label>
                <Input type="number" min={150} value={depthMm} onChange={(e) => setDepthMm(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{bn ? "মোট দৈর্ঘ্য (m)" : "Total length (m)"}</Label>
              <Input type="number" min={0.5} step={0.5} value={lengthM} onChange={(e) => setLengthM(+e.target.value)} />
            </div>
            <div>
              <Label>{bn ? "ক্লিয়ার কভার (mm)" : "Clear cover (mm)"}</Label>
              <Input type="number" min={10} value={coverMm} onChange={(e) => setCoverMm(+e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — কংক্রিট" : "Input — Concrete"}>
          <div className="space-y-3">
            <div>
              <Label>{bn ? "মিক্স অনুপাত" : "Mix ratio"}</Label>
              <Select value={mixKey} onChange={(e) => setMixKey(e.target.value as EngineeringMixKey)}>
                {MIX_KEYS.map((k) => (
                  <option key={k} value={k}>{pick(language, ENGINEERING_MIX_PRESETS[k].label)}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>fc&apos; (MPa)</Label>
                <Input type="number" min={10} value={fcMpa} onChange={(e) => setFcMpa(+e.target.value)} />
              </div>
              <div>
                <Label>fy (MPa)</Label>
                <Input type="number" min={250} value={fyMpa} onChange={(e) => setFyMpa(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{bn ? "ওয়েস্টেজ %" : "Wastage %"}</Label>
              <Input type="number" min={0} max={30} value={wastage} onChange={(e) => setWastage(+e.target.value)} />
            </div>
            <div>
              <Label>{bn ? "সিজমিক মোড" : "Seismic mode"}</Label>
              <Select value={seismicMode} onChange={(e) => setSeismicMode(e.target.value as SeismicMode)}>
                <option value="ordinary">{bn ? "সাধারণ / নন-সিজমিক" : "Ordinary / Non-seismic"}</option>
                <option value="IMRF">IMRF (Intermediate MRF)</option>
                <option value="SMRF">SMRF (Special MRF)</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — রড" : "Input — Reinforcement"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "টপ বার Ø (mm)" : "Top bar Ø (mm)"}</Label>
                <Input type="number" min={8} value={topDiam} onChange={(e) => setTopDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "সংখ্যা" : "Count"}</Label>
                <Input type="number" min={1} value={topCount} onChange={(e) => setTopCount(+e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "বটম বার Ø (mm)" : "Bottom bar Ø (mm)"}</Label>
                <Input type="number" min={8} value={botDiam} onChange={(e) => setBotDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "সংখ্যা" : "Count"}</Label>
                <Input type="number" min={1} value={botCount} onChange={(e) => setBotCount(+e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "স্টিরাপ Ø (mm)" : "Stirrup Ø (mm)"}</Label>
                <Input type="number" min={6} value={stirDiam} onChange={(e) => setStirDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "স্পেসিং (mm)" : "Spacing (mm)"}</Label>
                <Input type="number" min={50} value={stirSpacing} onChange={(e) => setStirSpacing(+e.target.value)} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={bn ? "কংক্রিট ফলাফল" : "Concrete Results"}>
          <Row label={bn ? "ওয়েট ভলিউম" : "Wet volume"}    value={r.wetVolumeM3}   unit="m³" />
          <Row label={bn ? "ড্রাই ভলিউম" : "Dry volume"}    value={r.dryVolumeM3}   unit="m³" />
          <Row label={bn ? "সিমেন্ট" : "Cement"}            value={r.cementBags}     unit="bags" />
          <Row label={bn ? "বালু" : "Sand"}                  value={r.sandCft}        unit="cft" />
          <Row label={bn ? "পাথর/খোয়া" : "Stone/aggregate"} value={r.stoneCft}       unit="cft" />
        </SectionCard>

        <SectionCard title={bn ? "স্টিল ফলাফল" : "Steel Results"}>
          <Row label={bn ? "টপ বার ওজন" : "Top bar weight"}      value={r.topBarWeightKg}   unit="kg" />
          <Row label={bn ? "বটম বার ওজন" : "Bottom bar weight"}  value={r.botBarWeightKg}   unit="kg" />
          <Row label={bn ? "স্টিরাপ সংখ্যা" : "Stirrup count"}   value={r.stirrupCount}     unit="pcs" />
          <Row label={bn ? "স্টিরাপ দৈর্ঘ্য" : "Stirrup length"}  value={r.stirrupLengthM}  unit="m" />
          <Row label={bn ? "স্টিরাপ ওজন" : "Stirrup weight"}     value={r.stirrupWeightKg}  unit="kg" />
          <Row label={bn ? `মোট স্টিল (ওয়েস্টেজ ${wastage}%)` : `Total steel (wastage ${wastage}%)`} value={r.totalSteelKg} unit="kg" />
          <Row label="ρ_min / ρ_provided" value={`${(r.rhoMin * 100).toFixed(3)}% / ${(r.rhoProvided * 100).toFixed(3)}%`} />
        </SectionCard>
      </div>

      <WarnBox warnings={r.warnings} />

      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {bn ? "প্রিন্ট করুন" : "Print estimate"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLUMN FORM
// ═══════════════════════════════════════════════════════════════════════════════

function ColumnForm({ language }: { language: Locale }) {
  const [widthMm, setWidthMm]         = useState(300);
  const [depthMm, setDepthMm]         = useState(300);
  const [heightM, setHeightM]         = useState(3);
  const [mixKey, setMixKey]           = useState<EngineeringMixKey>("M20");
  const [wastage, setWastage]         = useState(5);
  const [mainDiam, setMainDiam]       = useState(16);
  const [mainCount, setMainCount]     = useState(4);
  const [tieDiam, setTieDiam]         = useState(8);
  const [tieSpacing, setTieSpacing]   = useState(150);
  const [seismicMode, setSeismicMode] = useState<SeismicMode>("ordinary");
  const [coverMm, setCoverMm]         = useState<number>(CLEAR_COVER_DEFAULTS_MM.columnInterior);

  const r = useMemo(() => {
    const input: ColumnInput = {
      widthMm, depthMm, heightM, mixKey, wastagePercent: wastage,
      mainBarDiamMm: mainDiam, mainBarCount: mainCount,
      tieDiamMm: tieDiam, tieSpacingMm: tieSpacing,
      seismicMode, clearCoverMm: coverMm,
    };
    return calcColumn(input);
  }, [widthMm, depthMm, heightM, mixKey, wastage, mainDiam, mainCount, tieDiam, tieSpacing, seismicMode, coverMm]);

  // Lap reference
  const lapRef = useMemo(() => lapLengthReference(mainDiam), [mainDiam]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const sections = [
      {
        heading: "Column Inputs",
        rows: [
          { label: "Size (w × d)",     value: `${widthMm} × ${depthMm} mm` },
          { label: "Height",           value: `${heightM} m` },
          { label: "Mix",              value: mixKey },
          { label: "Main bars",        value: `${mainCount} × Ø${mainDiam} mm` },
          { label: "Ties",             value: `Ø${tieDiam} @ ${tieSpacing} mm c/c` },
          { label: "Seismic mode",     value: seismicMode },
        ],
      },
      {
        heading: "Concrete",
        rows: [
          { label: "Wet volume",  value: `${fmt2(r.wetVolumeM3)} m³` },
          { label: "Dry volume",  value: `${fmt2(r.dryVolumeM3)} m³` },
          { label: "Cement",      value: `${fmt1(r.cementBags)} bags` },
          { label: "Sand",        value: `${fmt1(r.sandCft)} cft` },
          { label: "Stone/agg.",  value: `${fmt1(r.stoneCft)} cft` },
        ],
      },
      {
        heading: "Steel",
        rows: [
          { label: "Longitudinal bars",    value: `${fmt1(r.longBarWeightKg)} kg` },
          { label: "Ties",                 value: `${fmt1(r.tieWeightKg)} kg (${r.tieCount} pcs)` },
          { label: "Total steel (w/ wastage)", value: `${fmt1(r.totalSteelKg)} kg` },
          { label: "ρ_gross",              value: `${(r.rhoGross * 100).toFixed(2)}%` },
        ],
      },
      {
        heading: "Lap / Development Length Reference",
        rows: [
          { label: `Top bar tension Ld (Ø${mainDiam})`,    value: `${lapRef.topBarTensionLd} mm` },
          { label: `Bottom bar tension Ld`,                value: `${lapRef.bottomBarTensionLd} mm` },
          { label: `Compression Ld`,                      value: `${lapRef.compressionLd} mm` },
          { label: `Class A lap splice`,                  value: `${lapRef.classALapSplice} mm` },
          { label: `Class B lap splice`,                  value: `${lapRef.classBLapSplice} mm` },
        ],
      },
    ];
    w.document.write(buildPrintHtml("Column Estimate", sections, r.warnings, DISCLAIMER_EN));
    w.document.close();
    w.print();
  };

  const bn = language === "bn";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title={bn ? "ইনপুট — মাত্রা" : "Input — Dimensions"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "প্রস্থ (mm)" : "Width (mm)"}</Label>
                <Input type="number" min={100} value={widthMm} onChange={(e) => setWidthMm(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "গভীরতা (mm)" : "Depth (mm)"}</Label>
                <Input type="number" min={100} value={depthMm} onChange={(e) => setDepthMm(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{bn ? "ক্লিয়ার উচ্চতা (m)" : "Clear height (m)"}</Label>
              <Input type="number" min={1} step={0.1} value={heightM} onChange={(e) => setHeightM(+e.target.value)} />
            </div>
            <div>
              <Label>{bn ? "ক্লিয়ার কভার (mm)" : "Clear cover (mm)"}</Label>
              <Input type="number" min={10} value={coverMm} onChange={(e) => setCoverMm(+e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — কংক্রিট" : "Input — Concrete"}>
          <div className="space-y-3">
            <div>
              <Label>{bn ? "মিক্স অনুপাত" : "Mix ratio"}</Label>
              <Select value={mixKey} onChange={(e) => setMixKey(e.target.value as EngineeringMixKey)}>
                {MIX_KEYS.map((k) => (
                  <option key={k} value={k}>{pick(language, ENGINEERING_MIX_PRESETS[k].label)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{bn ? "ওয়েস্টেজ %" : "Wastage %"}</Label>
              <Input type="number" min={0} max={30} value={wastage} onChange={(e) => setWastage(+e.target.value)} />
            </div>
            <div>
              <Label>{bn ? "সিজমিক মোড" : "Seismic mode"}</Label>
              <Select value={seismicMode} onChange={(e) => setSeismicMode(e.target.value as SeismicMode)}>
                <option value="ordinary">{bn ? "সাধারণ / নন-সিজমিক" : "Ordinary / Non-seismic"}</option>
                <option value="IMRF">IMRF (Intermediate MRF)</option>
                <option value="SMRF">SMRF (Special MRF)</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={bn ? "ইনপুট — রড" : "Input — Reinforcement"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "মেইন বার Ø (mm)" : "Main bar Ø (mm)"}</Label>
                <Input type="number" min={10} value={mainDiam} onChange={(e) => setMainDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "সংখ্যা" : "Count"}</Label>
                <Input type="number" min={4} value={mainCount} onChange={(e) => setMainCount(+e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn ? "টাই Ø (mm)" : "Tie Ø (mm)"}</Label>
                <Input type="number" min={6} value={tieDiam} onChange={(e) => setTieDiam(+e.target.value)} />
              </div>
              <div>
                <Label>{bn ? "টাই স্পেসিং (mm)" : "Tie spacing (mm)"}</Label>
                <Input type="number" min={50} value={tieSpacing} onChange={(e) => setTieSpacing(+e.target.value)} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={bn ? "কংক্রিট ফলাফল" : "Concrete Results"}>
          <Row label={bn ? "ওয়েট ভলিউম" : "Wet volume"}    value={r.wetVolumeM3}   unit="m³" />
          <Row label={bn ? "ড্রাই ভলিউম" : "Dry volume"}    value={r.dryVolumeM3}   unit="m³" />
          <Row label={bn ? "সিমেন্ট" : "Cement"}            value={r.cementBags}     unit="bags" />
          <Row label={bn ? "বালু" : "Sand"}                  value={r.sandCft}        unit="cft" />
          <Row label={bn ? "পাথর/খোয়া" : "Stone/aggregate"} value={r.stoneCft}       unit="cft" />
        </SectionCard>

        <SectionCard title={bn ? "স্টিল ফলাফল" : "Steel Results"}>
          <Row label={bn ? "লংগিচুডিনাল বার" : "Longitudinal bars"}    value={r.longBarWeightKg}  unit="kg" />
          <Row label={bn ? "টাই সংখ্যা" : "Tie count"}                 value={r.tieCount}         unit="pcs" />
          <Row label={bn ? "টাই দৈর্ঘ্য" : "Tie length"}               value={r.tieLengthM}       unit="m" />
          <Row label={bn ? "টাই ওজন" : "Tie weight"}                   value={r.tieWeightKg}      unit="kg" />
          <Row label={bn ? `মোট স্টিল (ওয়েস্টেজ ${wastage}%)` : `Total steel (wastage ${wastage}%)`} value={r.totalSteelKg} unit="kg" />
          <Row label="ρ_gross" value={`${(r.rhoGross * 100).toFixed(2)}%`} />
        </SectionCard>
      </div>

      <SectionCard title={bn ? "ল্যাপ / ডেভেলপমেন্ট দৈর্ঘ্য রেফারেন্স" : "Lap / Development Length Reference"}>
        <p className="mb-2 text-xs text-slate-500">
          {bn
            ? `Ø${mainDiam} mm বারের জন্য — শুধুমাত্র থাম্ব-রুল রেফারেন্স। ফাইনাল ডিজাইন ইঞ্জিনিয়ার দ্বারা যাচাই করতে হবে।`
            : `For Ø${mainDiam} mm bar — thumb-rule reference only. Verify with licensed engineer.`}
        </p>
        <div className="grid grid-cols-2 gap-x-6 md:grid-cols-3">
          <Row label={bn ? "টপ বার Ld (টেনশন)" : "Top bar Ld (tension)"}      value={`${lapRef.topBarTensionLd} mm`} />
          <Row label={bn ? "বটম বার Ld (টেনশন)" : "Bottom bar Ld (tension)"}  value={`${lapRef.bottomBarTensionLd} mm`} />
          <Row label={bn ? "কম্প্রেশন Ld" : "Compression Ld"}                 value={`${lapRef.compressionLd} mm`} />
          <Row label={bn ? "Class A ল্যাপ স্প্লাইস" : "Class A lap splice"}   value={`${lapRef.classALapSplice} mm`} />
          <Row label={bn ? "Class B ল্যাপ স্প্লাইস" : "Class B lap splice"}   value={`${lapRef.classBLapSplice} mm`} />
        </div>
      </SectionCard>

      <WarnBox warnings={r.warnings} />

      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {bn ? "প্রিন্ট করুন" : "Print estimate"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT CONVERTER TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ConverterTab({ language }: { language: Locale }) {
  const [val, setVal] = useState(1);
  const bn = language === "bn";

  const rows: Array<{ label: { en: string; bn: string }; forward: string; backward: string }> = [
    {
      label: { en: "ft → m",  bn: "ফুট → মিটার"      },
      forward:  `${val} ft = ${ftToM(val).toFixed(4)} m`,
      backward: `${val} m = ${mToFt(val).toFixed(4)} ft`,
    },
    {
      label: { en: "sft → m²", bn: "বর্গফুট → বর্গমিটার" },
      forward:  `${val} sft = ${sftToM2(val).toFixed(4)} m²`,
      backward: `${val} m² = ${m2ToSft(val).toFixed(4)} sft`,
    },
    {
      label: { en: "cft → m³", bn: "ঘনফুট → ঘনমিটার"   },
      forward:  `${val} cft = ${cftToM3(val).toFixed(4)} m³`,
      backward: `${val} m³ = ${m3ToCft(val).toFixed(4)} cft`,
    },
    {
      label: { en: "m → m²  (square)",  bn: "মিটার → বর্গমিটার"  },
      forward:  `${val} × ${val} = ${(val * val).toFixed(4)} m²`,
      backward: `√(${val}) = ${Math.sqrt(val).toFixed(4)} m`,
    },
    {
      label: { en: "m → m³  (cube)",    bn: "মিটার → ঘনমিটার"    },
      forward:  `${val} × ${val} × ${val} = ${(val ** 3).toFixed(4)} m³`,
      backward: `∛(${val}) = ${Math.cbrt(val).toFixed(4)} m`,
    },
    {
      label: { en: "ft → ft²  (square)", bn: "ফুট → বর্গফুট"      },
      forward:  `${val} × ${val} = ${(val * val).toFixed(4)} ft²`,
      backward: `√(${val}) = ${Math.sqrt(val).toFixed(4)} ft`,
    },
    {
      label: { en: "ft → ft³  (cube)",   bn: "ফুট → ঘনফুট"        },
      forward:  `${val} × ${val} × ${val} = ${(val ** 3).toFixed(4)} ft³`,
      backward: `∛(${val}) = ${Math.cbrt(val).toFixed(4)} ft`,
    },
    {
      label: { en: "Rod weight (ft)",   bn: "রড ওজন (ফুট)" },
      forward:  `Ø${val} mm × 1 ft = ${rodWeightKgFt(val, 1).toFixed(4)} kg`,
      backward: `Ø${val} mm × 10 ft = ${rodWeightKgFt(val, 10).toFixed(4)} kg`,
    },
    {
      label: { en: "Rod weight (m)",    bn: "রড ওজন (মিটার)" },
      forward:  `Ø${val} mm × 1 m = ${rodWeightKgM(val, 1).toFixed(4)} kg`,
      backward: `Ø${val} mm × 10 m = ${rodWeightKgM(val, 10).toFixed(4)} kg`,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title={bn ? "একক রূপান্তর" : "Unit Converter"}>
        <div className="mb-4">
          <Label>{bn ? "মান লিখুন" : "Enter value"}</Label>
          <Input type="number" min={0} step="any" value={val} onChange={(e) => setVal(+e.target.value)} className="max-w-xs" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="border border-slate-200 px-3 py-2">{bn ? "একক" : "Unit"}</th>
                <th className="border border-slate-200 px-3 py-2">{bn ? "রূপান্তর ১" : "Conversion 1"}</th>
                <th className="border border-slate-200 px-3 py-2">{bn ? "রূপান্তর ২" : "Conversion 2"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border border-slate-200 px-3 py-2 font-medium">{pick(language, r.label)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{r.forward}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{r.backward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function EngineeringEstimatorPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("slab");
  const bn = language === "bn";

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h1 className="text-2xl font-bold text-blue-950">
          {bn ? "ইঞ্জিনিয়ারিং এস্টিমেটর" : "Engineering Estimator"}
        </h1>
        <p className="mt-1 text-sm text-blue-800">
          {bn
            ? "BNBC-2020 ভিত্তিক স্ল্যাব, বিম ও কলামের পরিমাণ নির্ণয় ক্যালকুলেটর। অ্যাডমিন-অনলি।"
            : "BNBC-2020-informed quantity calculator for slab, beam, and column. Admin only."}
        </p>
        {/* Disclaimer */}
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>{bn ? "দায়মুক্তি:" : "DISCLAIMER:"}</strong>{" "}
          {bn ? DISCLAIMER_BN : DISCLAIMER_EN}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 print:hidden">
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

      {/* Tab content */}
      {activeTab === "slab"      && <SlabForm   language={language} />}
      {activeTab === "beam"      && <BeamForm   language={language} />}
      {activeTab === "column"    && <ColumnForm language={language} />}
      {activeTab === "converter" && <ConverterTab language={language} />}
    </div>
  );
}
