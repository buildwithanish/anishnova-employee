import JSZip from "jszip";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { generateQrBuffer } from "@/lib/qr";
import Employee from "@/models/Employee";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const employees = await Employee.find().sort({ employeeID: 1 });
  const zip = new JSZip();

  for (const employee of employees) {
    const qrBuffer = await generateQrBuffer(employee.employeeID);
    zip.file(`${employee.employeeID}.png`, qrBuffer);
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="anishnova-qrcodes.zip"',
    },
  });
}
