"use client";
import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addCategoryApi,
  removeCategoryApi,
  addUnitApi,
  removeUnitApi,
  CATEGORIES_API,
  UNITS_API,
} from "../utils/constantsApiHelperFunctions";
import { Ingredient } from "../model/Ingredient";
import { Constant } from "../model/Constant";
import { toast } from "react-toastify";

interface ConstantsContextType {
  categories: Constant[];
  units: Constant[];
  // Unit names, for pickers and the ingredient parser.
  unitNames: string[];
  addCategory: (name: string) => Promise<void>;
  removeCategory: (name: string) => Promise<void>;
  addUnit: (name: string) => Promise<void>;
  removeUnit: (name: string) => Promise<void>;
  checkAndAddUnitType: (ingredients: Ingredient[]) => Promise<string[]>;
  refresh: () => Promise<void>;
}

const ConstantsContext = createContext<ConstantsContextType | undefined>(
  undefined,
);

async function fetchConstants(): Promise<{
  categories: Constant[];
  units: Constant[];
}> {
  const [catRes, unitRes] = await Promise.all([
    fetch(CATEGORIES_API),
    fetch(UNITS_API),
  ]);
  if (!catRes.ok || !unitRes.ok) throw new Error("Failed to fetch constants");
  return { categories: await catRes.json(), units: await unitRes.json() };
}

export function ConstantsProvider({ children }: { children: ReactNode }) {
  const { data, refetch } = useQuery({
    queryKey: ["constants"],
    queryFn: fetchConstants,
  });
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const units = useMemo(() => data?.units ?? [], [data]);
  const unitNames = useMemo(() => units.map((u) => u.name), [units]);

  async function fetchData() {
    await refetch();
  }

  // Tells the user when the server refuses, and always shows what is stored afterwards.
  async function runThenRefresh(
    action: () => Promise<void>,
    errorText: string,
  ) {
    try {
      await action();
    } catch {
      toast.error(errorText);
    }
    await fetchData();
  }

  async function addCategory(name: string) {
    if (name)
      await runThenRefresh(
        () => addCategoryApi(name),
        "Kunne ikke tilføje kategorien",
      );
  }

  async function removeCategory(name: string) {
    await runThenRefresh(
      () => removeCategoryApi(name),
      "Kunne ikke slette kategorien",
    );
  }

  async function addUnit(name: string) {
    if (name)
      await runThenRefresh(
        () => addUnitApi(name),
        "Kunne ikke tilføje enheden",
      );
  }

  async function removeUnit(name: string) {
    await runThenRefresh(
      () => removeUnitApi(name),
      "Kunne ikke slette enheden",
    );
  }

  async function checkAndAddUnitType(
    ingredients: Ingredient[],
  ): Promise<string[]> {
    try {
      // 1. Fetch current units from DB (as Constant[])
      const res = await fetch(UNITS_API);
      if (!res.ok) {
        console.error(
          "Failed to fetch unit types:",
          res.status,
          res.statusText,
        );
        // Don't throw - allow recipe submission to continue even if unit sync fails
        return [];
      }
      const existingUnits: Constant[] = await res.json();

      const existingNames = new Set(
        existingUnits.map((u) => u.name.toLowerCase()),
      );

      // 2. Collect all distinct units from ingredients
      const ingredientUnits = new Set(
        ingredients
          .map((i) => i.unit?.trim().toLowerCase())
          .filter((u): u is string => !!u),
      );

      // 3. Find missing units
      const missingUnits = [...ingredientUnits].filter(
        (u) => !existingNames.has(u),
      );

      // 4. Add missing ones
      const addedUnits: string[] = [];
      for (const unit of missingUnits) {
        try {
          await addUnitApi(unit);
          addedUnits.push(unit);
        } catch (error) {
          console.error(`Error adding unit type ${unit}:`, error);
          // Continue with other units even if one fails
        }
      }

      return addedUnits;
    } catch (error) {
      console.error("Error in checkAndAddUnitType:", error);
      // Don't throw - allow recipe submission to continue even if unit sync fails
      return [];
    }
  }

  return (
    <ConstantsContext.Provider
      value={{
        categories,
        units,
        unitNames,
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
