import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "anishnova_admin_token";

const protectedPaths = [
  "/api/employees",
  "/api/upload",
];

function isProtected(pathname: string) {
  if (pathname.startsWith("/admin/")) {
    return true;
  }
  return protectedPaths.some((path) => pathname.startsWith(path));
}

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return false;
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

function applyHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;

  if (pathname === "/admin" && isAuthenticated) {
    return applyHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
  }

  if (isProtected(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/admin", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return applyHeaders(NextResponse.redirect(loginUrl));
  }

  return applyHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
