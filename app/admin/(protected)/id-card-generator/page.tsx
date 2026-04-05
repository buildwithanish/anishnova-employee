import { IdCardPreview } from "@/components/admin/id-card-preview";
import { getEmployeesList } from "@/lib/queries";

export default async function IdCardGeneratorPage() {
  const employees = await getEmployeesList({ page: 1, limit: 12 });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">ID Card Generator</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Generate professional employee identity cards.</h1>
        <p className="mt-3 max-w-3xl text-slate-500">
          Create CR80-style employee cards with photo, QR code, verification status, and download links for PNG or PDF exports.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/api/employees/bulk-id-cards" className="btn-primary">
            Download All ID Cards PDF
          </a>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {employees.items.map((employee) => (
          <div key={employee.employeeID} className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{employee.employeeID}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{employee.fullName}</p>
              <p className="mt-1 text-sm text-slate-500">{employee.designation} / {employee.department}</p>
            </div>
            <IdCardPreview employee={JSON.parse(JSON.stringify(employee))} />
          </div>
        ))}
      </div>
    </div>
  );
}
