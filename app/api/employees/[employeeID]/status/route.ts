import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { EMPLOYEE_STATUSES } from "@/lib/constants";
import dbConnect from "@/lib/db";
import { normalizeEmployeeId } from "@/lib/utils";
import Employee from "@/models/Employee";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const status = body?.status;

  if (!EMPLOYEE_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid status." }, { status: 400 });
  }

  await dbConnect();
  const employee = await Employee.findOneAndUpdate(
    { employeeID: normalizeEmployeeId(params.employeeID) },
    { status },
    { new: true },
  );

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, employee: employee.toObject() });
}
