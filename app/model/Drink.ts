import { Ingredient } from "./Ingredient";

export interface Drink {
  _id: string;
  title: string;
  image: string;
  ingredients: Ingredient[];
  time: number;
  numberOfPeople: number;
  description: string;
  alternatives: string;
  author: string;
}
