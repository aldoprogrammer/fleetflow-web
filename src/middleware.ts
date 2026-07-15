import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  RBAC_COOKIE,
  getPermissionsFromRbacCookie,
} from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/access";

const PUBLIC_PATHS = new Set(["/login"]);
const AUTHENTICATED_ONLY = new Set(["/dashboard", "/forbidden"]);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/operations",
  "/fleet",
  "/drivers",
  "/merchants",
  "/ledger",
  "/admin",
  "/notifications",
  "/forbidden",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const rbac = request.cookies.get(RBAC_COOKIE)?.value;
  const permissions = getPermissionsFromRbacCookie(rbac);

  if (PUBLIC_PATHS.has(pathname)) {
    if (token && rbac) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (token && rbac) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!token || !rbac) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTHENTICATED_ONLY.has(pathname)) {
    return NextResponse.next();
  }

  if (!canAccessPath(pathname, permissions)) {
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = "/forbidden";
    forbiddenUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard",
    "/forbidden",
    "/orders/:path*",
    "/operations/:path*",
    "/fleet",
    "/drivers",
    "/merchants",
    "/ledger",
    "/admin/:path*",
    "/notifications",
  ],
};
