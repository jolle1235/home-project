"use client";

interface ToggleChipProps {
  label: string;
  pressed: boolean;
  onClick: () => void;
}

// Rounded on/off filter button, e.g. recipe categories and Mad/Drinks.
export function ToggleChip({ label, pressed, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        pressed
          ? "bg-secondary text-foreground hover:bg-secondary-hover"
          : "bg-soft text-foreground hover:bg-secondary/60"
      }`}
    >
      {label}
    </button>
  );
}
