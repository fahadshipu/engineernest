import { convertUnit } from "@/lib/calculations/conversions";

const SFT_PER_M2 = 10.7639;
const CFT_PER_M3 = 35.3147;

export const estimatePlasterMaterials = (
  builtAreaSft: number,
  floors: number,
  wallAreaFactor: number,
  plasterThicknessMm: number,
) => {
  const wallAreaSft = builtAreaSft * Math.max(floors, 1) * wallAreaFactor;
  const wallAreaM2 = convertUnit(wallAreaSft, "sft", "m2", {
    markupPercent: 0,
    vatPercent: 0,
    slabThicknessInch: 0,
    steelKgPerSft: 0,
    wallAreaFactor,
    plasterThicknessMm,
    landPreset: { shotokToSft: 435.6, kathaToSft: 720, bighaToSft: 14400 },
  });

  const plasterThicknessM = plasterThicknessMm / 1000;
  const wetVolumeM3 = wallAreaM2 * plasterThicknessM;
  const dryVolumeM3 = wetVolumeM3 * 1.27;

  const cementM3 = dryVolumeM3 / 5;
  const sandM3 = (dryVolumeM3 * 4) / 5;

  return {
    cementBags: cementM3 / 0.035,
    sandCft: convertUnit(sandM3, "m3", "cft", {
      markupPercent: 0,
      vatPercent: 0,
      slabThicknessInch: 0,
      steelKgPerSft: 0,
      wallAreaFactor,
      plasterThicknessMm,
      landPreset: { shotokToSft: 435.6, kathaToSft: 720, bighaToSft: 14400 },
    }),
  };
};

// ─── Plaster trade calculator ─────────────────────────────────────────────────

export type PlasterPresetKey = "6mm" | "12mm" | "20mm";

/**
 * Configurable thickness presets for plaster quantity estimation.
 * Assumptions:
 *   • Mortar mix: 1 : 4  (cement : sand by volume)
 *   • Wet-to-dry bulking factor: 1.27
 *   • 1 cement bag ≈ 0.035 m³
 * These are preliminary estimates only — verify with a qualified engineer.
 */
export const PLASTER_PRESETS: Record<
  PlasterPresetKey,
  { label: { en: string; bn: string }; thicknessMm: number }
> = {
  "6mm":  { label: { en: "6 mm – internal thin coat",   bn: "৬ মি.মি. – অভ্যন্তরীণ পাতলা" }, thicknessMm: 6  },
  "12mm": { label: { en: "12 mm – standard coat",       bn: "১২ মি.মি. – সাধারণ"           }, thicknessMm: 12 },
  "20mm": { label: { en: "20 mm – external / rough",    bn: "২০ মি.মি. – বাহ্যিক / রাফ"    }, thicknessMm: 20 },
};

/**
 * Estimate plaster materials for a given surface area and thickness.
 * @param areaSft          Surface area to plaster in square feet
 * @param thicknessMm      Plaster thickness in millimetres
 */
export const estimatePlasterByArea = (areaSft: number, thicknessMm: number) => {
  const areaM2 = areaSft / SFT_PER_M2;
  const thicknessM = thicknessMm / 1000;

  const wetVolumeM3 = areaM2 * thicknessM;
  const dryVolumeM3 = wetVolumeM3 * 1.27;

  // 1:4 cement:sand mix → 5 parts total
  const cementM3 = dryVolumeM3 / 5;
  const sandM3   = (dryVolumeM3 * 4) / 5;

  return {
    cementBags: cementM3 / 0.035,
    sandCft: sandM3 * CFT_PER_M3,
  };
};
