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
import {
  saveWeekPlanToDatabase,
  saveTempWeekPlanToDatabase,
} from "../utils/apiHelperFunctions";

interface RecipeContextProps {
  weekPlan: WeekPlan[];
  tempWeekPlan: Recipe[];
  addRecipeToWeekPlan: (date: string, recipe: Recipe) => void;
  removeRecipeFromWeekPlan: (date: string, recipeId: string) => void;
  addRecipeToTempWeekPlan: (recipe: Recipe) => void;
  removeRecipeFromTempWeekPlan: (recipeId: string) => void;
  clearPlan: () => void;
  getDatesForNext4Weeks: () => Date[];
}

const RecipeContext = createContext<RecipeContextProps | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan[]>([]);
  const [tempWeekPlan, setTempWeekPlan] = useState<Recipe[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Fetch weekPlan and tempWeekPlan from the database
    try {
      const weekPlanResponse = await fetch("/api/weekPlan");
      const tempWeekPlanResponse = await fetch("/api/tempWeekPlan");

      if (weekPlanResponse.ok && tempWeekPlanResponse.ok) {
        const weekPlanData = await weekPlanResponse.json();
        const tempWeekPlanData = await tempWeekPlanResponse.json();

        setWeekPlan(weekPlanData);
        setTempWeekPlan(tempWeekPlanData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const addRecipeToWeekPlan = (date: string, recipe: Recipe) => {
    const newWeekPlan = [...weekPlan, { date, recipe }];
    setWeekPlan(newWeekPlan);
    toast.success("Opskrift er nu tilføjet til din madplan");
    saveWeekPlanToDatabase(newWeekPlan);
  };

  const removeRecipeFromWeekPlan = (date: string, recipeId: string) => {
    const newWeekPlan = weekPlan.filter(
      (entry) => entry.date !== date || entry.recipe._id !== recipeId
    );
    setWeekPlan(newWeekPlan);
    toast.success("Opskrift er fjernet fra din madplan");
    saveWeekPlanToDatabase(newWeekPlan);
  };

  const addRecipeToTempWeekPlan = (recipe: Recipe) => {
    const isIdInTempWeekPlan = tempWeekPlan.some(
      (item) => recipe._id === item._id
    );

    if (!isIdInTempWeekPlan) {
      const newTempWeekPlan = [...tempWeekPlan, recipe];
      setTempWeekPlan(newTempWeekPlan);
      toast.success("Opskrift er nu tilføjet til din midlertidige madplan");
      saveTempWeekPlanToDatabase(newTempWeekPlan);
    }
  };

  const removeRecipeFromTempWeekPlan = (recipeId: string) => {
    const newTempWeekPlan = tempWeekPlan.filter(
      (recipe) => recipe._id !== recipeId
    );
    setTempWeekPlan(newTempWeekPlan);
    toast.success("Opskrift er fjernet fra din midlertidige madplan");
    saveTempWeekPlanToDatabase(newTempWeekPlan);
  };

  const clearPlan = () => {
    setWeekPlan([]);
    toast.success("Din madplan er nulstillet");
    saveWeekPlanToDatabase([]);
    saveTempWeekPlanToDatabase([]);
  };

  const getDatesForNext4Weeks = () => {
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
  if (context === undefined) {
    throw new Error("useRecipe must be used within a RecipeProvider");
  }
  return context;
}
