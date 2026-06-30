"use client";
import React, { useCallback, memo } from "react";

interface VisibilityToggleProps {
  booleanValue: boolean;
  setBooleanValue: (value: boolean) => void;
}

function VisibilityToggle({
  booleanValue,
  setBooleanValue,
}: VisibilityToggleProps) {
  const toggleVisibility = useCallback(() => {
    setBooleanValue(!booleanValue);
  }, [booleanValue, setBooleanValue]);

  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-base sm:text-lg font-medium text-foreground">
        {booleanValue ? "Public" : "Private"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={booleanValue}
        aria-label={booleanValue ? "Skift til privat" : "Skift til offentlig"}
        onClick={toggleVisibility}
        className={[
          "relative inline-flex items-center rounded-full transition-colors",
          "min-h-[44px] min-w-[56px] px-1.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          booleanValue ? "bg-emerald-500" : "bg-gray-300",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
            booleanValue ? "translate-x-6" : "translate-x-0",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default memo(VisibilityToggle);
