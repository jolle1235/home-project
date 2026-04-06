"use client";

import { useState, useEffect } from "react";
import { IconButton } from "../components/IconButton";
import { X } from "lucide-react";
import { shoppinglistCategories } from "../constant/shoppinglistCategories";

type Props = {
  value?: string;
  onChange: (category: string) => void;
  onClose: () => void;
};

export function CategorySelectorModal({ value, onChange, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(value);

  const categoryNames = Object.keys(shoppinglistCategories);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-background w-full max-w-md rounded-2xl shadow-xl p-6 max-h-[50vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Vælg kategori
          </h2>
          <IconButton
            icon={X}
            variant="ghost"
            size="sm"
            ariaLabel="Luk"
            onClick={onClose}
          />
        </div>

        {/* Category List */}
        <div className="flex flex-col gap-2">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                onChange(cat); // send text to hook/backend
                onClose();
              }}
              className="text-left px-4 py-2 hover:bg-muted/20 rounded transition text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
