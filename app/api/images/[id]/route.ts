import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MongoUri = process.env.MONGODB_URI ?? "";
const databaseName = process.env.MONGO_DATABASE_NAME;
const collectionName = "images";

if (!MongoUri.startsWith("mongodb://") && !MongoUri.startsWith("mongodb+srv://")) {
  throw new Error('Invalid MongoDB URI. It must start with "mongodb://" or "mongodb+srv://".');
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Adjusted to handle Promise
) {
  const { id } = await context.params; // Await the params to resolve the Promise

  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const client = new MongoClient(MongoUri);
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const image = await collection.findOne({ _id: new ObjectId(id) });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.isBuffer(image.data) ? image.data : image.data.buffer;

    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": image.contentType },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
