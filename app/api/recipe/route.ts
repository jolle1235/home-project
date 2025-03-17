import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Recipe {
  _id?: ObjectId;
  name: string;
  ingredients: string;
  instructions?: string;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("recipe-database");
    const recipes = await db.collection("recipes").find({}).toArray();
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
    const db = client.db("recipe-database");
    
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
    const db = client.db("recipe-database");
    const recipe = await db.collection<Recipe>("recipes").findOne({ _id: new ObjectId(id) }) as Recipe | null;
    return recipe;
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return null;
  }
}
