"use client";

import { AlertTriangle, Camera, Loader2, QrCode, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { normalizeEmployeeId } from "@/lib/utils";

type BarcodeDetectorType = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorType;

function extractEmployeeId(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/verify\/([A-Z0-9-]+)$/i);
  return normalizeEmployeeId(match?.[1] || trimmed);
}

export function QrScannerPanel() {
  const router = useRouter();
  const [manualValue, setManualValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const barcodeSupported = useMemo(
    () => typeof window !== "undefined" && "BarcodeDetector" in window,
    [],
  );

  const openEmployee = (value: string) => {
    const employeeID = extractEmployeeId(value);
    if (!employeeID) {
      setMessage("QR code could not be read. Try another image or enter the employee ID manually.");
      return;
    }
    router.push(`/verify/${employeeID}`);
  };

  const scanQrImage = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
    setIsScanning(true);

    try {
      if (!barcodeSupported) {
        setMessage("This browser does not support automatic QR scanning. Use the manual employee ID search below.");
        return;
      }

      const BarcodeDetectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
      if (!BarcodeDetectorClass) {
        setMessage("QR scanning is unavailable in this browser. Use manual search instead.");
        return;
      }

      const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      const rawValue = codes[0]?.rawValue;

      if (!rawValue) {
        setMessage("No QR code was detected in this image. Try a clearer QR image.");
        return;
      }

      openEmployee(rawValue);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to scan QR code right now.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass rounded-[32px] p-7 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-slate-950 p-3 text-white">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-700">QR Scanner</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Scan Anishnova employee QR credentials</h2>
          </div>
        </div>

        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-blue-200 bg-white/70 px-6 py-12 text-center">
          <div className="rounded-3xl bg-blue-50 p-4 text-blue-700">
            <Camera className="h-8 w-8" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">Upload a QR image</p>
          <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
            Drop or select a QR code screenshot, employee card image, or generated verification QR to instantly open the public verification profile.
          </p>
          <span className="btn-primary mt-6">Select QR Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void scanQrImage(file);
              }
            }}
          />
        </label>

        {message ? (
          <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{message}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-[24px] bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Manual verification fallback</p>
          <p className="mt-2 text-sm text-slate-500">Paste the verification URL or enter the employee ID directly if scanning is unavailable.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                placeholder="Enter employee ID or verification link"
                className="input pl-11"
              />
            </div>
            <button type="button" onClick={() => openEmployee(manualValue)} className="btn-primary">
              Open Verification
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-[32px] p-7 shadow-glass">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scanner Preview</p>
        <div className="mt-6 flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] border border-white/60 bg-white/80">
          {previewUrl ? (
            <img src={previewUrl} alt="QR preview" className="h-full w-full object-contain" />
          ) : (
            <div className="max-w-sm text-center">
              <p className="text-lg font-semibold text-slate-900">No QR image selected</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">The uploaded QR image preview will appear here before redirecting to the employee verification page.</p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[24px] bg-slate-950 px-5 py-4 text-sm text-slate-200">
          <div className="flex items-center gap-3">
            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            <p>{isScanning ? "Scanning uploaded QR image..." : "Supports verification QR screenshots and employee card exports."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
