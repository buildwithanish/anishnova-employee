import { NextRequest, NextResponse } from "next/server";

import { getEmployeeByEmployeeId, logVerificationAttempt } from "@/lib/employee";
import { searchPublicEmployees } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyRateLimitHeaders, getRequestIp, getUserAgent } from "@/lib/security";
import { publicSearchSchema } from "@/lib/validation";
import { normalizeEmployeeId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`public-search:${ip}`, 60, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return applyRateLimitHeaders(
      NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 }),
      rateLimit,
    );
  }

  const query = request.nextUrl.searchParams.get("q") || "";
  const parsed = publicSearchSchema.safeParse({ q: query });

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Search query is required." }, { status: 400 });
  }

  const results = await searchPublicEmployees(parsed.data.q);
  const matched =
    (await getEmployeeByEmployeeId(normalizeEmployeeId(parsed.data.q))) ||
    (results.length > 0 ? results[0] : null);

  await logVerificationAttempt({
    employeeID: parsed.data.q,
    matchedEmployeeId: matched?.employeeID,
    matchedEmployeeName: matched?.fullName,
    status: matched ? "valid" : "invalid",
    source: "search",
    path: `/employee-search?q=${encodeURIComponent(parsed.data.q)}`,
    ip,
    userAgent: getUserAgent(request),
  });

  return applyRateLimitHeaders(
    NextResponse.json({
      success: true,
      results: results.map((employee) => employee.toObject()),
    }),
    rateLimit,
  );
}
