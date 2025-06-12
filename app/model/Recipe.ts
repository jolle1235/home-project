import { Ingredient } from "./Ingredient";
import { Item } from "./Item";
export interface Recipe {
  _id: number;
  recipeId?: number;
  recipeName: string;
  description: string;
  image: string;
  ingredients: Ingredient[];
  time: number;
  categories: string[];
  recommendedPersonAmount: number;
  author: string;
}
