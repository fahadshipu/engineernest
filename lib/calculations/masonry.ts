const SFT_PER_M2 = 10.7639;
const CFT_PER_M3 = 35.3147;

export const estimateBrickCount = (builtAreaSft: number, floors: number, wallAreaFactor: number) => {
  const wallAreaSft = builtAreaSft * Math.max(floors, 1) * wallAreaFactor;
  const bricksPerSft = 12;
  return wallAreaSft * bricksPerSft;
};

// ─── Brick masonry trade calculator ──────────────────────────────────────────

export type WallThickness = "5inch" | "10inch";

/**
 * Configurable presets for brick masonry quantity estimation.
 * Assumptions:
 *   • Standard Bangladesh brick: 9.5″ × 4.5″ × 2.75″ (with 10 mm mortar joint)
 *   • Mortar mix: 1 : 6  (cement : sand by volume)
 *   • Wet-to-dry mortar bulking factor: 1.30
 *   • 5-inch wall  ≈ half-brick (single-wythe), wall thickness ≈ 125 mm
 *   • 10-inch wall ≈ full-brick (double-wythe), wall thickness ≈ 250 mm
 * These are preliminary estimates only — verify with a qualified engineer.
 */
export const MASONRY_PRESETS: Record<
  WallThickness,
  {
    label: { en: string; bn: string };
    bricksPerM2: number;
    wetMortarM3PerM2: number;
  }
> = {
  "5inch": {
    label: { en: "5 inch wall (half brick)", bn: "৫ ইঞ্চি দেয়াল (হাফ ব্রিক)" },
    bricksPerM2: 55,
    wetMortarM3PerM2: 0.031, // ≈ 25 % of wall volume (1 m² × 0.125 m × 25 %)
  },
  "10inch": {
    label: { en: "10 inch wall (full brick)", bn: "১০ ইঞ্চি দেয়াল (ফুল ব্রিক)" },
    bricksPerM2: 110,
    wetMortarM3PerM2: 0.063, // ≈ 25 % of wall volume (1 m² × 0.250 m × 25 %)
  },
};

/**
 * Estimate brick masonry materials for a given wall area and wall thickness.
 * @param wallAreaSft  Net wall face area in square feet (deduct openings as needed)
 * @param wallThickness  "5inch" or "10inch"
 */
export const estimateMasonryMaterials = (wallAreaSft: number, wallThickness: WallThickness) => {
  const wallAreaM2 = wallAreaSft / SFT_PER_M2;
  const preset = MASONRY_PRESETS[wallThickness];

  const bricks = wallAreaM2 * preset.bricksPerM2;

  // Mortar: 1:6 cement–sand mix
  const dryMortarM3 = wallAreaM2 * preset.wetMortarM3PerM2 * 1.3;
  const cementM3 = dryMortarM3 / 7; // 1 part out of (1 + 6)
  const sandM3 = (dryMortarM3 * 6) / 7;

  return {
    bricks: Math.ceil(bricks),
    cementBags: cementM3 / 0.035, // 1 bag ≈ 0.035 m³
    sandCft: sandM3 * CFT_PER_M3,
  };
};
