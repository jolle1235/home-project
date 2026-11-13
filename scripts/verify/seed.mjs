// Fills a verification database from the committed fixtures or the local
// production snapshot (.verify/snapshot, never committed).
import fs from "node:fs";
import path from "node:path";
import { BSON } from "mongodb";
import { COLLECTIONS, FIXTURES_DIR, SNAPSHOT_DIR } from "./lib.mjs";

function readFixture(collection) {
  const file = path.join(FIXTURES_DIR, `${collection}.json`);
  if (!fs.existsSync(file)) return [];
  const docs = BSON.EJSON.parse(fs.readFileSync(file, "utf8"), { relaxed: false });
  return collection === "weekPlan" ? docs.map(resolveDayOffsets) : docs;
}

// mongodump format: BSON documents written back to back.
function readSnapshot(collection) {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    throw new Error("No snapshot yet: run npm run verify:snapshot first");
  }
  const file = path.join(SNAPSHOT_DIR, `${collection}.bson`);
  if (!fs.existsSync(file)) return [];
  const buffer = fs.readFileSync(file);
  const docs = [];
  for (let offset = 0; offset < buffer.length; ) {
    const size = buffer.readInt32LE(offset);
    docs.push(BSON.deserialize(buffer.subarray(offset, offset + size)));
    offset += size;
  }
  return docs;
}

// Fixture week plans say "in N days" so the planner, which only shows today
// onwards, always has something to show.
function resolveDayOffset({ dayOffset, ...entry }) {
  if (dayOffset === undefined) return entry;
  const day = new Date();
  day.setDate(day.getDate() + dayOffset);
  return { ...entry, date: day.toLocaleDateString("sv-SE") }; // local YYYY-MM-DD
}

function resolveDayOffsets(doc) {
  return { ...doc, weekPlan: (doc.weekPlan ?? []).map(resolveDayOffset) };
}

export async function seedDatabase(db, source) {
  const read = source === "snapshot" ? readSnapshot : readFixture;
  const counts = {};
  for (const collection of COLLECTIONS) {
    const docs = read(collection);
    if (docs.length) await db.collection(collection).insertMany(docs);
    counts[collection] = docs.length;
  }
  return counts;
}
