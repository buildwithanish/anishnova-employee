import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import VerificationLog from "@/models/VerificationLog";
import { DEFAULT_EMPLOYEE_PREFIX } from "@/lib/constants";
import { buildVerificationUrl, normalizeEmployeeId } from "@/lib/utils";
import { createHash } from "node:crypto";

export async function generateEmployeeId() {
  await dbConnect();

  const prefix = DEFAULT_EMPLOYEE_PREFIX.toUpperCase();
  const employees = await Employee.find({
    employeeID: { $regex: `^${prefix}[0-9]+$` },
  })
    .select("employeeID")
    .lean();

  const currentNumber = employees.reduce((max, employee) => {
    const value = Number(employee.employeeID.replace(prefix, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `${prefix}${String(currentNumber + 1).padStart(3, "0")}`;
}

export async function getEmployeeByEmployeeId(employeeID: string) {
  await dbConnect();
  return Employee.findOne({ employeeID: normalizeEmployeeId(employeeID) });
}

export function generateEmployeeVerificationMetadata(input: {
  employeeID: string;
  fullName: string;
  designation: string;
  department: string;
  joiningDate: string | Date;
  email: string;
  manager: string;
  officeLocation: string;
}) {
  const employeeID = normalizeEmployeeId(input.employeeID);
  const qrCode = buildVerificationUrl(employeeID);
  const blockchainHash = createHash("sha256")
    .update(
      [
        employeeID,
        input.fullName,
        input.designation,
        input.department,
        new Date(input.joiningDate).toISOString(),
        input.email.toLowerCase(),
        input.manager,
        input.officeLocation,
      ].join("|"),
    )
    .digest("hex");

  return {
    qrCode,
    nfcTagUrl: qrCode,
    blockchainHash,
  };
}

export async function logVerificationAttempt(input: {
  employeeID: string;
  matchedEmployeeId?: string;
  matchedEmployeeName?: string;
  status: "valid" | "invalid";
  source: "link" | "qr" | "search" | "admin" | "face" | "voice" | "deepfake";
  path: string;
  confidence?: number;
  notes?: string;
  ip?: string;
  userAgent?: string;
}) {
  await dbConnect();

  return VerificationLog.create({
    employeeID: normalizeEmployeeId(input.employeeID),
    matchedEmployeeId: input.matchedEmployeeId || "",
    matchedEmployeeName: input.matchedEmployeeName || "",
    status: input.status,
    source: input.source,
    path: input.path,
    confidence: input.confidence,
    notes: input.notes || "",
    ip: input.ip || "",
    userAgent: input.userAgent || "",
  });
}
