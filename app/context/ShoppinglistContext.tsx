"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Item } from "../model/Item";



interface ShoppingListContextProps {
  shoppingList: Item[];
  addItem: (item: Item) => void;
  removeItem: (itemId: number) => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
  toggleMarkedItem: (itemId: number) => void;
  clearMarked: () => void;
  clearList: () => void;
  isSomethingMarked: () => boolean;
}

interface ShoppingListProviderProps {
  children: ReactNode;
}

export const ShoppingListContext = createContext<ShoppingListContextProps | undefined>(undefined);

export function ShoppingListProvider({ children }: ShoppingListProviderProps) {
  const [shoppingList, setShoppingList] = useState<Item[]>([]);

  const addItem = (item: Item) => {
    setShoppingList((prev) => [...prev, item]);
  };

  const removeItem = (itemId: number) => {
    setShoppingList((prev) => prev.filter((item) => item._id !== itemId));
  };

  const updateItemQuantity = (itemId: number, quantity: number) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearList = () => setShoppingList([]);

  const clearMarked = () => {
    setShoppingList((prevList) => prevList.filter((item) => !item.marked));
  };
  

  const isSomethingMarked = () => {
    return shoppingList.some((item) => item.marked);
  };

  const toggleMarkedItem = (itemId: number) => {
    setShoppingList((prevList) =>
      prevList.map((item) =>
        item._id === itemId ? { ...item, marked: !item.marked } : item
      )
    );
  };
  
  return (
    <ShoppingListContext.Provider
      value={{
        shoppingList,
        addItem,
        removeItem,
        updateItemQuantity,
        toggleMarkedItem,
        clearMarked,
        isSomethingMarked,
        clearList,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingListContext() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error("useShoppingListContext must be used within a ShoppingListProvider");
  }
  return context;
}
