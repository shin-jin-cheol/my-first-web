import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sjc-session";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (sessionCookie) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: ["/posts/new", "/guest/new", "/guest/account", "/admin/:path*"],
};
