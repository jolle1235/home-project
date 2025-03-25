import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

const databaseName = process.env.MONGO_DATABASE_NAME

interface Recipe {
  _id?: ObjectId;
  name: string;
  Items: string;
  instructions?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userName = url.searchParams.get("userName");

    const client = await clientPromise;
    const db = client.db(databaseName);

    // Build the query: if a userName is provided, return all recipes that are public or have that author.
    const query = userName
      ? { $or: [{ isPublic: true }, { author: userName }] }
      : { isPublic: true };

    const recipes = await db.collection("recipes").find(query).toArray();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const recipe_data: Recipe = await request.json();
    const client = await clientPromise;
    const db = client.db(databaseName);;
    
    const result = await db.collection("recipes").insertOne(recipe_data);
    const insertedRecipe = await db.collection("recipes").findOne({ _id: result.insertedId });
    
    return NextResponse.json({ 
      message: "Recipe created successfully",
      receivedData: insertedRecipe 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}

// Helper function to get a single recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);;
    const recipe = await db.collection<Recipe>("recipes").findOne({ _id: new ObjectId(id) }) as Recipe | null;
    return recipe;
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return null;
  }
}
