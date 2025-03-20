import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { Ingredient } from '@/app/model/Ingredient';

const databaseName = process.env.MONGO_DATABASE_NAME

export async function GET(request: NextRequest) {
  try {
    const searchTerm = request.nextUrl.searchParams.get('term') || '';
    const client = await clientPromise;
    const db = client.db(databaseName);;
    
    const ingredients = await db.collection<Ingredient>("ingredients")
      .find({
        name: { $regex: searchTerm, $options: 'i' }
      })
      .toArray();
      
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ingredient = await request.json();
    
    // Validate the ingredient data
    if (!ingredient.name || !ingredient.unit) {
      return NextResponse.json(
        { error: "Name and unit are required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(databaseName);;

    // Check if ingredient already exists
    const existingIngredient = await db.collection("ingredients")
      .findOne({ name: ingredient.name });

    if (existingIngredient) {
      return NextResponse.json(
        { error: "Ingredient already exists" },
        { status: 409 }
      );
    }

    // Insert the new ingredient
    const result = await db.collection("ingredients")
      .insertOne(ingredient);

    return NextResponse.json(
      { id: result.insertedId, ...ingredient },
      { status: 201 }
    );

  } catch (error) {
    console.error("Failed to add ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
}


