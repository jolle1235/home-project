import { Item } from "./Item";

export interface Ingredient {
  _id: string;
  item: Item;
  unit: string;
  marked: boolean;
  quantity: number;
}
