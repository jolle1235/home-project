// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing to handle multipart/form-data manually.
  },
};

const databaseName = process.env.MONGO_DATABASE_NAME ?? "";
const mongoURI = process.env.MONGODB_URI ?? "";

if (!databaseName) {
  throw new Error("databaseName is not defined");
}

if(!mongoURI){
    throw new Error("mongoURI is not defined");
}

async function saveImageToMongoDB(fileBuffer: Buffer, fileName: string) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection("images");

    const result = await collection.insertOne({
      filename: fileName,
      data: fileBuffer,
      contentType: "image/png", // You may want to determine the content type dynamically.
      createdAt: new Date(),
    });

    return result.insertedId;
  } finally {
    await client.close();
  }
}

export async function POST(req: Request) {
  try {
    // Parse the incoming form data using the Web API.
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert the uploaded File into a Buffer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the image buffer to MongoDB.
    const imageId = await saveImageToMongoDB(buffer, file.name || "upload.png");

    // Return a JSON response with the URL to access the image.
    return NextResponse.json(
      { imageUrl: `/api/images/${imageId}`, imageId: `${imageId}` },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
