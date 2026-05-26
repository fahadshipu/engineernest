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
  | "materialRates"
  | "workLogs"
  | "inventoryItems";

export interface ProjectStage {
  id: string;
  name: LocalizedText;
  startDate: string;
  endDate: string;
  status: LocalizedText;
  progressPercent: number;
}

export interface Project {
  id: string;
  name: LocalizedText;
  location: LocalizedText;
  status: LocalizedText;
  budget: number;
  spentCost: number;
  startDate: string;
  endDate: string;
  progressPercent: number;
  clientSummary: LocalizedText;
  stages: ProjectStage[];
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

export interface WorkLogPhoto {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: "local" | "supabase";
}

export interface WorkLog {
  id: string;
  date: string;
  projectId: string;
  summary: LocalizedText;
  progressNotes: LocalizedText;
  laborCount: number;
  weather: LocalizedText;
  photos: WorkLogPhoto[];
  remarks: LocalizedText;
}

export interface DocumentItem {
  id: string;
  title: LocalizedText;
  type: string;
  category?: string;
  url: string;
  mimeType?: string;
  fileName?: string;
  sizeBytes?: number;
  storageProvider?: "local" | "supabase";
  createdAt?: string;
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

export interface InventoryItem {
  id: string;
  name: LocalizedText;
  unit: string;
  quantityReceived: number;
  quantityConsumed: number;
  rate?: number;
  supplier?: LocalizedText;
  remarks?: LocalizedText;
}

export interface EstimatorConfig {
  markupPercent: number;
  vatPercent: number;
  slabThicknessInch: number;
  steelKgPerSft: number;
  wallAreaFactor: number;
  plasterThicknessMm: number;
  earthwork: {
    excavationRatePerM3: number;
    backfillRatePerM3: number;
    transportDisposalRatePerM3: number;
    defaultSwellFactor: number;
    defaultCompactionFactor: number;
    defaultSideSlopePercent: number;
  };
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

export type DashboardRole = "engineer" | "client";
