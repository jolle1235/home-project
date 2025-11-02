import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function GET() {
  const client = await clientPromise;
  const db = client.db(databaseName);
  const unitTypes = await db.collection("unitTypes").find().toArray();
  return NextResponse.json(unitTypes);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const client = await clientPromise;
  const db = client.db(databaseName);
  await db.collection("unitTypes").insertOne({ name });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { name } = await req.json();
  const client = await clientPromise;
  const db = client.db(databaseName);
  await db.collection("unitTypes").deleteOne({ name });
  return NextResponse.json({ success: true });
}
