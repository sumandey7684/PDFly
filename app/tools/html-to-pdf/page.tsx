"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { htmlToPDF, downloadPDF } from "@/lib/pdf-operations";

export default function HTMLToPDF() {
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<"paste" | "file">("paste");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState({
    format: "a4" as "a4" | "letter",
    orientation: "portrait" as "portrait" | "landscape",
    maxHeightPerPage: 0, // 0 means use full page height
  });

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setHtmlFile(file);
      setStatus("idle");
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtmlContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleConvert = async () => {
    if (inputMethod === "paste" && !htmlContent.trim()) {
      setStatus("error");
      setMessage("Please paste HTML code or upload an HTML file");
      return;
    }

    if (inputMethod === "file" && !htmlFile) {
      setStatus("error");
      setMessage("Please upload an HTML file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Converting HTML to PDF...");

      const content = htmlContent || "";
      const pdf = await htmlToPDF(content, {
        format: options.format,
        orientation: options.orientation,
        maxHeightPerPage: options.maxHeightPerPage > 0 ? options.maxHeightPerPage : undefined,
      });

      const filename = htmlFile?.name.replace(/\.html?$/i, ".pdf") || "document.pdf";
      downloadPDF(pdf, filename);

      setStatus("success");
      setMessage("Successfully converted HTML to PDF!");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Failed to convert HTML to PDF. Please try again.");
      console.error(error);
    }
  };

  const resetForm = () => {
    setHtmlContent("");
    setHtmlFile(null);
    setStatus("idle");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">HTML to PDF</h1>
            <p className="text-slate-600">Convert HTML files or code to PDF documents</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Input Method Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setInputMethod("paste");
                  setHtmlFile(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  inputMethod === "paste"
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Paste HTML Code
              </button>
              <button
                onClick={() => {
                  setInputMethod("file");
                  setHtmlContent("");
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  inputMethod === "file"
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Upload HTML File
              </button>
            </div>

            {/* HTML Input */}
            {inputMethod === "paste" ? (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  HTML Code
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste your HTML code here..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>
            ) : (
              <div className="mb-6">
                <FileUploader
                  onFilesSelected={handleFileSelected}
                  accept=".html,.htm"
                  multiple={false}
                />
                {htmlFile && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-900">{htmlFile.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({(htmlFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setHtmlFile(null);
                          setHtmlContent("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">PDF Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Format
                  </label>
                  <select
                    value={options.format}
                    onChange={(e) =>
                      setOptions({ ...options, format: e.target.value as "a4" | "letter" })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Orientation
                  </label>
                  <select
                    value={options.orientation}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        orientation: e.target.value as "portrait" | "landscape",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Max Height Per Page ({options.format === "letter" ? "in" : "mm"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={options.maxHeightPerPage || ""}
                    onChange={(e) =>
                      setOptions({ ...options, maxHeightPerPage: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Auto (full page)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {options.maxHeightPerPage === 0
                      ? `Using full page height (~${options.format === "letter" ? "11in" : "297mm"})`
                      : `Max ${options.maxHeightPerPage}${options.format === "letter" ? "in" : "mm"} per page`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                disabled={status === "processing" || (!htmlContent.trim() && !htmlFile)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "processing" ? "Converting..." : "Convert to PDF"}
              </button>
              {(htmlContent || htmlFile) && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
              )}
            </div>

            {status !== "idle" && (
              <div className="mt-6">
                <ProcessingStatus status={status} message={message} />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">How it works</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-violet-500 font-bold">1.</span>
                <span>
                  <strong>Paste HTML code</strong> or <strong>upload an HTML file</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-500 font-bold">2.</span>
                <span>
                  Choose your <strong>PDF format and orientation</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-500 font-bold">3.</span>
                <span>
                  Click <strong>"Convert to PDF"</strong> and download your PDF
                </span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> External resources (images, fonts, CSS from URLs) may not
                load due to browser security restrictions. For best results, use inline styles and
                base64-encoded images.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
