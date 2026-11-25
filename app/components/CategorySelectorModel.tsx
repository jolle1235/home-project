"use client";

import { useState, useEffect } from "react";
import { IconButton } from "../components/IconButton";
import { X } from "lucide-react";
import { DIALOG_BACKDROP, DIALOG_PANEL } from "./dialogStyles";
import { shoppinglistCategories } from "../features/shoppingList/types/shoppinglistCategories";

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
      className={DIALOG_BACKDROP}
      aria-modal="true"
      role="dialog"
    >
      <div className={`${DIALOG_PANEL} p-6 max-h-dialog overflow-y-auto animate-slide-up`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-section-title text-foreground">
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
              className="hit-area text-left px-4 py-2 rounded transition text-body-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
