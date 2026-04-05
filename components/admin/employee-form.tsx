"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type EmployeeFormState = {
  employeeID?: string;
  fullName: string;
  photo: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  officeLocation: string;
  manager: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  status: "verified" | "pending" | "inactive" | "suspended";
};

const defaultState: EmployeeFormState = {
  employeeID: "",
  fullName: "",
  photo: "",
  designation: "",
  department: "",
  email: "",
  phone: "",
  joiningDate: "",
  officeLocation: "",
  manager: "",
  address: "",
  bloodGroup: "",
  emergencyContact: "",
  status: "verified",
};

export function EmployeeForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: Partial<EmployeeFormState>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EmployeeFormState>({
    ...defaultState,
    ...initialData,
  } as EmployeeFormState);
  const [error, setError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof EmployeeFormState>(key: K, value: EmployeeFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const uploadPhoto = async (file: File) => {
    setPhotoUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setForm((current) => ({ ...current, photo: data.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(() => {
      void (async () => {
        const endpoint = mode === "create" ? "/api/employees" : `/api/employees/${form.employeeID}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to save employee.");
          return;
        }

        router.push(`/admin/employees/${data.employee.employeeID}`);
        router.refresh();
      })();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6 rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Employee ID</label>
              <input
                value={form.employeeID}
                onChange={(event) => updateField("employeeID", event.target.value)}
                className="input"
                placeholder="Auto generated on save"
                disabled={mode === "edit"}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="input" placeholder="Enter employee full name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Designation</label>
              <input value={form.designation} onChange={(event) => updateField("designation", event.target.value)} className="input" placeholder="Software Engineer" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <input value={form.department} onChange={(event) => updateField("department", event.target.value)} className="input" placeholder="Engineering" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input value={form.email} onChange={(event) => updateField("email", event.target.value)} className="input" placeholder="employee@anishnova.com" type="email" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" placeholder="+91XXXXXXXXXX" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Office Location</label>
              <input
                value={form.officeLocation}
                onChange={(event) => updateField("officeLocation", event.target.value)}
                className="input"
                placeholder="Bengaluru HQ"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Manager Name</label>
              <input value={form.manager} onChange={(event) => updateField("manager", event.target.value)} className="input" placeholder="Reporting manager" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Joining Date</label>
              <input value={form.joiningDate} onChange={(event) => updateField("joiningDate", event.target.value)} className="input" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(event) => updateField("status", event.target.value as EmployeeFormState["status"])} className="input">
                <option value="verified">Verified Employee</option>
                <option value="pending">Pending Verification</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blood Group</label>
              <input value={form.bloodGroup} onChange={(event) => updateField("bloodGroup", event.target.value)} className="input" placeholder="B+" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Emergency Contact</label>
              <input value={form.emergencyContact} onChange={(event) => updateField("emergencyContact", event.target.value)} className="input" placeholder="+91XXXXXXXXXX" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} className="input min-h-[120px]" placeholder="Employee address" required />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Employee Photo</p>
                <p className="mt-1 text-sm text-slate-500">Upload a professional square employee profile image.</p>
              </div>
              <label className="btn-secondary cursor-pointer gap-2">
                <UploadCloud className="h-4 w-4" />
                {photoUploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadPhoto(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="mt-6 overflow-hidden rounded-[26px] border border-dashed border-slate-200 bg-slate-50">
              {form.photo ? (
                <img src={form.photo} alt={form.fullName || "Employee preview"} className="h-72 w-full object-cover" />
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-slate-400">Photo preview will appear here</div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-glass">
            <p className="text-sm font-semibold text-slate-950">Automation</p>
            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <div className="rounded-2xl bg-slate-50 p-4">Employee ID is auto-generated if left blank.</div>
              <div className="rounded-2xl bg-slate-50 p-4">QR code is generated automatically after save.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Verification hash and NFC-ready link are generated automatically.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Verification page goes live instantly after publish.</div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create Employee" : "Update Employee"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
