import { Ingredient } from "../../../model/Ingredient";
import { Item } from "../../../model/Item";
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
}
