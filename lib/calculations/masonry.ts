export const estimateBrickCount = (builtAreaSft: number, floors: number, wallAreaFactor: number) => {
  const wallAreaSft = builtAreaSft * Math.max(floors, 1) * wallAreaFactor;
  const bricksPerSft = 12;
  return wallAreaSft * bricksPerSft;
};
