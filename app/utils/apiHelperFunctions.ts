import { Item } from "../model/Item";
import { Ingredient } from "../model/Ingredient";
import { Recipe } from "../model/Recipe";
import { WeekPlan } from "../model/weekPlan";

// API client function
export async function searchItem(searchTerm: string): Promise<Item[]> {
  try {
    const response = await fetch(`/api/item?term=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Failed to fetch Items');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching Items:', error);
    return [];
  }
}

export async function createItem(Ingredient: Ingredient): Promise<Item> {
  const newItem = {
    name: Ingredient.item.name,
    category: Ingredient.item.category
  }

  try {
    const response = await fetch('/api/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (!response.ok) throw new Error('Failed to create Item');
    return await response.json();
  } catch (error) {
    console.error('Error creating Item:', error);
    throw error;
  }
}

export async function removeItem(itemName: string): Promise<void> {
  try {
    const response = await fetch("/api/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: itemName }), // Send name instead of ID
    });

    if (!response.ok) throw new Error("Failed to remove item");

    console.log(`Item '${itemName}' removed successfully`);
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
}
export async function saveWeekPlanToDatabase(actualUserId: string, weekPlanData: WeekPlan[]): Promise<void> {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: actualUserId,
      weekPlan: weekPlanData, // Ensure this matches the key expected by the API
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save week plan");
  }
}

export async function saveTempWeekPlanToDatabase(actualUserId: string, tempWeekPlan: Recipe[]): Promise<void> {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: actualUserId,
      tempWeekPlan: tempWeekPlan, // Ensure this matches the key expected by the API
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save temporary week plan");
  }
}
