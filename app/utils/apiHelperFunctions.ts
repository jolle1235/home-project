"use cliet";
import { Item } from "../model/Item";
import { Recipe } from "../features/recipes/types/Recipe";
import { WeekPlan } from "../features/weekplanner/types/weekPlan";

// API client function
//------------------ ITEMs ------------------------//
export async function searchItem(searchTerm: string): Promise<Item[]> {
  try {
    const response = await fetch(
      `/api/item?term=${encodeURIComponent(searchTerm)}`,
    );
    if (!response.ok) throw new Error("Failed to fetch Items");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching Items:", error);
    return [];
  }
}

export async function updateItemCategory(
  itemId: string | undefined,
  itemName: string,
  category: string,
  defaultUnit?: string,
): Promise<void> {
  try {
    const response = await fetch("/api/item", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, name: itemName, category, defaultUnit }),
    });

    if (!response.ok) throw new Error("Failed to update item category");
  } catch (error) {
    console.error("Error updating item category:", error);
    throw error;
  }
}

//------------------ IMAGES ------------------------//
// Both store the image in the images collection and return its /api/images URL.
async function postUpload(init: RequestInit): Promise<string> {
  const response = await fetch("/api/upload", { method: "POST", ...init });
  if (!response.ok) throw new Error("Image upload failed.");
  return (await response.json()).imageUrl;
}

export function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  return postUpload({ body: formData });
}

// Copies a remote image (e.g. from an imported recipe) into our own store.
export function copyImageFromUrl(url: string): Promise<string> {
  return postUpload({
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

//------------------ WEEK PLANNER ------------------------//
export async function saveWeekPlanToDatabase(
  weekPlanData: WeekPlan[],
): Promise<void> {
  const response = await fetch("/api/weekPlan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weekPlan: weekPlanData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WeekPlan API error:", errorText);
    throw new Error("Failed to save week plan");
  }
}
