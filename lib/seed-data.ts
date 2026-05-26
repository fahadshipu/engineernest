import {
  BoqItem,
  CompanyProfile,
  ContentSection,
  DailyReport,
  EstimatorConfig,
  MaterialRate,
  DocumentItem,
  Project,
} from "@/lib/types";

export const projectSeeds: Project[] = [
  {
    id: "p1",
    name: { en: "Gulshan Residential Tower", bn: "গুলশান রেসিডেনশিয়াল টাওয়ার" },
    location: { en: "Dhaka", bn: "ঢাকা" },
    status: { en: "In Progress", bn: "চলমান" },
    budget: 18000000,
  },
  {
    id: "p2",
    name: { en: "Chattogram Factory Retrofit", bn: "চট্টগ্রাম ফ্যাক্টরি রেট্রোফিট" },
    location: { en: "Chattogram", bn: "চট্টগ্রাম" },
    status: { en: "Completed", bn: "সম্পন্ন" },
    budget: 9500000,
  },
];

export const boqSeeds: BoqItem[] = [
  {
    id: "b1",
    item: { en: "Rebar 60 Grade", bn: "রড ৬০ গ্রেড" },
    quantity: 120,
    unit: "ton",
    unitRate: 98000,
  },
  {
    id: "b2",
    item: { en: "Ready Mix Concrete", bn: "রেডি মিক্স কংক্রিট" },
    quantity: 560,
    unit: "cft",
    unitRate: 420,
  },
];

export const reportSeeds: DailyReport[] = [
  {
    id: "r1",
    date: "2026-05-20",
    summary: { en: "Column shuttering completed on level 3.", bn: "৩য় তলায় কলাম শাটারিং সম্পন্ন হয়েছে।" },
    laborCount: 34,
  },
  {
    id: "r2",
    date: "2026-05-21",
    summary: { en: "Electrical conduit layout validated.", bn: "ইলেকট্রিক্যাল কন্ডুইট লে-আউট যাচাই করা হয়েছে।" },
    laborCount: 21,
  },
];

export const documentSeeds: DocumentItem[] = [
  {
    id: "d1",
    title: { en: "Structural Drawing Package", bn: "স্ট্রাকচারাল ড্রইং প্যাকেজ" },
    type: "Drawing",
    url: "https://example.com/structural-drawing.pdf",
  },
  {
    id: "d2",
    title: { en: "Monthly Progress Invoice", bn: "মাসিক প্রগ্রেস ইনভয়েস" },
    type: "Invoice",
    url: "https://example.com/progress-invoice.pdf",
  },
];

export const contentSeeds: ContentSection[] = [
  {
    id: "c1",
    headline: {
      en: "Build smarter with EngineerNest",
      bn: "EngineerNest দিয়ে স্মার্টভাবে নির্মাণ করুন",
    },
    body: {
      en: "From design to site delivery—managed by engineers, tracked digitally.",
      bn: "ডিজাইন থেকে সাইট ডেলিভারি—ইঞ্জিনিয়ারদের মাধ্যমে ডিজিটালি ম্যানেজড।",
    },
    cta: { en: "Get Free Consultation", bn: "ফ্রি কনসালটেশন নিন" },
  },
];

export const materialRateSeeds: MaterialRate[] = [
  {
    id: "cement",
    name: { en: "Cement", bn: "সিমেন্ট" },
    unit: "bag",
    rate: 560,
  },
  {
    id: "rod",
    name: { en: "Rod", bn: "রড" },
    unit: "kg",
    rate: 98,
  },
  {
    id: "sand",
    name: { en: "Sand", bn: "বালু" },
    unit: "cft",
    rate: 52,
  },
  {
    id: "stone",
    name: { en: "Stone chips", bn: "খোয়া" },
    unit: "cft",
    rate: 120,
  },
  {
    id: "brick",
    name: { en: "Brick", bn: "ইট" },
    unit: "pcs",
    rate: 12,
  },
  {
    id: "labor",
    name: { en: "Labor", bn: "শ্রম" },
    unit: "sft",
    rate: 230,
  },
];

export const estimatorConfigSeed: EstimatorConfig = {
  markupPercent: 10,
  vatPercent: 7.5,
  slabThicknessInch: 5,
  steelKgPerSft: 3.2,
  wallAreaFactor: 1.85,
  plasterThicknessMm: 12,
  earthwork: {
    excavationRatePerM3: 320,
    backfillRatePerM3: 180,
    transportDisposalRatePerM3: 240,
    defaultSwellFactor: 1.2,
    defaultCompactionFactor: 0.9,
    defaultSideSlopePercent: 8,
  },
  landPreset: {
    shotokToSft: 435.6,
    kathaToSft: 720,
    bighaToSft: 14400,
  },
};

export const profileSeed: CompanyProfile = {
  companyName: "M/S SKBA ENTERPRISE",
  tagline: {
    en: "Engineer Services",
    bn: "ইঞ্জিনিয়ারিং সেবা",
  },
  phone: "01739894079 / 01401788009",
  email: "fahad.shipu@gmail.com, admin@skbaenterprise.me",
  whatsapp: "01739894079",
  address: {
    en: "West Chattar, College Gate, BOF-1703, Gazipur City",
    bn: "ওয়েস্ট চত্তর, কলেজ গেট, বিওএফ-১৭০৩, গাজীপুর সিটি",
  },
  about: {
    en: "Government contractor and engineering service provider for design, estimation, and construction management.",
    bn: "সরকারি ঠিকাদারি, ডিজাইন, এস্টিমেশন ও কনস্ট্রাকশন ম্যানেজমেন্টে সেবা প্রদানকারী প্রতিষ্ঠান।",
  },
};
