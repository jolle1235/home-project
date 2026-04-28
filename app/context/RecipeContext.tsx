"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Recipe } from "../model/Recipe";
import { WeekPlan } from "../model/weekPlan";
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

const RecipeContext = createContext<RecipeContextProps | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/weekPlan");

      if (response.ok) {
        const data = await response.json();
        setWeekPlan(data);
      }
    } catch (error) {
      console.error("Error loading week plan:", error);
    }
  };

  const refreshWeekPlan = async () => {
    await loadData();
  };

  const save = async (newPlan: WeekPlan[]) => {
    setWeekPlan(newPlan);

    try {
      await saveWeekPlanToDatabase(newPlan);
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke gemme madplan");
    }
  };

  const addRecipesToWeekPlan = (dates: string[], recipe: Recipe) => {
    setWeekPlan((prev) => {
      const newEntries: WeekPlan[] = dates.map((date) => ({
        date,
        recipeId: recipe._id,
        recipeName: recipe.recipeName,
      }));

      const combined = [...prev];

      newEntries.forEach((entry) => {
        const exists = combined.some(
          (e) => e.date === entry.date && e.recipeId === entry.recipeId
        );

        if (!exists) {
          combined.push(entry);
        }
      });

      saveWeekPlanToDatabase(combined);

      return combined;
    });

    toast.success(
      `Opskrift tilføjet til ${dates.length} ${
        dates.length === 1 ? "dato" : "datoer"
      }`
    );
  };

  const removeRecipeFromWeekPlan = (date: string, recipeId: string) => {
    const newWeekPlan = weekPlan.filter(
      (entry) => !(entry.date === date && entry.recipeId === recipeId)
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
