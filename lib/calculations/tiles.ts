const SFT_PER_M2 = 10.7639;

// ─── Tiles work trade calculator ─────────────────────────────────────────────

export type TileSizePresetKey = "300x300" | "400x400" | "600x600" | "800x800";

/**
 * Configurable tile-size presets.
 * These are preliminary estimates only — verify with a qualified engineer.
 */
export const TILE_SIZE_PRESETS: Record<
  TileSizePresetKey,
  { label: { en: string; bn: string }; widthMm: number; heightMm: number }
> = {
  "300x300": { label: { en: "30×30 cm (1 ft × 1 ft)",  bn: "৩০×৩০ সে.মি. (১×১ ফুট)"  }, widthMm: 300, heightMm: 300 },
  "400x400": { label: { en: "40×40 cm",                 bn: "৪০×৪০ সে.মি."             }, widthMm: 400, heightMm: 400 },
  "600x600": { label: { en: "60×60 cm (2 ft × 2 ft)",  bn: "৬০×৬০ সে.মি. (২×২ ফুট)"  }, widthMm: 600, heightMm: 600 },
  "800x800": { label: { en: "80×80 cm",                 bn: "৮০×৮০ সে.মি."             }, widthMm: 800, heightMm: 800 },
};

/**
 * Estimate tile quantity and coverage for a given area.
 * @param areaSft           Floor or wall area in square feet
 * @param tileSizeWidthMm   Tile width in millimetres
 * @param tileSizeHeightMm  Tile height in millimetres
 * @param wastagePercent    Wastage allowance percentage (e.g. 10 for 10 %)
 */
export const estimateTilesMaterials = (
  areaSft: number,
  tileSizeWidthMm: number,
  tileSizeHeightMm: number,
  wastagePercent: number,
) => {
  const areaM2 = areaSft / SFT_PER_M2;
  const tileAreaM2 = (tileSizeWidthMm / 1000) * (tileSizeHeightMm / 1000);
  const wastageMultiplier = 1 + Math.max(wastagePercent, 0) / 100;

  const tilesRequired = Math.ceil((areaM2 / tileAreaM2) * wastageMultiplier);
  const requiredAreaSft = areaSft * wastageMultiplier;

  return {
    tilesRequired,
    requiredAreaSft,
    wastageAreaSft: requiredAreaSft - areaSft,
    tileAreaM2,
  };
};
