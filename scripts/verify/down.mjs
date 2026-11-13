// Stops verification instances started by verify:up.
//
//   npm run verify:down -- <id>      one instance
//   npm run verify:down -- --all     every instance this checkout started
//
// Kills only the recorded process group (supervisor, next dev, mongod) and
// removes the worktree. Evidence in .verify/runs/<id>/evidence stays.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import {
  REPO,
  cliArgs,
  isAlive,
  listRunIds,
  readInstance,
  resolveId,
  writeInstance,
} from "./lib.mjs";

const args = cliArgs({ all: { type: "boolean" } });
const ids = args.all ? listRunIds() : [resolveId(args.id)];

for (const id of ids) {
  let instance;
  try {
    instance = readInstance(id);
  } catch {
    continue;
  }
  if (isAlive(instance.pid)) {
    try {
      process.kill(-instance.pid, "SIGTERM");
    } catch {
      // Group already gone.
    }
    for (let i = 0; i < 30 && isAlive(instance.pid); i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (isAlive(instance.pid)) {
      try {
        process.kill(-instance.pid, "SIGKILL");
      } catch {
        // Group exited between the check and the kill.
      }
    }
  }
  if (instance.worktree && fs.existsSync(instance.worktree)) {
    try {
      execFileSync("git", ["worktree", "remove", "--force", instance.worktree], { cwd: REPO });
    } catch {
      fs.rmSync(instance.worktree, { recursive: true, force: true });
    }
  }
  execFileSync("git", ["worktree", "prune"], { cwd: REPO });
  if (instance.status !== "stopped") writeInstance(id, { ...instance, status: "stopped" });
  console.log(`stopped ${id}`);
}
