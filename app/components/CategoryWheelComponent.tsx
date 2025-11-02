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
      <div className="flex flex-wrap gap-2 py-2 px-4">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryToggle(category.name)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 active:opacity-80 ${
              selectedCategories.includes(category.name)
                ? "bg-action text-darkText hover:bg-actionHover"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
