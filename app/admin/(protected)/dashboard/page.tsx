import Link from "next/link";

import { StatsCard } from "@/components/admin/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardStats } from "@/lib/queries";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatsCard label="Total Employees" value={stats.totalEmployees} hint="Entire employee directory" accent="slate" />
        <StatsCard label="Verified Employees" value={stats.verifiedEmployees} hint="Live verified workforce identities" accent="emerald" />
        <StatsCard label="Pending Employees" value={stats.pendingEmployees} hint="Awaiting verification approval" accent="amber" />
        <StatsCard label="Inactive Employees" value={stats.inactiveEmployees} hint="Disabled or former records" accent="rose" />
        <StatsCard label="Verification Requests" value={stats.verificationRequests} hint="Public verification log count" accent="blue" />
        <StatsCard label="Fake Attempts" value={stats.fakeAttempts} hint="Invalid public lookups detected" accent="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Recent Employees</p>
              <p className="mt-1 text-sm text-slate-500">Newly added employee identities</p>
            </div>
            <Link href="/admin/employees" className="btn-secondary px-4 py-2 text-xs">
              Open Employees
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {stats.recentEmployees.map((employee) => (
              <div key={employee.employeeID} className="flex flex-col gap-4 rounded-[24px] border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-200">
                    {employee.photo ? (
                        <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
                      ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-slate-600">
                        {employee.fullName
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{employee.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {employee.designation} / {employee.department}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{employee.employeeID}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={employee.status} />
                  <p className="text-sm text-slate-500">{formatDate(employee.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <p className="text-sm font-semibold text-slate-950">Verification Activity</p>
          <p className="mt-1 text-sm text-slate-500">Latest valid and invalid verification checks</p>
          <div className="mt-6 space-y-4">
            {stats.recentLogs.map((log) => (
              <div key={String(log._id)} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{log.employeeID}</p>
                    <p className="mt-1 text-sm text-slate-500">{log.path}</p>
                  </div>
                  <span
                    className={
                      log.status === "valid"
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                    }
                  >
                    {log.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                  <p>Source: {log.source}</p>
                  <p>Time: {formatDateTime(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
