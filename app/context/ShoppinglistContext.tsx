"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Ingredient } from "../model/Ingredient";

interface ShoppingListContextProps {
  shoppingList: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  addIngredients: (ingredients: Ingredient[]) => void;
  removeIngredient: (ingredientId: string) => void;
  updateIngredientQuantity: (ingredientId: string, quantity: number) => void;
  updateIngredientCenter: (ingredientId: string, center: string) => void;
  updateIngredientPrice: (ingredientId: string, price: number) => void;
  updateIngredientNotes: (ingredientId: string, notes: string) => void;
  toggleMarkedIngredient: (ingredientId: string) => void;
  clearMarked: () => void;
  clearList: () => void;
  isSomethingMarked: () => boolean;
  sortByCenter: () => void;
}

interface ShoppingListProviderProps {
  children: ReactNode;
}

type Action =
  | { type: "ADD_INGREDIENT"; payload: Ingredient }
  | { type: "ADD_INGREDIENTS"; payload: Ingredient[] }
  | { type: "REMOVE_INGREDIENT"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_CENTER"; payload: { id: string; center: string } }
  | { type: "UPDATE_PRICE"; payload: { id: string; price: number } }
  | { type: "UPDATE_NOTES"; payload: { id: string; notes: string } }
  | { type: "TOGGLE_MARKED"; payload: string }
  | { type: "CLEAR_MARKED" }
  | { type: "CLEAR_LIST" }
  | { type: "SORT_BY_CENTER" };

const ShoppingListContext = createContext<ShoppingListContextProps | undefined>(
  undefined
);

function shoppingListReducer(
  state: Ingredient[],
  action: Action
): Ingredient[] {
  switch (action.type) {
    case "ADD_INGREDIENT":
      return [...state, action.payload];

    case "ADD_INGREDIENTS":
      return [...state, ...action.payload];

    case "REMOVE_INGREDIENT":
      return state.filter((ingredient) => ingredient._id !== action.payload);

    case "UPDATE_QUANTITY":
      return state.map((ingredient) =>
        ingredient._id === action.payload.id
          ? { ...ingredient, quantity: action.payload.quantity }
          : ingredient
      );

    case "UPDATE_CENTER":
      return state.map((ingredient) =>
        ingredient._id === action.payload.id
          ? { ...ingredient, center: action.payload.center }
          : ingredient
      );

    case "UPDATE_PRICE":
      return state.map((ingredient) =>
        ingredient._id === action.payload.id
          ? { ...ingredient, price: action.payload.price }
          : ingredient
      );

    case "UPDATE_NOTES":
      return state.map((ingredient) =>
        ingredient._id === action.payload.id
          ? { ...ingredient, notes: action.payload.notes }
          : ingredient
      );

    case "TOGGLE_MARKED":
      return state.map((ingredient) =>
        ingredient._id === action.payload
          ? { ...ingredient, marked: !ingredient.marked }
          : ingredient
      );

    case "CLEAR_MARKED":
      return state.filter((ingredient) => !ingredient.marked);

    case "CLEAR_LIST":
      return [];

    case "SORT_BY_CENTER":
      return [...state].sort((a, b) => {
        const centerA = a.center ?? "";
        const centerB = b.center ?? "";

        if (!centerA && !centerB) return 0;
        if (!centerA) return 1;
        if (!centerB) return -1;

        return centerA.localeCompare(centerB, "da", { sensitivity: "base" });
      });

    default:
      return state;
  }
}

export function ShoppingListProvider({ children }: ShoppingListProviderProps) {
  const [shoppingList, dispatch] = useReducer(shoppingListReducer, []);

  const addIngredient = (ingredient: Ingredient) => {
    dispatch({ type: "ADD_INGREDIENT", payload: ingredient });
  };

  const addIngredients = (ingredients: Ingredient[]) => {
    dispatch({ type: "ADD_INGREDIENTS", payload: ingredients });
  };

  const removeIngredient = (ingredientId: string) => {
    dispatch({ type: "REMOVE_INGREDIENT", payload: ingredientId });
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: ingredientId, quantity },
    });
  };

  const updateIngredientCenter = (ingredientId: string, center: string) => {
    dispatch({
      type: "UPDATE_CENTER",
      payload: { id: ingredientId, center },
    });
  };

  const updateIngredientPrice = (ingredientId: string, price: number) => {
    dispatch({
      type: "UPDATE_PRICE",
      payload: { id: ingredientId, price },
    });
  };

  const updateIngredientNotes = (ingredientId: string, notes: string) => {
    dispatch({
      type: "UPDATE_NOTES",
      payload: { id: ingredientId, notes },
    });
  };

  const toggleMarkedIngredient = (ingredientId: string) => {
    dispatch({ type: "TOGGLE_MARKED", payload: ingredientId });
  };

  const clearMarked = () => {
    dispatch({ type: "CLEAR_MARKED" });
  };

  const clearList = () => {
    dispatch({ type: "CLEAR_LIST" });
  };

  const sortByCenter = () => {
    dispatch({ type: "SORT_BY_CENTER" });
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
        updateIngredientNotes,
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
