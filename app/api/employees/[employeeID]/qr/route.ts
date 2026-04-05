import { NextRequest, NextResponse } from "next/server";

import { generateQrBuffer } from "@/lib/qr";
import { normalizeEmployeeId } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeID: string } },
) {
  const employeeID = normalizeEmployeeId(params.employeeID);
  const qrBuffer = await generateQrBuffer(employeeID);
  const shouldDownload = request.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(qrBuffer), {
    headers: {
      "Content-Type": "image/png",
      ...(shouldDownload
        ? {
            "Content-Disposition": `attachment; filename="${employeeID}-qr.png"`,
          }
        : {}),
    },
  });
}
