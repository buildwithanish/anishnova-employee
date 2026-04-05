import { NextRequest, NextResponse } from "next/server";

import { getEmployeeByEmployeeId, logVerificationAttempt } from "@/lib/employee";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyRateLimitHeaders, getRequestIp, getUserAgent } from "@/lib/security";
import { faceVerificationSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`face-verify:${ip}`, 20, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return applyRateLimitHeaders(
      NextResponse.json({ success: false, message: "Too many face verification attempts." }, { status: 429 }),
      rateLimit,
    );
  }

  const body = await request.json();
  const parsed = faceVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid face verification payload." }, { status: 400 });
  }

  const employee = await getEmployeeByEmployeeId(parsed.data.employeeID);

  await logVerificationAttempt({
    employeeID: parsed.data.employeeID,
    matchedEmployeeId: employee?.employeeID,
    matchedEmployeeName: employee?.fullName,
    status: parsed.data.match ? "valid" : "invalid",
    source: "face",
    path: `/face-verify/${parsed.data.employeeID}`,
    confidence: parsed.data.confidence,
    notes: parsed.data.notes,
    ip,
    userAgent: getUserAgent(request),
  });

  return applyRateLimitHeaders(
    NextResponse.json({
      success: true,
      employee: employee ? employee.toObject() : null,
    }),
    rateLimit,
  );
}
