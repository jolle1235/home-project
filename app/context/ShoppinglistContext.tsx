"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Ingredient } from "../model/Ingredient";

interface ShoppingListContextProps {
  shoppingList: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  addIngredients: (ingredients: Ingredient[]) => void;
  removeIngredient: (ingredientId: string) => void;
  updateIngredientQuantity: (ingredientId: string, quantity: number) => void;
  updateIngredientCenter: (ingredientId: string, center: string) => void;
  updateIngredientPrice: (ingredientId: string, price: number) => void;
  toggleMarkedIngredient: (ingredientId: string) => void;
  clearMarked: () => void;
  clearList: () => void;
  isSomethingMarked: () => boolean;
  sortByCenter: () => void;
}

interface ShoppingListProviderProps {
  children: ReactNode;
}

const ShoppingListContext = createContext<ShoppingListContextProps | undefined>(
  undefined
);

export function ShoppingListProvider({ children }: ShoppingListProviderProps) {
  const [shoppingList, setShoppingList] = useState<Ingredient[]>([]);

  const addIngredient = (ingredient: Ingredient) => {
    setShoppingList((prev) => [...prev, ingredient]);
  };

  const addIngredients = (ingredients: Ingredient[]) => {
    setShoppingList((prev) => [...prev, ...ingredients]);
  };

  const removeIngredient = (ingredientId: string) => {
    setShoppingList((prev) =>
      prev.filter((ingredient) => ingredient._id !== ingredientId)
    );
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    setShoppingList((prev) =>
      prev.map((ingredient) =>
        ingredient._id === ingredientId
          ? { ...ingredient, quantity }
          : ingredient
      )
    );
  };

  const updateIngredientCenter = (ingredientId: string, center: string) => {
    setShoppingList((prev) =>
      prev.map((ingredient) =>
        ingredient._id === ingredientId ? { ...ingredient, center } : ingredient
      )
    );
  };

  const updateIngredientPrice = (ingredientId: string, price: number) => {
    setShoppingList((prev) =>
      prev.map((ingredient) =>
        ingredient._id === ingredientId ? { ...ingredient, price } : ingredient
      )
    );
  };

  const toggleMarkedIngredient = (ingredientId: string) => {
    setShoppingList((prev) =>
      prev.map((ingredient) =>
        ingredient._id === ingredientId
          ? { ...ingredient, marked: !ingredient.marked }
          : ingredient
      )
    );
  };

  const clearMarked = () => {
    setShoppingList((prev) => prev.filter((ingredient) => !ingredient.marked));
  };

  const clearList = () => {
    setShoppingList([]);
  };

  const sortByCenter = () => {
    setShoppingList((prev) =>
      [...prev].sort((a, b) => {
        const centerA = a.center ?? "";
        const centerB = b.center ?? "";

        if (!centerA && !centerB) return 0;
        if (!centerA) return 1;
        if (!centerB) return -1;

        return centerA.localeCompare(centerB, "da", { sensitivity: "base" });
      })
    );
  };

  const isSomethingMarked = () => {
    return shoppingList.some((ingredient) => ingredient.marked);
  };

  return (
    <ShoppingListContext.Provider
      value={{
        shoppingList,
        addIngredient,
        addIngredients,
        removeIngredient,
        updateIngredientQuantity,
        updateIngredientCenter,
        updateIngredientPrice,
        toggleMarkedIngredient,
        clearMarked,
        clearList,
        isSomethingMarked,
        sortByCenter,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingListContext() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error(
      "useShoppingListContext must be used within a ShoppingListProvider"
    );
  }
  return context;
}
