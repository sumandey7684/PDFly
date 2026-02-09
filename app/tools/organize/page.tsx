"use client";

import { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { organizePDF, downloadPDF } from "@/lib/pdf-operations";
import { PDFDocument } from "pdf-lib";

interface PageInfo {
  index: number;
  rotation: 0 | 90 | 180 | 270;
  deleted: boolean;
  imageUrl: string | null;
}

export default function OrganizePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      setPages(
        Array.from({ length: pageCount }, (_, i) => ({
          index: i,
          rotation: 0,
          deleted: false,
          imageUrl: null,
        }))
      );

      await loadThumbnails(selectedFile, pageCount);
    } catch (error) {
      console.error("Failed to load PDF:", error);
    }
  };

  const loadThumbnails = async (pdfFile: File, count: number) => {
    setLoadingThumbnails(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const thumbnailPromises = Array.from({ length: count }, async (_, i) => {
        try {
          const pageNum = i + 1;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return { index: i, imageUrl: null };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL("image/png");
          return { index: i, imageUrl };
        } catch (error) {
          console.error(`Failed to render page ${i + 1}:`, error);
          return { index: i, imageUrl: null };
        }
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      
      setPages((prev) =>
        prev.map((page) => {
          const thumbnail = thumbnails.find((t) => t.index === page.index);
          return thumbnail ? { ...page, imageUrl: thumbnail.imageUrl } : page;
        })
      );
    } catch (error) {
      console.error("Failed to load thumbnails:", error);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.index === index
          ? { ...page, rotation: ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : page
      )
    );
  };

  const deletePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) => (page.index === index ? { ...page, deleted: true } : page))
    );
  };

  const restorePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) => (page.index === index ? { ...page, deleted: false } : page))
    );
  };

  const movePage = (index: number, direction: "up" | "down") => {
    const currentPos = pages.findIndex((p) => p.index === index);
    const newPos = direction === "up" ? currentPos - 1 : currentPos + 1;

    if (newPos >= 0 && newPos < pages.length) {
      const newPages = [...pages];
      [newPages[currentPos], newPages[newPos]] = [newPages[newPos], newPages[currentPos]];
      setPages(newPages);
    }
  };

  const handleOrganize = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Organizing PDF...");

      // Build final page order from current state (excluding deleted pages)
      const pageOrder = pages
        .filter((page) => !page.deleted)
        .map((page) => ({
          originalIndex: page.index,
          rotation: page.rotation,
        }));

      const organizedPdf = await organizePDF(file, pageOrder);

      downloadPDF(organizedPdf, `organized-${file.name}`);

      setStatus("success");
      setMessage("PDF organized successfully!");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to organize PDF. Please try again.");
      console.error(error);
    }
  };

  const activePages = pages.filter((p) => !p.deleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Organize Pages</h1>
            <p className="text-slate-600">Reorder, rotate, or delete PDF pages</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && pages.length > 0 && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Pages:</span> {activePages.length} /{" "}
                    {pages.length}
                  </p>
                </div>

                {loadingThumbnails && (
                  <div className="mb-4 text-center text-sm text-slate-600">
                    Loading page previews...
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                  {pages.map((page, idx) => (
                    <div
                      key={page.index}
                      className={`relative p-4 border-2 rounded-xl transition-all shadow-sm ${
                        page.deleted
                          ? "border-red-300 bg-red-50 opacity-50"
                          : "border-slate-200 bg-white hover:border-yellow-300 hover:shadow-md"
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div
                          className="w-full aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden border border-slate-100"
                          style={{
                            transform: `rotate(${page.rotation}deg)`,
                            transition: "transform 0.3s",
                          }}
                        >
                          {page.imageUrl ? (
                            <img
                              src={page.imageUrl}
                              alt={`Page ${page.index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                          <span className="text-2xl font-bold text-slate-400">
                            {page.index + 1}
                          </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${page.deleted ? "text-red-700" : "text-slate-700"}`}>
                          Page {page.index + 1}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => movePage(page.index, "up")}
                            disabled={idx === 0 || page.deleted}
                            className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-bold text-base"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => movePage(page.index, "down")}
                            disabled={idx === pages.length - 1 || page.deleted}
                            className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-bold text-base"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => rotatePage(page.index)}
                          disabled={page.deleted}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-bold text-sm"
                        >
                          Rotate 90°
                        </button>
                        {page.deleted ? (
                          <button
                            onClick={() => restorePage(page.index)}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
                          >
                            Restore Page
                          </button>
                        ) : (
                          <button
                            onClick={() => deletePage(page.index)}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                          >
                            Delete Page
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleOrganize}
                  disabled={status === "processing"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Processing..." : "Apply Changes"}
                </button>
              </div>
            )}

            {status !== "idle" && (
              <div className="mt-6">
                <ProcessingStatus status={status} message={message} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
