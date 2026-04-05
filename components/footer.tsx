import Link from "next/link";

import { COMPANY_CONTACT_EMAIL, COMPANY_NAME, COMPANY_WEBSITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>{COMPANY_NAME} / Official employee verification platform</p>
        <div className="flex flex-wrap gap-4">
          <Link href={COMPANY_WEBSITE} target="_blank" className="hover:text-slate-900">
            anishnova.com
          </Link>
          <Link href={`mailto:${COMPANY_CONTACT_EMAIL}`} className="hover:text-slate-900">
            {COMPANY_CONTACT_EMAIL}
          </Link>
        </div>
      </div>
    </footer>
  );
}
