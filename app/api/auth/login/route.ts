import { NextRequest, NextResponse } from "next/server";

import {
  adminCookieOptions,
  comparePassword,
  ensureDefaultAdmin,
  signAdminToken,
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import Admin from "@/models/Admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyRateLimitHeaders, badRequest, getRequestIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return applyRateLimitHeaders(
      NextResponse.json({ success: false, message: "Too many login attempts. Try again later." }, { status: 429 }),
      rateLimit,
    );
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid login credentials.");
  }

  await dbConnect();
  await ensureDefaultAdmin();

  const admin = await Admin.findOne({ email: parsed.data.email });

  if (!admin) {
    return badRequest("Invalid email or password.", 401);
  }

  const valid = await comparePassword(parsed.data.password, admin.passwordHash);

  if (!valid) {
    return badRequest("Invalid email or password.", 401);
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = await signAdminToken(admin);
  const response = NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });

  response.cookies.set("anishnova_admin_token", token, adminCookieOptions());
  return applyRateLimitHeaders(response, rateLimit);
}
