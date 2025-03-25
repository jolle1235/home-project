import { Item } from "./Item";
export interface Recipe {
    _id: number
    recipeId?: number;
    recipeName: string;
    description: string;
    image: string;
    Items: Item[];
    time: number;
    categories: string[];
    recommendedPersonAmount: number;
    isPublic: boolean;
    author: string;
  }