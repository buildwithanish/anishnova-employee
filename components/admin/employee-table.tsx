import Link from "next/link";

import { EmployeeActions } from "@/components/admin/employee-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

type EmployeeTableItem = {
  employeeID: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: Date | string;
  officeLocation?: string;
  manager?: string;
  status: "verified" | "pending" | "inactive" | "suspended";
  photo?: string;
};

export function EmployeeTable({
  employees,
  page,
  totalPages,
  query,
  status,
}: {
  employees: EmployeeTableItem[];
  page: number;
  totalPages: number;
  query?: string;
  status?: string;
}) {
  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(nextPage));
    return `/admin/employees?${params.toString()}`;
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-glass">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.employeeID} className="align-top">
                <td className="px-6 py-5">
                  <div className="flex min-w-[240px] items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                      {employee.photo ? (
                        <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-500">
                          {employee.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/employees/${employee.employeeID}`} className="font-semibold text-slate-950">
                        {employee.fullName}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{employee.employeeID}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-medium text-slate-900">{employee.designation}</p>
                  <p className="mt-1 text-slate-500">{employee.department}</p>
                  {employee.officeLocation ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{employee.officeLocation}</p> : null}
                </td>
                <td className="px-6 py-5">
                  <p className="text-slate-900">{employee.email}</p>
                  <p className="mt-1 text-slate-500">{employee.phone}</p>
                  {employee.manager ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Mgr: {employee.manager}</p> : null}
                </td>
                <td className="px-6 py-5 text-slate-600">{formatDate(employee.joiningDate)}</td>
                <td className="px-6 py-5">
                  <StatusBadge status={employee.status} />
                </td>
                <td className="px-6 py-5">
                  <EmployeeActions employeeID={employee.employeeID} status={employee.status} />
                </td>
              </tr>
            ))}
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                  No employees found for the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Link href={createPageHref(Math.max(page - 1, 1))} className="btn-secondary px-4 py-2 text-xs" aria-disabled={page <= 1}>
            Previous
          </Link>
          <Link
            href={createPageHref(Math.min(page + 1, totalPages))}
            className="btn-secondary px-4 py-2 text-xs"
            aria-disabled={page >= totalPages}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
