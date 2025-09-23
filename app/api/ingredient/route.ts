import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(request: NextRequest) {
  try {
    const searchTerm = request.nextUrl.searchParams.get("term") || "";
    const client = await clientPromise;
    const db = client.db(databaseName);

    const Items = await db
      .collection("Items")
      .find({
        name: { $regex: searchTerm, $options: "i" },
      })
      .toArray();

    return NextResponse.json(Items);
  } catch (error) {
    console.error("Failed to fetch Items:", error);
    return NextResponse.json(
      { error: "Failed to fetch Items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const Item = await request.json();

    // Validate the Item data
    if (!Item.name || !Item.unit) {
      return NextResponse.json(
        { error: "Name and unit are required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    // Check if Item already exists
    const existingItem = await db
      .collection("Items")
      .findOne({ name: Item.name });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists" },
        { status: 409 }
      );
    }

    // Insert the new Item
    const result = await db.collection("Items").insertOne(Item);

    return NextResponse.json(
      { id: result.insertedId, ...Item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add Item:", error);
    return NextResponse.json({ error: "Failed to add Item" }, { status: 500 });
  }
}
