"use client";

import { FOCUS_RING } from "./buttonStyles";

interface ToggleChipProps {
  label: string;
  pressed: boolean;
  onClick: () => void;
}

// Rounded on/off filter button, e.g. recipe categories and Mad/Drinks. The pressed one also
// gets a dark inner outline (a shadow, so its size doesn't change), so it differs by more than
// its fill.
export function ToggleChip({ label, pressed, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`hit-area min-h-7 md:min-h-8 px-3 md:px-4 py-1 rounded-full whitespace-nowrap text-control font-medium transition-all duration-150 cursor-pointer ${FOCUS_RING} ${
        pressed
          ? "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-selected"
          : "bg-soft text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
