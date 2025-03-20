import { Ingredient } from "./Ingredient";
export interface Recipe {
    _id?: number | undefined,
    recipeId?: number;
    recipeName: string;
    description: string;
    image: string;
    ingredients: Ingredient[];
    time: number;
    categories: string[];
    recommendedPersonAmount: number;
    isPublic: boolean;
    author: string;
  }