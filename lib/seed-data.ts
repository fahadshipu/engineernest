import {
  BoqItem,
  CompanyProfile,
  ContentSection,
  DailyReport,
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

export const profileSeed: CompanyProfile = {
  companyName: "EngineerNest",
  tagline: {
    en: "Durable engineering. Modern execution.",
    bn: "নির্মাণে স্থায়িত্ব, বাস্তবায়নে আধুনিকতা।",
  },
  phone: "+880 1712-345678",
  email: "info@engineernest.local",
  whatsapp: "+8801712345678",
  address: {
    en: "House 10, Road 7, Dhaka, Bangladesh",
    bn: "বাড়ি ১০, রোড ৭, ঢাকা, বাংলাদেশ",
  },
  about: {
    en: "Professional engineering and construction management partner for residential and commercial projects.",
    bn: "আবাসিক ও বাণিজ্যিক প্রকল্পের জন্য পেশাদার ইঞ্জিনিয়ারিং ও কনস্ট্রাকশন ম্যানেজমেন্ট পার্টনার।",
  },
};
