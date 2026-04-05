import { NextRequest, NextResponse } from "next/server";

import { generateEmployeeCertificatePdf } from "@/lib/certificate";
import { getEmployeeByEmployeeId } from "@/lib/employee";

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const employee = await getEmployeeByEmployeeId(params.employeeID);

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  const pdf = await generateEmployeeCertificatePdf(employee);
  const download = request.nextUrl.searchParams.get("download");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename=${employee.employeeID}-verification-certificate.pdf`,
    },
  });
}
