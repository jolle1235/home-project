import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SESSION_MAX_AGE,
  classifyPath,
  codeMatches,
  createSessionValue,
  isConfigured,
  safeNextPath,
  verifySession,
} from "./session";

const CODE = "husstand-kode-1234";
const SECRET = "s".repeat(40);
const NOW = 1_800_000_000_000;

// undefined removes the variable, so "missing" really is missing.
function configure(code: string | undefined, secret: string | undefined) {
  vi.stubEnv("HOUSEHOLD_CODE", code);
  vi.stubEnv("AUTH_SECRET", secret);
}
const configureValid = () => configure(CODE, SECRET);

afterEach(() => vi.unstubAllEnvs());

describe("isConfigured", () => {
  it("needs a code of at least 12 and a secret of at least 32 characters", () => {
    configureValid();
    expect(isConfigured()).toBe(true);
    configure("a".repeat(12), "b".repeat(32));
    expect(isConfigured()).toBe(true);
  });

  it.each([
    ["code missing", undefined, SECRET],
    ["code empty", "", SECRET],
    ["code too short", "a".repeat(11), SECRET],
    ["secret missing", CODE, undefined],
    ["secret empty", CODE, ""],
    ["secret too short", CODE, "b".repeat(31)],
  ])("is false when the %s", (_, code, secret) => {
    configure(code, secret);
    expect(isConfigured()).toBe(false);
  });
});

describe("codeMatches", () => {
  it("accepts only the configured code", () => {
    configureValid();
    expect(codeMatches(CODE)).toBe(true);
    expect(codeMatches("husstand-kode-1235")).toBe(false);
    expect(codeMatches("kort")).toBe(false);
    expect(codeMatches("")).toBe(false);
  });

  it("accepts nothing when the code is not configured", () => {
    configure("", SECRET);
    expect(codeMatches("")).toBe(false);
  });
});

describe("session value", () => {
  it("is valid until it expires after a year", () => {
    configureValid();
    const value = createSessionValue(NOW);
    expect(verifySession(value, NOW)).toBe(true);
    expect(verifySession(value, NOW + (SESSION_MAX_AGE - 60) * 1000)).toBe(true);
    expect(verifySession(value, NOW + (SESSION_MAX_AGE + 60) * 1000)).toBe(false);
  });

  it("rejects a changed expiry or signature", () => {
    configureValid();
    const [expiry, mac] = createSessionValue(NOW).split(".");
    expect(verifySession(`${Number(expiry) + 1000}.${mac}`, NOW)).toBe(false);
    const flipped = (mac[0] === "a" ? "b" : "a") + mac.slice(1);
    expect(verifySession(`${expiry}.${flipped}`, NOW)).toBe(false);
  });

  it("is invalid once the household code or the secret changes", () => {
    configureValid();
    const value = createSessionValue(NOW);
    configure("en-anden-kode-5678", SECRET);
    expect(verifySession(value, NOW)).toBe(false);
    configure(CODE, "t".repeat(40));
    expect(verifySession(value, NOW)).toBe(false);
  });

  it.each([undefined, "", "abc", "123", "abc.def", "123.short", `${Math.floor(NOW / 1000) + 99}.${"z".repeat(64)}`])(
    "rejects the malformed value %j without throwing",
    (value) => {
      configureValid();
      expect(verifySession(value, NOW)).toBe(false);
    },
  );

  it("rejects everything when not configured, including a cookie forged with an empty secret", () => {
    configureValid();
    const valid = createSessionValue(NOW);
    const expiry = Math.floor(NOW / 1000) + 3600;
    const emptyHash = crypto.createHash("sha256").update("").digest("hex");
    const forged = `${expiry}.${crypto.createHmac("sha256", "").update(`${expiry}.${emptyHash}`).digest("hex")}`;

    for (const [code, secret] of [
      [undefined, undefined],
      ["", ""],
      [CODE, ""],
      ["", SECRET],
      ["kort", SECRET],
      [CODE, "kort"],
    ] as const) {
      configure(code, secret);
      expect(verifySession(forged, NOW)).toBe(false);
      expect(verifySession(valid, NOW)).toBe(false);
    }
  });
});

describe("classifyPath", () => {
  it.each(["/login", "/api/login"])("lets %s through", (path) => {
    expect(classifyPath(path)).toBe("public");
  });

  it.each(["/api", "/api/recipe", "/api/images/abc", "/api/login/x", "/_next/image", "/_next/data/x"])(
    "answers %s as an API (401)",
    (path) => {
      expect(classifyPath(path)).toBe("api");
    },
  );

  it.each(["/", "/recipes", "/features/recipes", "/LOGIN", "/login/x", "/apis", "/admin"])(
    "answers %s as a page (redirect to /login)",
    (path) => {
      expect(classifyPath(path)).toBe("page");
    },
  );
});

describe("safeNextPath", () => {
  it("keeps a path on this site, with its query", () => {
    expect(safeNextPath("/admin?tab=2")).toBe("/admin?tab=2");
  });

  it.each([
    undefined,
    "",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/.//evil.example", // normalizes to //evil.example, which a browser reads as a host
    "https://evil.example/recipes",
    "javascript:alert(1)",
    "/login",
    "http://[::1",
  ])("sends %j to /recipes", (next) => {
    expect(safeNextPath(next)).toBe("/recipes");
  });
});
