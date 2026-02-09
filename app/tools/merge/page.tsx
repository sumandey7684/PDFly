"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { mergePDFs, downloadPDF } from "@/lib/pdf-operations";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setStatus("idle");
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatus("error");
      setMessage("Please select at least 2 PDF files");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Merging PDFs...");

      const mergedPdf = await mergePDFs(files);

      downloadPDF(mergedPdf, "merged.pdf");

      setStatus("success");
      setMessage("PDFs merged successfully!");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to merge PDFs. Please try again.");
      console.error(error);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...files];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Merge PDF</h1>
            <p className="text-slate-600">
              Combine multiple PDF files into a single document
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              accept=".pdf"
              multiple={true}
            />

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-slate-50 rounded-lg gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 flex-shrink-0 pt-0.5">
                          {index + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-slate-900 break-words block">
                          {file.name}
                        </span>
                          <span className="text-xs text-slate-500 block mt-1">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveFile(index, "up")}
                          disabled={index === 0}
                          className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveFile(index, "down")}
                          disabled={index === files.length - 1}
                          className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleMerge}
                  disabled={status === "processing"}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Merging..." : "Merge PDFs"}
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
