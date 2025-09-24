"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  addCategoryApi,
  removeCategoryApi,
  addUnitApi,
  removeUnitApi,
} from "../utils/constantsApiHelperFunctions";
import { Ingredient } from "../model/Ingredient";

interface ConstantsContextType {
  categories: string[];
  units: string[];
  addCategory: (name: string) => Promise<void>;
  removeCategory: (name: string) => Promise<void>;
  addUnit: (name: string) => Promise<void>;
  removeUnit: (name: string) => Promise<void>;
  checkAndAddUnitType: (ingredients: Ingredient[]) => Promise<string[]>;
  refresh: () => Promise<void>;
}

const ConstantsContext = createContext<ConstantsContextType | undefined>(
  undefined
);

export function ConstantsProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  async function fetchData() {
    const catRes = await fetch("/api/admin/recipeCategories");
    const unitRes = await fetch("/api/admin/unitTypes");
    setCategories(await catRes.json());
    setUnits(await unitRes.json());
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function addCategory(name: string) {
    if (!name) return;
    await addCategoryApi(name);
    await fetchData();
  }

  async function removeCategory(name: string) {
    await removeCategoryApi(name);
    await fetchData();
  }

  async function addUnit(name: string) {
    if (!name) return;
    await addUnitApi(name);
    await fetchData();
  }

  async function removeUnit(name: string) {
    await removeUnitApi(name);
    await fetchData();
  }

  async function checkAndAddUnitType(
    ingredients: Ingredient[]
  ): Promise<string[]> {
    // 1. Fetch current units from DB (as string[])
    const res = await fetch("/api/admin/unitTypes");
    const existingUnits: string[] = await res.json();
    const existingNames = new Set(existingUnits.map((u) => u.toLowerCase()));

    // 2. Collect all distinct units from ingredients
    const ingredientUnits = new Set(
      ingredients
        .map((i) => i.unit?.trim().toLowerCase())
        .filter((u): u is string => !!u) // remove null/undefined/empty
    );

    // 3. Find missing units
    const missingUnits = [...ingredientUnits].filter(
      (u) => !existingNames.has(u)
    );

    // 4. Add missing ones
    for (const unit of missingUnits) {
      await addUnitApi(unit);
      console.log(`Added new unit type: ${unit}`);
    }

    return missingUnits; // return what was added
  }

  return (
    <ConstantsContext.Provider
      value={{
        categories,
        units,
        addCategory,
        removeCategory,
        addUnit,
        removeUnit,
        checkAndAddUnitType,
        refresh: fetchData,
      }}
    >
      {children}
    </ConstantsContext.Provider>
  );
}

export function useConstants() {
  const context = useContext(ConstantsContext);
  if (!context) {
    throw new Error("useConstants must be used within a ConstantsProvider");
  }
  return context;
}
