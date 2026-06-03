/**
 * BNBC-2020-informed engineering estimator backend.
 *
 * DISCLAIMER: All outputs are for preliminary quantity estimation and engineering
 * guidance only. They must be reviewed and verified by a qualified structural
 * engineer before execution or use for any construction purpose.
 *
 * Calculation basis: BNBC 2020 (Bangladesh National Building Code 2020),
 * with configurable constants and practical Bangladeshi civil-construction defaults.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

/** Dry-to-wet volume bulking factor for concrete */
export const DRY_VOLUME_FACTOR = 1.54;

/** Volume of one cement bag in m³ */
export const CEMENT_BAG_VOLUME_M3 = 0.035; // ≈ 50 kg bag

/** Default wastage percentage for reinforcement steel */
export const DEFAULT_WASTAGE_PERCENT = 5;

/** Default RCC mix preset */
export const DEFAULT_MIX_KEY: EngineeringMixKey = "M20";

/** Default concrete grade MPa */
export const DEFAULT_FC_MPA = 20;

/** Conversion factors */
export const FT_TO_M = 0.3048;
export const M_TO_FT = 3.28084;
export const IN_TO_MM = 25.4;
export const MM_TO_IN = 1 / 25.4;
export const SFT_PER_M2 = 10.7639;
export const CFT_PER_M3 = 35.3147;

/**
 * Unit weight references (kN/m³) — BNBC 2020 Appendix / Table.
 * Use for dead-load estimation guidance.
 */
export const UNIT_WEIGHTS_KN_M3 = {
  cement: 14.7,
  drySand: 15.7,
  brick: 18.9,
  plainConcreteBrickAgg: 20.4,
  plainConcreteStoneAgg: 22.8,
  steel: 77.0,
} as const;

/**
 * Water-cement ratio reference values — BNBC 2020 guidance.
 * Key = target concrete strength in MPa.
 */
export const WATER_CEMENT_RATIO: Record<number, number> = {
  17: 0.66,
  20: 0.60,
  25: 0.50,
  30: 0.40,
};

/**
 * Minimum RCC structural strength: generally 20 MPa.
 * Relaxation to 17 MPa is permitted for buildings up to 4 stories per BNBC 2020.
 */
export const MIN_FC_GENERAL_MPA = 20;
export const MIN_FC_RELAXED_MPA = 17;

// ─── Clear-cover defaults (mm) ───────────────────────────────────────────────

export const CLEAR_COVER_DEFAULTS_MM = {
  slabInterior: 20,
  beamInterior: 40,
  columnInterior: 40,
  exposedToWeatherSmallBar: 40, // bars ≤ 16 mm
  exposedToWeatherLargeBar: 50, // bars > 16 mm
  castAgainstEarth: 75,
  coastalExtraAddition: 12,
} as const;

// ─── Mix ratio presets ────────────────────────────────────────────────────────

export type EngineeringMixKey = "M20" | "M15" | "M10" | "M25";

export const ENGINEERING_MIX_PRESETS: Record<
  EngineeringMixKey,
  { label: { en: string; bn: string }; cement: number; sand: number; stone: number; fcMpa: number }
> = {
  M25: { label: { en: "M25 (1:1:2) – High strength",   bn: "M25 (১:১:২) – উচ্চ শক্তি"    }, cement: 1, sand: 1,   stone: 2, fcMpa: 25 },
  M20: { label: { en: "M20 (1:1.5:3) – General RCC",   bn: "M20 (১:১.৫:৩) – সাধারণ আরসিসি" }, cement: 1, sand: 1.5, stone: 3, fcMpa: 20 },
  M15: { label: { en: "M15 (1:2:4) – Mild exposure",   bn: "M15 (১:২:৪) – মাইল্ড"          }, cement: 1, sand: 2,   stone: 4, fcMpa: 15 },
  M10: { label: { en: "M10 (1:3:6) – PCC / blinding",  bn: "M10 (১:৩:৬) – পিসিসি"          }, cement: 1, sand: 3,   stone: 6, fcMpa: 10 },
};

// ─── Unit conversion helpers ─────────────────────────────────────────────────

/** Convert linear feet to metres */
export const ftToM = (ft: number) => ft * FT_TO_M;

/** Convert metres to linear feet */
export const mToFt = (m: number) => m * M_TO_FT;

/** Convert square feet to square metres */
export const sftToM2 = (sft: number) => sft / SFT_PER_M2;

/** Convert square metres to square feet */
export const m2ToSft = (m2: number) => m2 * SFT_PER_M2;

/** Convert cubic feet to cubic metres */
export const cftToM3 = (cft: number) => cft / CFT_PER_M3;

/** Convert cubic metres to cubic feet */
export const m3ToCft = (m3: number) => m3 * CFT_PER_M3;

/** Convert metres to square metres (convenience: m → m²) */
export const mToM2 = (length: number, width: number) => length * width;

/** Convert metres to cubic metres (convenience: m → m³) */
export const mToM3 = (length: number, width: number, depth: number) => length * width * depth;

/** Convert feet to square feet (convenience) */
export const ftToSft = (length: number, width: number) => length * width;

/** Convert feet to cubic feet (convenience) */
export const ftToCft = (length: number, width: number, depth: number) => length * width * depth;

/** Convert inches to mm */
export const inchToMm = (inch: number) => inch * IN_TO_MM;

/** Convert mm to inches */
export const mmToInch = (mm: number) => mm * MM_TO_IN;

// ─── Rod weight formula ───────────────────────────────────────────────────────

/**
 * Rod weight using standard Bangladesh/India formula.
 * @param diamMm  Bar diameter in mm
 * @param lengthFt Bar length in feet
 * @returns Weight in kg
 */
export const rodWeightKgFt = (diamMm: number, lengthFt: number): number =>
  ((diamMm * diamMm) / 532.17) * lengthFt;

/**
 * Rod weight using metric formula.
 * @param diamMm   Bar diameter in mm
 * @param lengthM  Bar length in metres
 * @returns Weight in kg
 */
export const rodWeightKgM = (diamMm: number, lengthM: number): number =>
  ((diamMm * diamMm) / 162.2) * lengthM;

// ─── RCC material quantities ──────────────────────────────────────────────────

/**
 * Calculate cement, sand, stone quantities for a given concrete volume and mix.
 * @param wetVolumeM3  Wet concrete volume in m³
 * @param mixKey       Mix ratio preset key (default M20)
 * @returns { dryVolumeM3, cementBags, sandM3, sandCft, stoneM3, stoneCft }
 */
export const calcRccMaterials = (wetVolumeM3: number, mixKey: EngineeringMixKey = DEFAULT_MIX_KEY) => {
  const mix = ENGINEERING_MIX_PRESETS[mixKey];
  const totalRatio = mix.cement + mix.sand + mix.stone;
  const dryVolumeM3 = wetVolumeM3 * DRY_VOLUME_FACTOR;
  const cementM3 = (dryVolumeM3 * mix.cement) / totalRatio;
  const sandM3   = (dryVolumeM3 * mix.sand)   / totalRatio;
  const stoneM3  = (dryVolumeM3 * mix.stone)  / totalRatio;
  return {
    dryVolumeM3,
    cementBags: cementM3 / CEMENT_BAG_VOLUME_M3,
    sandM3,
    sandCft:  m3ToCft(sandM3),
    stoneM3,
    stoneCft: m3ToCft(stoneM3),
  };
};

// ─── Lap / development length helpers ────────────────────────────────────────

/**
 * Reference development / lap length helper based on BNBC 2020 / ACI-318 thumb rules.
 * These are guide values only — final values require proper design-code calculation.
 */
export const lapLengthReference = (diamMm: number) => ({
  topBarTensionLd:     50 * diamMm, // mm, top bar development
  bottomBarTensionLd:  40 * diamMm, // mm, bottom bar development
  compressionLd:       30 * diamMm, // mm, compression development reference
  classALapSplice:     Math.round(1.0 * 40 * diamMm), // mm, Class A splice
  classBLapSplice:     Math.round(1.3 * 40 * diamMm), // mm, Class B splice (typical)
});

// ─── Warning helpers ──────────────────────────────────────────────────────────

/** Collect string warnings into an array */
function warn(warnings: string[], msg: string) {
  warnings.push(msg);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLAB ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════

export type SlabInputUnit = "ft" | "m";
export type SlabThicknessUnit = "inch" | "mm";
export type SlabMode = "one-way" | "two-way";
export type AggregateType = "stone" | "brick";
export type SteelGrade = "Grade275" | "Grade350" | "Grade420" | "Grade500";

export interface SlabInput {
  /** Length in the unit specified by lengthUnit */
  length: number;
  /** Width in the unit specified by lengthUnit */
  width: number;
  /** Thickness in the unit specified by thicknessUnit */
  thickness: number;
  lengthUnit: SlabInputUnit;
  thicknessUnit: SlabThicknessUnit;
  floors: number;
  slabMode: SlabMode;
  mixKey: EngineeringMixKey;
  aggregateType: AggregateType;
  wastagePercent: number;
  /** Main flexural bar diameter in mm */
  mainBarDiamMm: number;
  /** Main bar spacing in mm */
  mainBarSpacingMm: number;
  /** Distribution / binder bar diameter in mm */
  binderBarDiamMm: number;
  /** Distribution bar spacing in mm */
  binderBarSpacingMm: number;
  steelGrade: SteelGrade;
  /** Clear cover in mm (default: 20 mm for slab interior) */
  clearCoverMm: number;
}

export interface SlabResult {
  /** Wet concrete volume per floor in m³ */
  wetVolumeM3: number;
  /** Dry volume per floor in m³ */
  dryVolumeM3: number;
  /** Cement bags per floor */
  cementBags: number;
  /** Sand in m³ per floor */
  sandM3: number;
  /** Sand in CFT per floor */
  sandCft: number;
  /** Stone/brick aggregate in m³ per floor */
  stoneM3: number;
  /** Stone/brick aggregate in CFT per floor */
  stoneCft: number;
  /** Main bar: total length per floor in m */
  mainBarLengthM: number;
  /** Main bar: weight per floor in kg (before wastage) */
  mainBarWeightKg: number;
  /** Binder bar: total length per floor in m */
  binderBarLengthM: number;
  /** Binder bar: weight per floor in kg (before wastage) */
  binderBarWeightKg: number;
  /** Total steel weight per floor including wastage */
  totalSteelKgPerFloor: number;
  /** Multiplied totals for all floors */
  totalWetVolumeM3: number;
  totalDryVolumeM3: number;
  totalCementBags: number;
  totalSandM3: number;
  totalSandCft: number;
  totalStoneM3: number;
  totalStoneCft: number;
  totalSteelKg: number;
  warnings: string[];
}

/**
 * Two-way slab moment coefficients (Ca, Cb) reference table — BNBC 2020 / ACI 318.
 * Indexed by panel condition and span ratio m = ls/ll (0.5 → 1.0 in 0.1 steps).
 * Ca_neg / Cb_neg = negative moment (support), Ca_pos / Cb_pos = positive moment (midspan).
 * These are provided as reference config data for future UI extension.
 */
export const TWO_WAY_SLAB_COEFFICIENTS: Record<
  string,
  Array<{ m: number; Ca_neg: number; Cb_neg: number; Ca_pos: number; Cb_pos: number }>
> = {
  interiorPanel: [
    { m: 0.5, Ca_neg: 0.033, Cb_neg: 0.007, Ca_pos: 0.025, Cb_pos: 0.005 },
    { m: 0.6, Ca_neg: 0.044, Cb_neg: 0.010, Ca_pos: 0.033, Cb_pos: 0.008 },
    { m: 0.7, Ca_neg: 0.055, Cb_neg: 0.015, Ca_pos: 0.041, Cb_pos: 0.011 },
    { m: 0.8, Ca_neg: 0.063, Cb_neg: 0.021, Ca_pos: 0.048, Cb_pos: 0.015 },
    { m: 0.9, Ca_neg: 0.070, Cb_neg: 0.029, Ca_pos: 0.053, Cb_pos: 0.021 },
    { m: 1.0, Ca_neg: 0.075, Cb_neg: 0.037, Ca_pos: 0.056, Cb_pos: 0.028 },
  ],
  oneEdgeDiscontinuous: [
    { m: 0.5, Ca_neg: 0.039, Cb_neg: 0.007, Ca_pos: 0.027, Cb_pos: 0.005 },
    { m: 0.6, Ca_neg: 0.051, Cb_neg: 0.011, Ca_pos: 0.036, Cb_pos: 0.008 },
    { m: 0.7, Ca_neg: 0.062, Cb_neg: 0.016, Ca_pos: 0.044, Cb_pos: 0.012 },
    { m: 0.8, Ca_neg: 0.070, Cb_neg: 0.023, Ca_pos: 0.051, Cb_pos: 0.017 },
    { m: 0.9, Ca_neg: 0.077, Cb_neg: 0.031, Ca_pos: 0.056, Cb_pos: 0.022 },
    { m: 1.0, Ca_neg: 0.081, Cb_neg: 0.039, Ca_pos: 0.059, Cb_pos: 0.029 },
  ],
  cornerPanel: [
    { m: 0.5, Ca_neg: 0.047, Cb_neg: 0.011, Ca_pos: 0.033, Cb_pos: 0.007 },
    { m: 0.6, Ca_neg: 0.058, Cb_neg: 0.016, Ca_pos: 0.042, Cb_pos: 0.011 },
    { m: 0.7, Ca_neg: 0.067, Cb_neg: 0.022, Ca_pos: 0.049, Cb_pos: 0.015 },
    { m: 0.8, Ca_neg: 0.074, Cb_neg: 0.029, Ca_pos: 0.055, Cb_pos: 0.020 },
    { m: 0.9, Ca_neg: 0.079, Cb_neg: 0.037, Ca_pos: 0.060, Cb_pos: 0.026 },
    { m: 1.0, Ca_neg: 0.083, Cb_neg: 0.045, Ca_pos: 0.062, Cb_pos: 0.032 },
  ],
};

/**
 * Minimum reinforcement ratio for slabs (BNBC 2020 / ACI 318-19 §7.6.1).
 */
export const SLAB_MIN_STEEL_RATIO: Record<SteelGrade, number> = {
  Grade275: 0.0020,
  Grade350: 0.0020,
  Grade420: 0.0018,
  Grade500: 0.0018,
};

/**
 * Calculate slab quantities.
 */
export function calcSlab(input: SlabInput): SlabResult {
  const warnings: string[] = [];

  // Convert length/width to metres
  const lengthM = input.lengthUnit === "ft" ? ftToM(input.length) : input.length;
  const widthM  = input.lengthUnit === "ft" ? ftToM(input.width)  : input.width;

  // Convert thickness to mm
  const thicknessMm = input.thicknessUnit === "inch" ? inchToMm(input.thickness) : input.thickness;
  const thicknessM  = thicknessMm / 1000;

  const floors       = Math.max(1, Math.round(input.floors));
  const wastage      = 1 + Math.max(0, input.wastagePercent) / 100;
  const coverMm      = input.clearCoverMm;

  // ── Concrete volumes ──────────────────────────────────────────────────────
  const slabAreaM2  = lengthM * widthM;
  const wetVolM3    = slabAreaM2 * thicknessM;
  const mats        = calcRccMaterials(wetVolM3, input.mixKey);

  // ── Aggregate-size guidance ───────────────────────────────────────────────
  const maxAggSizeMm = thicknessMm / 3;
  if (maxAggSizeMm < 20) {
    warn(warnings, `Slab thickness ${thicknessMm.toFixed(0)} mm may limit max aggregate size to ${maxAggSizeMm.toFixed(0)} mm. Check aggregate grading.`);
  }

  // ── Spacing validations ───────────────────────────────────────────────────
  const flexuralSpacingMaxMm = Math.min(3 * thicknessMm, 450);
  if (input.mainBarSpacingMm > flexuralSpacingMaxMm) {
    warn(warnings, `Main bar spacing ${input.mainBarSpacingMm} mm exceeds max allowed ${flexuralSpacingMaxMm.toFixed(0)} mm (min(3h, 450 mm)).`);
  }

  const shrinkageSpacingMaxMm = Math.min(5 * thicknessMm, 450);
  if (input.binderBarSpacingMm > shrinkageSpacingMaxMm) {
    warn(warnings, `Distribution bar spacing ${input.binderBarSpacingMm} mm exceeds max allowed ${shrinkageSpacingMaxMm.toFixed(0)} mm (min(5h, 450 mm)).`);
  }

  // ── Min steel ratio check ─────────────────────────────────────────────────
  const minRatio = SLAB_MIN_STEEL_RATIO[input.steelGrade];
  const effectiveDepthMm = thicknessMm - coverMm - input.mainBarDiamMm / 2;
  if (effectiveDepthMm > 0) {
    const asMainProvided = ((Math.PI / 4) * input.mainBarDiamMm ** 2) / input.mainBarSpacingMm; // mm²/mm = mm
    const rhoMain = asMainProvided / (1000 * effectiveDepthMm); // per 1000 mm width
    if (rhoMain < minRatio) {
      warn(warnings, `Main bar steel ratio ≈ ${(rhoMain * 100).toFixed(3)}% is below minimum ${(minRatio * 100).toFixed(2)}% for ${input.steelGrade}.`);
    }
  }

  // ── Reinforcement lengths ─────────────────────────────────────────────────
  // Main bars run along the length; number of bars = floor(width / spacing) + 1
  const mainBarSpacingM  = input.mainBarSpacingMm / 1000;
  const binderBarSpacingM = input.binderBarSpacingMm / 1000;

  const mainBarCount   = Math.floor(widthM / mainBarSpacingM) + 1;
  const binderBarCount = Math.floor(lengthM / binderBarSpacingM) + 1;

  const mainBarLengthPerBarM   = lengthM; // runs along slab length
  const binderBarLengthPerBarM = widthM;  // runs along slab width

  const mainBarTotalLengthM   = mainBarCount   * mainBarLengthPerBarM;
  const binderBarTotalLengthM = binderBarCount * binderBarLengthPerBarM;

  const mainBarWeightKg   = rodWeightKgM(input.mainBarDiamMm,   mainBarTotalLengthM);
  const binderBarWeightKg = rodWeightKgM(input.binderBarDiamMm, binderBarTotalLengthM);

  const totalSteelKgPerFloor = (mainBarWeightKg + binderBarWeightKg) * wastage;

  // ── Two-way slab note ─────────────────────────────────────────────────────
  if (input.slabMode === "two-way") {
    const m = Math.min(lengthM, widthM) / Math.max(lengthM, widthM);
    if (m > 0.5) {
      warn(warnings, `Two-way slab (ls/ll = ${m.toFixed(2)}): coefficient table available in backend config for moment estimation. Verify reinforcement design with licensed engineer.`);
    } else {
      warn(warnings, `Span ratio ls/ll = ${m.toFixed(2)} < 0.5: slab behaves as one-way. Consider switching mode.`);
    }
  }

  return {
    wetVolumeM3:    wetVolM3,
    dryVolumeM3:    mats.dryVolumeM3,
    cementBags:     mats.cementBags,
    sandM3:         mats.sandM3,
    sandCft:        mats.sandCft,
    stoneM3:        mats.stoneM3,
    stoneCft:       mats.stoneCft,
    mainBarLengthM:  mainBarTotalLengthM,
    mainBarWeightKg,
    binderBarLengthM: binderBarTotalLengthM,
    binderBarWeightKg,
    totalSteelKgPerFloor,
    totalWetVolumeM3: wetVolM3   * floors,
    totalDryVolumeM3: mats.dryVolumeM3 * floors,
    totalCementBags:  mats.cementBags  * floors,
    totalSandM3:      mats.sandM3      * floors,
    totalSandCft:     mats.sandCft     * floors,
    totalStoneM3:     mats.stoneM3     * floors,
    totalStoneCft:    mats.stoneCft    * floors,
    totalSteelKg:     totalSteelKgPerFloor * floors,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEAM ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════

export type SeismicMode = "ordinary" | "IMRF" | "SMRF";

export interface BeamInput {
  /** Beam width in mm */
  widthMm: number;
  /** Beam overall depth in mm */
  depthMm: number;
  /** Beam total length in m */
  lengthM: number;
  mixKey: EngineeringMixKey;
  wastagePercent: number;
  /** Concrete compressive strength in MPa */
  fcMpa: number;
  /** Steel yield strength in MPa */
  fyMpa: number;
  /** Top bar diameter in mm */
  topBarDiamMm: number;
  /** Number of top bars */
  topBarCount: number;
  /** Bottom bar diameter in mm */
  botBarDiamMm: number;
  /** Number of bottom bars */
  botBarCount: number;
  /** Stirrup diameter in mm */
  stirrupDiamMm: number;
  /** Stirrup spacing in mm */
  stirrupSpacingMm: number;
  seismicMode: SeismicMode;
  /** Clear cover to stirrups in mm */
  clearCoverMm: number;
}

export interface BeamResult {
  wetVolumeM3:        number;
  dryVolumeM3:        number;
  cementBags:         number;
  sandM3:             number;
  sandCft:            number;
  stoneM3:            number;
  stoneCft:           number;
  topBarLengthM:      number;
  topBarWeightKg:     number;
  botBarLengthM:      number;
  botBarWeightKg:     number;
  stirrupCount:       number;
  stirrupLengthM:     number;
  stirrupWeightKg:    number;
  totalSteelKg:       number;
  rhoMin:             number;
  rhoProvided:        number;
  warnings:           string[];
}

/**
 * Calculate beam quantities with BNBC 2020-informed validations.
 */
export function calcBeam(input: BeamInput): BeamResult {
  const warnings: string[] = [];

  const b = input.widthMm;
  const h = input.depthMm;
  const L = input.lengthM;
  const fc = input.fcMpa;
  const fy = input.fyMpa;
  const cover = input.clearCoverMm;
  const wastage = 1 + Math.max(0, input.wastagePercent) / 100;

  // Effective depth
  const d = h - cover - input.stirrupDiamMm - input.botBarDiamMm / 2;

  // ── Concrete ──────────────────────────────────────────────────────────────
  const wetVolM3 = (b / 1000) * (h / 1000) * L;
  const mats = calcRccMaterials(wetVolM3, input.mixKey);

  // ── Longitudinal steel ────────────────────────────────────────────────────
  const topBarLengthM = input.topBarCount * L;
  const botBarLengthM = input.botBarCount * L;
  const topBarWeightKg = rodWeightKgM(input.topBarDiamMm, topBarLengthM);
  const botBarWeightKg = rodWeightKgM(input.botBarDiamMm, botBarLengthM);

  // ── Stirrups ──────────────────────────────────────────────────────────────
  const stirrupCount   = Math.ceil(L * 1000 / input.stirrupSpacingMm) + 1;
  // perimeter of one stirrup (rectangular, inner dimensions)
  const stirrupPerimMm = 2 * ((b - 2 * cover) + (h - 2 * cover));
  const hookExtMm      = Math.max(6 * input.stirrupDiamMm, 75); // 135° seismic hook
  const stirrupLengthPerPcM = (stirrupPerimMm + 2 * hookExtMm) / 1000;
  const stirrupLengthM  = stirrupCount * stirrupLengthPerPcM;
  const stirrupWeightKg = rodWeightKgM(input.stirrupDiamMm, stirrupLengthM);

  const totalSteelKg = (topBarWeightKg + botBarWeightKg + stirrupWeightKg) * wastage;

  // ── Min steel ratio ───────────────────────────────────────────────────────
  const rhoMin = Math.max(1.4 / fy, (0.25 * Math.sqrt(fc)) / fy);
  const botBarAreaMm2 = input.botBarCount * (Math.PI / 4) * input.botBarDiamMm ** 2;
  const rhoProvided = d > 0 ? botBarAreaMm2 / (b * d) : 0;
  if (rhoProvided < rhoMin) {
    warn(warnings, `Bottom bar steel ratio ρ = ${(rhoProvided * 100).toFixed(3)}% < ρ_min = ${(rhoMin * 100).toFixed(3)}% (max(1.4/fy, 0.25√fc'/fy)).`);
  }

  // ── SMRF max rho ──────────────────────────────────────────────────────────
  if (input.seismicMode === "SMRF") {
    const maxRhoSmrf = 0.025;
    const topBarAreaMm2 = input.topBarCount * (Math.PI / 4) * input.topBarDiamMm ** 2;
    const rhoTop = d > 0 ? topBarAreaMm2 / (b * d) : 0;
    if (rhoTop > maxRhoSmrf || rhoProvided > maxRhoSmrf) {
      warn(warnings, `SMRF: beam steel ratio should not exceed 2.5% (ρ_max ≈ 0.025). Check top/bottom bars.`);
    }
  }

  // ── Min clear spacing ─────────────────────────────────────────────────────
  const minClearSpacing = Math.max(input.botBarDiamMm, 25);
  const clearSpacing = d > 0
    ? (b - 2 * cover - 2 * input.stirrupDiamMm - input.botBarCount * input.botBarDiamMm) /
      Math.max(1, input.botBarCount - 1)
    : 0;
  if (clearSpacing < minClearSpacing) {
    warn(warnings, `Clear spacing between bottom bars ≈ ${clearSpacing.toFixed(0)} mm < min ${minClearSpacing} mm (max(db, 25 mm)).`);
  }

  // ── Skin reinforcement ────────────────────────────────────────────────────
  if (h > 750) {
    warn(warnings, `Beam depth ${h} mm > 750 mm: BNBC / ACI 318 requires skin reinforcement along web faces.`);
  }

  // ── Stirrup spacing warnings ──────────────────────────────────────────────
  if (input.seismicMode === "ordinary") {
    const maxSpacing = Math.min(d / 2, 600);
    if (input.stirrupSpacingMm > maxSpacing) {
      warn(warnings, `Ordinary stirrup spacing ${input.stirrupSpacingMm} mm exceeds max d/2 = ${(d / 2).toFixed(0)} mm or 600 mm.`);
    }
  } else {
    // IMRF / SMRF plastic hinge zone
    const hingeLength = 2 * d;
    const maxHingeSpacing = Math.min(d / 4, 8 * input.botBarDiamMm, 24 * input.stirrupDiamMm, 300);
    const outsideSpacing = d / 2;
    warn(
      warnings,
      `${input.seismicMode} hinge zone: length = 2d = ${(hingeLength).toFixed(0)} mm from face. ` +
      `First stirrup ≈ 50 mm from face. Spacing in hinge zone ≤ ${maxHingeSpacing.toFixed(0)} mm ` +
      `(min(d/4, 8db_main, 24db_stirrup, 300 mm)). Outside hinge zone ≤ ${(outsideSpacing).toFixed(0)} mm.`
    );
    warn(warnings, `Seismic hook: 135° with extension ≥ max(6db_stirrup, 75 mm) = ${Math.max(6 * input.stirrupDiamMm, 75)} mm.`);
  }

  return {
    wetVolumeM3: wetVolM3,
    dryVolumeM3: mats.dryVolumeM3,
    cementBags:  mats.cementBags,
    sandM3:      mats.sandM3,
    sandCft:     mats.sandCft,
    stoneM3:     mats.stoneM3,
    stoneCft:    mats.stoneCft,
    topBarLengthM,
    topBarWeightKg,
    botBarLengthM,
    botBarWeightKg,
    stirrupCount,
    stirrupLengthM,
    stirrupWeightKg,
    totalSteelKg,
    rhoMin,
    rhoProvided,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLUMN ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface ColumnInput {
  /** Column width in mm */
  widthMm: number;
  /** Column depth in mm */
  depthMm: number;
  /** Column clear height / total length in m */
  heightM: number;
  mixKey: EngineeringMixKey;
  wastagePercent: number;
  /** Main longitudinal bar diameter in mm */
  mainBarDiamMm: number;
  /** Number of longitudinal bars */
  mainBarCount: number;
  /** Tie bar diameter in mm */
  tieDiamMm: number;
  /** Tie spacing in mm */
  tieSpacingMm: number;
  seismicMode: SeismicMode;
  /** Clear cover to ties in mm */
  clearCoverMm: number;
}

export interface ColumnResult {
  wetVolumeM3:      number;
  dryVolumeM3:      number;
  cementBags:       number;
  sandM3:           number;
  sandCft:          number;
  stoneM3:          number;
  stoneCft:         number;
  longBarLengthM:   number;
  longBarWeightKg:  number;
  tieCount:         number;
  tieLengthM:       number;
  tieWeightKg:      number;
  totalSteelKg:     number;
  rhoGross:         number;
  warnings:         string[];
}

/**
 * Calculate column quantities with BNBC 2020-informed validations.
 */
export function calcColumn(input: ColumnInput): ColumnResult {
  const warnings: string[] = [];

  const b = input.widthMm;
  const h = input.depthMm;
  const L = input.heightM;
  const cover = input.clearCoverMm;
  const wastage = 1 + Math.max(0, input.wastagePercent) / 100;

  const grossAreaMm2 = b * h;

  // ── Concrete ──────────────────────────────────────────────────────────────
  const wetVolM3 = (b / 1000) * (h / 1000) * L;
  const mats = calcRccMaterials(wetVolM3, input.mixKey);

  // ── Longitudinal steel ────────────────────────────────────────────────────
  const longBarLengthM   = input.mainBarCount * L;
  const longBarWeightKg  = rodWeightKgM(input.mainBarDiamMm, longBarLengthM);

  // ── Ties ──────────────────────────────────────────────────────────────────
  const tieCount = Math.ceil((L * 1000) / input.tieSpacingMm) + 1;
  const tiePerimMm = 2 * ((b - 2 * cover) + (h - 2 * cover));
  const tieHookExtMm = Math.max(6 * input.tieDiamMm, 75);
  const tieLengthPerPcM = (tiePerimMm + 2 * tieHookExtMm) / 1000;
  const tieLengthM   = tieCount * tieLengthPerPcM;
  const tieWeightKg  = rodWeightKgM(input.tieDiamMm, tieLengthM);

  const totalSteelKg = (longBarWeightKg + tieWeightKg) * wastage;

  // ── Steel ratio ───────────────────────────────────────────────────────────
  const longBarAreaMm2 = input.mainBarCount * (Math.PI / 4) * input.mainBarDiamMm ** 2;
  const rhoGross = longBarAreaMm2 / grossAreaMm2;

  if (rhoGross < 0.01) {
    warn(warnings, `Longitudinal steel ratio ρ = ${(rhoGross * 100).toFixed(2)}% < 1.0% minimum (BNBC 2020).`);
  }
  if (rhoGross > 0.06) {
    warn(warnings, `Longitudinal steel ratio ρ = ${(rhoGross * 100).toFixed(2)}% > 6.0% maximum (BNBC 2020).`);
  } else if (rhoGross > 0.04) {
    warn(warnings, `Longitudinal steel ratio ρ = ${(rhoGross * 100).toFixed(2)}% > 4.0% — congestion may cause casting difficulties. Practical limit recommendation: ≤ 4%.`);
  }

  // ── Min bar count ─────────────────────────────────────────────────────────
  if (input.mainBarCount < 4) {
    warn(warnings, `Minimum 4 longitudinal bars required for rectangular columns.`);
  }

  // ── Ordinary tie spacing ─────────────────────────────────────────────────
  const leastDimMm = Math.min(b, h);
  if (input.seismicMode === "ordinary") {
    const maxTieSpacing = Math.min(16 * input.mainBarDiamMm, 48 * input.tieDiamMm, leastDimMm);
    if (input.tieSpacingMm > maxTieSpacing) {
      warn(
        warnings,
        `Tie spacing ${input.tieSpacingMm} mm exceeds ordinary max = min(16db_main, 48db_tie, least dimension) = ${maxTieSpacing.toFixed(0)} mm.`
      );
    }
  } else {
    // IMRF / SMRF confinement zone
    const confinementLength = Math.max(leastDimMm, (L * 1000) / 6, 450);
    const maxConfinementSpacing = Math.min(leastDimMm / 4, 6 * input.mainBarDiamMm);
    const practicalSpacingNote = "100–150 mm";
    warn(
      warnings,
      `${input.seismicMode} confinement zone length = max(largest dim, h/6, 450) = ${confinementLength.toFixed(0)} mm from each end. ` +
      `Max tie spacing ≤ min(b_least/4, 6db_main) = ${maxConfinementSpacing.toFixed(0)} mm (practical: ${practicalSpacingNote}).`
    );
    warn(warnings, `Seismic hook: 135° with extension ≥ max(6db_tie, 75 mm) = ${Math.max(6 * input.tieDiamMm, 75)} mm.`);
  }

  // ── Footing/dowel note ────────────────────────────────────────────────────
  const minDownelAreaMm2 = 0.005 * grossAreaMm2;
  warn(
    warnings,
    `Footing/dowel interface: minimum steel area reference = 0.005 × Ag = ${minDownelAreaMm2.toFixed(0)} mm². Verify column-footing connection with engineer.`
  );

  return {
    wetVolumeM3: wetVolM3,
    dryVolumeM3: mats.dryVolumeM3,
    cementBags:  mats.cementBags,
    sandM3:      mats.sandM3,
    sandCft:     mats.sandCft,
    stoneM3:     mats.stoneM3,
    stoneCft:    mats.stoneCft,
    longBarLengthM,
    longBarWeightKg,
    tieCount,
    tieLengthM,
    tieWeightKg,
    totalSteelKg,
    rhoGross,
    warnings,
  };
}
