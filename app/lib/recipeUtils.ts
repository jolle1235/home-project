import clientPromise from "./mongodb";
import { Recipe } from "../model/Recipe";
import { ObjectId } from "mongodb";

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

    // Convert ObjectIds to strings
    return recipes.map((recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
    }));
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

    // Remove the _id field if it exists to let MongoDB generate a new one
    const { _id, ...recipeWithoutId } = recipe;

    const result = await db
      .collection<Recipe>("recipes")
      .insertOne(recipeWithoutId as Recipe);

    // Return the recipe with the new ObjectId converted to string
    return {
      ...recipeWithoutId,
      _id: result.insertedId.toString(),
    } as Recipe;
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

    const { _id, ...recipeWithoutId } = recipe;

    await db
      .collection<Recipe>("recipes")
      .updateOne({ _id: new ObjectId(_id) }, { $set: recipeWithoutId });

    return recipe;
  } catch (error) {
    console.error("Failed to update recipe:", error);
    throw error;
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    if (!databaseName) {
      throw new Error("MONGO_DATABASE_NAME is not defined");
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    await db.collection<Recipe>("recipes").deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    throw error;
  }
}
