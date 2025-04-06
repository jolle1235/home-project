import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb'; // MongoDB connection utility
import { Recipe } from '../../model/Recipe'; // Your Recipe model
import { WeekPlan } from '@/app/model/weekPlan'; // Your WeekPlan model

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Retrieve the user document containing both tempWeekPlan and weekPlan
    const user = await db.collection('users').findOne({ userId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      tempWeekPlan: user.tempWeekPlan || [],
      weekPlan: user.weekPlan || [],
    });
  } catch (error) {
    console.error("Failed to fetch week plans:", error);
    return NextResponse.json({ error: "Failed to fetch week plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, tempWeekPlan, weekPlan }: { userId: string; tempWeekPlan?: Recipe[]; weekPlan?: WeekPlan[] } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Prepare the update object dynamically
    const updateData: Record<string, any> = {};
    if (tempWeekPlan) updateData.tempWeekPlan = tempWeekPlan;
    if (weekPlan) updateData.weekPlan = weekPlan;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid data provided" }, { status: 400 });
    }

    // Update or insert the user document with tempWeekPlan and/or weekPlan
    const result = await db.collection('users').updateOne(
      { userId },
      { $set: updateData },
      { upsert: true }
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json({ error: "Failed to save week plan data" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save week plans:", error);
    return NextResponse.json({ error: "Failed to save week plans" }, { status: 500 });
  }
}
