// Inviting someone to the household: the text to send and how it leaves the phone.

export const inviteText = (origin: string, code: string) =>
  `Log ind på Home Project: ${origin}/login – husstandskoden er: ${code}`;

// The parts of `navigator` this needs, so tests can pass a fake.
type Sharer = {
  share?: (data: ShareData) => Promise<void>;
  clipboard: { writeText: (text: string) => Promise<void> };
};

type ShareResult = "shared" | "copied" | "cancelled";

const isCancel = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

// The share sheet where there is one, otherwise the clipboard. Call it straight from
// the tap: iOS only opens the share sheet while the user gesture is still active, so
// nothing may be awaited before `share`. Only a cancel stops here; any other refusal
// (e.g. NotAllowedError) falls back to copying. Throws when copying fails too.
export async function shareInvite(text: string, nav: Sharer): Promise<ShareResult> {
  if (nav.share) {
    try {
      await nav.share({ text });
      return "shared";
    } catch (error) {
      if (isCancel(error)) return "cancelled";
    }
  }
  await nav.clipboard.writeText(text);
  return "copied";
}
