import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!session?.user;

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isApiAuthRoute = pathname.startsWith("/api/auth");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  if (isPublicRoute && !isLoggedIn) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
