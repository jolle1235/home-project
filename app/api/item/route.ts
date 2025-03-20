import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

const databaseName = process.env.MONGO_DATABASE_NAME

export async function GET(request: NextRequest) {
    try {
      const searchTerm = request.nextUrl.searchParams.get('term') || '';
      const client = await clientPromise;
      const db = client.db(databaseName);;
      
      const items = await db.collection("items")
        .find({
          name: { $regex: searchTerm, $options: 'i' }
        })
        .toArray();
        
      return NextResponse.json(items);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
  }
  
  export async function POST(request: NextRequest) {
    try {
      const item = await request.json();
      
      // Validate the item data
      if (!item.name) {
        return NextResponse.json(
          { error: "Name is a required field" },
          { status: 400 }
        );
      }
  
      const client = await clientPromise;
      const db = client.db(databaseName);;
  
      // Check if item already exists
      const existingItem = await db.collection("items")
        .findOne({ name: item.name });
  
      if (existingItem) {
        return NextResponse.json(
          { error: "Item already exists" },
          { status: 409 }
        );
      }
  
      // Insert the new item
      const result = await db.collection("items")
        .insertOne(item);
  
      return NextResponse.json(
        { id: result.insertedId, ...item },
        { status: 201 }
      );
  
    } catch (error) {
      console.error("Failed to add item:", error);
      return NextResponse.json(
        { error: "Failed to add item" },
        { status: 500 }
      );
    }
  }