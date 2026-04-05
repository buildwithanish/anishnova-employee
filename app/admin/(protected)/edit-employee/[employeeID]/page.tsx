import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/admin/employee-form";
import { getEmployeeByEmployeeId } from "@/lib/employee";

export default async function EditEmployeePage({
  params,
}: {
  params: { employeeID: string };
}) {
  const employee = await getEmployeeByEmployeeId(params.employeeID);

  if (!employee) {
    notFound();
  }

  const initialData = {
    ...JSON.parse(JSON.stringify(employee)),
    joiningDate: new Date(employee.joiningDate).toISOString().slice(0, 10),
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Edit Employee</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{employee.fullName}</h1>
        <p className="mt-3 max-w-2xl text-slate-500">Update employee identity details, status, photo, and verification settings.</p>
      </div>
      <EmployeeForm mode="edit" initialData={initialData} />
    </div>
  );
}
