import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET() {
  const client = await clientPromise;
  const db = client.db(databaseName);
  const categories = await db.collection("recipeCategories").find().toArray();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const client = await clientPromise;
  const db = client.db("home-project");
  await db.collection("recipeCategories").insertOne({ name });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { name } = await req.json();
  const client = await clientPromise;
  const db = client.db("home-project");
  await db.collection("recipeCategories").deleteOne({ name });
  return NextResponse.json({ success: true });
}
