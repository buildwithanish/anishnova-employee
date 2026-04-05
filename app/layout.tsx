import type { Metadata } from "next";

import "@/app/globals.css";
import { COMPANY_DOMAIN, COMPANY_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || COMPANY_DOMAIN),
  title: {
    default: `${COMPANY_NAME} Employee Verification`,
    template: `%s | ${COMPANY_NAME}`,
  },
  description:
    "Official employee verification and workforce management platform for Anishnova Technologies.",
  keywords: [
    "Anishnova Technologies",
    "employee verification",
    "employee authentication",
    "employee QR verification",
    "Anishnova admin dashboard",
  ],
  openGraph: {
    title: `${COMPANY_NAME} Employee Verification`,
    description: "Official employee verification and workforce management platform for Anishnova Technologies.",
    url: process.env.NEXT_PUBLIC_APP_URL || COMPANY_DOMAIN,
    siteName: COMPANY_NAME,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
