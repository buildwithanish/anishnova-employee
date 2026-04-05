import { QrCodeImage } from "@/components/qr-code-image";
import { getEmployeesList } from "@/lib/queries";

export default async function QrGeneratorPage() {
  const employees = await getEmployeesList({ page: 1, limit: 24 });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">QR Generator</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Generate and export employee verification QR codes.</h1>
        <p className="mt-3 max-w-3xl text-slate-500">
          Every employee record already has an official verification QR. Use the cards below for quick download or export the complete ZIP.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/api/employees/bulk-qrs" className="btn-primary">
            Bulk Download QR ZIP
          </a>
          <a href="/employee-search" className="btn-secondary">
            Open Public Search
          </a>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {employees.items.map((employee) => (
          <div key={employee.employeeID} className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{employee.employeeID}</p>
                <p className="mt-2 text-xl font-bold text-slate-950">{employee.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">{employee.designation} / {employee.department}</p>
              </div>
              <QrCodeImage employeeID={employee.employeeID} className="h-24 w-24 rounded-[24px] border border-slate-200 bg-white p-2" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`/api/employees/${employee.employeeID}/qr?download=1`} className="btn-secondary">
                Download QR
              </a>
              <a href={`/verify/${employee.employeeID}`} target="_blank" className="btn-primary">
                Open Verify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
