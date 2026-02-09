# PDFly

A fast, privacy-focused PDF toolkit that runs entirely in your browser. No file uploads, no servers — your documents never leave your device.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

- **🔒 100% Private** — All processing happens locally in your browser
- **⚡ Fast** — No upload/download delays, instant processing
- **🆓 Free** — No registration, no limits, no watermarks
- **📱 Responsive** — Works on desktop and mobile

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| **Merge PDF** | Combine multiple PDFs into one |
| **Split PDF** | Extract specific pages from a PDF |
| **Compress PDF** | Reduce PDF file size |
| **Rotate PDF** | Rotate all pages by 90°, 180°, or 270° |
| **PDF to Images** | Convert PDF pages to PNG or JPEG |
| **Images to PDF** | Create a PDF from images |
| **Organize Pages** | Reorder, rotate, or delete individual pages |
| **Add Watermark** | Add text watermark to PDF pages |
| **Encrypt PDF** | Add password protection and control permissions |
| **Decrypt PDF** | Remove password protection from your PDFs |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/sumandey7684/pdfly.git
cd pdfly

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static export
npm run build

# The output will be in the 'out' folder
```

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **UI:** [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **PDF Processing:** [pdf-lib](https://pdf-lib.js.org/) + [PDF.js](https://mozilla.github.io/pdf.js/)
- **Language:** TypeScript

## 📁 Project Structure

```
pdfly/
├── app/
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout with Navbar & Footer
│   └── tools/
│       ├── page.tsx      # Tools grid
│       ├── merge/        # Merge PDF tool
│       ├── split/        # Split PDF tool
│       ├── compress/     # Compress PDF tool
│       ├── rotate/       # Rotate PDF tool
│       ├── pdf-to-images/
│       ├── images-to-pdf/
│       ├── organize/     # Organize pages tool
│       └── watermark/    # Add watermark tool
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── FileUploader.tsx
│   └── ProcessingStatus.tsx
└── lib/
    └── pdf-operations.ts # Core PDF manipulation functions
```

## 🌐 Deployment

PDF0 is configured for static export and works great on:

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- Any static hosting

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

## ☕ Support

If you find this project useful, consider [buying me a coffee](https://buymeacoffee.com/sumandey)!
