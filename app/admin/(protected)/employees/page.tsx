import Link from "next/link";
import { Filter, Search } from "lucide-react";

import { BulkActions } from "@/components/admin/bulk-actions";
import { EmployeeTable } from "@/components/admin/employee-table";
import { getEmployeesList } from "@/lib/queries";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    page?: string;
    status?: string;
  };
}) {
  const query = searchParams?.q || "";
  const status = searchParams?.status || "all";
  const page = Number(searchParams?.page || 1);
  const employees = await getEmployeesList({
    query,
    status,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Employee Directory</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Manage employees, credentials, and verification records.</h1>
          </div>
          <Link href="/admin/add-employee" className="btn-primary">
            Add Employee
          </Link>
        </div>

        <form className="mt-6 grid gap-4 rounded-[24px] bg-slate-50 p-4 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input className="input pl-12" placeholder="Search by employee ID, name, designation, or department" name="q" defaultValue={query} />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select name="status" defaultValue={status} className="input pl-12">
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
        </form>
      </div>

      <BulkActions />

      <EmployeeTable
        employees={JSON.parse(JSON.stringify(employees.items))}
        page={employees.page}
        totalPages={employees.totalPages}
        query={query}
        status={status}
      />
    </div>
  );
}
