import Link from "next/link";

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one",
    href: "/tools/merge",
    gradient: "from-blue-500 to-cyan-500",
    category: "Organize"
  },
  {
    name: "Split PDF",
    description: "Extract pages or split into multiple files",
    href: "/tools/split",
    gradient: "from-purple-500 to-pink-500",
    category: "Organize"
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size",
    href: "/tools/compress",
    gradient: "from-orange-500 to-red-500",
    category: "Optimize"
  },
  {
    name: "Rotate PDF",
    description: "Rotate PDF pages",
    href: "/tools/rotate",
    gradient: "from-green-500 to-emerald-500",
    category: "Edit"
  },
  {
    name: "PDF to Images",
    description: "Convert PDF pages to JPG or PNG",
    href: "/tools/pdf-to-images",
    gradient: "from-indigo-500 to-blue-500",
    category: "Convert"
  },
  {
    name: "Images to PDF",
    description: "Convert images to PDF document",
    href: "/tools/images-to-pdf",
    gradient: "from-pink-500 to-rose-500",
    category: "Convert"
  },
  {
    name: "Organize Pages",
    description: "Reorder, rotate, or delete PDF pages",
    href: "/tools/organize",
    gradient: "from-yellow-500 to-orange-500",
    category: "Organize"
  },
  {
    name: "Add Watermark",
    description: "Add text watermark to PDF pages",
    href: "/tools/watermark",
    gradient: "from-teal-500 to-cyan-500",
    category: "Edit"
  },
  {
    name: "Encrypt PDF",
    description: "Add password protection and control permissions",
    href: "/tools/encrypt",
    gradient: "from-red-500 to-pink-500",
    category: "Security",
    isNew: true
  },
  {
    name: "Decrypt PDF",
    description: "Remove password protection from encrypted PDFs",
    href: "/tools/decrypt",
    gradient: "from-blue-500 to-indigo-500",
    category: "Security",
    isNew: true
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML files or code to PDF documents",
    href: "/tools/html-to-pdf",
    gradient: "from-violet-500 to-purple-500",
    category: "Convert"
  },
];

const categories = ["All", "Organize", "Edit", "Convert", "Optimize", "Security"];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">All PDF Tools</h1>
          <p className="text-lg text-slate-600">
            Everything you need to manage your PDF files in one place. 100% private, browser-based processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} mb-4 flex items-center justify-center text-white shadow-lg`}>
                <span className="text-xl font-bold">{tool.name.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow">
                {tool.description}
              </p>
              <div className="flex items-center text-sm font-semibold text-blue-600">
                Open Tool
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                {tool.isNew && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-pink-500 px-2 py-1 rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {tool.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

