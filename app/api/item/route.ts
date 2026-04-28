import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { capitalise } from "@/app/utils/stringUtils";
import { ObjectId } from "mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(request: NextRequest) {
  try {
    const searchTerm = request.nextUrl.searchParams.get("term") || "";
    const client = await clientPromise;
    const db = client.db(databaseName);

    const items = await db
      .collection("items")
      .find({ name: { $regex: searchTerm, $options: "i" } })
      .toArray();

    return NextResponse.json(
      items.map((item) => ({ ...item, name: capitalise(item.name) }))
    );
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
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
    const db = client.db(databaseName);

    // Check if item already exists
    item.name = capitalise(item.name.trim());

    const existingItem = await db
      .collection("items")
      .findOne({ name: item.name });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists" },
        { status: 409 }
      );
    }

    // Insert the new item
    const result = await db.collection("items").insertOne(item);

    return NextResponse.json(
      { id: result.insertedId, ...item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { name } = await request.json();
    const capitalisedName = capitalise(name.trim());

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const result = await db
      .collection("items")
      .deleteOne({ name: capitalisedName });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Failed to remove item:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, name, category, defaultUnit } = await request.json();

    if (!category || (!itemId && !name)) {
      return NextResponse.json(
        { error: "Category and (itemId or name) are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(databaseName);
    const itemsCollection = db.collection("items");
    let filter: Record<string, unknown> | null = null;

    if (itemId && ObjectId.isValid(itemId)) {
      filter = { _id: new ObjectId(itemId) };
    } else if (name?.trim()) {
      const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingByName = await itemsCollection.findOne({
        name: { $regex: `^${escaped}$`, $options: "i" },
      });
      if (existingByName?._id) {
        filter = { _id: existingByName._id };
      }
    }

    if (!filter) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateResult = await itemsCollection.updateOne(filter, {
      $set: { category, defaultUnit: defaultUnit || "stk" },
    });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update item category:", error);
    return NextResponse.json(
      { error: "Failed to update item category" },
      { status: 500 }
    );
  }
}
