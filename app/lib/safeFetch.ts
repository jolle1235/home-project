import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Server-side fetch for user-supplied URLs (recipe import, image copy).
// Blocks internal addresses so the server can't be used to reach localhost
// or the private network, and caps time and size.

export type SafeFetchErrorCode =
  | "invalid_url"
  | "blocked"
  | "http"
  | "not_found"
  | "forbidden"
  | "too_large"
  | "timeout"
  | "network";

export class SafeFetchError extends Error {
  constructor(
    public code: SafeFetchErrorCode,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

interface SafeFetchOptions {
  accept: string;
  maxBytes?: number;
  timeoutMs?: number;
}

interface SafeFetchResult {
  body: Buffer;
  contentType: string;
  finalUrl: string;
}

const MAX_REDIRECTS = 5;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Accept-Language": "da,en;q=0.8",
};

function httpErrorCode(status: number): SafeFetchErrorCode {
  if (status === 404 || status === 410) return "not_found";
  // 402 is what some publishers (e.g. Dotdash Meredith) send to bots.
  if ([401, 402, 403, 429].includes(status)) return "forbidden";
  return "http";
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

export function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIPv4(mapped[1]);
    return (
      lower === "::" ||
      lower === "::1" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      /^fe[89ab]/.test(lower)
    );
  }
  return true;
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeFetchError("invalid_url", "Only http(s) URLs are allowed");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new SafeFetchError("blocked", "Internal address");
  }
  let addresses: string[];
  try {
    addresses = isIP(host)
      ? [host]
      : (await lookup(host, { all: true })).map((a) => a.address);
  } catch {
    throw new SafeFetchError("network", "Could not resolve host");
  }
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new SafeFetchError("blocked", "Internal address");
  }
}

async function readLimited(res: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(res.headers.get("content-length"));
  if (declared && declared > maxBytes) {
    throw new SafeFetchError("too_large", "Response too large");
  }
  if (!res.body) return Buffer.alloc(0);

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new SafeFetchError("too_large", "Response too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function safeFetch(
  rawUrl: string,
  { accept, maxBytes = 5 * 1024 * 1024, timeoutMs = 10_000 }: SafeFetchOptions,
): Promise<SafeFetchResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SafeFetchError("invalid_url", "Invalid URL");
  }

  const signal = AbortSignal.timeout(timeoutMs);

  try {
    // Follow redirects by hand so every hop is checked.
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicUrl(url);
      const res = await fetch(url, {
        headers: { ...BROWSER_HEADERS, Accept: accept },
        redirect: "manual",
        signal,
      });

      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        url = new URL(location, url);
        continue;
      }
      if (!res.ok) {
        throw new SafeFetchError(
          httpErrorCode(res.status),
          `HTTP ${res.status}`,
          res.status,
        );
      }

      return {
        body: await readLimited(res, maxBytes),
        contentType: res.headers.get("content-type") ?? "",
        finalUrl: url.toString(),
      };
    }
    throw new SafeFetchError("http", "Too many redirects");
  } catch (err) {
    if (err instanceof SafeFetchError) throw err;
    if (signal.aborted) throw new SafeFetchError("timeout", "Timed out");
    throw new SafeFetchError("network", "Could not fetch URL");
  }
}
