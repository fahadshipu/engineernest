import { EstimatorConfig } from "@/lib/types";

const SFT_PER_M2 = 10.7639;
const CFT_PER_M3 = 35.3147;
const RFT_PER_METER = 3.28084;
const KG_PER_TON = 1000;

export type ConversionUnit =
  | "m2"
  | "sft"
  | "m3"
  | "cft"
  | "meter"
  | "rft"
  | "ton"
  | "kg"
  | "shotok"
  | "katha"
  | "bigha";

const toSftFromLand = (value: number, unit: ConversionUnit, config: EstimatorConfig) => {
  if (unit === "shotok") return value * config.landPreset.shotokToSft;
  if (unit === "katha") return value * config.landPreset.kathaToSft;
  if (unit === "bigha") return value * config.landPreset.bighaToSft;
  return value;
};

const fromSftToLand = (value: number, unit: ConversionUnit, config: EstimatorConfig) => {
  if (unit === "shotok") return value / config.landPreset.shotokToSft;
  if (unit === "katha") return value / config.landPreset.kathaToSft;
  if (unit === "bigha") return value / config.landPreset.bighaToSft;
  return value;
};

export const convertUnit = (value: number, from: ConversionUnit, to: ConversionUnit, config: EstimatorConfig) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (from === to) {
    return value;
  }

  if ((from === "m2" || from === "sft") && (to === "m2" || to === "sft")) {
    return from === "m2" ? value * SFT_PER_M2 : value / SFT_PER_M2;
  }

  if ((from === "m3" || from === "cft") && (to === "m3" || to === "cft")) {
    return from === "m3" ? value * CFT_PER_M3 : value / CFT_PER_M3;
  }

  if ((from === "meter" || from === "rft") && (to === "meter" || to === "rft")) {
    return from === "meter" ? value * RFT_PER_METER : value / RFT_PER_METER;
  }

  if ((from === "ton" || from === "kg") && (to === "ton" || to === "kg")) {
    return from === "ton" ? value * KG_PER_TON : value / KG_PER_TON;
  }

  const landUnits: ConversionUnit[] = ["shotok", "katha", "bigha", "sft"];
  if (landUnits.includes(from) && landUnits.includes(to)) {
    const valueInSft = toSftFromLand(value, from, config);
    return fromSftToLand(valueInSft, to, config);
  }

  return value;
};
