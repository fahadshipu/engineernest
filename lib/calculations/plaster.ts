import { convertUnit } from "@/lib/calculations/conversions";

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
