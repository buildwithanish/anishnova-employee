import Link from "next/link";
import { headers } from "next/headers";
import { AlertTriangle, Building2, Download, ExternalLink, ShieldCheck } from "lucide-react";

import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";
import { QrCodeImage } from "@/components/qr-code-image";
import { StatusBadge } from "@/components/status-badge";
import { VerificationBadge } from "@/components/verification-badge";
import { VerificationEntryModal } from "@/components/verification-entry-modal";
import {
  COMPANY_ADDRESS,
  COMPANY_CONTACT_EMAIL,
  COMPANY_CONTACT_PHONE,
  COMPANY_NAME,
  COMPANY_TAGLINE,
  COMPANY_WEBSITE,
} from "@/lib/constants";
import { getEmployeeByEmployeeId, logVerificationAttempt } from "@/lib/employee";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatDate, normalizeEmployeeId } from "@/lib/utils";

function getHeaderValue(name: string) {
  return headers().get(name) || "";
}

export default async function VerifyEmployeePage({
  params,
}: {
  params: { employeeID: string };
}) {
  const normalizedEmployeeID = normalizeEmployeeId(params.employeeID);
  const ip = getHeaderValue("x-forwarded-for") || getHeaderValue("x-real-ip") || "unknown";
  const rateLimit = checkRateLimit(`verify-page:${ip}`, 60, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return (
      <div className="page-shell">
        <PublicNavbar />
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
          <div className="rounded-[34px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Rate Limit</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-amber-800">Too many verification requests</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-amber-700">
              Please wait a few minutes before trying to verify another employee record.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const employee = await getEmployeeByEmployeeId(normalizedEmployeeID);

  await logVerificationAttempt({
    employeeID: normalizedEmployeeID,
    matchedEmployeeId: employee?.employeeID,
    matchedEmployeeName: employee?.fullName,
    status: employee ? "valid" : "invalid",
    source: "link",
    path: `/verify/${normalizedEmployeeID}`,
    ip,
    userAgent: getHeaderValue("user-agent"),
  });

  const verified = Boolean(employee);

  return (
    <div className="page-shell">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="rounded-[34px] bg-slate-950 p-8 text-white shadow-glass">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Official Verification Portal</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight">{COMPANY_NAME}</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Employee identity response for employee ID <span className="font-semibold text-white">{normalizedEmployeeID}</span>
              </p>
            </div>
            <VerificationBadge verified={verified} />
          </div>
        </div>

        {employee ? (
          <>
            <VerificationEntryModal
              openByDefault
              verified
              employeeID={employee.employeeID}
              employeeName={employee.fullName}
              onCloseLabel="View Employee Details"
              secondaryActions={[
                {
                  label: "Verify Face",
                  href: `/face-verify?employeeID=${employee.employeeID}`,
                },
                {
                  label: "Verify Voice",
                  href: `/voice-verify?employeeID=${employee.employeeID}`,
                },
              ]}
            />
            <div className="glass rounded-[34px] p-8 shadow-glass">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50">
                    {employee.photo ? (
                      <img src={employee.photo} alt={employee.fullName} className="h-[380px] w-full object-cover" />
                    ) : (
                      <div className="flex h-[380px] items-center justify-center text-6xl font-black text-slate-400">
                        {employee.fullName
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-[28px] bg-emerald-50 p-5 text-emerald-700">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5" />
                      <p className="font-semibold">Verified Employee of Anishnova Technologies</p>
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">QR Verification</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Scan the official QR code to open this verification profile instantly.
                        </p>
                      </div>
                      <QrCodeImage employeeID={employee.employeeID} className="h-32 w-32 rounded-[24px] border border-slate-200 bg-white p-3" />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href={`/api/employees/${employee.employeeID}/qr?download=1`} className="btn-secondary">
                        Download QR Code
                      </a>
                      <a href={`/api/employees/${employee.employeeID}/id-card/png?download=1`} className="btn-primary gap-2">
                        <Download className="h-4 w-4" />
                        Download Employee ID Card
                      </a>
                      <a href={`/api/employees/${employee.employeeID}/certificate/pdf?download=1`} className="btn-secondary">
                        Download Certificate
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Employee Profile</p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-950">{employee.fullName}</h2>
                    <p className="text-lg text-slate-600">
                      {employee.designation} / {employee.department}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Employee ID</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{employee.employeeID}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Joining Date</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{formatDate(employee.joiningDate)}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Official Email</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{employee.email}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{employee.phone}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Office Location</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{employee.officeLocation}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Manager Name</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{employee.manager}</p>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Employment Status</p>
                      <div className="mt-3">
                        <StatusBadge status={employee.status} />
                      </div>
                    </div>
                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">NFC Employee Card</p>
                      <p className="mt-2 break-all text-base font-semibold text-slate-900">{employee.nfcTagUrl}</p>
                    </div>
                  </div>

                  <div id="blockchain-record" className="rounded-[28px] border border-slate-200 bg-white p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-3xl bg-slate-950 p-3 text-white">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Company Contact Information</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{COMPANY_NAME}</h3>
                        <p className="mt-2 text-sm text-slate-500">{COMPANY_TAGLINE}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-slate-900">Website</p>
                        <Link href={COMPANY_WEBSITE} className="mt-1 inline-flex items-center gap-2 hover:text-slate-950">
                          {COMPANY_WEBSITE}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Email</p>
                        <Link href={`mailto:${COMPANY_CONTACT_EMAIL}`} className="mt-1 inline-block hover:text-slate-950">
                          {COMPANY_CONTACT_EMAIL}
                        </Link>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Phone</p>
                        <p className="mt-1">{COMPANY_CONTACT_PHONE}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Address</p>
                        <p className="mt-1">{COMPANY_ADDRESS}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="font-semibold text-slate-900">Blockchain Verification Hash</p>
                        <p className="mt-1 break-all rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
                          {employee.blockchainHash || "Verification hash pending"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Company Website</p>
                        <Link href={COMPANY_WEBSITE} className="mt-1 inline-flex items-center gap-2 text-blue-700 hover:text-slate-950">
                          {COMPANY_WEBSITE}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Verification Status</p>
                        <p className="mt-1 text-emerald-700">Verified employee identity record</p>
                      </div>
                      <div className="sm:col-span-2 flex flex-wrap gap-3">
                        <Link href="#blockchain-record" className="btn-secondary">
                          View Blockchain Record
                        </Link>
                        <Link href={`/face-verify?employeeID=${employee.employeeID}`} className="btn-secondary">
                          Verify Face
                        </Link>
                        <Link href={`/voice-verify?employeeID=${employee.employeeID}`} className="btn-secondary">
                          Verify Voice
                        </Link>
                        <Link href={`/deepfake-check?employeeID=${employee.employeeID}`} className="btn-secondary">
                          Deepfake Screening
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[34px] border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-red-500">Security Warning</p>
                  <h2 className="text-4xl font-black tracking-tight text-red-700">Employee Record Not Found</h2>
                  <p className="max-w-2xl text-lg leading-8 text-red-700/85">
                    This employee ID does not exist in Anishnova Technologies database. This person is NOT registered with
                    Anishnova Technologies.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] bg-white px-6 py-5 text-sm text-red-700 shadow-sm">
                <p className="font-semibold">Invalid ID Checked</p>
                <p className="mt-2 font-mono">{normalizedEmployeeID}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
