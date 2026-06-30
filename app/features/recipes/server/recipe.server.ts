"use server";

import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

import { Recipe } from "../types/Recipe";

const databaseName = process.env.MONGO_DATABASE_NAME;

interface RecipeDocument extends Omit<Recipe, "_id"> {
  _id: ObjectId;
}

function mapRecipe(recipe: RecipeDocument): Recipe {
  return {
    ...recipe,
    _id: recipe._id.toString(),
  };
}

async function getDb() {
  if (!databaseName) {
    throw new Error("MONGO_DATABASE_NAME is not defined");
  }

  const client = await clientPromise;

  return client.db(databaseName);
}

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const db = await getDb();

    const recipes = await db
      .collection<RecipeDocument>("recipes")
      .find({})
      .limit(50)
      .toArray();

    return recipes.map(mapRecipe);
  } catch (error) {
    console.error(error);

    throw new Error("Failed to fetch recipes");
  }
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    const db = await getDb();

    const { _id, ...recipeWithoutId } = recipe;

    const result = await db
      .collection<RecipeDocument>("recipes")
      .insertOne({ ...recipeWithoutId, _id: new ObjectId() } as RecipeDocument);

    return {
      ...recipeWithoutId,
      _id: result.insertedId.toString(),
    } as Recipe;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to create recipe");
  }
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    const db = await getDb();

    const { _id, ...recipeWithoutId } = recipe;

    await db
      .collection<RecipeDocument>("recipes")
      .updateOne({ _id: new ObjectId(_id) }, { $set: recipeWithoutId });

    return recipe;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to update recipe");
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    const db = await getDb();

    await db.collection<RecipeDocument>("recipes").deleteOne({
      _id: new ObjectId(id),
    });
  } catch (error) {
    console.error(error);

    throw new Error("Failed to delete recipe");
  }
}
