import { auth } from "@/lib/auth/edge-config";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/feed", "/onboarding", "/blueprint", "/seo", "/studio", "/projects", "/trends", "/competitors", "/my-channel", "/thumbnail", "/analytics"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
