"use client";

import { useState, useEffect, useRef } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { extractPages, downloadPDF } from "@/lib/pdf-operations";
import { PDFDocument } from "pdf-lib";

interface PageThumbnail {
  pageNum: number;
  imageUrl: string | null;
  selected: boolean;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);

      setPages(
        Array.from({ length: count }, (_, i) => ({
          pageNum: i + 1,
          imageUrl: null,
          selected: false,
        }))
      );

      await loadThumbnails(selectedFile, count);
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
          if (!context) return { pageNum, imageUrl: null };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL("image/png");
          return { pageNum, imageUrl };
        } catch (error) {
          console.error(`Failed to render page ${i + 1}:`, error);
          return { pageNum: i + 1, imageUrl: null };
        }
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      
      setPages((prev) =>
        prev.map((page) => {
          const thumbnail = thumbnails.find((t) => t.pageNum === page.pageNum);
          return thumbnail ? { ...page, imageUrl: thumbnail.imageUrl } : page;
        })
      );
    } catch (error) {
      console.error("Failed to load thumbnails:", error);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const togglePage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNum === pageNum ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const handleMouseDown = (pageNum: number) => {
    setIsDragging(true);
    setDragStart(pageNum);
    togglePage(pageNum);
  };

  const handleMouseEnter = (pageNum: number) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, pageNum);
      const end = Math.max(dragStart, pageNum);

      setPages((prev) =>
        prev.map((page) => {
          if (page.pageNum >= start && page.pageNum <= end) {
            return { ...page, selected: true };
          }
          return page;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  const selectAll = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAll = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const handleSplit = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    const selectedIndices = pages
      .filter((p) => p.selected)
      .map((p) => p.pageNum - 1);

    if (selectedIndices.length === 0) {
      setStatus("error");
      setMessage("Please select at least one page");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Extracting selected pages...");

      const pdf = await extractPages(file, selectedIndices);
      downloadPDF(pdf, `extracted-${file.name}`);

      setStatus("success");
      setMessage("Successfully extracted selected pages into one PDF!");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to extract pages. Please try again.");
      console.error(error);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Split PDF</h1>
            <p className="text-slate-600">
              Extract pages or split PDF into multiple files
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && pageCount > 0 && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Pages:</span> {pageCount}
                  </p>
                  {selectedCount > 0 && (
                    <p className="text-sm text-purple-700 font-semibold mt-1">
                      Selected: {selectedCount} page{selectedCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {loadingThumbnails && (
                  <div className="mb-4 text-center text-sm text-slate-600">
                    Loading page previews...
                  </div>
                )}

                <div
                  ref={containerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6"
                  onMouseUp={handleMouseUp}
                >
                  {pages.map((page) => (
                    <div
                      key={page.pageNum}
                      onMouseDown={() => handleMouseDown(page.pageNum)}
                      onMouseEnter={() => handleMouseEnter(page.pageNum)}
                      className={`relative aspect-[3/4] border-2 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm ${
                        page.selected
                          ? "border-purple-500 bg-purple-50 ring-4 ring-purple-100 scale-[1.02]"
                          : "border-slate-200 bg-slate-50 hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      {page.imageUrl ? (
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNum}`}
                          className="w-full h-full object-contain"
                  />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <span className="text-xs text-slate-400">Page {page.pageNum}</span>
                        </div>
                      )}
                      <div className="absolute top-1 right-1">
                        {page.selected ? (
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-300 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                        {page.pageNum}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCount > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      Extraction Order:
                    </p>
                    <p className="text-xs text-purple-700">
                      Pages {pages
                        .filter(p => p.selected)
                        .map(p => p.pageNum)
                        .join(", ")} will be merged into one file.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSplit}
                  disabled={status === "processing" || selectedCount === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing"
                    ? "Processing..."
                    : `Extract Selected Pages`}
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
