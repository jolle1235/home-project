// One look for every dialog: the backdrop and the panel. The backdrop keeps `fixed inset-0`,
// which the calendar's checks select on.
// ConfirmationDialog (a native <dialog>) repeats the backdrop as `backdrop:` classes: a Tailwind
// prefix can't be applied to a constant. Change both together.
export const DIALOG_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm p-4";

export const DIALOG_PANEL = "w-full max-w-md rounded-2xl bg-background shadow-overlay";
