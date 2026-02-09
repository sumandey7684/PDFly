/* ========================== CORE PDF UTILITIES ========================== */

import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { encryptPDF as encryptPDFBytes } from "@pdfsmaller/pdf-encrypt-lite";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* =============================== CONSTANTS ============================== */

const PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;
const MAX_HTML_CHARS = 500_000; // hard guard
const MAX_CANVAS_HEIGHT_PX = 16_000;

/* ================================ HELPERS =============================== */

function pxToUnit(px: number, unit: "mm" | "in") {
  return unit === "in" ? px / PX_PER_INCH : (px * MM_PER_INCH) / PX_PER_INCH;
}

function sanitizeHTML(input: string): string {
  const template = document.createElement("template");
  template.innerHTML = input;

  const forbidden = ["script", "iframe", "object", "embed", "link"];
  forbidden.forEach(tag =>
    template.content.querySelectorAll(tag).forEach(el => el.remove())
  );

  template.content.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      if (
        attr.name.startsWith("on") ||
        /javascript:/i.test(attr.value)
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return template.innerHTML;
}

async function waitForResources(doc: Document) {
  const imgs = Array.from(doc.images).map(
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

  await Promise.all(imgs);
}

/* ========================== STANDARD PDF OPS ============================ */

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
  indices: number[]
): Promise<Uint8Array> {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  return out.save();
}

export async function rotatePDF(
  file: File,
  rotation: 90 | 180 | 270,
  indices?: number[]
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdf.getPages();
  const targets = indices ?? pages.map((_, i) => i);

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

/* ============================ HTML → PDF ============================ */
/* Browser-only. Do NOT import in server components. */

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
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) throw new Error("Iframe creation failed");

  try {
    doc.open();
    doc.write("<!doctype html><html><head></head><body></body></html>");
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

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < imgHeightTotal) {
      if (pageIndex > 0) pdf.addPage();

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
        (renderedHeight / imgHeightTotal) * canvas.height,
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

      renderedHeight += maxHeight;
      pageIndex++;
    }

    document.body.removeChild(iframe);
    return new Uint8Array(pdf.output("arraybuffer"));
  } catch (err) {
    document.body.removeChild(iframe);
    throw err;
  }
}

/* ============================== DOWNLOAD ============================== */

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
