// Client-side PDF text extraction using pdfjs-dist with a worker URL.
import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error - vite handles ?url
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(pdf.numPages, 40);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join("\n\n");
}

export async function extractTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch URL");
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("pdf")) {
    const blob = await res.blob();
    const file = new File([blob], "paper.pdf", { type: "application/pdf" });
    return extractPdfText(file);
  }
  // Fallback: treat as text/HTML
  const txt = await res.text();
  return txt.replace(/<[^>]+>/g, " ");
}
