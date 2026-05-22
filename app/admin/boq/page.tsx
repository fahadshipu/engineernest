"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/data-layer";
import { pick, t } from "@/lib/i18n";
import { useCollectionManager } from "@/hooks/use-collection-manager";
import { useLanguage } from "@/components/language-provider";
import { BoqItem } from "@/lib/types";

const emptyItem = (): BoqItem => ({
  id: "",
  item: { en: "", bn: "" },
  quantity: 0,
  unit: "",
  unitRate: 0,
});

export default function AdminBoqPage() {
  const { language } = useLanguage();
  const { items, saveItem, deleteItem } = useCollectionManager<BoqItem>("boqItems");
  const [form, setForm] = useState<BoqItem>(emptyItem());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveItem({ ...form, id: form.id || createId() });
    setForm(emptyItem());
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t(language, "boq")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Item (EN)" value={form.item.en} onChange={(e) => setForm({ ...form, item: { ...form.item, en: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="আইটেম (BN)" value={form.item.bn} onChange={(e) => setForm({ ...form, item: { ...form.item, bn: e.target.value } })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Unit Rate" value={form.unitRate} onChange={(e) => setForm({ ...form, unitRate: Number(e.target.value) })} required />
        <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white" type="submit">{form.id ? t(language, "save") : t(language, "addNew")}</button>
      </form>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-semibold">{pick(language, item.item)}</p>
            <p className="text-sm text-slate-600">{item.quantity} {item.unit} × ৳ {item.unitRate.toLocaleString()}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(item)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">{t(language, "edit")}</button>
              <button onClick={() => deleteItem(item.id)} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600">{t(language, "del")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
