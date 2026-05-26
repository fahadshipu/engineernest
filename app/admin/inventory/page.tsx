"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { calculateRemainingStock } from "@/lib/operations";
import { InventoryItem } from "@/lib/types";

const emptyInventoryItem = (): InventoryItem => ({
  id: "",
  name: { en: "", bn: "" },
  unit: "",
  quantityReceived: 0,
  quantityConsumed: 0,
  rate: 0,
  supplier: { en: "", bn: "" },
  remarks: { en: "", bn: "" },
});

export default function AdminInventoryPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<InventoryItem>("inventoryItems");
  const [form, setForm] = useState<InventoryItem>(emptyInventoryItem());

  const totals = useMemo(
    () => ({
      received: items.reduce((sum, item) => sum + item.quantityReceived, 0),
      consumed: items.reduce((sum, item) => sum + item.quantityConsumed, 0),
      remaining: items.reduce((sum, item) => sum + calculateRemainingStock(item), 0),
    }),
    [items],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptyInventoryItem());
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t(language, "inventory")}</h1>
        <p className="text-sm text-slate-600">
          {t(language, "stockReceived")} · {t(language, "stockConsumed")} · {t(language, "remainingStock")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t(language, "stockReceived"), value: totals.received },
          { label: t(language, "stockConsumed"), value: totals.consumed },
          { label: t(language, "remainingStock"), value: totals.remaining },
        ].map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Material (EN)" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="উপকরণ (BN)" value={form.name.bn} onChange={(e) => setForm({ ...form, name: { ...form.name, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={language === "bn" ? "একক" : "Unit"} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={0} placeholder={language === "bn" ? "গৃহীত পরিমাণ" : "Quantity received"} value={form.quantityReceived} onChange={(e) => setForm({ ...form, quantityReceived: Number(e.target.value) })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={0} placeholder={language === "bn" ? "ব্যবহৃত পরিমাণ" : "Quantity consumed"} value={form.quantityConsumed} onChange={(e) => setForm({ ...form, quantityConsumed: Number(e.target.value) })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={0} placeholder={language === "bn" ? "রেট" : "Rate"} value={form.rate ?? 0} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Supplier (EN)" value={form.supplier?.en ?? ""} onChange={(e) => setForm({ ...form, supplier: { ...(form.supplier ?? { en: "", bn: "" }), en: e.target.value } })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="সরবরাহকারী (BN)" value={form.supplier?.bn ?? ""} onChange={(e) => setForm({ ...form, supplier: { ...(form.supplier ?? { en: "", bn: "" }), bn: e.target.value } })} />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Remarks (EN)" rows={3} value={form.remarks?.en ?? ""} onChange={(e) => setForm({ ...form, remarks: { ...(form.remarks ?? { en: "", bn: "" }), en: e.target.value } })} />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="মন্তব্য (BN)" rows={3} value={form.remarks?.bn ?? ""} onChange={(e) => setForm({ ...form, remarks: { ...(form.remarks ?? { en: "", bn: "" }), bn: e.target.value } })} />
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {t(language, "remainingStock")}: <span className="font-semibold">{calculateRemainingStock(form)} {form.unit || ""}</span>
        </div>
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">
          {form.id ? t(language, "save") : t(language, "addNew")}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => {
          const remaining = calculateRemainingStock(item);
          return (
            <article key={item.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{pick(language, item.name)}</p>
                  <p className="text-sm text-slate-600">
                    {t(language, "supplier")}: {item.supplier ? pick(language, item.supplier) : "—"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${remaining < 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {remaining} {item.unit}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-4">
                <p>{t(language, "stockReceived")}: {item.quantityReceived}</p>
                <p>{t(language, "stockConsumed")}: {item.quantityConsumed}</p>
                <p>{t(language, "rate")}: {item.rate ? `৳ ${item.rate}` : "—"}</p>
                <p>{t(language, "unit")}: {item.unit}</p>
              </div>
              {item.remarks && (item.remarks.en || item.remarks.bn) ? (
                <p className="mt-2 text-sm text-slate-600">{pick(language, item.remarks)}</p>
              ) : null}

              <div className="mt-3 flex gap-2">
                <button onClick={() => setForm(item)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
                <button onClick={() => deleteItem(item.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
              </div>
            </article>
          );
        })}
        {items.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm">{t(language, "noData")}</p>}
      </div>
    </div>
  );
}
