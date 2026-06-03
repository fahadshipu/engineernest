import type { DocumentItem, Locale } from "@/lib/types";

export type PrintHeaderTemplate = "none" | "faisal-enterprise" | "skba-enterprise";

type PrintHeaderTemplateConfig = {
  value: PrintHeaderTemplate;
  label: { en: string; bn: string };
  documentCategory?: string;
};

const PRINT_HEADER_TEMPLATE_CONFIGS: PrintHeaderTemplateConfig[] = [
  {
    value: "none",
    label: { en: "No header (default)", bn: "হেডার ছাড়া (ডিফল্ট)" },
  },
  {
    value: "faisal-enterprise",
    label: { en: "M/S. FAISAL ENTERPRISE", bn: "M/S. FAISAL ENTERPRISE" },
    documentCategory: "pad-template-a",
  },
  {
    value: "skba-enterprise",
    label: { en: "M/S. S.K.B.A. ENTERPRISE", bn: "M/S. S.K.B.A. ENTERPRISE" },
    documentCategory: "pad-template-b",
  },
];

export const getPrintHeaderTemplateOptions = (language: Locale) =>
  PRINT_HEADER_TEMPLATE_CONFIGS.map((template) => ({
    value: template.value,
    label: template.label[language],
  }));

export const getPrintHeaderTemplateLabel = (template: PrintHeaderTemplate, language: Locale) =>
  PRINT_HEADER_TEMPLATE_CONFIGS.find((item) => item.value === template)?.label[language] ??
  PRINT_HEADER_TEMPLATE_CONFIGS[0].label[language];

export const resolvePrintHeaderImageUrl = (documents: DocumentItem[], template: PrintHeaderTemplate): string | null => {
  const category = PRINT_HEADER_TEMPLATE_CONFIGS.find((item) => item.value === template)?.documentCategory;
  if (!category) {
    return null;
  }
  return documents.find((item) => item.category === category)?.url ?? null;
};
