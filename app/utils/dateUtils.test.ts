import { describe, expect, it } from "vitest";
import { toDateKey } from "./dateUtils";

describe("toDateKey", () => {
  it("uses the local calendar day, also at local midnight", () => {
    expect(toDateKey(new Date(2026, 10, 8, 0, 0))).toBe("2026-11-08");
    expect(toDateKey(new Date(2026, 10, 8, 0, 30))).toBe("2026-11-08");
    expect(toDateKey(new Date(2026, 10, 8, 23, 59))).toBe("2026-11-08");
  });

  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
