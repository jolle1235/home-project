// app/api/recipes/[id]/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(
  request: Request,
  context: { params: { id: string } } // Pass context instead of destructuring params directly
) {
  try {
    const { params } = context;
    const { id } = params;

    const client = await clientPromise;
    const db = client.db(databaseName);
    const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

