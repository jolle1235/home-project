import { Item } from "./Item";

export interface Ingredient {
    _id: number;
    item: Item;
    unit: string;
    marked: boolean;
    quantity: number;
  }