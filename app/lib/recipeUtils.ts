import clientPromise from "./mongodb";
import { Recipe } from "../model/Recipe";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function getRecipes(): Promise<Recipe[]> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    console.log("Connected to MongoDB");

    const db = client.db(databaseName);

    const recipes = await db
      .collection<Recipe>("recipes")
      .find({})
      .limit(50)
      .toArray();

    return recipes;
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const result = await db.collection<Recipe>("recipes").insertOne(recipe);
    return { ...recipe, _id: result.insertedId };
  } catch (error) {
    console.error("Failed to create recipe:", error);
    throw error;
  }
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    await db
      .collection<Recipe>("recipes")
      .updateOne({ _id: recipe._id }, { $set: recipe });

    return recipe;
  } catch (error) {
    console.error("Failed to update recipe:", error);
    throw error;
  }
}

export async function deleteRecipe(id: number): Promise<void> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    await db.collection<Recipe>("recipes").deleteOne({ _id: id });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    throw error;
  }
}
