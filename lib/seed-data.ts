import {
  BoqItem,
  CompanyProfile,
  ContentSection,
  DailyReport,
  EstimatorConfig,
  DocumentItem,
  InventoryItem,
  MaterialRate,
  Project,
  WorkLog,
} from "@/lib/types";

const workLogPhotoA =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23dbeafe'/%3E%3Crect x='60' y='180' width='480' height='140' rx='16' fill='%239ca3af'/%3E%3Crect x='110' y='110' width='120' height='80' rx='10' fill='%23f59e0b'/%3E%3Cpath d='M240 250l80-90 70 70 50-45 90 65H240Z' fill='%232563eb'/%3E%3Ctext x='50%25' y='360' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='26' fill='%230f172a'%3ESite Progress Photo%3C/text%3E%3C/svg%3E";
const workLogPhotoB =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23dcfce7'/%3E%3Crect x='70' y='170' width='460' height='150' rx='18' fill='%2364748b'/%3E%3Ccircle cx='170' cy='130' r='42' fill='%23facc15'/%3E%3Cpath d='M240 255l70-75 55 42 75-80 88 113H240Z' fill='%2316a34a'/%3E%3Ctext x='50%25' y='355' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%230f172a'%3EDaily Work Log%3C/text%3E%3C/svg%3E";

export const projectSeeds: Project[] = [
  {
    id: "p1",
    name: { en: "Gulshan Residential Tower", bn: "গুলশান রেসিডেনশিয়াল টাওয়ার" },
    location: { en: "Dhaka", bn: "ঢাকা" },
    status: { en: "In Progress", bn: "চলমান" },
    budget: 18000000,
    spentCost: 11250000,
    startDate: "2026-03-01",
    endDate: "2026-12-20",
    progressPercent: 62,
    clientSummary: {
      en: "Structural frame is progressing floor by floor, with MEP coordination underway.",
      bn: "স্ট্রাকচারাল ফ্রেম ধাপে ধাপে এগোচ্ছে এবং এমইপি সমন্বয় কাজ চলছে।",
    },
    stages: [
      {
        id: "p1-s1",
        name: { en: "Foundation & Substructure", bn: "ফাউন্ডেশন ও সাবস্ট্রাকচার" },
        startDate: "2026-03-01",
        endDate: "2026-04-20",
        status: { en: "Completed", bn: "সম্পন্ন" },
        progressPercent: 100,
      },
      {
        id: "p1-s2",
        name: { en: "Superstructure", bn: "সুপারস্ট্রাকচার" },
        startDate: "2026-04-21",
        endDate: "2026-08-30",
        status: { en: "In Progress", bn: "চলমান" },
        progressPercent: 70,
      },
      {
        id: "p1-s3",
        name: { en: "Finishing & Handover", bn: "ফিনিশিং ও হ্যান্ডওভার" },
        startDate: "2026-09-01",
        endDate: "2026-12-20",
        status: { en: "Pending", bn: "অপেক্ষমাণ" },
        progressPercent: 15,
      },
    ],
  },
  {
    id: "p2",
    name: { en: "Chattogram Factory Retrofit", bn: "চট্টগ্রাম ফ্যাক্টরি রেট্রোফিট" },
    location: { en: "Chattogram", bn: "চট্টগ্রাম" },
    status: { en: "Completed", bn: "সম্পন্ন" },
    budget: 9500000,
    spentCost: 9300000,
    startDate: "2025-11-10",
    endDate: "2026-04-18",
    progressPercent: 100,
    clientSummary: {
      en: "Retrofit package completed with production-safe phasing and close-out documentation delivered.",
      bn: "প্রোডাকশন-সেফ ফেজিংসহ রেট্রোফিট প্যাকেজ সম্পন্ন হয়েছে এবং ক্লোজ-আউট ডকুমেন্ট হস্তান্তর করা হয়েছে।",
    },
    stages: [
      {
        id: "p2-s1",
        name: { en: "Assessment & Design", bn: "অ্যাসেসমেন্ট ও ডিজাইন" },
        startDate: "2025-11-10",
        endDate: "2025-12-15",
        status: { en: "Completed", bn: "সম্পন্ন" },
        progressPercent: 100,
      },
      {
        id: "p2-s2",
        name: { en: "Retrofit Execution", bn: "রেট্রোফিট এক্সিকিউশন" },
        startDate: "2025-12-16",
        endDate: "2026-03-28",
        status: { en: "Completed", bn: "সম্পন্ন" },
        progressPercent: 100,
      },
      {
        id: "p2-s3",
        name: { en: "Testing & Handover", bn: "টেস্টিং ও হ্যান্ডওভার" },
        startDate: "2026-03-29",
        endDate: "2026-04-18",
        status: { en: "Completed", bn: "সম্পন্ন" },
        progressPercent: 100,
      },
    ],
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

export const workLogSeeds: WorkLog[] = [
  {
    id: "wl1",
    date: "2026-05-24",
    projectId: "p1",
    summary: {
      en: "Level 6 slab reinforcement tied and column shutter alignment checked.",
      bn: "৬ষ্ঠ তলার স্ল্যাব রড বাঁধাই সম্পন্ন এবং কলাম শাটারের অ্যালাইনমেন্ট পরীক্ষা করা হয়েছে।",
    },
    progressNotes: {
      en: "Concrete pour for the slab remains on track for tomorrow morning.",
      bn: "আগামীকাল সকালেই স্ল্যাব কংক্রিট ঢালাইয়ের প্রস্তুতি সম্পন্ন রয়েছে।",
    },
    laborCount: 38,
    weather: { en: "Cloudy with light wind", bn: "মেঘলা, হালকা বাতাস" },
    photos: [
      {
        url: workLogPhotoA,
        fileName: "gulshan-slab-progress.svg",
        mimeType: "image/svg+xml",
        sizeBytes: 1820,
        storageProvider: "local",
      },
    ],
    remarks: {
      en: "Rebar cover blocks restocked before shift close.",
      bn: "শিফট শেষ হওয়ার আগে রিবার কভার ব্লক পুনরায় সংগ্রহ করা হয়েছে।",
    },
  },
  {
    id: "wl2",
    date: "2026-05-23",
    projectId: "p2",
    summary: {
      en: "Final punch list review completed with client representative.",
      bn: "ক্লায়েন্ট প্রতিনিধির উপস্থিতিতে ফাইনাল পাঞ্চ লিস্ট রিভিউ সম্পন্ন হয়েছে।",
    },
    progressNotes: {
      en: "Only signage relocation remained before handover closure.",
      bn: "হ্যান্ডওভার ক্লোজারের আগে শুধু সাইনেজ রিলোকেশন বাকি ছিল।",
    },
    laborCount: 12,
    weather: { en: "Warm and dry", bn: "উষ্ণ ও শুষ্ক" },
    photos: [
      {
        url: workLogPhotoB,
        fileName: "factory-closeout.svg",
        mimeType: "image/svg+xml",
        sizeBytes: 1760,
        storageProvider: "local",
      },
    ],
    remarks: {
      en: "Close-out documents uploaded to the project archive.",
      bn: "ক্লোজ-আউট ডকুমেন্ট প্রজেক্ট আর্কাইভে আপলোড করা হয়েছে।",
    },
  },
];

export const documentSeeds: DocumentItem[] = [
  {
    id: "d1",
    title: { en: "Structural Drawing Package", bn: "স্ট্রাকচারাল ড্রইং প্যাকেজ" },
    type: "Drawing",
    category: "drawing",
    url: "https://example.com/structural-drawing.pdf",
  },
  {
    id: "d2",
    title: { en: "Monthly Progress Invoice", bn: "মাসিক প্রগ্রেস ইনভয়েস" },
    type: "Invoice",
    category: "invoice",
    url: "https://example.com/progress-invoice.pdf",
  },
  {
    id: "d3",
    title: { en: "Company Pad Header A", bn: "কোম্পানি প্যাড হেডার A" },
    type: "Pad Template",
    category: "pad-template-a",
    url: "https://example.com/pad-template-a.jpg",
  },
  {
    id: "d4",
    title: { en: "Company Pad Header B", bn: "কোম্পানি প্যাড হেডার B" },
    type: "Pad Template",
    category: "pad-template-b",
    url: "https://example.com/pad-template-b.jpg",
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

export const inventorySeeds: InventoryItem[] = [
  {
    id: "inv1",
    name: { en: "Cement", bn: "সিমেন্ট" },
    unit: "bag",
    quantityReceived: 1200,
    quantityConsumed: 860,
    rate: 560,
    supplier: { en: "Dhaka Traders", bn: "ঢাকা ট্রেডার্স" },
    remarks: { en: "Reserved for slab and stair casting", bn: "স্ল্যাব ও সিঁড়ির কাস্টিংয়ের জন্য সংরক্ষিত" },
  },
  {
    id: "inv2",
    name: { en: "MS Rod 60 Grade", bn: "এমএস রড ৬০ গ্রেড" },
    unit: "kg",
    quantityReceived: 24000,
    quantityConsumed: 18500,
    rate: 98,
    supplier: { en: "Chattogram Steel House", bn: "চট্টগ্রাম স্টিল হাউস" },
    remarks: { en: "Cutting schedule aligned with level 6 shuttering", bn: "লেভেল ৬ শাটারিংয়ের সাথে কাটিং সূচি সমন্বয় করা হয়েছে" },
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
