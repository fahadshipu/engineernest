const CFT_PER_M3 = 35.3147;
const FT_PER_M = 3.28084;

export type EarthworkInputMode = "lwd" | "areaDepth" | "repeated" | "manual";
export type EarthworkUnitSystem = "metric" | "imperial";
export type EarthworkLaborMode = "manual" | "machine" | "mixed";
export type EarthworkSection = "foundation" | "trench" | "pit" | "leveling" | "backfilling";

export interface EarthworkEstimateInput {
  mode: EarthworkInputMode;
  unitSystem: EarthworkUnitSystem;
  length: number;
  width: number;
  depth: number;
  area: number;
  repeatedUnits: number;
  volumePerUnit: number;
  manualTotalVolume: number;
  sideSlopeAllowancePercent: number;
  swellFactor: number;
  compactionFactor: number;
  backfillPercent: number;
  laborMode: EarthworkLaborMode;
  excavationRatePerM3: number;
  backfillRatePerM3: number;
  transportDisposalRatePerM3: number;
  disposalDistanceKm: number;
  truckCapacityM3: number;
}

const laborMultiplier: Record<EarthworkLaborMode, number> = {
  manual: 1,
  mixed: 1.1,
  machine: 1.2,
};

const toM3 = (value: number, unitSystem: EarthworkUnitSystem) => (unitSystem === "metric" ? value : value / CFT_PER_M3);

const toM = (value: number, unitSystem: EarthworkUnitSystem) => (unitSystem === "metric" ? value : value / FT_PER_M);

const baseVolumeM3 = (input: EarthworkEstimateInput) => {
  if (input.mode === "manual") {
    return toM3(Math.max(input.manualTotalVolume, 0), input.unitSystem);
  }
  if (input.mode === "repeated") {
    return toM3(Math.max(input.repeatedUnits, 0) * Math.max(input.volumePerUnit, 0), input.unitSystem);
  }
  if (input.mode === "areaDepth") {
    const area = input.unitSystem === "metric" ? Math.max(input.area, 0) : Math.max(input.area, 0) / 10.7639;
    return area * toM(Math.max(input.depth, 0), input.unitSystem);
  }
  return (
    toM(Math.max(input.length, 0), input.unitSystem) *
    toM(Math.max(input.width, 0), input.unitSystem) *
    toM(Math.max(input.depth, 0), input.unitSystem)
  );
};

export const estimateEarthwork = (input: EarthworkEstimateInput) => {
  const grossExcavationVolumeM3 = baseVolumeM3(input);
  const adjustedExcavationVolumeM3 = grossExcavationVolumeM3 * (1 + Math.max(input.sideSlopeAllowancePercent, 0) / 100);
  const looseSoilVolumeM3 = adjustedExcavationVolumeM3 * Math.max(input.swellFactor, 1);
  const backfillVolumeM3 = adjustedExcavationVolumeM3 * Math.max(input.backfillPercent, 0) / 100;

  const safeCompaction = Math.min(Math.max(input.compactionFactor, 0.5), 1);
  const looseRequiredForBackfillM3 = backfillVolumeM3 / safeCompaction;
  const disposalQuantityM3 = Math.max(looseSoilVolumeM3 - looseRequiredForBackfillM3, 0);
  const estimatedTrips = Math.max(input.truckCapacityM3, 0) > 0 ? Math.ceil(disposalQuantityM3 / input.truckCapacityM3) : 0;

  const excavationCost = adjustedExcavationVolumeM3 * Math.max(input.excavationRatePerM3, 0);
  const backfillCost = backfillVolumeM3 * Math.max(input.backfillRatePerM3, 0);
  const transportDistanceFactor = Math.max(input.disposalDistanceKm, 0) > 0 ? 1 + input.disposalDistanceKm / 50 : 1;
  const disposalCost = disposalQuantityM3 * Math.max(input.transportDisposalRatePerM3, 0) * transportDistanceFactor;
  const laborAdjustedCost = (excavationCost + backfillCost) * (laborMultiplier[input.laborMode] - 1);
  const totalCost = excavationCost + backfillCost + disposalCost + laborAdjustedCost;

  return {
    grossExcavationVolumeM3,
    adjustedExcavationVolumeM3,
    looseSoilVolumeM3,
    backfillVolumeM3,
    disposalQuantityM3,
    estimatedTrips,
    costs: {
      excavationCost,
      backfillCost,
      disposalCost,
      laborAdjustedCost,
      totalCost,
    },
  };
};
