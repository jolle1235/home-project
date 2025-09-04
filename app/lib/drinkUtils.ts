import clientPromise from "./mongodb";
import { Drink } from "../model/Drink";
import { ObjectId } from "mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

interface DrinkWithObjectId extends Omit<Drink, "_id"> {
  _id: ObjectId;
}

export async function getDrinks(
  filter: Partial<{ ingredientNames: string[] }>
): Promise<Drink[]> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const query: any = {};
    if (filter.ingredientNames && filter.ingredientNames.length > 0) {
      query["ingredients.item.name"] = { $in: filter.ingredientNames };
    }

    const drinks = await db
      .collection<Drink>("drinks")
      .find(query)
      .limit(50)
      .toArray();

    return drinks.map((drink) => ({ ...drink, _id: drink._id.toString() }));
  } catch (error) {
    console.error("Failed to fetch drinks:", error);
    return [];
  }
}

export async function createDrink(drink: Drink): Promise<Drink> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const { _id, ...drinkWithoutId } = drink;

    const result = await db
      .collection<Drink>("drinks")
      .insertOne(drinkWithoutId as Drink);

    return { ...drinkWithoutId, _id: result.insertedId.toString() } as Drink;
  } catch (error) {
    console.error("Failed to create drink:", error);
    throw error;
  }
}
