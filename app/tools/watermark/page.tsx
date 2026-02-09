"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { addWatermark, downloadPDF } from "@/lib/pdf-operations";

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleAddWatermark = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    if (!watermarkText.trim()) {
      setStatus("error");
      setMessage("Please enter watermark text");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Adding watermark...");

      const watermarkedPdf = await addWatermark(file, watermarkText, {
        fontSize,
        opacity,
        rotation,
      });

      downloadPDF(watermarkedPdf, `watermarked-${file.name}`);

      setStatus("success");
      setMessage("Watermark added successfully!");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to add watermark. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Add Watermark</h1>
            <p className="text-slate-600">Add text watermark to your PDF pages</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && (
              <div className="mt-6">
                <div className="mb-4 p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-slate-700 break-words">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Font Size: <span className="text-teal-600">{fontSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Opacity: <span className="text-teal-600">{(opacity * 100).toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Rotation: <span className="text-teal-600">{rotation}°</span>
                    </label>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddWatermark}
                  disabled={status === "processing"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? "Adding Watermark..." : "Add Watermark"}
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
