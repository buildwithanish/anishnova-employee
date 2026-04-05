import { NextRequest, NextResponse } from "next/server";

import { getEmployeeByEmployeeId, logVerificationAttempt } from "@/lib/employee";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyRateLimitHeaders, getRequestIp, getUserAgent } from "@/lib/security";
import { publicLookupSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`public-lookup:${ip}`, 80, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return applyRateLimitHeaders(
      NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 }),
      rateLimit,
    );
  }

  const employeeID = request.nextUrl.searchParams.get("employeeID") || "";
  const parsed = publicLookupSchema.safeParse({ employeeID });

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Employee ID is required." }, { status: 400 });
  }

  const employee = await getEmployeeByEmployeeId(parsed.data.employeeID);

  await logVerificationAttempt({
    employeeID: parsed.data.employeeID,
    matchedEmployeeId: employee?.employeeID,
    matchedEmployeeName: employee?.fullName,
    status: employee ? "valid" : "invalid",
    source: "search",
    path: `/api/public/lookup?employeeID=${parsed.data.employeeID}`,
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
