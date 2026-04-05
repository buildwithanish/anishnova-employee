"use client";

import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export function BulkActions() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCsvUpload = async (file: File) => {
    const text = await file.text();
    const response = await fetch("/api/employees/bulk-import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ csvText: text }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Bulk upload failed.");
      return;
    }

    setMessage(`Imported ${data.summary.created} employees, updated ${data.summary.updated}.`);
    router.refresh();
  };

  return (
    <div className="grid gap-4 rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-glass lg:grid-cols-[1fr_auto_auto] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-slate-950">Bulk Operations</p>
        <p className="mt-1 text-sm text-slate-500">
          Import employees from CSV, generate all QR codes, and export all ID cards.
        </p>
        {message ? <p className="mt-2 text-sm font-medium text-blue-700">{message}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          startTransition(() => {
            handleCsvUpload(file);
          });
        }}
      />
      <button type="button" className="btn-secondary gap-2" onClick={() => inputRef.current?.click()} disabled={isPending}>
        <UploadCloud className="h-4 w-4" />
        {isPending ? "Uploading..." : "Bulk Upload CSV"}
      </button>
      <div className="flex flex-wrap gap-3">
        <a href="/api/employees/bulk-qrs" className="btn-primary">
          Download QR ZIP
        </a>
        <a href="/api/employees/bulk-id-cards" className="btn-secondary">
          Download ID Card PDF
        </a>
      </div>
    </div>
  );
}
