// Session checks next to the data, the second layer behind proxy.ts. Server-only:
// they read the request's cookies.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { LOGIN_REQUIRED, hasSession } from "./session";

// For server pages that read the database directly.
export async function requireSession(): Promise<void> {
  if (!hasSession(await cookies())) redirect("/login");
}

// For route handlers: refuse without a session, even if the proxy let the request through.
export function withSession<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response,
) {
  return async (...args: Args): Promise<Response> => {
    if (!hasSession(await cookies())) {
      return NextResponse.json(LOGIN_REQUIRED, { status: 401 });
    }
    return handler(...args);
  };
}
