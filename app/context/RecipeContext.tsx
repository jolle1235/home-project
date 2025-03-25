"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Recipe } from "../model/Recipe";
import { WeekPlan } from "../model/weekPlan";

interface RecipeContextProps {
  weekPlan: WeekPlan[];
  tempWeekPlan: Recipe[];
  addRecipeToWeekPlan: (date: string, recipe: Recipe) => void;
  removeRecipeFromWeekPlan: (date: string, recipeId: number) => void;
  addRecipeToTempWeekPlan: (recipe: Recipe) => void;
  removeRecipeFromTempWeekPlan: (recipeId: number) => void;
  clearPlan: () => void;
  getDatesForNext4Weeks: () => Date[];
}

interface RecipeProviderProps {
  children: ReactNode;
}

export const RecipeContext = createContext<RecipeContextProps | undefined>(undefined);

export function RecipeProvider({ children }: RecipeProviderProps) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan[]>([]);
  const [tempWeekPlan, setTempWeekPlan] = useState<Recipe[]>([]);

  const addRecipeToWeekPlan = (date: string, recipe: Recipe) => {
    setWeekPlan((prev) => [...prev, { date, recipe }]);
  };

  const removeRecipeFromWeekPlan = (date: string, recipeId: number) => {
    setWeekPlan((prev) => prev.filter((entry) => entry.date !== date || entry.recipe._id !== recipeId));
  };

  const addRecipeToTempWeekPlan = (recipe: Recipe) => {
    setTempWeekPlan((prev) => [...prev, recipe]);
  };

  const removeRecipeFromTempWeekPlan = (recipeId: number) => {
    setTempWeekPlan((prev) => prev.filter((r) => r._id !== recipeId));
  };

  const clearPlan = () => setWeekPlan([]);

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

  return (
    <RecipeContext.Provider
      value={{
        weekPlan,
        tempWeekPlan,
        addRecipeToWeekPlan,
        removeRecipeFromWeekPlan,
        addRecipeToTempWeekPlan,
        removeRecipeFromTempWeekPlan,
        clearPlan,
        getDatesForNext4Weeks,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipeContext() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipeContext must be used within a RecipeProvider");
  }
  return context;
}