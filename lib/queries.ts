import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import VerificationLog from "@/models/VerificationLog";
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants";
import { normalizeEmployeeId } from "@/lib/utils";

export async function getDashboardStats() {
  await dbConnect();

  const [totalEmployees, verifiedEmployees, pendingEmployees, inactiveEmployees, verificationRequests, fakeAttempts, recentEmployees, recentLogs] =
    await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "verified" }),
      Employee.countDocuments({ status: "pending" }),
      Employee.countDocuments({ status: { $in: ["inactive", "suspended"] } }),
      VerificationLog.countDocuments(),
      VerificationLog.countDocuments({ status: "invalid" }),
      Employee.find().sort({ createdAt: -1 }).limit(5),
      VerificationLog.find().sort({ createdAt: -1 }).limit(8),
    ]);

  return {
    totalEmployees,
    verifiedEmployees,
    pendingEmployees,
    inactiveEmployees,
    verificationRequests,
    fakeAttempts,
    recentEmployees,
    recentLogs,
  };
}

export async function getEmployeesList(options: {
  query?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await dbConnect();

  const page = Math.max(Number(options.page || 1), 1);
  const limit = Math.max(Number(options.limit || DASHBOARD_PAGE_SIZE), 1);
  const skip = (page - 1) * limit;
  const filters: Record<string, unknown> = {};

  if (options.status && options.status !== "all") {
    filters.status = options.status;
  }

  if (options.query) {
    const normalized = normalizeEmployeeId(options.query);
    filters.$or = [
      { employeeID: { $regex: normalized, $options: "i" } },
      { fullName: { $regex: options.query, $options: "i" } },
      { designation: { $regex: options.query, $options: "i" } },
      { department: { $regex: options.query, $options: "i" } },
      { manager: { $regex: options.query, $options: "i" } },
      { officeLocation: { $regex: options.query, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Employee.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filters),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function searchPublicEmployees(query: string) {
  await dbConnect();

  const normalized = normalizeEmployeeId(query);
  return Employee.find({
    $or: [
      { employeeID: { $regex: normalized, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1, fullName: 1 })
    .limit(20);
}

export async function getVerificationLogs(options?: {
  source?: "link" | "qr" | "search" | "admin" | "face" | "voice" | "deepfake";
  limit?: number;
}) {
  await dbConnect();

  const filters: Record<string, unknown> = {};
  if (options?.source) {
    filters.source = options.source;
  }

  return VerificationLog.find(filters)
    .sort({ createdAt: -1 })
    .limit(options?.limit || 20);
}

export async function getPublicDirectory(limit = 16) {
  await dbConnect();

  return Employee.find({
    status: { $in: ["verified", "pending", "inactive", "suspended"] },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
}
