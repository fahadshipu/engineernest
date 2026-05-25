import { convertUnit } from "@/lib/calculations/conversions";

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
