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

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid drink ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const drink = await db
      .collection("drinks")
      .findOne({ _id: new ObjectId(id) });

    if (!drink) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 });
    }

    const serializedDrink = { ...drink, _id: drink._id.toString() };
    return NextResponse.json(serializedDrink);
  } catch (error) {
    console.error("Failed to fetch drink:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch drink",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid drink ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(databaseName);

    const result = await db
      .collection("drinks")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete drink:", error);
    return NextResponse.json(
      {
        error: "Failed to delete drink",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
