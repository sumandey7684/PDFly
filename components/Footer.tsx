import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">PDFly</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Professional-grade PDF tools, 100% private and processed entirely in your browser. No registration required.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/tools" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">All Tools</Link></li>
              <li><Link href="/tools/compress" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Compression</Link></li>
              <li><Link href="/tools/organize" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Organization</Link></li>
              <li><Link href="/tools/encrypt" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Tools</h4>
            <ul className="space-y-4">
              <li><Link href="/tools/merge" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Merge PDF</Link></li>
              <li><Link href="/tools/split" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Split PDF</Link></li>
              <li><Link href="/tools/pdf-to-images" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">PDF to Image</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Trust</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Privacy Guaranteed
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                100% Client-Side
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                No Data Collection
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
          <p className="text-base sm:text-lg font-semibold text-slate-500">
            © {new Date().getFullYear()} PDFly
          </p>
          <span className="hidden sm:block text-slate-300 text-lg">•</span>
          <p className="text-base sm:text-lg font-semibold text-slate-500">
            Made with ❤️ by <a href="https://x.com/sumxnnn" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-4 decoration-2 decoration-slate-300 hover:text-blue-600 hover:decoration-blue-600 transition-all">Suman</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

