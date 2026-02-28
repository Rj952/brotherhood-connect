import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret-change-in-production");
const COOKIE_NAME = "bc_session";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/framework", "/about", "/admin"];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check admin access
    if (isAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token — redirect to login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/framework/:path*", "/about/:path*", "/admin/:path*"],
};
