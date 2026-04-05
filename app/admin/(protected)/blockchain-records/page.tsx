import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getEmployeesList } from "@/lib/queries";

export default async function BlockchainRecordsPage() {
  const employees = await getEmployeesList({ page: 1, limit: 50 });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Blockchain Records</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Verification hash registry for employee identities.</h1>
        <p className="mt-3 max-w-3xl text-slate-500">
          Each employee record is provisioned with a tamper-evident verification hash that can be referenced during public checks,
          ID card generation, and future blockchain anchoring workflows.
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-glass">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification Hash</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.items.map((employee) => (
                <tr key={employee.employeeID}>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-950">{employee.fullName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{employee.employeeID}</p>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={employee.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-[420px] break-all rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
                      {employee.blockchainHash || "Hash not generated"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Link href={`/verify/${employee.employeeID}`} target="_blank" className="btn-secondary px-4 py-2 text-xs">
                      View Record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
