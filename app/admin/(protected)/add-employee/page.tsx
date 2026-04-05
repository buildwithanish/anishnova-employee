import { EmployeeForm } from "@/components/admin/employee-form";

export default function AddEmployeePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Create Employee</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Add a new verified employee profile.</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Create a new employee record with photo, role details, contact information, and automatic QR verification.
        </p>
      </div>
      <EmployeeForm mode="create" />
    </div>
  );
}
