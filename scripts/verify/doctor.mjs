// Read-only health check: is this instance ours, alive, and isolated?
//
//   npm run verify:doctor -- [<id>]
//
// Exit 0 only when every check passes. Run it before driving, and whenever a
// result looks wrong.
import fs from "node:fs";
import { MongoClient } from "mongodb";
import { appFetch, cliArgs, isAlive, readInstance, resolveId } from "./lib.mjs";

const id = resolveId(cliArgs().id);
const instance = readInstance(id);
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

check("status is ready", instance.status === "ready", instance.status);
check("supervisor alive", isAlive(instance.pid), `pid ${instance.pid}`);

const envFiles = fs.existsSync(instance.worktree)
  ? fs.readdirSync(instance.worktree).filter((name) => name.startsWith(".env"))
  : ["<worktree missing>"];
check("worktree has no .env files", envFiles.length === 0, envFiles.join(", "));

const host = instance.mongoUri ? new URL(instance.mongoUri).hostname : "";
check("database is local", ["127.0.0.1", "localhost"].includes(host), host);

// The app must be reading the in-memory server: its query counter has to
// move when the app serves a page that loads recipes.
let client;
try {
  client = await MongoClient.connect(instance.mongoUri, { serverSelectionTimeoutMS: 3000 });
  const admin = client.db("admin");
  const before = (await admin.command({ serverStatus: 1 })).opcounters.query;
  const response = await appFetch(instance, "/api/recipe");
  check("app answers", response.ok, `GET /api/recipe → ${response.status}`);
  const after = (await admin.command({ serverStatus: 1 })).opcounters.query;
  check("app reads the in-memory database", after > before, `queries ${before} → ${after}`);
} catch (error) {
  check("app reads the in-memory database", false, error.message);
} finally {
  await client?.close();
}

const ok = checks.every((c) => c.ok);
console.log(JSON.stringify({ id, url: instance.url, sha: instance.sha, data: instance.data, ok, checks }, null, 2));
process.exit(ok ? 0 : 1);
