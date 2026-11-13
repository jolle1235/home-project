// Shared paths and instance bookkeeping for the verification harness.
// See .claude/skills/verify-home-project/SKILL.md for how the pieces fit.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

export const REPO = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const VERIFY_DIR = path.join(REPO, ".verify");
export const SNAPSHOT_DIR = path.join(VERIFY_DIR, "snapshot");
export const FIXTURES_DIR = path.join(REPO, "scripts", "verify", "fixtures");

// Worktrees live outside the repo: a nested checkout would make Next pick the
// outer package-lock.json as its workspace root.
const WORKTREE_ROOT =
  process.env.VERIFY_WORKTREE_ROOT ??
  path.join(os.homedir(), ".cache", "home-project-verify", "worktrees");

// The collections the app reads. Snapshot and seed both use this list.
export const COLLECTIONS = [
  "recipes",
  "items",
  "shoppingList",
  "weekPlan",
  "recipeCategories",
  "unitTypes",
  "images",
];

// Every page a user can reach. Warm-up and smoke both walk this list.
export const ROUTES = [
  "/recipes",
  "/recipes?type=drink",
  "/add-recipe",
  "/shoppinglist",
  "/weekPlanner",
  "/admin",
];

export function runDir(id) {
  return path.join(VERIFY_DIR, "runs", id);
}

export function evidenceDir(id) {
  const dir = path.join(runDir(id), "evidence");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function worktreePath(id) {
  return path.join(WORKTREE_ROOT, id);
}

export function readInstance(id) {
  const file = path.join(runDir(id), "instance.json");
  if (!fs.existsSync(file)) {
    throw new Error(`No verify instance "${id}" (${file} missing)`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeInstance(id, data) {
  fs.mkdirSync(runDir(id), { recursive: true });
  fs.writeFileSync(
    path.join(runDir(id), "instance.json"),
    JSON.stringify(data, null, 2),
  );
}

export function listRunIds() {
  const dir = path.join(VERIFY_DIR, "runs");
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

export function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

// Every script takes the instance id as `--id <id>` or as its first
// positional argument, plus its own options.
export function cliArgs(options = {}) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: { id: { type: "string" }, ...options },
    allowPositionals: true,
  });
  return { ...values, id: values.id ?? positionals[0] };
}

function isReady(id) {
  try {
    return readInstance(id).status === "ready";
  } catch {
    return false;
  }
}

// The id that was passed, or the only running instance.
export function resolveId(id) {
  if (id) return id;
  const running = listRunIds().filter(isReady);
  if (running.length !== 1) {
    throw new Error(`Pass an instance id. Running: [${running.join(", ")}]`);
  }
  return running[0];
}
