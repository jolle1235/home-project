"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Recipe } from "../model/Recipe";
import { WeekPlan } from "../model/weekPlan";
import { toast } from "react-toastify";
import { saveWeekPlanToDatabase, saveTempWeekPlanToDatabase } from "../utils/apiHelperFunctions";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [localUserId, setLocalUserId] = useState<string>()
  

  useEffect(() => {
    setLocalUserId(session?.user.id)
  }, [session]);

  useEffect(() => {
    if(localUserId){
      loadData(localUserId);
    }
  }, [localUserId])

  const loadData = async (userId: string) => {
    // Fetch weekPlan and tempWeekPlan from the database
    try {
      const response = await fetch(`/api/user?userId=${userId}`);
      const data = await response.json();

      if (data.weekPlan) setWeekPlan(data.weekPlan);
      if (data.tempWeekPlan) setTempWeekPlan(data.tempWeekPlan);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const addRecipeToWeekPlan = (date: string, recipe: Recipe) => {

    if(localUserId){

      const newWeekPlan = [...weekPlan, { date, recipe }];
      setWeekPlan(newWeekPlan);
      toast.success("Opskrift er nu tilføjet til din madplan");

      saveWeekPlanToDatabase(localUserId, newWeekPlan);
    }
  };

  const removeRecipeFromWeekPlan = (date: string, recipeId: number) => {


    if(localUserId){
      const newWeekPlan = weekPlan.filter((entry) => entry.date !== date || entry.recipe._id !== recipeId);
      setWeekPlan(newWeekPlan);
      toast.success("Opskrift er fjernet fra din madplan");

      saveWeekPlanToDatabase(localUserId, newWeekPlan);
    }
  };

  const addRecipeToTempWeekPlan = (recipe: Recipe) => {
    const isIdInTempWeekPlan = tempWeekPlan.some((item) => {recipe._id === item._id})

    if(localUserId && !isIdInTempWeekPlan){

      const newTempWeekPlan = [...tempWeekPlan, recipe];
      setTempWeekPlan(newTempWeekPlan);
      toast.success("Opskrift er nu tilføjet til din midlertidige madplan");
      
      saveTempWeekPlanToDatabase(localUserId, newTempWeekPlan);
    }
  };

  const removeRecipeFromTempWeekPlan = (recipeId: number) => {
    if(localUserId){

      const newTempWeekPlan = tempWeekPlan.filter((r) => r._id !== recipeId);
      setTempWeekPlan(newTempWeekPlan);
      toast.success("Opskrift er fjerne fra din midlertidige madplan");
      
      saveTempWeekPlanToDatabase(localUserId, newTempWeekPlan);
    }
  };

  const clearPlan = () => {
    if(localUserId){

      setWeekPlan([]);
      toast.success("Din madplan er nulstillet");
      
      saveWeekPlanToDatabase(localUserId, []);
      saveTempWeekPlanToDatabase(localUserId, []);
    }
  };

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
