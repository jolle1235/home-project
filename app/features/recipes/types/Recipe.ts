import { Ingredient } from "../../../model/Ingredient";

// Drinks are recipes with type "drink"; "recipe" or a missing type means food.
export const RECIPE_TYPES = ["recipe", "drink"] as const;
export type RecipeType = (typeof RECIPE_TYPES)[number];

// Anything that isn't "drink" (including a missing value) is food.
export function toRecipeType(value: unknown): RecipeType {
  return value === "drink" ? "drink" : "recipe";
}

export interface Recipe {
  _id: string;
  recipeName: string;
  description: string;
  image: string;
  sourceUrl?: string;
  ingredients: Ingredient[];
  time: number;
  categories: string[];
  recommendedPersonAmount: number;
  author: string;
  type?: RecipeType;
}

export function isDrink(recipe: Pick<Recipe, "type">): boolean {
  return toRecipeType(recipe.type) === "drink";
}
