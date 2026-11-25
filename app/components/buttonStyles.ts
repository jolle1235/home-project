// Shared by Button and IconButton: their common base, focus ring and colour variants.
// Call sites never pass a competing size or colour class (Tailwind has no "last class
// wins"); they pick a variant or size prop instead.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";

// The keyboard focus ring of every button-like control (also ToggleChip).
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const BUTTON_BASE = `inline-flex items-center justify-center font-medium transition-all duration-200 active:translate-y-px disabled:cursor-not-allowed ${FOCUS_RING}`;

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-raised",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  ghost: "bg-transparent text-foreground hover:bg-soft",
  danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
  "danger-ghost": "bg-transparent text-danger-ink hover:bg-soft",
};
