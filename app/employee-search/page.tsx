import Link from "next/link";
import { Building2, Search } from "lucide-react";

import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";
import { StatusBadge } from "@/components/status-badge";
import { getPublicDirectory, searchPublicEmployees } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function EmployeeSearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() || "";
  const results = query ? await searchPublicEmployees(query) : await getPublicDirectory();

  return (
    <div className="page-shell">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Search className="h-4 w-4" />
            Public employee directory search
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950">Search employees by ID or name.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Use the official employee directory to quickly search current records and open the verification profile.
          </p>
        </div>

        <form className="glass rounded-[28px] p-4 shadow-glass">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search AN001 or Rahul Sharma"
                className="input pl-12"
              />
            </div>
            <button type="submit" className="btn-primary min-w-[180px]">
              Search Directory
            </button>
          </div>
        </form>

        <div className="grid gap-5">
          {query && results.length === 0 ? (
            <div className="rounded-[28px] border border-red-100 bg-red-50 p-8 text-red-700 shadow-sm">
              No employee record matched your search.
            </div>
          ) : null}

          {results.map((employee) => (
            <div key={employee.employeeID} className="glass rounded-[28px] p-6 shadow-glass">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-[24px] bg-slate-100">
                    {employee.photo ? (
                      <img src={employee.photo} alt={employee.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">
                        {employee.fullName
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-950">{employee.fullName}</p>
                    <p className="mt-1 text-slate-500">
                      {employee.designation} / {employee.department}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{employee.employeeID}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={employee.status} />
                  <Link href={`/verify/${employee.employeeID}`} className="btn-primary">
                    Open Verification
                  </Link>
                </div>
              </div>
              <div className="mt-6 grid gap-4 border-t border-slate-200/80 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Joining Date</p>
                  <p className="mt-2 font-medium text-slate-800">{formatDate(employee.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="mt-2 font-medium text-slate-800">{employee.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                  <p className="mt-2 font-medium text-slate-800">{employee.phone}</p>
                </div>
                {"officeLocation" in employee ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Office</p>
                    <p className="mt-2 font-medium text-slate-800">{employee.officeLocation}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {!query ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <p>Latest employee directory records are shown by default. Search any specific employee ID for a precise verification check.</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
