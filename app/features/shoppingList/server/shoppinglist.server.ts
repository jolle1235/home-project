"use server";

import clientPromise from "../../../lib/mongodb";

import { Ingredient } from "../../../model/Ingredient";
import { ObjectId } from "mongodb";

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

    const items = doc?.items ?? [];
    if (items.length === 0) return [];

    const itemsCollection = db.collection("items");
    const enriched = await Promise.all(
      items.map(async (ingredient) => {
        const storedCategory = ingredient.item?.category;
        if (storedCategory && storedCategory !== "unknown") {
          return ingredient;
        }

        let dbItem = null;
        if (
          ingredient.item?._id &&
          ingredient.item._id !== "unknown" &&
          ObjectId.isValid(ingredient.item._id)
        ) {
          dbItem = await itemsCollection.findOne({
            _id: new ObjectId(ingredient.item._id),
          });
        } else if (ingredient.item?.name) {
          dbItem = await itemsCollection.findOne({
            name: ingredient.item.name,
          });
        }

        if (dbItem?.category) {
          return {
            ...ingredient,
            item: {
              ...ingredient.item,
              category: dbItem.category,
              _id: ingredient.item._id || String(dbItem._id),
            },
          };
        }

        return ingredient;
      }),
    );

    return enriched;
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

    const itemsCollection = db.collection("items");
    for (const ingredient of items) {
      const { item } = ingredient;
      if (!item?.category || item.category === "unknown") continue;

      const filter =
        item._id && item._id !== "unknown" && ObjectId.isValid(item._id)
          ? { _id: new ObjectId(item._id) }
          : item.name
            ? { name: item.name }
            : null;

      if (!filter) continue;

      await itemsCollection.updateOne(filter, {
        $set: { category: item.category },
      });
    }
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
