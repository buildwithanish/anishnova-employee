import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { parseEmployeeCsv } from "@/lib/csv";
import dbConnect from "@/lib/db";
import { generateEmployeeId, generateEmployeeVerificationMetadata } from "@/lib/employee";
import { employeeSchema } from "@/lib/validation";
import Employee from "@/models/Employee";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const csvText = body?.csvText;

  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ success: false, message: "CSV text is required." }, { status: 400 });
  }

  await dbConnect();

  const rows = parseEmployeeCsv(csvText);
  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    try {
      const parsed = employeeSchema.parse(rows[index]);
      const employeeID = parsed.employeeID || (await generateEmployeeId());
      const existing = parsed.employeeID
        ? await Employee.findOne({ employeeID })
        : await Employee.findOne({ email: parsed.email.toLowerCase() });

      if (existing) {
        Object.assign(existing, {
          ...parsed,
          employeeID: existing.employeeID,
          email: parsed.email.toLowerCase(),
          joiningDate: new Date(parsed.joiningDate),
          ...generateEmployeeVerificationMetadata({
            employeeID: existing.employeeID,
            fullName: parsed.fullName,
            designation: parsed.designation,
            department: parsed.department,
            joiningDate: parsed.joiningDate,
            email: parsed.email,
            manager: parsed.manager,
            officeLocation: parsed.officeLocation,
          }),
        });
        await existing.save();
        updated += 1;
      } else {
        await Employee.create({
          ...parsed,
          employeeID,
          email: parsed.email.toLowerCase(),
          joiningDate: new Date(parsed.joiningDate),
          ...generateEmployeeVerificationMetadata({
            employeeID,
            fullName: parsed.fullName,
            designation: parsed.designation,
            department: parsed.department,
            joiningDate: parsed.joiningDate,
            email: parsed.email,
            manager: parsed.manager,
            officeLocation: parsed.officeLocation,
          }),
        });
        created += 1;
      }
    } catch (error) {
      failed += 1;
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Invalid row"}`);
    }
  }

  return NextResponse.json({
    success: true,
    summary: { created, updated, failed },
    errors,
  });
}
