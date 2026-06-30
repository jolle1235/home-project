"use server";

import clientPromise from "../../../lib/mongodb";

import { Ingredient } from "../../../model/Ingredient";

const databaseName = process.env.MONGO_DATABASE_NAME;

const COLLECTION = "shoppingList";

const LIST_ID = "default";

interface ShoppingListDocument {
  listId: string;
  items: Ingredient[];
  updatedAt: Date;
}

async function getDb() {
  if (!databaseName) {
    throw new Error("MONGO_DATABASE_NAME is not defined");
  }

  const client = await clientPromise;

  return client.db(databaseName);
}

export async function getShoppingList(): Promise<Ingredient[]> {
  try {
    const db = await getDb();

    const doc = await db.collection<ShoppingListDocument>(COLLECTION).findOne({
      listId: LIST_ID,
    });

    return doc?.items ?? [];
  } catch (error) {
    console.error(error);

    throw new Error("Failed to fetch shopping list");
  }
}

export async function saveShoppingList(items: Ingredient[]): Promise<void> {
  try {
    const db = await getDb();

    await db.collection<ShoppingListDocument>(COLLECTION).updateOne(
      {
        listId: LIST_ID,
      },
      {
        $set: {
          listId: LIST_ID,
          items,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
      },
    );
  } catch (error) {
    console.error(error);

    throw new Error("Failed to save shopping list");
  }
}

export async function clearShoppingList(): Promise<void> {
  try {
    const db = await getDb();

    await db.collection<ShoppingListDocument>(COLLECTION).updateOne(
      {
        listId: LIST_ID,
      },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      },
    );
  } catch (error) {
    console.error(error);

    throw new Error("Failed to clear shopping list");
  }
}
