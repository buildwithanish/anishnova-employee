import { NextResponse } from "next/server";

import { getEmployeeByEmployeeId } from "@/lib/employee";
import { generateIdCardPng } from "@/lib/id-card";

export async function GET(
  request: Request,
  { params }: { params: { employeeID: string } },
) {
  const employee = await getEmployeeByEmployeeId(params.employeeID);

  if (!employee) {
    return NextResponse.json({ success: false, message: "Employee not found." }, { status: 404 });
  }

  const png = await generateIdCardPng(employee);

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      ...(new URL(request.url).searchParams.get("download") === "1"
        ? {
            "Content-Disposition": `attachment; filename="${employee.employeeID}-id-card.png"`,
          }
        : {}),
    },
  });
}
