import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { generateBulkIdCardsPdf } from "@/lib/id-card";
import Employee from "@/models/Employee";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const employees = await Employee.find().sort({ employeeID: 1 });
  const pdfBuffer = await generateBulkIdCardsPdf(employees);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="anishnova-employee-id-cards.pdf"',
    },
  });
}
