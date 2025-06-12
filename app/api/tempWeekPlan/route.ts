import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { Recipe } from "@/app/model/Recipe";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Retrieve the temp week plan
    const tempWeekPlan = (await db.collection("tempWeekPlan").findOne({})) || {
      tempWeekPlan: [],
    };

    return NextResponse.json(tempWeekPlan.tempWeekPlan || []);
  } catch (error) {
    console.error("Failed to fetch temp week plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch temp week plan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { tempWeekPlan }: { tempWeekPlan: Recipe[] } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Update or insert the temp week plan
    const result = await db
      .collection("tempWeekPlan")
      .updateOne({}, { $set: { tempWeekPlan } }, { upsert: true });

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json(
        { error: "Failed to save temp week plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save temp week plan:", error);
    return NextResponse.json(
      { error: "Failed to save temp week plan" },
      { status: 500 }
    );
  }
}
