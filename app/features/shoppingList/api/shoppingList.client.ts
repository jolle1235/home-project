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

  // #region agent log
  fetch("http://127.0.0.1:7939/ingest/cfe37d34-6cf2-465d-a72d-0e3bee97b400", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "090014",
    },
    body: JSON.stringify({
      sessionId: "090014",
      runId: "post-fix",
      hypothesisId: "H1",
      location: "shoppingList.client.ts:saveShoppingList",
      message: "saveShoppingList response",
      data: { ok: response.ok, status: response.status, itemCount: items.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!response.ok) {
    throw new Error("Failed to save shopping list");
  }
}

export async function clearShoppingListApi(): Promise<void> {
  const response = await fetch(SHOPPING_LIST_API, { method: "DELETE" });

  // #region agent log
  fetch("http://127.0.0.1:7939/ingest/cfe37d34-6cf2-465d-a72d-0e3bee97b400", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "090014",
    },
    body: JSON.stringify({
      sessionId: "090014",
      runId: "post-fix",
      hypothesisId: "H2",
      location: "shoppingList.client.ts:clearShoppingListApi",
      message: "clearShoppingListApi response",
      data: { ok: response.ok, status: response.status },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!response.ok) {
    throw new Error("Failed to clear shopping list");
  }
}
