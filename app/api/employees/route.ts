import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { generateEmployeeId, generateEmployeeVerificationMetadata } from "@/lib/employee";
import { getEmployeesList } from "@/lib/queries";
import { employeeSchema } from "@/lib/validation";
import Employee from "@/models/Employee";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const result = await getEmployeesList({
    query: searchParams.get("q") || "",
    status: searchParams.get("status") || "all",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
  });

  return NextResponse.json({
    success: true,
    ...result,
    items: result.items.map((employee) => employee.toObject()),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = employeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid employee payload." }, { status: 400 });
  }

  await dbConnect();

  const employeeID = parsed.data.employeeID || (await generateEmployeeId());

  const existingEmployee = await Employee.findOne({
    $or: [{ employeeID }, { email: parsed.data.email.toLowerCase() }],
  });

  if (existingEmployee) {
    return NextResponse.json(
      { success: false, message: "Employee with this ID or email already exists." },
      { status: 409 },
    );
  }

  const employee = await Employee.create({
    ...parsed.data,
    employeeID,
    email: parsed.data.email.toLowerCase(),
    joiningDate: new Date(parsed.data.joiningDate),
    ...generateEmployeeVerificationMetadata({
      employeeID,
      fullName: parsed.data.fullName,
      designation: parsed.data.designation,
      department: parsed.data.department,
      joiningDate: parsed.data.joiningDate,
      email: parsed.data.email,
      manager: parsed.data.manager,
      officeLocation: parsed.data.officeLocation,
    }),
  });

  return NextResponse.json({
    success: true,
    employee: employee.toObject(),
  });
}
