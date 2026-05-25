export type Locale = "en" | "bn";

export type LocalizedText = {
  en: string;
  bn: string;
};

export type CollectionName =
  | "projects"
  | "boqItems"
  | "reports"
  | "documents"
  | "contentSections"
  | "materialRates";

export interface Project {
  id: string;
  name: LocalizedText;
  location: LocalizedText;
  status: LocalizedText;
  budget: number;
}

export interface BoqItem {
  id: string;
  item: LocalizedText;
  quantity: number;
  unit: string;
  unitRate: number;
}

export interface DailyReport {
  id: string;
  date: string;
  summary: LocalizedText;
  laborCount: number;
}

export interface DocumentItem {
  id: string;
  title: LocalizedText;
  type: string;
  url: string;
}

export interface ContentSection {
  id: string;
  headline: LocalizedText;
  body: LocalizedText;
  cta: LocalizedText;
}

export type MaterialRateKey = "cement" | "rod" | "sand" | "stone" | "brick" | "labor";

export interface MaterialRate {
  id: MaterialRateKey;
  name: LocalizedText;
  unit: string;
  rate: number;
}

export interface EstimatorConfig {
  markupPercent: number;
  vatPercent: number;
  slabThicknessInch: number;
  steelKgPerSft: number;
  wallAreaFactor: number;
  plasterThicknessMm: number;
  landPreset: {
    shotokToSft: number;
    kathaToSft: number;
    bighaToSft: number;
  };
}

export interface CompanyProfile {
  companyName: string;
  tagline: LocalizedText;
  phone: string;
  email: string;
  whatsapp: string;
  address: LocalizedText;
  about: LocalizedText;
}
