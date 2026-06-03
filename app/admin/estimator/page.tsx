"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { pick } from "@/lib/i18n";
import { dataLayer } from "@/lib/data-layer";
import {
  type PrintHeaderTemplate,
  getPrintHeaderTemplateLabel,
  getPrintHeaderTemplateOptions,
  resolvePrintHeaderImageUrl,
} from "@/lib/print-header-templates";
import type { CompanyProfile, DocumentItem } from "@/lib/types";

type EstimateItem = {
  id: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
};

type EstimateSection = {
  id: string;
  title: string;
  notes: string;
  items: EstimateItem[];
};

const makeId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

const newItem = (): EstimateItem => ({
  id: makeId(),
  name: "",
  description: "",
  unit: "",
  quantity: 0,
  rate: 0,
});

const newSection = (): EstimateSection => ({
  id: makeId(),
  title: "",
  notes: "",
  items: [newItem()],
});

const money = (value: number) => `৳ ${Math.round(value).toLocaleString()}`;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export default function AdminEstimatorPage() {
  const { language } = useLanguage();

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [printHeaderTemplate, setPrintHeaderTemplate] = useState<PrintHeaderTemplate>("none");
  const [referenceNo, setReferenceNo] = useState("EST-001");
  const [estimateDate, setEstimateDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [remarks, setRemarks] = useState("");

  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [additionalCharge, setAdditionalCharge] = useState(0);

  const [sections, setSections] = useState<EstimateSection[]>([
    {
      id: makeId(),
      title: language === "bn" ? "সিভিল কাজ" : "Civil Works",
      notes: "",
      items: [newItem()],
    },
  ]);

  useEffect(() => {
    void dataLayer.getProfile().then(setCompany);
    void dataLayer.list<DocumentItem>("documents").then(setDocuments);
  }, []);

  const selectedPadHeaderUrl = useMemo(
    () => resolvePrintHeaderImageUrl(documents, printHeaderTemplate),
    [documents, printHeaderTemplate],
  );

  const sectionTotals = useMemo(
    () =>
      sections.map((section) =>
        section.items.reduce((sum, item) => {
          const lineTotal = Math.max(0, item.quantity) * Math.max(0, item.rate);
          return sum + lineTotal;
        }, 0),
      ),
    [sections],
  );

  const subtotal = useMemo(() => sectionTotals.reduce((sum, value) => sum + value, 0), [sectionTotals]);
  const taxAmount = useMemo(() => (subtotal * Math.max(0, taxPercent)) / 100, [subtotal, taxPercent]);
  const grandTotal = useMemo(
    () => Math.max(0, subtotal + taxAmount + Math.max(0, additionalCharge) - Math.max(0, discount)),
    [subtotal, taxAmount, additionalCharge, discount],
  );

  const updateSection = (sectionId: string, updater: (section: EstimateSection) => EstimateSection) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? updater(section) : section)));
  };

  const updateItem = (sectionId: string, itemId: string, key: keyof EstimateItem, value: string | number) => {
    updateSection(sectionId, (section) => ({
      ...section,
      items: section.items.map((item) => (item.id === itemId ? { ...item, [key]: value } : item)),
    }));
  };

  const handlePrint = () => {
    const printHeaderLabel = getPrintHeaderTemplateLabel(printHeaderTemplate, language);
    const rows = sections
      .map((section, sectionIndex) => {
        const body = section.items
          .map((item, itemIndex) => {
            const total = Math.max(0, item.quantity) * Math.max(0, item.rate);
            return `<tr>
              <td>${sectionIndex + 1}.${itemIndex + 1}</td>
              <td>${escapeHtml(item.name || "-")}</td>
              <td>${escapeHtml(item.description || "-")}</td>
              <td>${escapeHtml(item.unit || "-")}</td>
              <td>${item.quantity.toFixed(2)}</td>
              <td>${item.rate.toFixed(2)}</td>
              <td>${total.toFixed(2)}</td>
            </tr>`;
          })
          .join("");

        return `<h3>${escapeHtml(section.title || `Section ${sectionIndex + 1}`)}</h3>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
          <p><strong>Section Subtotal:</strong> ${sectionTotals[sectionIndex].toFixed(2)}</p>
          ${section.notes ? `<p><strong>Notes:</strong> ${escapeHtml(section.notes)}</p>` : ""}`;
      })
      .join("");

    const printable = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Estimate ${escapeHtml(referenceNo)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
            h1, h2, h3 { margin: 0 0 10px; }
            .pad-header { margin-bottom: 10px; }
            .pad-header img { max-height: 150px; width: 100%; object-fit: contain; display: block; }
            .pad-header .pad-name { text-align: center; border: 1px solid #cbd5e1; padding: 10px; font-weight: 700; letter-spacing: 0.2px; }
            .pad-ref-line { border-top: 1px solid #94a3b8; border-bottom: 1px solid #94a3b8; margin-bottom: 12px; padding: 6px 0; display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
            .head { border-bottom: 2px solid #1e3a8a; margin-bottom: 16px; padding-bottom: 12px; }
            .meta { margin: 0 0 16px; font-size: 14px; }
            .meta div { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; font-size: 12px; text-align: left; }
            th { background: #e2e8f0; }
            .summary { margin-top: 16px; width: 340px; margin-left: auto; font-size: 14px; }
            .summary div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .summary .grand { border-top: 1px solid #94a3b8; margin-top: 6px; padding-top: 6px; font-weight: 700; }
          </style>
        </head>
        <body>
          ${printHeaderTemplate === "none" ? "" : `<div class="pad-header">${
            selectedPadHeaderUrl
              ? `<img src="${escapeHtml(selectedPadHeaderUrl)}" alt="${escapeHtml(printHeaderLabel)}" />`
              : `<div class="pad-name">${escapeHtml(printHeaderLabel)}</div>`
          }</div>`}
          <div class="pad-ref-line">
            <div><strong>${language === "bn" ? "রেফ" : "Ref"}:</strong> ${escapeHtml(referenceNo)}</div>
            <div><strong>${language === "bn" ? "তারিখ" : "Date"}:</strong> ${escapeHtml(estimateDate)}</div>
          </div>
          <div class="head">
            <h1>${escapeHtml(company?.companyName ?? "EngineerNest")}</h1>
            <p>${escapeHtml(company ? pick(language, company.tagline) : "")}</p>
            <h2>${language === "bn" ? "কাস্টম এস্টিমেট" : "Custom Estimate"}</h2>
          </div>
          <div class="meta">
            <div><strong>${language === "bn" ? "ক্লায়েন্ট" : "Client"}:</strong> ${escapeHtml(clientName || "-")}</div>
            <div><strong>${language === "bn" ? "প্রজেক্ট" : "Project"}:</strong> ${escapeHtml(projectName || "-")}</div>
            <div><strong>${language === "bn" ? "সাইট" : "Site"}:</strong> ${escapeHtml(siteAddress || "-")}</div>
          </div>
          ${rows}
          <div class="summary">
            <div><span>${language === "bn" ? "সাবটোটাল" : "Subtotal"}</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div><span>${language === "bn" ? "ট্যাক্স" : "Tax"} (${taxPercent.toFixed(2)}%)</span><strong>${taxAmount.toFixed(2)}</strong></div>
            <div><span>${language === "bn" ? "অতিরিক্ত" : "Additional"}</span><strong>${Math.max(0, additionalCharge).toFixed(2)}</strong></div>
            <div><span>${language === "bn" ? "ডিসকাউন্ট" : "Discount"}</span><strong>${Math.max(0, discount).toFixed(2)}</strong></div>
            <div class="grand"><span>${language === "bn" ? "গ্র্যান্ড টোটাল" : "Grand Total"}</span><strong>${grandTotal.toFixed(2)}</strong></div>
          </div>
          ${remarks ? `<p><strong>${language === "bn" ? "মন্তব্য" : "Remarks"}:</strong> ${escapeHtml(remarks)}</p>` : ""}
          <script>window.print()</script>
        </body>
      </html>`;

    const popup = window.open("", "_blank", "width=1100,height=850");
    if (!popup) return;
    popup.document.open();
    popup.document.write(printable);
    popup.document.close();
  };

  const handleExportCsv = () => {
    const lines = [
      ["Section", "Item", "Description", "Unit", "Quantity", "Rate", "Total"],
      ...sections.flatMap((section) =>
        section.items.map((item) => [
          section.title,
          item.name,
          item.description,
          item.unit,
          String(item.quantity),
          String(item.rate),
          String(item.quantity * item.rate),
        ]),
      ),
      ["", "", "", "", "", "Subtotal", String(subtotal)],
      ["", "", "", "", "", `Tax (${taxPercent}%)`, String(taxAmount)],
      ["", "", "", "", "", "Additional", String(additionalCharge)],
      ["", "", "", "", "", "Discount", String(discount)],
      ["", "", "", "", "", "Grand Total", String(grandTotal)],
    ];

    const csv = lines
      .map((line) =>
        line
          .map((value) => {
            const sanitized = String(value ?? "").replaceAll('"', '""');
            return `"${sanitized}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${referenceNo || "estimate"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-blue-950">{language === "bn" ? "কাস্টম এস্টিমেটর" : "Custom Estimator"}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {language === "bn"
                ? "শুধু অ্যাডমিনের জন্য পূর্ণ কাস্টম এস্টিমেট — সেকশন ও আইটেম ইচ্ছামতো যোগ/বিয়োগ করুন।"
                : "Admin-only fully customizable estimator. Add/remove sections and items freely."}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button type="button" onClick={handleExportCsv} className="rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">
              {language === "bn" ? "CSV এক্সপোর্ট" : "Export CSV"}
            </button>
            <button type="button" onClick={handlePrint} className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              {language === "bn" ? "প্রিন্ট" : "Print"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">{language === "bn" ? "এস্টিমেট তথ্য" : "Estimate details"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">{language === "bn" ? "রেফারেন্স নং" : "Reference no"}
            <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">{language === "bn" ? "তারিখ" : "Date"}
            <input type="date" value={estimateDate} onChange={(e) => setEstimateDate(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">{language === "bn" ? "প্যাড হেডার" : "Pad header"}
            <select value={printHeaderTemplate} onChange={(e) => setPrintHeaderTemplate(e.target.value as PrintHeaderTemplate)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {getPrintHeaderTemplateOptions(language).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">{language === "bn" ? "ক্লায়েন্ট" : "Client"}
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">{language === "bn" ? "প্রজেক্ট" : "Project"}
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">{language === "bn" ? "সাইট ঠিকানা" : "Site address"}
            <input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>
      </section>

      {sections.map((section, sectionIndex) => (
        <section key={section.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-blue-900">{language === "bn" ? `সেকশন ${sectionIndex + 1}` : `Section ${sectionIndex + 1}`}</h3>
            <button
              type="button"
              onClick={() => setSections((prev) => prev.filter((item) => item.id !== section.id))}
              disabled={sections.length === 1}
              className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {language === "bn" ? "সেকশন মুছুন" : "Remove section"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">{language === "bn" ? "সেকশনের নাম" : "Section title"}
              <input
                value={section.title}
                onChange={(e) => updateSection(section.id, (current) => ({ ...current, title: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">{language === "bn" ? "নোট" : "Section notes"}
              <input
                value={section.notes}
                onChange={(e) => updateSection(section.id, (current) => ({ ...current, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-200 px-2 py-2 text-left">{language === "bn" ? "আইটেম" : "Item"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">{language === "bn" ? "বিবরণ" : "Description"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">{language === "bn" ? "ইউনিট" : "Unit"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-right">{language === "bn" ? "পরিমাণ" : "Qty"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-right">{language === "bn" ? "রেট" : "Rate"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-right">{language === "bn" ? "মোট" : "Total"}</th>
                  <th className="border border-slate-200 px-2 py-2 text-center">{language === "bn" ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => {
                  const lineTotal = Math.max(0, item.quantity) * Math.max(0, item.rate);
                  return (
                    <tr key={item.id}>
                      <td className="border border-slate-200 p-2"><input value={item.name} onChange={(e) => updateItem(section.id, item.id, "name", e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" /></td>
                      <td className="border border-slate-200 p-2"><input value={item.description} onChange={(e) => updateItem(section.id, item.id, "description", e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" /></td>
                      <td className="border border-slate-200 p-2"><input value={item.unit} onChange={(e) => updateItem(section.id, item.id, "unit", e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" /></td>
                      <td className="border border-slate-200 p-2"><input type="number" min={0} value={item.quantity} onChange={(e) => updateItem(section.id, item.id, "quantity", Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-1 text-right" /></td>
                      <td className="border border-slate-200 p-2"><input type="number" min={0} value={item.rate} onChange={(e) => updateItem(section.id, item.id, "rate", Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-1 text-right" /></td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">{money(lineTotal)}</td>
                      <td className="border border-slate-200 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => updateSection(section.id, (current) => ({ ...current, items: current.items.filter((next) => next.id !== item.id) }))}
                          disabled={section.items.length === 1}
                          className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {language === "bn" ? "মুছুন" : "Remove"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => updateSection(section.id, (current) => ({ ...current, items: [...current.items, newItem()] }))}
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900"
            >
              {language === "bn" ? "আইটেম যোগ করুন" : "Add item"}
            </button>
            <p className="text-sm font-semibold text-blue-950">{language === "bn" ? "সেকশন সাবটোটাল" : "Section subtotal"}: {money(sectionTotals[sectionIndex])}</p>
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSections((prev) => [...prev, newSection()])}
            className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            {language === "bn" ? "নতুন সেকশন যোগ করুন" : "Add new section"}
          </button>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              {language === "bn" ? "ট্যাক্স %" : "Tax %"}
              <input type="number" min={0} value={taxPercent} onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {language === "bn" ? "ডিসকাউন্ট" : "Discount"}
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {language === "bn" ? "অতিরিক্ত চার্জ" : "Additional charge"}
              <input type="number" min={0} value={additionalCharge} onChange={(e) => setAdditionalCharge(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="space-y-1 text-sm text-blue-950">
            <p className="flex justify-between"><span>{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span><strong>{money(subtotal)}</strong></p>
            <p className="flex justify-between"><span>{language === "bn" ? "ট্যাক্স" : "Tax"} ({taxPercent}%)</span><strong>{money(taxAmount)}</strong></p>
            <p className="flex justify-between"><span>{language === "bn" ? "অতিরিক্ত" : "Additional"}</span><strong>{money(additionalCharge)}</strong></p>
            <p className="flex justify-between"><span>{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</span><strong>- {money(discount)}</strong></p>
            <p className="flex justify-between border-t border-blue-200 pt-2 text-base"><span>{language === "bn" ? "গ্র্যান্ড টোটাল" : "Grand total"}</span><strong>{money(grandTotal)}</strong></p>
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          {language === "bn" ? "মন্তব্য / Remarks" : "Notes / Remarks"}
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
      </section>

      <section className="estimate-print-root rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {printHeaderTemplate !== "none" && (
          <div className="mb-3">
            {selectedPadHeaderUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPadHeaderUrl} alt={getPrintHeaderTemplateLabel(printHeaderTemplate, language)} className="max-h-36 w-full rounded object-contain" />
            ) : (
              <p className="rounded border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700">
                {getPrintHeaderTemplateLabel(printHeaderTemplate, language)}
              </p>
            )}
          </div>
        )}
        <h2 className="text-xl font-bold text-blue-950">{language === "bn" ? "প্রিন্ট প্রিভিউ সারাংশ" : "Print preview summary"}</h2>
        <div className="mt-2 grid gap-1 border-y border-slate-300 py-2 text-sm text-slate-700 md:grid-cols-2">
          <p><strong>{language === "bn" ? "রেফ" : "Ref"}:</strong> {referenceNo || "-"}</p>
          <p><strong>{language === "bn" ? "তারিখ" : "Date"}:</strong> {estimateDate || "-"}</p>
          <p><strong>{language === "bn" ? "ক্লায়েন্ট" : "Client"}:</strong> {clientName || "-"}</p>
          <p><strong>{language === "bn" ? "প্রজেক্ট" : "Project"}:</strong> {projectName || "-"}</p>
        </div>
        <p className="mt-3 text-lg font-semibold text-blue-950">{language === "bn" ? "মোট" : "Total"}: {money(grandTotal)}</p>
      </section>
    </div>
  );
}
