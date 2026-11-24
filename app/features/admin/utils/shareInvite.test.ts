import { describe, expect, it, vi } from "vitest";
import { inviteText, shareInvite } from "./shareInvite";

const TEXT = inviteText("https://app.example", "kode-123456789");

function fakeNavigator(share?: (data: ShareData) => Promise<void>, write?: (text: string) => Promise<void>) {
  return {
    share: share && vi.fn(share),
    clipboard: { writeText: vi.fn(write ?? (() => Promise.resolve())) },
  };
}

describe("inviteText", () => {
  it("links to the login page and gives the code", () => {
    expect(TEXT).toBe(
      "Log ind på Home Project: https://app.example/login – husstandskoden er: kode-123456789",
    );
  });
});

describe("shareInvite", () => {
  it("uses the share sheet when there is one, and copies nothing", async () => {
    const nav = fakeNavigator(() => Promise.resolve());
    await expect(shareInvite(TEXT, nav)).resolves.toBe("shared");
    expect(nav.share).toHaveBeenCalledWith({ text: TEXT });
    expect(nav.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("copies the text when there is no share sheet", async () => {
    const nav = fakeNavigator();
    await expect(shareInvite(TEXT, nav)).resolves.toBe("copied");
    expect(nav.clipboard.writeText).toHaveBeenCalledWith(TEXT);
  });

  it("does nothing more when the user cancels the share sheet", async () => {
    const nav = fakeNavigator(() => Promise.reject(new DOMException("cancelled", "AbortError")));
    await expect(shareInvite(TEXT, nav)).resolves.toBe("cancelled");
    expect(nav.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("copies the text when the share sheet refuses (e.g. iOS NotAllowedError)", async () => {
    const nav = fakeNavigator(() => Promise.reject(new DOMException("no gesture", "NotAllowedError")));
    await expect(shareInvite(TEXT, nav)).resolves.toBe("copied");
    expect(nav.clipboard.writeText).toHaveBeenCalledWith(TEXT);
  });

  it("fails when neither sharing nor copying works", async () => {
    const nav = fakeNavigator(undefined, () => Promise.reject(new Error("blocked")));
    await expect(shareInvite(TEXT, nav)).rejects.toThrow("blocked");
  });
});
