"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Ingredient } from "../model/Ingredient";

interface ShoppingListContextProps {
  shoppingList: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: string) => void;
  updateIngredientQuantity: (ingredientId: string, quantity: number) => void;
  toggleMarkedIngredient: (ingredientId: string) => void;
  clearMarked: () => void;
  clearList: () => void;
  isSomethingMarked: () => boolean;
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

  const isSomethingMarked = () => {
    return shoppingList.some((ingredient) => ingredient.marked);
  };

  return (
    <ShoppingListContext.Provider
      value={{
        shoppingList,
        addIngredient,
        removeIngredient,
        updateIngredientQuantity,
        toggleMarkedIngredient,
        clearMarked,
        clearList,
        isSomethingMarked,
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
