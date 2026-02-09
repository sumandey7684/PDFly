import Link from "next/link";

const featuredTools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one perfectly organized document.",
    href: "/tools/merge",
    icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2",
    color: "blue"
  },
  {
    name: "Encrypt PDF",
    description: "Secure your documents with password protection. 100% private, browser-based encryption.",
    href: "/tools/encrypt",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "red",
    isNew: true
  },
  {
    name: "Unlock PDF",
    description: "Remove password protection from encrypted PDFs quickly and securely.",
    href: "/tools/decrypt",
    icon: "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z",
    color: "blue",
    isNew: true
  },
  {
    name: "Compress PDF",
    description: "Reduce file size while maintaining the highest possible quality.",
    href: "/tools/compress",
    icon: "M19 14l-7 7m0 0l-7-7m7 7V3",
    color: "orange"
  }
];

export default function LandingPage() {
  return (
    <div className="[background:radial-gradient(125%_100%_at_50%_0%,#FFF_6.32%,#E0F0FF_29.28%,#E7EFFD_68.68%,#FFFFFF_100%)] ">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
        {/* Simplified, cleaner gradient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-[0.2em]">
              100% Private & Local
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            The Professional Way to <br />
            <span className="text-blue-600">Manage Your PDFs</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-12">
            Professional-grade PDF tools that run entirely in your browser. No
            uploads, no registration, and no data collection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 text-lg"
            >
              Explore All Tools
            </Link>
            <Link
              href="/tools/merge"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 text-lg"
            >
              Try Merge PDF
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-900">100%</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Client Side
              </span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-900">Fast</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Processing
              </span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-900">Secure</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                By Design
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Grid */}
      <section className="py-24 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Most Popular Tools
            </h2>
            <p className="text-slate-500">
              Quickly handle your most common PDF tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                      tool.color === "blue"
                        ? "bg-blue-50 text-blue-600"
                        : tool.color === "purple"
                        ? "bg-purple-50 text-purple-600"
                        : tool.color === "red"
                        ? "bg-red-50 text-red-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={tool.icon}
                      />
                    </svg>
                  </div>
                  {tool.isNew && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {tool.name}
                </h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  {tool.description}
                </p>
                <span
                  className={`text-sm font-bold inline-flex items-center ${
                    tool.color === "blue"
                      ? "text-blue-600"
                      : tool.color === "purple"
                      ? "text-purple-600"
                      : tool.color === "red"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  Start now
                  <svg
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                Your privacy is our <br />
                <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">
                  top priority.
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most PDF editors upload your files to their servers. We
                don&apos;t. All processing happens locally in your web browser.
              </p>
              <ul className="space-y-4">
                {[
                  "No data collection or tracking",
                  "Files stay on your local device",
                  "No registration required",
                  "High-speed browser processing",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 font-bold text-slate-700"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-5"></div>
                <div className="relative bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-8">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Zero Upload Policy
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Your data remains <strong>completely yours</strong>.
                    Security by design, privacy by implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
            <h2 className="text-4xl font-bold mb-6 relative">
              Ready to manage your PDFs?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto relative">
              Get access to all our professional PDF tools right now, absolutely
              free and 100% private.
            </p>
            <Link
              href="/tools"
              className="relative inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl text-lg"
            >
              Get Started for Free
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
