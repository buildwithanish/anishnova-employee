"use client";

import { Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { normalizeEmployeeId } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [employeeID, setEmployeeID] = useState("");
  const [isPending, startTransition] = useTransition();

  const onVerify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeID.trim()) return;
    startTransition(() => {
      router.push(`/verify/${normalizeEmployeeId(employeeID)}`);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <ShieldCheck className="h-4 w-4" />
          Public employee verification powered by secure identity records
        </div>
        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
            Enterprise-grade employee verification for a modern workforce.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Verify official Anishnova Technologies employees in seconds through a direct verification link,
            employee ID search, or QR code scan.
          </p>
        </div>
        <form onSubmit={onVerify} className="glass max-w-2xl rounded-[30px] p-4 shadow-glass">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={employeeID}
                onChange={(event) => setEmployeeID(event.target.value)}
                placeholder="Enter employee ID, for example AN001"
                className="input pl-12"
              />
            </div>
            <button type="submit" className="btn-primary min-w-[180px]" disabled={isPending}>
              {isPending ? "Verifying..." : "Verify Employee"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass relative overflow-hidden rounded-[32px] border border-white/60 p-6 shadow-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-500/10" />
        <div className="relative space-y-4">
          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-glass">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-200">Verification Channel</p>
            <h2 className="mt-4 text-3xl font-bold">Trusted by public users, internal admins, and HR teams.</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Scan the employee QR code to land on the official verification profile.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Open a direct verification link like <span className="font-semibold text-white">/verify/AN001</span>.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Search employees publicly while fake attempts are logged and monitored.
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Real-time verification", "Official employee identity response pages"],
              ["Secure admin access", "JWT protected management workspace"],
              ["Bulk operations", "CSV import, QR ZIP exports, and ID cards"],
              ["Audit logs", "Track valid and invalid verification activity"],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
