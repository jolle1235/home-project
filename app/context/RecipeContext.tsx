"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Recipe } from "../model/Recipe";
import { WeekPlan } from "../model/weekPlan";

interface RecipeContextProps {
  weekPlan: WeekPlan;
  addRecipe: (date: string, recipe: Recipe) => void;
  removeRecipe: (date: string, recipeId: number) => void;
  clearPlan: () => void;
  getDatesForNext4Weeks: () => Date[];
}

interface RecipeProviderProps {
  children: ReactNode;
}

// 1) Create the actual context
export const RecipeContext = createContext<RecipeContextProps | undefined>(undefined);

// 2) Create the provider component
export function RecipeProvider({ children }: RecipeProviderProps) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});

  const addRecipe = (date: string, recipe: Recipe) => {
    setWeekPlan((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), recipe],
    }));
  };

  const removeRecipe = (date: string, recipeId: number) => {
    // Adjust if your `Recipe` interface uses a different unique property than `_id`
    setWeekPlan((prev) => ({
      ...prev,
      [date]: (prev[date] || []).filter((r) => r._id !== recipeId),
    }));
  };

  const clearPlan = () => setWeekPlan({});

  const getDatesForNext4Weeks = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 3) Return the Provider with a proper `value` prop
  return (
    <RecipeContext.Provider
      value={{
        weekPlan,
        addRecipe,
        removeRecipe,
        clearPlan,
        getDatesForNext4Weeks,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

// 4) Export a custom hook to consume this context
export function useRecipeContext() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipeContext must be used within a RecipeProvider");
  }
  return context;
}
