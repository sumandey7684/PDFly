"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { downloadImage } from "@/lib/pdf-operations";

export default function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleConvert = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Converting PDF to images...");

      // Dynamic import of pdfjs-dist to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist");
      // Use the worker from node_modules
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            format === "png" ? "image/png" : "image/jpeg",
            0.95
          );
        });

        downloadImage(blob, `page-${pageNum}.${format}`);
      }

      setStatus("success");
      setMessage(`Successfully converted ${numPages} page(s) to ${format.toUpperCase()}!`);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to convert PDF. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">PDF to Images</h1>
            <p className="text-slate-600">Convert PDF pages to JPG or PNG images</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Output Format
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(["png", "jpeg"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          format === fmt
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        <div className={`text-sm font-bold uppercase transition-colors ${
                          format === fmt ? "text-indigo-900" : "text-slate-900"
                        }`}>{fmt}</div>
                        <div className={`text-xs mt-1 transition-colors ${
                          format === fmt ? "text-indigo-600" : "text-slate-500"
                        }`}>
                          {fmt === "png" ? "Lossless quality" : "Smaller file size"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={status === "processing"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Converting..." : "Convert to Images"}
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
