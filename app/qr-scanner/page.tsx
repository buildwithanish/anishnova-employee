import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";
import { QrScannerPanel } from "@/components/qr-scanner-panel";

export default function QrScannerPage() {
  return (
    <div className="page-shell">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="rounded-[34px] bg-slate-950 p-8 text-white shadow-glass">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Official QR Verification</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Scan employee QR credentials</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Upload an employee QR code, badge export, or card image to instantly open the official verification profile on
            employee.anishnova.com.
          </p>
        </div>

        <QrScannerPanel />
      </main>
      <Footer />
    </div>
  );
}
