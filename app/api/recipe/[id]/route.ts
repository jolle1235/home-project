import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // `params` is now a Promise
) {
  try {
    const { id } = await context.params; // Await the `params` Promise to extract `id`

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
