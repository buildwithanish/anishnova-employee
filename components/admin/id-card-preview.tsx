"use client";

import { Download, Printer } from "lucide-react";

import { COMPANY_NAME } from "@/lib/constants";
import { employeeStatusMap } from "@/lib/status";

export function IdCardPreview({
  employee,
}: {
  employee: {
    employeeID: string;
    fullName: string;
    designation: string;
    department: string;
    status: "verified" | "pending" | "inactive" | "suspended";
    photo?: string;
  };
}) {
  const imageUrl = `/api/employees/${employee.employeeID}/id-card/png`;
  const imageDownloadUrl = `${imageUrl}?download=1`;
  const pdfUrl = `/api/employees/${employee.employeeID}/id-card/pdf`;
  const statusLabel = employeeStatusMap[employee.status]?.label || employee.status;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-blue-700 to-emerald-500 p-6 shadow-glass">
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-blue-100">Official ID Card</p>
              <p className="mt-2 text-2xl font-bold">{COMPANY_NAME}</p>
            </div>
            <img src={`/api/employees/${employee.employeeID}/qr`} alt={employee.employeeID} className="h-24 w-24 rounded-2xl bg-white p-2" />
          </div>
          <div className="mt-6 flex gap-4">
            <div className="h-40 w-32 overflow-hidden rounded-[24px] bg-white/10">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                  {employee.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-2xl font-bold">{employee.fullName}</p>
                <p className="text-slate-100">{employee.designation}</p>
              </div>
              <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Employee ID</p>
                  <p className="mt-2 font-semibold">{employee.employeeID}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Department</p>
                  <p className="mt-2 font-semibold">{employee.department}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Status</p>
                  <p className="mt-2 font-semibold">{statusLabel}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Verification</p>
                  <p className="mt-2 font-semibold">Scan QR to verify</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={imageDownloadUrl} className="btn-secondary gap-2" download>
          <Download className="h-4 w-4" />
          Download PNG
        </a>
        <a href={pdfUrl} className="btn-primary gap-2" download>
          <Download className="h-4 w-4" />
          Download PDF
        </a>
        <button type="button" className="btn-secondary gap-2" onClick={() => window.open(imageUrl, "_blank")}>
          <Printer className="h-4 w-4" />
          Print ID Card
        </button>
      </div>
    </div>
  );
}
