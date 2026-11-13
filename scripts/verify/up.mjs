// Starts an isolated verification instance of the app.
//
//   npm run verify:up -- [--id <id>] [--ref WORKTREE|HEAD|<sha>] [--data fixtures|snapshot]
//
// The instance runs from a throwaway git worktree (no .env files, so Atlas is
// unreachable) against an in-memory MongoDB, on a free port. This process
// starts a detached supervisor, waits until it reports ready, prints the
// instance and exits. Stop it with `npm run verify:down -- <id>`.
import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import {
  REPO,
  ROUTES,
  freePort,
  cliArgs,
  appFetch,
  isAlive,
  loginCookie,
  readInstance,
  runDir,
  worktreePath,
  writeInstance,
} from "./lib.mjs";
import { seedDatabase } from "./seed.mjs";

// The household code every instance gets unless --env overrides it.
const TEST_HOUSEHOLD_CODE = "verify-household-code";

// Pinned so every run (and later every cloud sandbox) uses the same server.
const MONGO_VERSION = "8.0.4";
const DB_NAME = "verify";
const READY_TIMEOUT_MS = 10 * 60 * 1000;

const args = cliArgs({
  ref: { type: "string", default: "WORKTREE" },
  data: { type: "string", default: "fixtures" },
  mode: { type: "string", default: "dev" },
  env: { type: "string", multiple: true, default: [] },
  supervise: { type: "boolean" },
});
const id = args.id ?? newRunId();
const { ref, data } = args;

const git = (gitArgs, opts = {}) =>
  execFileSync("git", gitArgs, { cwd: REPO, encoding: "utf8", ...opts }).trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const print = (instance) => console.log(JSON.stringify(instance, null, 2));

if (args.supervise) {
  await supervise();
} else {
  await launch();
}

function newRunId() {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  return `${stamp}-${Math.random().toString(36).slice(2, 6)}`;
}

function currentInstance() {
  try {
    return readInstance(id);
  } catch {
    return { status: "missing" };
  }
}

async function launch() {
  const existing = currentInstance();
  if (existing.status === "ready" && isAlive(existing.pid)) return print(existing);
  print(await waitForReady(startSupervisor()));
}

function startSupervisor() {
  fs.mkdirSync(path.join(runDir(id), "logs"), { recursive: true });
  const log = fs.openSync(path.join(runDir(id), "logs", "supervisor.log"), "a");
  const child = spawn(
    process.execPath,
    [
      fileURLToPath(import.meta.url),
      ...["--supervise", "--id", id, "--ref", ref, "--data", data, "--mode", args.mode],
      ...args.env.flatMap((pair) => ["--env", pair]),
    ],
    { cwd: REPO, detached: true, stdio: ["ignore", log, log] },
  );
  child.unref();
  return child;
}

async function waitForReady(child) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    await sleep(1000);
    const instance = currentInstance();
    if (instance.status === "ready") return instance;
    const problem = startFailure(instance, child, deadline);
    if (problem) {
      console.error(`verify:up failed: ${problem}`);
      console.error(`log: ${path.join(runDir(id), "logs", "supervisor.log")}`);
      process.exit(1);
    }
  }
}

function startFailure(instance, child, deadline) {
  if (instance.status === "failed") return instance.error;
  if (!isAlive(child.pid)) return "supervisor exited";
  if (Date.now() > deadline) return `timed out after ${READY_TIMEOUT_MS / 1000}s`;
  return null;
}

async function supervise() {
  const worktree = worktreePath(id);
  const instance = { id, pid: process.pid, status: "starting", ref, data, worktree };
  writeInstance(id, instance);
  let mongo;
  let next;
  let stopping = false;

  const shutdown = async (code) => {
    if (stopping) return;
    stopping = true;
    if (next && isAlive(next.pid)) next.kill("SIGTERM");
    await mongo?.stop().catch(() => {});
    removeWorktree(worktree);
    writeInstance(id, { ...readInstance(id), status: "stopped" });
    process.exit(code);
  };
  process.on("SIGTERM", () => shutdown(0));
  process.on("SIGINT", () => shutdown(0));

  try {
    instance.sha = createWorktree(worktree);
    linkNodeModules(worktree);
    assertNoEnvFiles(worktree);

    mongo = await MongoMemoryServer.create({
      binary: { version: MONGO_VERSION },
      instance: { dbName: DB_NAME, ip: "127.0.0.1" },
    });
    const mongoUri = mongo.getUri();
    if (!new URL(mongoUri).hostname.match(/^(127\.0\.0\.1|localhost)$/)) {
      throw new Error(`Refusing to run against a non-local database: ${mongoUri}`);
    }
    const client = await MongoClient.connect(mongoUri);
    instance.seeded = await seedDatabase(client.db(DB_NAME), data);
    await client.close();

    const port = await freePort();
    const nextLog = fs.openSync(path.join(runDir(id), "logs", "next.log"), "a");
    const env = appEnv(mongoUri);
    Object.assign(instance, {
      mode: args.mode,
      householdCode: env.HOUSEHOLD_CODE,
      port,
      url: `http://127.0.0.1:${port}`,
      mongoUri,
      dbName: DB_NAME,
    });
    next = startNext(worktree, port, env, nextLog);
    next.on("exit", (code) => {
      if (stopping) return;
      writeInstance(id, { ...readInstance(id), status: "failed", error: `next exited (${code})` });
      shutdown(1);
    });

    await warmUp(instance);
    writeInstance(id, { ...instance, status: "ready", readyAt: new Date().toISOString() });
  } catch (error) {
    writeInstance(id, { ...instance, status: "failed", error: error.message });
    console.error(error);
    await shutdown(1);
  }
}

// HEAD/sha: a clean checkout. WORKTREE: HEAD plus the uncommitted changes,
// including new files, so unfinished work can be verified.
function createWorktree(worktree) {
  removeWorktree(worktree);
  fs.mkdirSync(path.dirname(worktree), { recursive: true });
  const withChanges = ref === "WORKTREE";
  const sha = git(["rev-parse", `${withChanges ? "HEAD" : ref}^{commit}`]);
  git(["worktree", "add", "--detach", worktree, sha]);
  if (!withChanges) return sha;
  copyWorkingChanges(worktree);
  return `${sha}+worktree`;
}

// Never copy .env files, even if one ever stops being gitignored.
function isCopyable(file) {
  return file && !path.basename(file).startsWith(".env");
}

function copyWorkingChanges(worktree) {
  const diff = execFileSync("git", ["diff", "HEAD", "--binary"], { cwd: REPO });
  if (diff.length) {
    execFileSync("git", ["apply", "--whitespace=nowarn"], { cwd: worktree, input: diff });
  }
  const untracked = git(["ls-files", "--others", "--exclude-standard", "-z"]).split("\0");
  for (const file of untracked.filter(isCopyable)) {
    fs.mkdirSync(path.dirname(path.join(worktree, file)), { recursive: true });
    fs.copyFileSync(path.join(REPO, file), path.join(worktree, file));
  }
}

// Turbopack rejects a symlinked node_modules. A hardlinked copy is fast and is
// only valid while the lockfiles match; otherwise install for real.
function linkNodeModules(worktree) {
  const sameLock =
    fs.readFileSync(path.join(REPO, "package-lock.json"), "utf8") ===
    fs.readFileSync(path.join(worktree, "package-lock.json"), "utf8");
  if (sameLock) {
    execFileSync("cp", ["-al", path.join(REPO, "node_modules"), path.join(worktree, "node_modules")]);
  } else {
    execFileSync("npm", ["ci", "--prefer-offline", "--no-audit", "--no-fund", "--ignore-scripts"], {
      cwd: worktree,
      stdio: "inherit",
    });
  }
}

function assertNoEnvFiles(worktree) {
  const envFiles = fs.readdirSync(worktree).filter((name) => name.startsWith(".env"));
  if (envFiles.length) {
    throw new Error(`Worktree contains ${envFiles.join(", ")}; refusing to start`);
  }
}

function removeWorktree(worktree) {
  if (fs.existsSync(worktree)) {
    try {
      git(["worktree", "remove", "--force", worktree]);
    } catch {
      fs.rmSync(worktree, { recursive: true, force: true });
    }
  }
  git(["worktree", "prune"]);
}

// The env the app runs with: the in-memory database, a test household code and a
// per-run secret, then the --env KEY=VALUE overrides (KEY= sets it empty).
function appEnv(mongoUri) {
  const overrides = Object.fromEntries(args.env.map((pair) => pair.split(/=(.*)/s, 2)));
  return {
    ...process.env,
    MONGODB_URI: mongoUri,
    MONGO_DATABASE_NAME: DB_NAME,
    NEXT_TELEMETRY_DISABLED: "1",
    HOUSEHOLD_CODE: TEST_HOUSEHOLD_CODE,
    AUTH_SECRET: crypto.randomBytes(24).toString("hex"),
    ...overrides,
  };
}

// dev: next dev (Turbopack). prod: next build, then next start, for what only a
// production build does (Secure cookies, prerendering, the proxy bundle).
function startNext(worktree, port, env, log) {
  const bin = path.join(worktree, "node_modules", ".bin", "next");
  const listen = ["--port", String(port), "--hostname", "127.0.0.1"];
  const options = { cwd: worktree, env, stdio: ["ignore", log, log] };
  if (args.mode !== "prod") return spawn(bin, ["dev", "--turbopack", ...listen], options);
  execFileSync(bin, ["build"], options);
  return spawn(bin, ["start", ...listen], options);
}

// Logs in once (the cookie goes into instance.json for every later drive) and
// requests each route once, because Turbopack compiles a route on its first
// request. With a session every route must answer 2xx. Without one (a commit
// from before the login, or a deliberately locked instance) only the gate
// answers, so any answer below 500 counts and the routes stay cold.
async function warmUp(instance) {
  const deadline = Date.now() + 5 * 60 * 1000;
  await waitForRoute(instance, "/login", deadline, (status) => status < 500);
  instance.cookie = await loginCookie(instance);
  const answered = instance.cookie ? (status) => status < 300 : (status) => status < 500;
  for (const route of ["/api/recipe", ...ROUTES]) {
    await waitForRoute(instance, route, deadline, answered);
  }
}

async function waitForRoute(instance, route, deadline, answered) {
  for (;;) {
    const problem = await probe(instance, route, answered);
    if (!problem) return;
    if (Date.now() > deadline) throw new Error(`Warm-up of ${route} failed: ${problem}`);
    await sleep(2000);
  }
}

async function probe(instance, route, answered) {
  try {
    const response = await appFetch(instance, route);
    return answered(response.status) ? null : `HTTP ${response.status}`;
  } catch (error) {
    return error.message;
  }
}
