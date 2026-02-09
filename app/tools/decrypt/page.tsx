"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { decryptPDF, downloadPDF } from "@/lib/pdf-operations";

export default function DecryptPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPassword("");
    setMessage("");
    
    // Try to detect if PDF is encrypted
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      
      try {
        await PDFDocument.load(arrayBuffer);
        setIsEncrypted(false);
        setStatus("idle");
        setMessage("This PDF is not encrypted and doesn't need decryption.");
      } catch (error: any) {
        const errorMsg = (error?.message || "").toLowerCase();
        if (errorMsg.includes("password") || errorMsg.includes("encrypted") || errorMsg.includes("decrypt")) {
          setIsEncrypted(true);
          setMessage("");
        } else {
          setIsEncrypted(null);
          setMessage("");
        }
      }
    } catch (error) {
      setIsEncrypted(null);
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    if (!password) {
      setStatus("error");
      setMessage("Please enter the password");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Decrypting your PDF...");

      const decryptedPdf = await decryptPDF(file, password);

      downloadPDF(decryptedPdf, `decrypted-${file.name}`);

      setStatus("success");
      setMessage("PDF decrypted successfully! Your document is now unprotected.");
      
      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setPassword("");
        setStatus("idle");
        setIsEncrypted(null);
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      if (error.message?.includes("password") || error.message?.includes("Incorrect")) {
        setMessage("Incorrect password. Please verify and try again.");
      } else if (error.message?.includes("not encrypted")) {
        setMessage("This PDF is not encrypted.");
      } else {
        setMessage("Failed to decrypt PDF. Please check the password and try again.");
      }
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg shadow-blue-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-4">Decrypt PDF</h1>
            <p className="text-xl text-slate-600">Remove password protection from your PDFs</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />

            {file && (
              <div className="mt-8 space-y-6">
                {/* File Info */}
                <div className={`p-5 rounded-2xl border ${
                  isEncrypted === false 
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100" 
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      {isEncrypted === false ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : isEncrypted === true ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                      {isEncrypted !== null && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isEncrypted ? "bg-red-500" : "bg-green-500"
                          }`}></span>
                          <span className={`text-xs font-bold ${
                            isEncrypted ? "text-red-700" : "text-green-700"
                          }`}>
                            {isEncrypted ? "Encrypted" : "Not Encrypted"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Not Encrypted Message */}
                {isEncrypted === false && (
                  <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-green-900 mb-1">No Decryption Needed</h4>
                        <p className="text-xs text-green-800">This PDF is not password-protected and can be opened freely.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Input - Only show if encrypted or unknown */}
                {isEncrypted !== false && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Enter Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && password) {
                              handleDecrypt();
                            }
                          }}
                          placeholder="Enter the PDF password"
                          className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 pr-12 font-medium transition-all"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Enter the password that was used to encrypt this PDF</p>
                    </div>

                    {/* Info Box */}
                    <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-900 mb-2">Important Information</h4>
                          <ul className="space-y-1 text-xs text-amber-800">
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                              All decryption happens locally in your browser
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                              Your password is never stored or transmitted
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                              This removes all password protection from the PDF
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Decrypt Button */}
                    <button
                      onClick={handleDecrypt}
                      disabled={status === "processing" || !password}
                      className="w-full px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 active:scale-[0.98]"
                    >
                      {status === "processing" ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Decrypting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Decrypt PDF
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {status !== "idle" && (
              <div className="mt-6">
                <ProcessingStatus status={status} message={message} />
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/60 backdrop-blur rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Remove Protection</h3>
              <p className="text-xs text-slate-600">Unlock password-protected PDFs instantly</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur rounded-2xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Fast Processing</h3>
              <p className="text-xs text-slate-600">Decrypt PDFs in seconds, no delays</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur rounded-2xl">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">100% Private</h3>
              <p className="text-xs text-slate-600">Everything happens in your browser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
