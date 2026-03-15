import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequestEdge } from "./lib/auth-edge";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/api/auth/login", "/api/auth/register"];
const ADMIN_ROUTES = ["/admin", "/api/admin"];
const TEACHER_ROUTES = ["/teacher"];
const STUDENT_ROUTES = ["/student"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "?"));
  if (isPublic) return NextResponse.next();

  const payload = await getTokenFromRequestEdge(request);

  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!["ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Teacher routes
  if (pathname.startsWith("/teacher")) {
    if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
