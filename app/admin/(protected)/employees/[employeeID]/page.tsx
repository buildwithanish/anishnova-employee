import Link from "next/link";
import { notFound } from "next/navigation";

import { IdCardPreview } from "@/components/admin/id-card-preview";
import { QrCodeImage } from "@/components/qr-code-image";
import { StatusBadge } from "@/components/status-badge";
import { COMPANY_ADDRESS, COMPANY_NAME, COMPANY_TAGLINE, COMPANY_WEBSITE } from "@/lib/constants";
import { getEmployeeByEmployeeId } from "@/lib/employee";
import { formatDate } from "@/lib/utils";

export default async function EmployeeProfilePage({
  params,
}: {
  params: { employeeID: string };
}) {
  const employee = await getEmployeeByEmployeeId(params.employeeID);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-[28px] bg-slate-100">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-500">
                  {employee.fullName
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{employee.employeeID}</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{employee.fullName}</h1>
              <p className="mt-2 text-slate-600">{employee.designation} / {employee.department}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={employee.status} />
            <Link href={`/verify/${employee.employeeID}`} target="_blank" className="btn-primary">
              1 Click Verification
            </Link>
            <a href={`/api/employees/${employee.employeeID}/certificate/pdf?download=1`} className="btn-secondary">
              Download Certificate
            </a>
            <Link href={`/admin/edit-employee/${employee.employeeID}`} className="btn-secondary">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <p className="text-sm font-semibold text-slate-950">Employee Details</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Email", employee.email],
                ["Phone", employee.phone],
                ["Joining Date", formatDate(employee.joiningDate)],
                ["Office Location", employee.officeLocation],
                ["Manager", employee.manager],
                ["Blood Group", employee.bloodGroup || "N/A"],
                ["Emergency Contact", employee.emergencyContact || "N/A"],
                ["Address", employee.address],
                ["Verification Hash", employee.blockchainHash || "Not generated"],
                ["Voice Signature", employee.voiceSignature || "Pending enrollment"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 break-all font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">QR Verification</p>
                <p className="mt-1 text-sm text-slate-500">Official QR code for public verification link.</p>
              </div>
              <a href={`/api/employees/${employee.employeeID}/qr?download=1`} className="btn-secondary">
                Download QR
              </a>
            </div>
            <div className="mt-6 flex flex-col items-start gap-4 rounded-[24px] bg-slate-50 p-5">
              <QrCodeImage employeeID={employee.employeeID} className="h-48 w-48 rounded-[26px] border border-slate-200 bg-white p-4" />
              <p className="text-sm text-slate-500">Scan or share this QR to open the official verification page.</p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/face-verify?employeeID=${employee.employeeID}`} className="btn-secondary px-4 py-2 text-xs">
                  Verify Face
                </Link>
                <Link href={`/voice-verify?employeeID=${employee.employeeID}`} className="btn-secondary px-4 py-2 text-xs">
                  Verify Voice
                </Link>
                <Link href={`/deepfake-check?employeeID=${employee.employeeID}`} className="btn-secondary px-4 py-2 text-xs">
                  Deepfake Screen
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <p className="text-sm font-semibold text-slate-950">Company Snapshot</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Company Name</p>
                <p className="mt-2 font-medium text-slate-900">{COMPANY_NAME}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tagline</p>
                <p className="mt-2 font-medium text-slate-900">{COMPANY_TAGLINE}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Website</p>
                <a href={COMPANY_WEBSITE} target="_blank" className="mt-2 block font-medium text-blue-700">
                  {COMPANY_WEBSITE}
                </a>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Address</p>
                <p className="mt-2 font-medium text-slate-900">{COMPANY_ADDRESS}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <p className="text-sm font-semibold text-slate-950">Employee ID Card Generator</p>
          <p className="mt-1 text-sm text-slate-500">CR80 professional identity card with QR verification.</p>
          <div className="mt-6">
            <IdCardPreview employee={JSON.parse(JSON.stringify(employee))} />
          </div>
        </div>
      </div>
    </div>
  );
}
