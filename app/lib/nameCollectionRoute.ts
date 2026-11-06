import { NextResponse } from "next/server";
import clientPromise from "./mongodb";

/** GET/POST/DELETE handlers for a collection of `{ name }` constants. */
export function nameCollectionRoute(collectionName: string) {
  async function collection() {
    const client = await clientPromise;
    return client.db(process.env.MONGO_DATABASE_NAME).collection(collectionName);
  }

  return {
    async GET() {
      const docs = await (await collection()).find().toArray();
      return NextResponse.json(docs);
    },
    async POST(req: Request) {
      const { name } = await req.json();
      await (await collection()).insertOne({ name });
      return NextResponse.json({ success: true });
    },
    async DELETE(req: Request) {
      const { name } = await req.json();
      await (await collection()).deleteOne({ name });
      return NextResponse.json({ success: true });
    },
  };
}
