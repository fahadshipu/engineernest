"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { pick } from "@/lib/i18n";

type SiteChecklistSection = {
  id: string;
  title: { en: string; bn: string };
  items: Array<{ id: string; text: { en: string; bn: string }; critical?: boolean }>;
};

const sections: SiteChecklistSection[] = [
  {
    id: "excavation",
    title: { en: "Excavation safety checklist", bn: "খনন কাজের সেফটি চেকলিস্ট" },
    items: [
      { id: "exc1", text: { en: "Barricading and warning signs installed", bn: "বেরিকেড ও সতর্কীকরণ সাইন বসানো হয়েছে" }, critical: true },
      { id: "exc2", text: { en: "Slope/shoring reviewed before work", bn: "কাজের আগে স্লোপ/শোরিং যাচাই করা হয়েছে" }, critical: true },
      { id: "exc3", text: { en: "Safe access and egress provided", bn: "নিরাপদ প্রবেশ/বাহির পথ রাখা হয়েছে" } },
    ],
  },
  {
    id: "worker",
    title: { en: "Worker safety checklist", bn: "শ্রমিক সেফটি চেকলিস্ট" },
    items: [
      { id: "wrk1", text: { en: "PPE in use (helmet, vest, boots)", bn: "PPE ব্যবহার (হেলমেট, ভেস্ট, বুট)" }, critical: true },
      { id: "wrk2", text: { en: "Toolbox talk conducted", bn: "টুলবক্স টক সম্পন্ন হয়েছে" } },
      { id: "wrk3", text: { en: "First-aid and emergency contact displayed", bn: "ফার্স্ট এইড ও ইমার্জেন্সি কন্টাক্ট প্রদর্শিত" }, critical: true },
    ],
  },
  {
    id: "temporary",
    title: { en: "Temporary works checklist", bn: "টেম্পোরারি ওয়ার্কস চেকলিস্ট" },
    items: [
      { id: "tmp1", text: { en: "Scaffold/formwork inspected", bn: "স্ক্যাফোল্ড/ফর্মওয়ার্ক পরিদর্শন করা হয়েছে" }, critical: true },
      { id: "tmp2", text: { en: "Electrical temporary lines protected", bn: "অস্থায়ী ইলেকট্রিক লাইনে সুরক্ষা রয়েছে" }, critical: true },
    ],
  },
  {
    id: "materials",
    title: { en: "Material stacking checklist", bn: "মেটেরিয়াল স্ট্যাকিং চেকলিস্ট" },
    items: [
      { id: "mat1", text: { en: "Cement stored dry and raised platform", bn: "সিমেন্ট শুকনা ও উঁচু প্ল্যাটফর্মে রাখা হয়েছে" } },
      { id: "mat2", text: { en: "Steel and aggregates stacked safely", bn: "রড ও এগ্রিগেট নিরাপদে স্ট্যাক করা হয়েছে" } },
    ],
  },
  {
    id: "docs",
    title: { en: "Documentation checklist", bn: "ডকুমেন্টেশন চেকলিস্ট" },
    items: [
      { id: "doc1", text: { en: "Permit-to-work records updated", bn: "Permit-to-work রেকর্ড আপডেট করা হয়েছে" }, critical: true },
      { id: "doc2", text: { en: "Inspection and test records filed", bn: "ইনস্পেকশন ও টেস্ট রেকর্ড সংরক্ষণ করা হয়েছে" } },
    ],
  },
];

type DailyLog = {
  id: string;
  date: string;
  note: string;
  score: number;
  criticalOpen: number;
};

export default function AdminSiteCompliancePage() {
  const { language } = useLanguage();
  const [siteInfo, setSiteInfo] = useState({
    siteName: "",
    location: "",
    supervisor: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [logNote, setLogNote] = useState("");
  const [logs, setLogs] = useState<DailyLog[]>([]);

  const allItems = sections.flatMap((section) => section.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter((item) => checked[item.id]).length;
  const score = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const criticalMissing = allItems.filter((item) => item.critical && !checked[item.id]);

  const sectionScores = useMemo(
    () =>
      sections.map((section) => {
        const done = section.items.filter((item) => checked[item.id]).length;
        return { section, done, total: section.items.length };
      }),
    [checked],
  );

  const addLog = (event: FormEvent) => {
    event.preventDefault();
    if (!siteInfo.date || !logNote.trim()) {
      return;
    }
    const entry: DailyLog = {
      id: `${siteInfo.date}-${logs.length + 1}`,
      date: siteInfo.date,
      note: logNote.trim(),
      score,
      criticalOpen: criticalMissing.length,
    };
    setLogs((prev) => [entry, ...prev]);
    setLogNote("");
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{language === "bn" ? "BNBC-aware সাইট কমপ্লায়েন্স" : "BNBC-aware site compliance"}</h1>
      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        {language === "bn"
          ? "এটি BNBC-aware guidance checklist মডিউল; এটি কোনো certified/legal compliance engine নয়। প্রকৃত সাইট কমপ্লায়েন্স যোগ্য প্রকৌশলী ও নিরাপত্তা কর্মকর্তার মাধ্যমে নিশ্চিত করতে হবে।"
          : "This is a BNBC-aware guidance checklist module, not a certified/legal compliance engine. Actual site compliance must be validated by qualified engineers and safety professionals."}
      </p>

      <section className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">{language === "bn" ? "Site info" : "Site info"}</h2>
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "সাইট নাম" : "Site name"} value={siteInfo.siteName} onChange={(e) => setSiteInfo({ ...siteInfo, siteName: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "লোকেশন" : "Location"} value={siteInfo.location} onChange={(e) => setSiteInfo({ ...siteInfo, location: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "সুপারভাইজার" : "Supervisor"} value={siteInfo.supervisor} onChange={(e) => setSiteInfo({ ...siteInfo, supervisor: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={siteInfo.date} onChange={(e) => setSiteInfo({ ...siteInfo, date: e.target.value })} />
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">{language === "bn" ? "কমপ্লিশন স্কোর" : "Completion score"}</p>
            <p className="text-2xl font-bold text-blue-900">{score}%</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">{language === "bn" ? "সম্পন্ন আইটেম" : "Completed items"}</p>
            <p className="text-2xl font-bold text-blue-900">{completedItems}/{totalItems}</p>
          </div>
          <div className={`rounded-lg p-3 text-sm ${criticalMissing.length > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
            <p>{language === "bn" ? "Critical missing" : "Critical missing"}</p>
            <p className="text-2xl font-bold">{criticalMissing.length}</p>
          </div>
        </div>

        {criticalMissing.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="mb-2 font-semibold">{language === "bn" ? "তাৎক্ষণিকভাবে যাচাই করুন" : "Check immediately"}</p>
            <ul className="list-disc space-y-1 pl-5">
              {criticalMissing.map((item) => (
                <li key={item.id}>{pick(language, item.text)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.id} className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 font-semibold">{pick(language, section.title)}</p>
              <div className="mb-2 text-xs text-slate-500">
                {sectionScores.find((item) => item.section.id === section.id)?.done ?? 0}/{section.items.length}
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked[item.id] ?? false}
                      onChange={(event) => setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))}
                      className="mt-1"
                    />
                    <span className={item.critical ? "font-medium" : ""}>
                      {pick(language, item.text)} {item.critical ? (language === "bn" ? "(Critical)" : "(Critical)") : ""}
                    </span>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{language === "bn" ? "Daily compliance log" : "Daily compliance log"}</h2>
        <form onSubmit={addLog} className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={siteInfo.date} onChange={(e) => setSiteInfo({ ...siteInfo, date: e.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "আজকের কমপ্লায়েন্স নোট" : "Today’s compliance note"} value={logNote} onChange={(e) => setLogNote(e.target.value)} required />
          <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">
            {language === "bn" ? "লগ যোগ করুন" : "Add log"}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">{language === "bn" ? "এখনো কোনো লগ নেই" : "No logs yet"}</p>
          ) : (
            logs.map((log) => (
              <article key={log.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold">{log.date}</p>
                <p className="text-slate-600">{log.note}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {language === "bn" ? "স্কোর" : "Score"}: {log.score}% · {language === "bn" ? "Critical missing" : "Critical missing"}: {log.criticalOpen}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
