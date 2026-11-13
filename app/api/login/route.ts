import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  codeMatches,
  createSessionValue,
  isConfigured,
  safeNextPath,
} from "@/app/lib/session";

// Slows down guessing; the code length (at least 12) is the real defence.
const WRONG_CODE_DELAY_MS = 1000;

// Relative, so the browser stays on the host it used (Next can report another one,
// e.g. localhost for 127.0.0.1); safeNextPath guarantees a single leading slash.
const seeOther = (location: string) => new NextResponse(null, { status: 303, headers: { Location: location } });

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

// The login form posts here. Not behind withSession: this is where a session starts.
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Husstandskoden er ikke sat op" }, { status: 503 });
  }
  const form = await request.formData();
  const next = safeNextPath(field(form, "next"));

  if (!codeMatches(field(form, "code"))) {
    await new Promise((resolve) => setTimeout(resolve, WRONG_CODE_DELAY_MS));
    return seeOther(`/login?${new URLSearchParams({ error: "1", next })}`);
  }

  const response = seeOther(next);
  response.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
