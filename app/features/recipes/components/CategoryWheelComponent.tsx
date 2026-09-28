"use client";

import React from "react";
import { Constant } from "../../../model/Constant";
import { ToggleChip } from "../../../components/ToggleChip";

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
          <ToggleChip
            key={category._id}
            label={category.name}
            pressed={selectedCategories.includes(category.name)}
            onClick={() => onCategoryToggle(category.name)}
          />
        ))}
      </div>
    </div>
  );
}
