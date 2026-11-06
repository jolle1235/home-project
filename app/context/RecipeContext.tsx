"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Recipe } from "../features/recipes/types/Recipe";
import { WeekPlan } from "../features/weekplanner/types/weekPlan";
import { toast } from "react-toastify";
import { saveWeekPlanToDatabase } from "../utils/apiHelperFunctions";

interface RecipeContextProps {
  weekPlan: WeekPlan[];
  addRecipesToWeekPlan: (dates: string[], recipe: Recipe) => void;
  removeRecipeFromWeekPlan: (date: string, recipeId: string) => void;
  clearPlan: () => void;
  getDatesForNext4Weeks: () => Date[];
  refreshWeekPlan: () => Promise<void>;
}

const WEEK_PLAN_QUERY_KEY = ["weekPlan"];

async function fetchWeekPlan(): Promise<WeekPlan[]> {
  const response = await fetch("/api/weekPlan");
  if (!response.ok) throw new Error("Failed to fetch week plan");
  return response.json();
}

const RecipeContext = createContext<RecipeContextProps | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: weekPlan = [], refetch } = useQuery({
    queryKey: WEEK_PLAN_QUERY_KEY,
    queryFn: fetchWeekPlan,
  });

  const refreshWeekPlan = async () => {
    await refetch();
  };

  const save = async (newPlan: WeekPlan[]) => {
    queryClient.setQueryData(WEEK_PLAN_QUERY_KEY, newPlan);

    try {
      await saveWeekPlanToDatabase(newPlan);
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke gemme madplan");
    }
  };

  const addRecipesToWeekPlan = (dates: string[], recipe: Recipe) => {
    const combined = [...weekPlan];
    for (const date of dates) {
      const exists = combined.some(
        (e) => e.date === date && e.recipeId === recipe._id,
      );
      if (!exists) {
        combined.push({
          date,
          recipeId: recipe._id,
          recipeName: recipe.recipeName,
        });
      }
    }
    save(combined);

    toast.success(
      `Opskrift tilføjet til ${dates.length} ${
        dates.length === 1 ? "dato" : "datoer"
      }`,
    );
  };

  const removeRecipeFromWeekPlan = (date: string, recipeId: string) => {
    const newWeekPlan = weekPlan.filter(
      (entry) => !(entry.date === date && entry.recipeId === recipeId),
    );

    save(newWeekPlan);

    toast.success("Opskrift fjernet fra madplan");
  };

  const clearPlan = () => {
    save([]);
    toast.success("Madplan nulstillet");
  };

  const getDatesForNext4Weeks = () => {
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }

    return dates;
  };

  return (
    <RecipeContext.Provider
      value={{
        weekPlan,
        addRecipesToWeekPlan,
        removeRecipeFromWeekPlan,
        clearPlan,
        getDatesForNext4Weeks,
        refreshWeekPlan,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipeContext() {
  const context = useContext(RecipeContext);

  if (!context) {
    throw new Error("useRecipeContext must be used within RecipeProvider");
  }

  return context;
}
