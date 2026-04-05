"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { useState } from "react";

import { COMPANY_NAME } from "@/lib/constants";

export function VerificationEntryModal({
  employeeID,
  openByDefault = false,
  open: controlledOpen,
  employeeName,
  onCloseLabel = "View Employee Details",
  verified = true,
  onClose,
  secondaryActions = [],
}: {
  employeeID: string;
  openByDefault?: boolean;
  open?: boolean;
  employeeName?: string;
  onCloseLabel?: string;
  verified?: boolean;
  onClose?: () => void;
  secondaryActions?: Array<{
    label: string;
    href: string;
  }>;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(openByDefault);
  const open = controlledOpen ?? uncontrolledOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    setUncontrolledOpen(false);
  };

  return (
    open ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/50 bg-white/90 p-8 shadow-[0_40px_120px_rgba(2,6,23,0.28)] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
          <div className="relative space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                  <Sparkles className="h-4 w-4" />
                  Verification Gateway
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">
                    Welcome to {COMPANY_NAME}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {verified
                      ? "This employee record has been found in our official company database."
                      : "This employee ID could not be found in our official employee database."}
                  </p>
                </div>
              </div>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                  verified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                {verified ? <ShieldCheck className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
            </div>

            <div className={`rounded-[28px] p-5 ${verified ? "bg-emerald-50" : "bg-red-50"}`}>
              <p className={`text-xs uppercase tracking-[0.25em] ${verified ? "text-emerald-600" : "text-red-600"}`}>
                Verification Status
              </p>
              <p className={`mt-3 text-2xl font-bold ${verified ? "text-emerald-700" : "text-red-700"}`}>
                {verified ? "Verified Employee" : "Employee Record Not Found"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {employeeName ? `${employeeName} / ${employeeID}` : employeeID}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn-primary w-full sm:col-span-2" onClick={handleClose}>
                {onCloseLabel}
              </button>
              {verified
                ? secondaryActions.map((action) => (
                    <Link key={action.href} href={action.href} className="btn-secondary justify-center">
                      {action.label}
                    </Link>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}
