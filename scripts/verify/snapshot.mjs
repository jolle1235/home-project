// Copies the production database into .verify/snapshot/ (gitignored) so a
// verification instance can run on real data with `--data snapshot`.
//
//   npm run verify:snapshot
//
// Read-only: it only lists collections and calls find(). For a hard
// guarantee, point it at a read-only Atlas user via VERIFY_SNAPSHOT_URI.
// The repo is public: the snapshot must never be committed or quoted on GitHub.
import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { BSON, MongoClient } from "mongodb";
import { COLLECTIONS, REPO, SNAPSHOT_DIR } from "./lib.mjs";

// Images larger than this are left out; recipes then show the fallback image.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const envFile = (name) => {
  const file = path.join(REPO, name);
  return fs.existsSync(file) ? parseEnv(fs.readFileSync(file, "utf8")) : {};
};
// Same precedence as Next: the real environment, then .env.local, then .env.
const env = { ...envFile(".env"), ...envFile(".env.local"), ...process.env };

const uri = env.VERIFY_SNAPSHOT_URI ?? env.MONGODB_URI;
const dbName = env.MONGO_DATABASE_NAME;
if (!uri || !dbName) throw new Error("MONGODB_URI and MONGO_DATABASE_NAME must be set");

const client = await MongoClient.connect(uri, { readPreference: "secondaryPreferred" });
const db = client.db(dbName);
const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));

fs.rmSync(SNAPSHOT_DIR, { recursive: true, force: true });
fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
const meta = { takenAt: new Date().toISOString(), database: dbName, counts: {}, skipped: {} };

for (const collection of COLLECTIONS) {
  if (!existing.has(collection)) {
    meta.counts[collection] = 0;
    continue;
  }
  const out = fs.openSync(path.join(SNAPSHOT_DIR, `${collection}.bson`), "w");
  let count = 0;
  let skipped = 0;
  for await (const doc of db.collection(collection).find({})) {
    const bytes = BSON.serialize(doc);
    if (collection === "images" && bytes.length > MAX_IMAGE_BYTES) {
      skipped++;
      continue;
    }
    fs.writeSync(out, bytes);
    count++;
  }
  fs.closeSync(out);
  meta.counts[collection] = count;
  if (skipped) meta.skipped[collection] = skipped;
}
await client.close();

fs.writeFileSync(path.join(SNAPSHOT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));
