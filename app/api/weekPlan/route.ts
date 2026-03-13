import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { WeekPlan } from "@/app/model/weekPlan";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET() {
  const client = await clientPromise;
  const db = client.db(databaseName);

  const data = await db.collection("weekPlan").findOne({ type: "weekPlan" });

  return NextResponse.json(data?.weekPlan || []);
}

export async function POST(request: Request) {
  const { weekPlan }: { weekPlan: WeekPlan[] } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    await db.collection("weekPlan").updateOne(
      { type: "weekPlan" },
      {
        $set: {
          type: "weekPlan",
          weekPlan,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save week plan:", error);
    return NextResponse.json(
      { error: "Failed to save week plan" },
      { status: 500 }
    );
  }
}
