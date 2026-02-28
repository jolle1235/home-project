import { Item } from "./Item";

export interface Ingredient {
  _id: string;
  item: Item;
  unit: string;
  marked: boolean;
  quantity: number;
  section?: string; // Optional section/category title (e.g., "Sauce", "Main course")
  center?: string; // Store name (e.g. "Netto", "Rema")
  price?: number;
}
