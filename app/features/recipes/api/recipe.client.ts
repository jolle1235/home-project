import { Recipe } from "../types/Recipe";

export async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`/api/recipe/${id}`);
  if (!response.ok) throw new Error("Failed to fetch recipe");
  return response.json();
}
