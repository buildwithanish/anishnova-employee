import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <BrandLogo />
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/directory" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
            Directory
          </Link>
          <Link href="/qr-scanner" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
            QR Scanner
          </Link>
          <Link href="/face-verify" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
            Face Verify
          </Link>
          <Link href="/voice-verify" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
            Voice Verify
          </Link>
          <Link href="/deepfake-check" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
            AI Screening
          </Link>
          <Link href="/admin" className="btn-primary">
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
