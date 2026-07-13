import { Ingredient } from "../../../model/Ingredient";

import { SHOPPING_LIST_API } from "../constants";

export async function fetchShoppingList(): Promise<Ingredient[]> {
  const response = await fetch(SHOPPING_LIST_API);

  if (!response.ok) {
    throw new Error("Failed to fetch shopping list");
  }

  return response.json();
}

export async function saveShoppingList(items: Ingredient[]): Promise<void> {
  const response = await fetch(SHOPPING_LIST_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });

  if (!response.ok) {
    throw new Error("Failed to save shopping list");
  }
}

export async function clearShoppingListApi(): Promise<void> {
  const response = await fetch(SHOPPING_LIST_API, { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Failed to clear shopping list");
  }
}
