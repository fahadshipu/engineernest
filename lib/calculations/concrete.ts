import { convertUnit } from "@/lib/calculations/conversions";

const CFT_PER_M3 = 35.3147;

export const estimateConcreteVolumeM3 = (builtAreaSft: number, floors: number, slabThicknessInch: number) => {
  const areaPerFloorM2 = convertUnit(builtAreaSft, "sft", "m2", {
    markupPercent: 0,
    vatPercent: 0,
    slabThicknessInch,
    steelKgPerSft: 0,
    wallAreaFactor: 0,
    plasterThicknessMm: 0,
    landPreset: { shotokToSft: 435.6, kathaToSft: 720, bighaToSft: 14400 },
  });
  const slabThicknessM = slabThicknessInch * 0.0254;
  return areaPerFloorM2 * Math.max(floors, 1) * slabThicknessM;
};

export const estimateConcreteMaterials = (volumeM3: number) => {
  const dryVolumeM3 = volumeM3 * 1.54;
  const totalRatio = 1 + 1.5 + 3;
  const cementM3 = (dryVolumeM3 * 1) / totalRatio;
  const sandM3 = (dryVolumeM3 * 1.5) / totalRatio;
  const stoneM3 = (dryVolumeM3 * 3) / totalRatio;

  const cementBags = cementM3 / 0.035;

  return {
    cementBags,
    sandCft: convertUnit(sandM3, "m3", "cft", {
      markupPercent: 0,
      vatPercent: 0,
      slabThicknessInch: 0,
      steelKgPerSft: 0,
      wallAreaFactor: 0,
      plasterThicknessMm: 0,
      landPreset: { shotokToSft: 435.6, kathaToSft: 720, bighaToSft: 14400 },
    }),
    stoneCft: convertUnit(stoneM3, "m3", "cft", {
      markupPercent: 0,
      vatPercent: 0,
      slabThicknessInch: 0,
      steelKgPerSft: 0,
      wallAreaFactor: 0,
      plasterThicknessMm: 0,
      landPreset: { shotokToSft: 435.6, kathaToSft: 720, bighaToSft: 14400 },
    }),
  };
};

// ─── RCC work trade calculator ────────────────────────────────────────────────

export type RccMixRatioKey = "M20" | "M15" | "M10";

/**
 * Configurable mix-ratio presets for RCC quantity estimation.
 * Assumptions:
 *   • Wet-to-dry concrete bulking factor: 1.54
 *   • 1 cement bag ≈ 0.035 m³
 * These are preliminary estimates only — verify with a qualified engineer.
 */
export const RCC_MIX_PRESETS: Record<
  RccMixRatioKey,
  { label: { en: string; bn: string }; cement: number; sand: number; stone: number }
> = {
  M20: { label: { en: "M20  (1:1.5:3) – General RCC",     bn: "M20 (১:১.৫:৩) – সাধারণ আরসিসি"   }, cement: 1, sand: 1.5, stone: 3 },
  M15: { label: { en: "M15  (1:2:4) – Mild exposure",     bn: "M15 (১:২:৪) – মাইল্ড এক্সপোজার"  }, cement: 1, sand: 2,   stone: 4 },
  M10: { label: { en: "M10  (1:3:6) – PCC / blinding",    bn: "M10 (১:৩:৬) – পিসিসি / ব্লাইন্ড" }, cement: 1, sand: 3,   stone: 6 },
};

/**
 * Estimate RCC materials for a given concrete volume and mix ratio.
 * @param volumeM3     Concrete volume in m³
 * @param mixRatioKey  Mix ratio key from RCC_MIX_PRESETS (default "M20")
 */
export const estimateRccMaterials = (volumeM3: number, mixRatioKey: RccMixRatioKey = "M20") => {
  const mix = RCC_MIX_PRESETS[mixRatioKey];
  const dryVolumeM3 = volumeM3 * 1.54;
  const totalRatio = mix.cement + mix.sand + mix.stone;

  const cementM3 = (dryVolumeM3 * mix.cement) / totalRatio;
  const sandM3   = (dryVolumeM3 * mix.sand)   / totalRatio;
  const stoneM3  = (dryVolumeM3 * mix.stone)  / totalRatio;

  return {
    cementBags: cementM3 / 0.035,
    sandCft:    sandM3  * CFT_PER_M3,
    stoneCft:   stoneM3 * CFT_PER_M3,
  };
};
