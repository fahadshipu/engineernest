export const estimateSteelWeightKg = (builtAreaSft: number, floors: number, steelKgPerSft: number) => {
  return builtAreaSft * Math.max(floors, 1) * steelKgPerSft;
};
