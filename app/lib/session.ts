// The household-code session: one shared code, a signed cookie, no session store.
// Pure (no Next imports) so the proxy and unit tests can use it; the request-bound
// helpers live in ./auth.ts.
import crypto from "node:crypto";

export const SESSION_COOKIE = "hp_session";
// The 401 body both layers answer with (proxy.ts and withSession).
export const LOGIN_REQUIRED = { error: "Login påkrævet" };
export const SESSION_MAX_AGE = 365 * 24 * 60 * 60; // seconds

const MIN_CODE_LENGTH = 12;
const MIN_SECRET_LENGTH = 32;
const PUBLIC_PATHS = new Set(["/login", "/api/login"]);

// Read on every call, never at module load, so a changed or missing env var takes
// effect immediately and is never replaced by an empty fallback.
function config() {
  const code = process.env.HOUSEHOLD_CODE ?? "";
  const secret = process.env.AUTH_SECRET ?? "";
  const ok = code.length >= MIN_CODE_LENGTH && secret.length >= MIN_SECRET_LENGTH;
  return ok ? { code, secret } : null;
}

export function isConfigured(): boolean {
  return config() !== null;
}

const sha256 = (text: string) => crypto.createHash("sha256").update(text).digest();

// Compares hashes, so both sides have the same length and the time taken
// doesn't depend on how much of the code was right.
export function codeMatches(input: string): boolean {
  const settings = config();
  return settings !== null && crypto.timingSafeEqual(sha256(input), sha256(settings.code));
}

// The signature covers the expiry and a hash of the code, so changing the code
// invalidates every existing cookie.
function sign(expiry: string, settings: { code: string; secret: string }): string {
  const codeHash = sha256(settings.code).toString("hex");
  return crypto.createHmac("sha256", settings.secret).update(`${expiry}.${codeHash}`).digest("hex");
}

export function createSessionValue(now = Date.now()): string {
  const settings = config();
  if (!settings) throw new Error("Household code is not configured");
  const expiry = String(Math.floor(now / 1000) + SESSION_MAX_AGE);
  return `${expiry}.${sign(expiry, settings)}`;
}

const SESSION_FORMAT = /^(\d{1,12})\.([0-9a-f]{64})$/;

// The session check for any cookie store: the proxy's `request.cookies` and
// next/headers' `cookies()` both have this shape.
type CookieReader = { get(name: string): { value: string } | undefined };

export function hasSession(cookies: CookieReader): boolean {
  return verifySession(cookies.get(SESSION_COOKIE)?.value);
}

export function verifySession(value: string | undefined, now = Date.now()): boolean {
  const settings = config();
  const match = SESSION_FORMAT.exec(value ?? "");
  if (!settings || !match) return false;
  const [, expiry, mac] = match;
  const expected = sign(expiry, settings);
  return Number(expiry) * 1000 > now && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
}

// How the proxy treats a path: let it through, answer 401 (APIs and Next's own
// endpoints, which can't follow a redirect to a page), or redirect to /login.
export function classifyPath(pathname: string): "public" | "api" | "page" {
  if (PUBLIC_PATHS.has(pathname)) return "public";
  if (/^\/(api|_next)(\/|$)/.test(pathname)) return "api";
  return "page";
}

// Where to go after logging in, as a path for a relative Location. Only a path on
// this site counts; anything else (other hosts, `//`, `/\`, tabs the URL parser
// strips, schemes) goes to /recipes. A path that normalizes to `//host` (e.g.
// `/.//host`) is refused too: a browser would read it as another host.
// Parsed against a fixed base: only a relative path keeps that origin.
const NEXT_BASE = new URL("http://site.invalid");

export function safeNextPath(next: string | undefined): string {
  const fallback = "/recipes";
  try {
    const url = new URL(next || fallback, NEXT_BASE);
    const onSite = url.origin === NEXT_BASE.origin && !url.pathname.startsWith("//");
    return onSite && url.pathname !== "/login" ? url.pathname + url.search : fallback;
  } catch {
    return fallback;
  }
}
