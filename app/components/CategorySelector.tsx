"use client";

import { useState } from "react";
import { getCategoryIcon } from "../utils/shoppinglistHelper";
import { CategorySelectorModal } from "./CategorySelectorModel";

type Props = {
  value?: string;
  onChange: (category: string) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const categoryIcon = getCategoryIcon(value);

  return (
    <>
      {/* Button to open modal if no category */}
      <button
        onClick={() => setModalOpen(true)}
        className="text-sm px-2 py-1 rounded-lg bg-background hover:bg-muted/70 text-muted-foreground transition"
      >
        {categoryIcon || "+"}
      </button>

      {/* Modal for selecting category */}
      {modalOpen && (
        <CategorySelectorModal
          value={value}
          onChange={onChange}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
