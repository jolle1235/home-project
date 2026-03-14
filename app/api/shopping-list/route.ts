import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;
const COLLECTION = "shoppingList";
const LIST_ID = "default"; // single shared list — swap for userId later

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const doc = await db.collection(COLLECTION).findOne({ listId: LIST_ID });
    return NextResponse.json(doc?.items ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const items = await request.json();
    const client = await clientPromise;
    const db = client.db(databaseName);
    await db
      .collection(COLLECTION)
      .updateOne(
        { listId: LIST_ID },
        { $set: { listId: LIST_ID, items, updatedAt: new Date() } },
        { upsert: true }
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save list" }, { status: 500 });
  }
}
