import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { WeekPlan } from "@/app/model/weekPlan";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Retrieve the week plan
    const weekPlan = (await db.collection("weekPlan").findOne({})) || {
      weekPlan: [],
    };

    return NextResponse.json(weekPlan.weekPlan || []);
  } catch (error) {
    console.error("Failed to fetch week plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch week plan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { weekPlan }: { weekPlan: WeekPlan[] } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Update or insert the week plan
    const result = await db
      .collection("weekPlan")
      .updateOne({}, { $set: { weekPlan } }, { upsert: true });

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json(
        { error: "Failed to save week plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save week plan:", error);
    return NextResponse.json(
      { error: "Failed to save week plan" },
      { status: 500 }
    );
  }
}
