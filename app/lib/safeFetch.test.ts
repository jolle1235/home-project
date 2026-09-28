import { describe, expect, it } from "vitest";
import { isPrivateAddress, safeFetch } from "./safeFetch";

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "::",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ])("blocks %s", (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });

  it.each(["93.184.216.34", "172.32.0.1", "8.8.8.8", "2606:4700::1111"])(
    "allows %s",
    (ip) => {
      expect(isPrivateAddress(ip)).toBe(false);
    },
  );
});

describe("safeFetch", () => {
  it.each([
    "http://localhost:3000/",
    "http://127.0.0.1/",
    "http://[::1]/",
    "http://192.168.1.1/admin",
  ])("refuses %s without fetching", async (url) => {
    await expect(safeFetch(url, { accept: "*/*" })).rejects.toMatchObject({
      code: "blocked",
    });
  });

  it("refuses non-http protocols", async () => {
    await expect(
      safeFetch("file:///etc/passwd", { accept: "*/*" }),
    ).rejects.toMatchObject({ code: "invalid_url" });
  });
});
