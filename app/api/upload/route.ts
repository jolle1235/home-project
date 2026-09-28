// app/api/upload/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { safeFetch, SafeFetchError } from "@/app/lib/safeFetch";

const databaseName = process.env.MONGO_DATABASE_NAME ?? "";

if (!databaseName) {
  throw new Error("databaseName is not defined");
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Checked for both file uploads and URL copies. SVG is excluded: served
// from our own origin it could run scripts.
const ALLOWED_TYPES = /^image\/(png|jpe?g|webp|gif|avif|heic|heif|bmp)$/i;

async function saveImageToMongoDB(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
) {
  const client = await clientPromise;
  const result = await client
    .db(databaseName)
    .collection("images")
    .insertOne({
      filename: fileName,
      data: fileBuffer,
      contentType,
      createdAt: new Date(),
    });
  return result.insertedId;
}

// Downloads a remote image (e.g. from an imported recipe) so the recipe
// doesn't depend on the source site keeping it online.
async function imageFromUrl(url: string) {
  const { body, contentType, finalUrl } = await safeFetch(url, {
    accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
    maxBytes: MAX_IMAGE_BYTES,
  });
  const fileName = new URL(finalUrl).pathname.split("/").pop() || "import";
  return {
    buffer: body,
    fileName,
    contentType: contentType.split(";")[0].trim(),
  };
}

async function imageFromForm(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) return null;
  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    fileName: file.name || "upload.png",
    contentType: file.type || "image/png",
  };
}

export async function POST(req: Request) {
  try {
    const isJson = req.headers
      .get("content-type")
      ?.includes("application/json");

    let image;
    if (isJson) {
      const { url } = await req.json();
      if (typeof url !== "string" || !url) {
        return NextResponse.json({ error: "Missing url" }, { status: 400 });
      }
      image = await imageFromUrl(url);
    } else {
      image = await imageFromForm(req);
    }

    if (!image) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.test(image.contentType)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${image.contentType}` },
        { status: 415 },
      );
    }

    const imageId = await saveImageToMongoDB(
      image.buffer,
      image.fileName,
      image.contentType,
    );

    // Return a JSON response with the URL to access the image.
    return NextResponse.json(
      { imageUrl: `/api/images/${imageId}`, imageId: `${imageId}` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof SafeFetchError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
