import { Ingredient } from "./Ingredient";
export interface Recipe {
    recipeId?: number;
    recipeName: string;
    description: string;
    image: string;
    ingredients: Ingredient[];
    time: number;
    categories: string[];
    recommendedPersonAmount: number;
  }