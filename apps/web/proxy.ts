import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAccessTokenUnusable } from "./app/lib/access-token";

function usableAccessToken(request: NextRequest): string | undefined {
  const token = request.cookies.get("access_token")?.value;
  if (!token || isAccessTokenUnusable(token)) return undefined;
  return token;
}

function redirectHomeToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/", request.url));
  if (request.cookies.has("access_token")) {
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  }
  return response;
}

export function proxy(request: NextRequest) {
  const token = usableAccessToken(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/home") && !token) {
    return redirectHomeToLogin(request);
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
