import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate the ID format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    // Try to find the recipe by ID
    const recipe = await db
      .collection("recipes")
      .findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Convert ObjectId to string for JSON serialization
    const serializedRecipe = {
      ...recipe,
      _id: recipe._id.toString(),
    };

    return NextResponse.json(serializedRecipe);
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
