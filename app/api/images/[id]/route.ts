import { withSession } from "@/app/lib/auth";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

async function handleGet(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const images = (await clientPromise).db(process.env.MONGO_DATABASE_NAME).collection("images");
    const image = await images.findOne({ _id: new ObjectId(id) });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.isBuffer(image.data) ? image.data : image.data.buffer;
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": image.contentType,
        // An image id never changes content; private because it is behind the login.
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withSession(handleGet);
