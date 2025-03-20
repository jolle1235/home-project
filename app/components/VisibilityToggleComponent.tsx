import React from "react";

interface VisibilityToggleProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

export default function VisibilityToggle({ isPublic, setIsPublic }: VisibilityToggleProps) {
  const toggleVisibility = () => {
    setIsPublic(!isPublic);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-lg font-medium">
        {isPublic ? "Public" : "Private"}
      </span>
      <button
        onClick={toggleVisibility}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
          isPublic ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            isPublic ? "translate-x-6" : "translate-x-1"
          }`}
        ></span>
      </button>
    </div>
  );
}
