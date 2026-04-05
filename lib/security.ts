import { type NextRequest, NextResponse } from "next/server";

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent") || "unknown";
}

export function applyRateLimitHeaders(response: NextResponse, rateResult: { remaining: number; resetAt: number }) {
  response.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
  response.headers.set("X-RateLimit-Reset", String(rateResult.resetAt));
  return response;
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
