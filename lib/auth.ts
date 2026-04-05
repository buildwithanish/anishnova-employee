import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import dbConnect from "@/lib/db";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import Admin, { type AdminDocument } from "@/models/Admin";

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function ensureDefaultAdmin() {
  await dbConnect();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword(password);

  return Admin.create({
    email: email.toLowerCase(),
    name: "Anishnova Admin",
    passwordHash,
    role: "superadmin",
  });
}

export async function signAdminToken(admin: Pick<AdminDocument, "id" | "email" | "name" | "role">) {
  return new SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  } satisfies AdminSession)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string) {
  const result = await jwtVerify(token, getJwtSecret());
  return result.payload as JWTPayload & AdminSession;
}

export async function getAdminSession() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAdminToken(token);
    return {
      adminId: payload.adminId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    } satisfies AdminSession;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin");
  }
  return session;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
