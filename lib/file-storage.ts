export type UploadCategory =
  | "project-image"
  | "drawing"
  | "invoice"
  | "estimate-pdf"
  | "company-document"
  | "pad-template-a"
  | "pad-template-b";

export interface UploadedFileResult {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: "local";
}

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export const uploadAdminFile = async (file: File, _category: UploadCategory): Promise<UploadedFileResult> => {
  const dataUrl = await toDataUrl(file);
  return {
    url: dataUrl,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    storageProvider: "local",
  };
};
