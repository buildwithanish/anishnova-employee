import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { generateEmployeeVerificationMetadata } from "@/lib/employee";
import { normalizeEmployeeId } from "@/lib/utils";
import { employeeUpdateSchema } from "@/lib/validation";
import Employee from "@/models/Employee";

export async function GET(
  _request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const employee = await Employee.findOne({ employeeID: normalizeEmployeeId(params.employeeID) });

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, employee: employee.toObject() });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid employee payload." }, { status: 400 });
  }

  await dbConnect();
  const employee = await Employee.findOne({ employeeID: normalizeEmployeeId(params.employeeID) });

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  const nextEmail = parsed.data.email?.toLowerCase();
  if (nextEmail && nextEmail !== employee.email) {
    const duplicate = await Employee.findOne({ email: nextEmail, _id: { $ne: employee._id } });
    if (duplicate) {
      return NextResponse.json({ success: false, message: "Email already in use by another employee." }, { status: 409 });
    }
  }

  Object.assign(employee, {
    ...parsed.data,
    email: nextEmail ?? employee.email,
    joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : employee.joiningDate,
    ...generateEmployeeVerificationMetadata({
      employeeID: employee.employeeID,
      fullName: parsed.data.fullName ?? employee.fullName,
      designation: parsed.data.designation ?? employee.designation,
      department: parsed.data.department ?? employee.department,
      joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : employee.joiningDate,
      email: nextEmail ?? employee.email,
      manager: parsed.data.manager ?? employee.manager,
      officeLocation: parsed.data.officeLocation ?? employee.officeLocation,
    }),
  });

  await employee.save();

  return NextResponse.json({ success: true, employee: employee.toObject() });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const employee = await Employee.findOneAndDelete({ employeeID: normalizeEmployeeId(params.employeeID) });

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
