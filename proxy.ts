// The gate in front of the whole app: no valid household session, no access.
// Pages redirect to /login; APIs and Next's own endpoints answer 401. Route
// handlers and server pages check the session again (app/lib/auth.ts).
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_REQUIRED, classifyPath, hasSession } from "./app/lib/session";

function redirectToLogin(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login, 307);
}

export function proxy(request: NextRequest) {
  const kind = classifyPath(request.nextUrl.pathname);
  if (kind === "public" || hasSession(request.cookies)) return NextResponse.next();
  return kind === "api"
    ? NextResponse.json(LOGIN_REQUIRED, { status: 401 })
    : redirectToLogin(request);
}

// Static files the PWA needs before login never reach the proxy.
export const config = {
  matcher: [
    "/((?!_next/static|_next/webpack-hmr|__nextjs|icon/|manifest\\.json|sw\\.js|sw-register\\.js|workbox-|favicon\\.ico).*)",
  ],
};
