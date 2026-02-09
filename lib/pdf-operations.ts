/* ============================================================================
   PDF OPERATIONS – PRODUCTION READY (VERCEL SAFE)
   Browser-only functions are guarded.
   Public API is stable and complete.
============================================================================ */

import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { encryptPDF as encryptPDFBytes } from "@pdfsmaller/pdf-encrypt-lite";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ============================== CONSTANTS ============================== */

const PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;
const MAX_HTML_CHARS = 500_000;
const MAX_CANVAS_HEIGHT_PX = 16_000;

/* =============================== HELPERS =============================== */

function pxToUnit(px: number, unit: "mm" | "in") {
  return unit === "in" ? px / PX_PER_INCH : (px * MM_PER_INCH) / PX_PER_INCH;
}

function sanitizeHTML(input: string): string {
  const template = document.createElement("template");
  template.innerHTML = input;

  ["script", "iframe", "object", "embed", "link"].forEach(tag => {
    template.content.querySelectorAll(tag).forEach(el => el.remove());
  });

  template.content.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith("on") || /javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return template.innerHTML;
}

async function waitForResources(doc: Document) {
  const images = Array.from(doc.images).map(
    img =>
      new Promise<void>(res => {
        if (img.complete) return res();
        img.onload = img.onerror = () => res();
      })
  );

  if ("fonts" in doc) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (doc as any).fonts.ready;
    } catch {}
  }

  await Promise.all(images);
}

/* ============================ CORE PDF OPS ============================ */

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();

  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const pages = await out.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => out.addPage(p));
  }

  return out.save();
}

export async function extractPages(
  file: File,
  pageIndices: number[]
): Promise<Uint8Array> {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, pageIndices);
  pages.forEach(p => out.addPage(p));
  return out.save();
}

export async function rotatePDF(
  file: File,
  rotation: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdf.getPages();
  const targets = pageIndices ?? pages.map((_, i) => i);

  targets.forEach(i => {
    if (pages[i]) {
      pages[i].setRotation(degrees(pages[i].getRotation().angle + rotation));
    }
  });

  return pdf.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setCreator("");
  pdf.setProducer("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  return pdf.save({ useObjectStreams: true });
}

export async function addWatermark(
  file: File,
  text: string,
  options?: { fontSize?: number; opacity?: number; rotation?: number }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const size = options?.fontSize ?? 48;
  const opacity = options?.opacity ?? 0.3;
  const rotation = options?.rotation ?? -45;

  pdf.getPages().forEach(page => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    });
  });

  return pdf.save();
}

export async function organizePDF(
  file: File,
  pageOrder: { originalIndex: number; rotation: 0 | 90 | 180 | 270 }[]
): Promise<Uint8Array> {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();

  for (const { originalIndex, rotation } of pageOrder) {
    const [page] = await out.copyPages(src, [originalIndex]);
    if (rotation !== 0) {
      page.setRotation(degrees(page.getRotation().angle + rotation));
    }
    out.addPage(page);
  }

  return out.save();
}

export async function imagesToPDF(
  files: File[]
): Promise<{ pdf: Uint8Array; skippedFiles: string[] }> {
  const pdf = await PDFDocument.create();
  const skipped: string[] = [];

  for (const file of files) {
    const buf = await file.arrayBuffer();
    let img;

    if (file.type === "image/png") img = await pdf.embedPng(buf);
    else if (file.type === "image/jpeg" || file.type === "image/jpg")
      img = await pdf.embedJpg(buf);
    else {
      skipped.push(file.name);
      continue;
    }

    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  return { pdf: await pdf.save(), skippedFiles: skipped };
}

/* ============================ HTML → PDF ============================ */
/* Browser-only */

export async function htmlToPDF(
  rawHTML: string,
  options?: {
    format?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
    maxHeightPerPage?: number;
  }
): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error("htmlToPDF must run in the browser");
  }

  if (rawHTML.length > MAX_HTML_CHARS) {
    throw new Error("HTML content too large");
  }

  const html = sanitizeHTML(rawHTML);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) throw new Error("Iframe creation failed");

  try {
    doc.open();
    doc.write("<!doctype html><html><body></body></html>");
    doc.close();

    doc.body.innerHTML = html;
    doc.body.style.margin = "0";
    doc.body.style.background = "#ffffff";

    await waitForResources(doc);

    const dpr = window.devicePixelRatio || 1;
    const isLetter = options?.format === "letter";
    const unit: "mm" | "in" = isLetter ? "in" : "mm";
    const pageWidth = isLetter ? 8.5 : 210;
    const pageHeight = isLetter ? 11 : 297;

    const canvas = await html2canvas(
      doc.body,
      {
        scale: dpr,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      } as Parameters<typeof html2canvas>[1]
    );

    if (canvas.height > MAX_CANVAS_HEIGHT_PX) {
      throw new Error("Rendered document too tall");
    }

    const pdf = new jsPDF({
      orientation: options?.orientation ?? "portrait",
      unit,
      format: isLetter ? "letter" : "a4",
    });

    const imgWidth = pageWidth;
    const imgHeightTotal =
      pxToUnit(canvas.height / dpr, unit) *
      (pageWidth / pxToUnit(canvas.width / dpr, unit));

    const maxHeight =
      options?.maxHeightPerPage && options.maxHeightPerPage > 0
        ? Math.min(options.maxHeightPerPage, pageHeight)
        : pageHeight;

    let rendered = 0;

    while (rendered < imgHeightTotal) {
      if (rendered > 0) pdf.addPage();

      const sliceHeightPx =
        ((maxHeight / imgHeightTotal) * canvas.height) | 0;

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeightPx;

      const ctx = slice.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(
        canvas,
        0,
        (rendered / imgHeightTotal) * canvas.height,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      pdf.addImage(
        slice.toDataURL("image/png", 0.95),
        "PNG",
        0,
        0,
        imgWidth,
        maxHeight,
        undefined,
        "FAST"
      );

      rendered += maxHeight;
    }

    document.body.removeChild(iframe);
    return new Uint8Array(pdf.output("arraybuffer"));
  } catch (e) {
    document.body.removeChild(iframe);
    throw e;
  }
}

/* ============================== DOWNLOADS ============================== */

export function downloadPDF(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  a.remove();
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  a.remove();
}

/* ============================== ENCRYPTION ============================== */

export interface EncryptionOptions {
  userPassword: string;
  ownerPassword?: string;
}

export async function encryptPDF(
  file: File,
  options: EncryptionOptions
): Promise<Uint8Array> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return encryptPDFBytes(
    bytes,
    options.userPassword,
    options.ownerPassword ?? options.userPassword
  );
}

export async function decryptPDF(
  file: File,
  password: string
): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error("decryptPDF must run in the browser");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  let pdfDoc;
  try {
    pdfDoc = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      password,
    }).promise;
  } catch {
    throw new Error("Incorrect password or corrupted PDF");
  }

  const out = await PDFDocument.create();

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const img = await out.embedPng(canvas.toDataURL("image/png"));
    const pdfPage = out.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(img, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return out.save();
}
