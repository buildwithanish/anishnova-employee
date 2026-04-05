import { NextResponse } from "next/server";

import { getEmployeeByEmployeeId } from "@/lib/employee";
import { generateIdCardPdf } from "@/lib/id-card";

export async function GET(
  _request: Request,
  { params }: { params: { employeeID: string } },
) {
  const employee = await getEmployeeByEmployeeId(params.employeeID);

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  const pdf = await generateIdCardPdf(employee);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${employee.employeeID}-id-card.pdf"`,
    },
  });
}
