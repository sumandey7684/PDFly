"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { rotatePDF, downloadPDF } from "@/lib/pdf-operations";
import Link from "next/link";

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleRotate = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Rotating PDF...");

      const rotatedPdf = await rotatePDF(file, rotation);

      downloadPDF(rotatedPdf, `rotated-${file.name}`);

      setStatus("success");
      setMessage(`PDF rotated ${rotation}° successfully!`);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to rotate PDF. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Rotate PDF</h1>
            <p className="text-slate-600">
              All pages in your document will be rotated. For selective rotation, use the{" "}
              <Link href="/tools/organize" className="text-green-600 hover:underline font-medium">
                Organize Pages
              </Link>{" "}
              tool.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Rotation Angle
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[90, 180, 270].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => setRotation(angle as 90 | 180 | 270)}
                        className={`p-4 rounded-xl border-2 transition-all group ${
                          rotation === angle
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        <div className={`text-2xl mb-2 transition-transform duration-300 ${
                          rotation === angle ? "scale-110" : "group-hover:scale-110"
                        }`}>↻</div>
                        <div className={`text-base font-bold transition-colors ${
                          rotation === angle ? "text-green-900" : "text-slate-900"
                        }`}>{angle}°</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRotate}
                  disabled={status === "processing"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Rotating..." : `Rotate ${rotation}°`}
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
