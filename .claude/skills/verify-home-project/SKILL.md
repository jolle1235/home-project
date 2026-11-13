---
name: verify-home-project
description: Drive the recipe / meal-plan / shopping-list web app the way a phone user does and capture proof. Starts an isolated instance (throwaway git worktree, in-memory MongoDB with fixtures or a local production snapshot, free port), drives it with Playwright, and tears it down. Use whenever a change has to be proven on the real app, to reproduce a bug, or for before/after evidence; `before-after` and `merge-verdict` build on it.
---

# Verify home-project

Generated with pstack's `create-verification-skill` (`.claude/skills/create-verification-skill/`).
Keep it honest with `maintain-verification-skill`. The feature map is in [`features/`](features/README.md).

**Surface:** a mobile-first Next.js web app (PWA). Users touch the browser UI only; the `/api/*`
routes exist for the UI, not for users, so drive the UI and read the API only to check state.

## Launch

```bash
npm run verify:up -- --id <id> [--ref WORKTREE|HEAD|<sha>] [--data fixtures|snapshot]
```

- `--ref WORKTREE` (default) runs HEAD plus your uncommitted changes, including new files.
  `HEAD` or a SHA runs that commit exactly (use the base SHA for a BEFORE run).
- `--data fixtures` (default) seeds the committed synthetic data in `scripts/verify/fixtures/`.
  `--data snapshot` seeds the local production copy from `npm run verify:snapshot`.
- Ready means usable: the command returns only after the database is seeded and every route in
  `ROUTES` (`scripts/verify/lib.mjs`) has compiled and answered. It prints the instance JSON with
  `url`, `port`, `sha`, `seeded` counts. Typical start: about 10 s with a warm cache. A changed
  `package-lock.json` makes it run `npm ci` in the worktree, which takes longer.
- Same `--id` twice → the running instance is reused.
- **Isolation, by construction:** the app runs from a git worktree under
  `~/.cache/home-project-verify/worktrees/<id>` that has no `.env*` files, with `MONGODB_URI`
  pointing at a local in-memory mongod. Several instances can run at once (BEFORE and AFTER,
  reviewers), each on its own port, next to your normal `npm run dev`.

## Doctor

```bash
npm run verify:doctor -- <id>
```

Read-only. Passes only when the supervisor is alive, the worktree has no `.env*` file, the database
host is local, and the in-memory mongod's query counter rises when the app serves `/api/recipe`
(so the app really reads the instance's database). Run it before driving and whenever a result
looks wrong. Never drive an instance that this run did not start.

## Drive

Write the drive as a small Node script with the shared driver (Playwright, 390×844, `da-DK`):

```js
import { openDriver } from "<repo>/scripts/verify/driver.mjs";

const app = await openDriver({ id: "<id>" });
const { page } = app;
await app.goto("/recipes");
await page.getByRole("button", { name: /Se opskrift/ }).first().click();
await page.getByRole("heading", { name: "Ingredienser" }).waitFor();
await app.shot("recipe-detail");
const state = await app.api("/api/shopping-list");   // read state back
const { problems, evidence } = await app.close();      // console errors, page errors, API ≥ 400
```

- Prefer roles and accessible names (`getByRole`, `getByLabel`, `getByPlaceholder`) and the
  visible Danish text in the feature files. Positional CSS is a last resort; name it as such.
- `npm run verify:smoke -- <id>` drives every feature once, read-only, and fails on missing
  content, console errors or failing API calls. Run it after any change to shared UI.
- Per-task checks live in `.flow/<slug>/check.mjs` (gitignored) and use the same driver.

## Evidence

- Everything goes to `.verify/runs/<id>/evidence/` (screenshots from `app.shot`) and
  `.verify/runs/<id>/logs/` (`supervisor.log`, `next.log`). It survives cleanup.
- Proof standards: drive the real user path, not internal setters or test-only routes. Capture the
  action and the resulting state, and read the stored state back (`app.api(...)`) for anything that
  saves. `problems` from `app.close()` must be empty unless the check is about them.
- **The repo is public.** Only runs on `--data fixtures` may be quoted in a PR, a comment or a
  commit. Snapshot runs are local realism checks: report counts and pass/fail, never content.

## Cleanup

```bash
npm run verify:down -- <id>      # or --all
```

Kills only the recorded process group (supervisor, `next dev`, mongod) and removes the worktree.
Evidence and logs stay in `.verify/runs/<id>/`. Delete `.verify/runs/` by hand when it gets big.

## Helpers

| Command | Script | Does |
|---|---|---|
| `npm run verify:up` | `scripts/verify/up.mjs` | Starts an instance (see Launch). |
| `npm run verify:doctor` | `scripts/verify/doctor.mjs` | Health and isolation check. |
| `npm run verify:smoke` | `scripts/verify/smoke.mjs` | Drives every feature once. |
| `npm run verify:down` | `scripts/verify/down.mjs` | Stops an instance, keeps evidence. |
| `npm run verify:snapshot` | `scripts/verify/snapshot.mjs` | Read-only copy of production into `.verify/snapshot/` (gitignored). Set `VERIFY_SNAPSHOT_URI` to a read-only Atlas user for a hard guarantee. |
| — | `scripts/verify/driver.mjs` | `openDriver({ id })` for scripted drives. |
| — | `scripts/verify/fixtures/` | Synthetic data; see its README for fixed ids. |

## Gotchas

- First run on a machine downloads mongod 8.0.4 (~100 MB, cached in `~/.cache/mongodb-binaries`)
  and needs Chromium (`npx playwright install chromium`).
- Snapshot runs show the fallback image for images over 2 MB (left out of the snapshot), which logs
  `HTTP 404 /api/images/...` problems. That is expected on snapshot data only.
- Toasts (react-toastify) disappear after 2.5 s; wait for them right after the action.
- Drives that save go through optimistic TanStack Query updates and debounced PUTs; read state back
  after a short wait instead of trusting the UI alone.
