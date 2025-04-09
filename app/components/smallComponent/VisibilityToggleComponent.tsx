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
    <div className="flex items-center space-x-3">
      <span className="text-lg font-medium">
        {booleanValue ? "Public" : "Private"}
      </span>
      <button
        onClick={toggleVisibility}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
          booleanValue ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            booleanValue ? "translate-x-6" : "translate-x-1"
          }`}
        ></span>
      </button>
    </div>
  );
}

export default memo(VisibilityToggle);
