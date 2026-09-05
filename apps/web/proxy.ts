import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/home") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (pathname.startsWith("/api/") && token && !request.headers.get("authorization")) {
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return NextResponse.next({
      request: { headers },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/api/:path*"],
};
