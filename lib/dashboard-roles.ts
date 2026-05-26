import { DashboardRole, LocalizedText } from "@/lib/types";

export const dashboardRoles: Record<
  DashboardRole,
  {
    route: string;
    label: LocalizedText;
    description: LocalizedText;
    canEdit: boolean;
  }
> = {
  engineer: {
    route: "/admin/dashboard",
    label: { en: "Engineer/Admin view", bn: "ইঞ্জিনিয়ার/এডমিন ভিউ" },
    description: {
      en: "Operational workspace with editable logs, stock, schedules, and technical tools.",
      bn: "লগ, স্টক, শিডিউল এবং টেকনিক্যাল টুল সম্পাদনাযোগ্য অপারেশনাল ওয়ার্কস্পেস।",
    },
    canEdit: true,
  },
  client: {
    route: "/client/dashboard",
    label: { en: "Client view", bn: "ক্লায়েন্ট ভিউ" },
    description: {
      en: "Read-only project status, timeline, photo, and cost visibility for clients.",
      bn: "ক্লায়েন্টদের জন্য শুধুমাত্র দেখার উপযোগী প্রজেক্ট স্ট্যাটাস, টাইমলাইন, ছবি ও খরচের ভিউ।",
    },
    canEdit: false,
  },
};
