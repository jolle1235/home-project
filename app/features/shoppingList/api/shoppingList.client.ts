import { Ingredient } from "../../../model/Ingredient";

import { SHOPPING_LIST_API } from "../constants";

export async function fetchShoppingList(): Promise<Ingredient[]> {
  const response = await fetch(SHOPPING_LIST_API);

  if (!response.ok) {
    throw new Error("Failed to fetch shopping list");
  }

  return response.json();
}

// Resolves to the saved list as the server returns it (categories filled in).
export async function saveShoppingList(
  items: Ingredient[],
): Promise<Ingredient[]> {
  const response = await fetch(SHOPPING_LIST_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });

  if (!response.ok) {
    throw new Error("Failed to save shopping list");
  }

  return response.json();
}
