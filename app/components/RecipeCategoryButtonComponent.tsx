import React, { ReactNode } from "react";

type RecipeCategoryButtonProps = {
  children: ReactNode;
  onClick: (category: string) => void;
  category: string;
  isSelected: boolean;
};

export const RecipeCategoryButtonComponent: React.FC<RecipeCategoryButtonProps> = ({
  children,
  onClick,
  category,
  isSelected,
}) => {
  return (
    <button
      className={`font-bold rounded-full px-3 py-2 text-darkText ${
        isSelected ? "bg-action" : "bg-secondary"
      }`}
      onClick={() => onClick(category)}
    >
      {children}
    </button>
  );
};
