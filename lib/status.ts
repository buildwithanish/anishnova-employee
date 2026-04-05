import { EMPLOYEE_STATUSES } from "@/lib/constants";

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
export type EmployeeStatusKey = EmployeeStatus | "unknown";

export const employeeStatusMap: Record<
  EmployeeStatusKey,
  {
    label: string;
    shortLabel: string;
    tone: string;
    badgeClassName: string;
  }
> = {
  verified: {
    label: "Verified Employee",
    shortLabel: "Verified",
    tone: "Verified employee identity is active and confirmed.",
    badgeClassName: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "Pending Verification",
    shortLabel: "Pending",
    tone: "Employee record exists and is under verification review.",
    badgeClassName: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  inactive: {
    label: "Inactive Employee",
    shortLabel: "Inactive",
    tone: "Employee record is inactive and should not be treated as currently active.",
    badgeClassName: "bg-rose-100 text-rose-700 border border-rose-200",
  },
  suspended: {
    label: "Suspended Employee",
    shortLabel: "Suspended",
    tone: "Employee record is suspended and requires manual review.",
    badgeClassName: "bg-red-100 text-red-700 border border-red-200",
  },
  unknown: {
    label: "Unknown Employee",
    shortLabel: "Unknown",
    tone: "Employee record could not be matched with the official database.",
    badgeClassName: "bg-slate-200 text-slate-700 border border-slate-300",
  },
};

export function isPositiveEmployeeStatus(status: string) {
  return status === "verified";
}
