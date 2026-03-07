"use client";

import React from "react";
import { Constant } from "../model/Constant";

interface CategoryWheelProps {
  categories: Constant[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

export function CategoryWheelComponent({
  categories,
  selectedCategories,
  onCategoryToggle,
}: CategoryWheelProps) {
  return (
    <div className="w-full">
      <div className="flex gap-2 py-1 px-1 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => onCategoryToggle(category.name)}
            aria-pressed={selectedCategories.includes(category.name)}
            className={`px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              selectedCategories.includes(category.name)
                ? "bg-secondary text-foreground hover:bg-secondary-hover"
                : "bg-soft text-foreground hover:bg-secondary/60"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
