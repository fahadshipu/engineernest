import { MaterialRate, MaterialRateKey } from "@/lib/types";

export interface EstimateLineItem {
  key: MaterialRateKey;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
  name: MaterialRate["name"];
}

const amountFor = (quantity: number, rate: number) => quantity * rate;

export const estimateBudget = (
  quantities: Record<MaterialRateKey, number>,
  rates: MaterialRate[],
  markupPercent: number,
  vatPercent: number,
) => {
  const lines: EstimateLineItem[] = rates.map((rate) => {
    const quantity = quantities[rate.id] ?? 0;
    return {
      key: rate.id,
      quantity,
      rate: rate.rate,
      amount: amountFor(quantity, rate.rate),
      unit: rate.unit,
      name: rate.name,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const markup = (subtotal * Math.max(markupPercent, 0)) / 100;
  const vat = ((subtotal + markup) * Math.max(vatPercent, 0)) / 100;

  return {
    lines,
    subtotal,
    markup,
    vat,
    total: subtotal + markup + vat,
  };
};
