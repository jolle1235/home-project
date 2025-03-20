// app/api/images/[id]/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// Ensure your environment variable has a valid connection string:
const MongoUri = process.env.MONGODB_URI ?? "";
const databaseName = process.env.MONGO_DATABASE_NAME;
const collectionName = "images";

// Throw an error at startup if the URI is not valid:
if (!MongoUri.startsWith("mongodb://") && !MongoUri.startsWith("mongodb+srv://")) {
  throw new Error(
    'Invalid MongoDB URI. It must start with "mongodb://" or "mongodb+srv://".'
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await the params object before using its properties.
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
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

    // Depending on how image.data is stored, adjust accordingly.
    // If image.data is a Binary object, you may need to access its buffer property.
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
