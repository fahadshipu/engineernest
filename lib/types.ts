export type Locale = "en" | "bn";

export type LocalizedText = {
  en: string;
  bn: string;
};

export type CollectionName = "projects" | "boqItems" | "reports" | "documents" | "contentSections";

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

export interface CompanyProfile {
  companyName: string;
  tagline: LocalizedText;
  phone: string;
  email: string;
  whatsapp: string;
  address: LocalizedText;
  about: LocalizedText;
}
