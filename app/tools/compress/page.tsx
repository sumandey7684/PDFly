"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { compressPDF, downloadPDF } from "@/lib/pdf-operations";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFileSelected = (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("idle");
    setCompressedSize(0);
  };

  const handleCompress = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Compressing PDF...");

      const compressedPdf = await compressPDF(file);
      setCompressedSize(compressedPdf.length);

      downloadPDF(compressedPdf, `compressed-${file.name}`);

      const reduction = ((1 - compressedPdf.length / file.size) * 100).toFixed(1);
      setStatus("success");
      setMessage(`PDF compressed successfully! Size reduced by ${reduction}%`);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to compress PDF. Please try again.");
      console.error(error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Compress PDF</h1>
            <p className="text-slate-600">Reduce PDF file size while maintaining quality</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Original Size:</span>{" "}
                    {formatSize(originalSize)}
                  </p>
                  {compressedSize > 0 && (
                    <p className="text-sm text-green-700 font-semibold">
                      Compressed Size: {formatSize(compressedSize)}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCompress}
                  disabled={status === "processing"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Compressing..." : "Compress PDF"}
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
