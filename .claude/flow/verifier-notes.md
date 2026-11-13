# Verifier notes: home-project

The project's memory for proving changes, across sessions. Read by `find-verifier`, `scope-task`,
`before-after`, `verify` and `update-verify` (profile → Verifier notes). Only append from runs that
happened; never delete lines, strike them through with a pointer instead.

## Recipes

This repo's recipes, numbered like the shared catalog
(`.claude/skills/find-verifier/references/verifier-catalog.md`); where both cover a technique, the
recipe here wins. Tools: `npm run verify:up -- --id <id> [--ref <sha>] [--data fixtures|snapshot]
[--mode prod]`, `verify:doctor`, `verify:smoke`, `verify:down`, the driver in
`scripts/verify/driver.mjs`, vitest (`npm test`, files `app/**/*.test.ts`), and git.

### 1. UI drive with assertions

- **Use when:** the task changes what a user sees or can do on a page.
- **Signal:** visible text, roles, counts, and the state read back through `app.api(...)`, plus the
  driver's `problems` list (console errors, page errors, failing API calls).
- **Recipe:** a `.flow/<slug>/check.mjs` with `openDriver({ id })`, following the steps in the
  matching feature file. BEFORE on `--ref <base>`, AFTER on the working tree.
- **Cost:** about 1 minute per instance.
- **Blind spots:** paths the script does not take; layout (see 7).
- **Hydration and first-load checks** (learned 2026-11-08):
  - Load each page in a **fresh browser** (`openDriver` per route): Next's dev tooling reports a
    given mismatch only once per session.
  - Wait for React with `app.hydrated(locator)` before reading the console or typing; a fixed sleep
    misses warnings at random.
  - Check the editor is in the server HTML (`(await app.goto(route)).text()`) and print `ssr=yes|no`:
    a page served from Next's static shell renders client-only and proves nothing.
  - The console warning is unreliable on its own; also assert a symptom (a stale attribute, focus
    that doesn't move) on a page that is always server-rendered.

### 2. Golden replay of recorded inputs

- **Use when:** refactoring or rewriting a function that turns input into output, such as
  `parseIngredientLine`, `tidyRecipeText`, `formatInstructions`, `recipeToDraft` /
  `scrapedToDraft`, `unifyUnit`, `sortByCenter`, or the scrape normalizers.
- **Signal:** the full list of `input → output` pairs; any difference is a finding.
- **Recipe:**
  - **Inputs.** Mostly *generated*: the cross product of the dimensions the function cares about
    (for the ingredient parser: quantity forms × every unit spelling and its case/dot variants ×
    name endings × prefixes, plus odd single lines). The snapshot holds *stored results*, not the
    raw text users typed (19 recipes, 253 parsed ingredients, 214 description lines in Nov 2026), so
    use it to rebuild realistic inputs (`<quantity> <unit> <name>`, descriptions, item names), not
    as the main source. Build inputs independently of the code under test (copy spelling tables
    from the base commit once), or a dropped case silently drops out of the inputs too.
  - **Run the base.** `git archive <base> app | tar -x -C <scratch>/base` gives the base source
    without `node_modules`; pure utils need none. Load the TypeScript with jiti from any root:
    `require("<repo>/node_modules/jiti")(__filename, { cache: false, requireCache: false })(<root>/app/...ts)`.
    Print one JSON line per input with sorted keys and volatile fields (row `key`s) removed.
  - **Compare.** Run the runner on the base copy and on the working tree, `cmp` the base twice
    (determinism), then `diff`. Snapshot-derived results: report counts only.
  - Commit only a small synthetic table as a vitest test; the replay stays local.
- **Cost:** 15–20 minutes to write the runner the first time, seconds per run.
- **Blind spots:** spellings nobody generated; wiring (who passes which arguments); see 6 for that.
- **Proven:** see `## Log`, 2026-11-08 (17,290 lines; dropping the `ltr` alias changed 696).

### 3. Differential run (old vs new side by side)

- **Use when:** replacing an implementation and both can live in one process for a moment.
- **Signal:** `old(x) === new(x)` for every generated or recorded `x`.
- **Recipe:** in a scratch vitest file, import the new function and paste or import the old one
  (`git show <base>:<path>`); loop over the inputs from 2. Delete the old copy before committing.
- **Cost:** low.
- **Blind spots:** side effects; shared state.

### 4. Round-trip and property checks

- **Use when:** paired conversions such as `ingredientsToRows` / `rowsToIngredients`,
  `recipeToDraft` and back, parse and format.
- **Signal:** `back(forth(x))` equals `x` (normalised), for every fixture and snapshot case.
- **Recipe:** a vitest test over the fixtures plus a local snapshot run.
- **Cost:** low.
- **Blind spots:** both directions sharing the same bug.

### 5. Unit test, red first

- **Use when:** pure logic with clear edge cases (dates, quantities, units, parsing).
- **Signal:** a test that fails on the base code for the reason in the brief.
- **Recipe:** write the test, run `npx vitest run <file>` on the unchanged code and save the
  failure to `evidence/unit-before.txt`, implement, run again. Commit the test with the fix.
- **Cost:** lowest.
- **Blind spots:** wiring, rendering, data flow.

### 6. Characterization snapshot

- **Use when:** a behaviour-preserving refactor of a page or API route.
- **Signal:** the normalised output (`page.locator("main").ariaSnapshot()`, visible text, or API JSON
  with ids and timestamps removed) is identical before and after.
- **Recipe:** `check.mjs` prints the normalised output; run it on both instances and `diff`.
- **Cost:** about 1 minute.
- **Blind spots:** styling; anything you normalised away.

### 7. Visual diff

- **Use when:** layout, spacing, colour, responsive behaviour.
- **Signal:** the pixel difference between screenshots at the same viewport, above a threshold,
  in the region that should change and nowhere else.
- **Recipe:** screenshots of the same route on the BEFORE and AFTER instances (`app.shot`). There is
  no diff helper yet: the first task that needs one adds `scripts/verify/pixeldiff.mjs` (pixelmatch
  and pngjs as devDependencies, run from an npm script so fallow sees it) and updates this entry.
  Freeze time-dependent content first (see 11).
- **Cost:** low once the helper exists.
- **Blind spots:** other viewports; hover and focus states.

### 8. Data-state diff

- **Use when:** saves, merges, the category write-back, deletes: anything that writes Mongo.
- **Signal:** the documents before and after one user action. Exactly the intended change, nothing
  else.
- **Recipe:** connect to the instance's `mongoUri` (in `.verify/runs/<id>/instance.json`), dump the
  touched collections, drive the action, dump again, and diff.
- **Cost:** low.
- **Blind spots:** writes that happen later (debounced saves): wait before the second dump.

### 9. Logs and instrumentation

- **Use when:** "it saves twice", refetch loops, N+1 requests, race conditions.
- **Signal:** a count or an order of events: requests per action (`page.on("request")`), server log
  lines in `.verify/runs/<id>/logs/next.log`, temporary `console.info` markers.
- **Recipe:** count the events for one action on BEFORE and AFTER. Remove temporary logs before the
  commit (`thermonuclear-review` flags leftovers).
- **Cost:** low.
- **Blind spots:** events nobody logged.

### 10. Performance numbers

- **Use when:** "slow", bundle size, render cost.
- **Signal:** one number with a unit, before → after (the median of N runs on the same machine), and
  the reason it moved.
- **Recipe:** warm up first; then N=10 timed runs with `performance.now()` around the action in the
  driver, or a Playwright trace; `npm run build` route sizes for bundle questions. Explain what
  limits the number before trusting it.
- **Cost:** about 10 minutes.
- **Blind spots:** dev mode is not production; build and start for real numbers (see 13).

### 11. Fake clock and time zone

- **Use when:** anything with dates, "today", week grids, the date keys in `app/utils/dateUtils.ts`.
- **Signal:** the same assertion under `TZ=Europe/Copenhagen` and `TZ=UTC`, and around midnight.
- **Recipe:** vitest with `vi.setSystemTime(...)` and `TZ=... npx vitest run <file>`; in the browser,
  `browser.newContext({ timezoneId: "Europe/Copenhagen" })` and `page.clock.setFixedTime(...)`.
- **Cost:** low.
- **Blind spots:** server and client in different zones: test both sides.

### 12. Recorded external input

- **Use when:** scraping and importing (`app/features/recipes/server/scrape/`), remote images.
- **Signal:** extraction results from saved HTML, never from live sites.
- **Recipe:** follow `scrape.test.ts`: save the page HTML as a test fixture and assert the
  extracted draft.
- **Cost:** low.
- **Blind spots:** the site changing later.

### 13. Production build checks

- **Use when:** the PWA and service worker, caching, anything that differs between dev and prod.
- **Signal:** behaviour of `npm run build && npm start`, offline (`context.setOffline(true)`), cache
  hits.
- **Recipe:** `npm run verify:up -- --id <id> --mode prod` runs `next build` and `next start` in
  the instance's worktree, with the instance's env (database, household code). Run the task's
  `check.mjs` and `verify:smoke` against it like any instance. Confirm the build really ran:
  `.verify/runs/<id>/logs/next.log` shows "Compiled successfully" and the route list.
- **Expected noise:** every page 404s on `/_vercel/speed-insights/script.js` (only Vercel serves it).
- **Cost:** about 15 seconds to build here, plus the checks.
- **Blind spots:** Vercel-specific behaviour (its image optimizer, edge, env per environment); the
  service worker (the committed `public/sw.js` is stale since the Next 16 upgrade).
- **Proven:** 2026-11-09, require-login: the Secure cookie flag only appears in this mode.

### 13b. Anonymous request matrix (access control)

- **Use when:** anything about who may reach what: login, permissions, a gate in front of routes.
- **Signal:** for every page and every API route × method, the status and body an anonymous client
  gets, plus bypass shapes (encoded segments, trailing slashes, case, `//`, `\`, `/_next/image`,
  `x-middleware-subrequest`), and the data read back logged in afterwards.
- **Recipe:** `fetch` with `redirect: "manual"` for exact statuses, `redirect: "follow"` for bypass
  shapes (pass = not 2xx, or ends on the login page, and no fixture names in any body). Expect 401
  only for a route's exported methods; others answer 405/204. Next answers `//`, `\` and trailing
  slashes with 308 before the proxy runs. Prove each layer separately with deliberate breaks
  (allowlist a path in the gate: the next layer must still refuse).
- **Cost:** about 2 minutes per instance.
- **Blind spots:** routes added later (the list is explicit); client-side state after a session ends.
- **Proven:** 2026-11-09, require-login: BEFORE 72/110 red, AFTER 130/130; a removed route check
  turned 5 lines red.

### 14. Static guarantee

- **Use when:** "make sure this can't happen again" and the bug was a shape or wiring mistake.
- **Signal:** the compiler, lint or fallow rejects the bad version.
- **Recipe:** a type that makes the bad state impossible, an ESLint rule, or a fallow rule; prove it
  by writing the bad version and watching `tsc` / `npm run lint` / `npx fallow` fail.
- **Cost:** varies.
- **Blind spots:** runtime data that bypasses the types (parse it at the boundary).


#### Candidates (proposed by a scout, not yet run)

Promote a candidate into the catalog, with its real recipe, after the first task that uses it.

- **Layout geometry diff** (for spacing and layout tasks; fixes the blind spot of 1 and the
  "everything below moved" problem of 7). Measure bounding boxes, gaps and a few computed styles
  of elements found by role and text, after `document.fonts.ready` and all images complete; print
  one rounded line per measurement; pass when only the intended heights and gaps change and
  everything above and beside them is identical. Break it on purpose by shrinking a different
  element instead (the image), removing the 44 px touch-target minimum, or adding a negative
  margin that makes elements overlap.

## Log

One line per task that chose a verifier (`find-verifier`) or ran `before-after`.

```
date       | task slug | kind | technique | caught something | note
2026-11-08 | fv-parser (skill test) | refactor | 2 golden replay | yes | 17,290 generated lines through linesToRows, deterministic; removing the `ltr` alias in a base copy changed 696 lines. Catalog entry 2 corrected: the snapshot stores parsed results, not raw lines.
2026-11-08 | fix-editor-hydration | bug | 1 UI drive | yes | stopped at approval; BEFORE on base red on /shoppinglist (warning, aria-controls, Enter). Drives found the hydration timing trap and two wrong feature-map selectors; lessons added to entry 1.
2026-11-09 | require-login | feature | 13b anonymous request matrix + 13 production build + 5 unit | yes | BEFORE 72/110 red; AFTER dev 130/130, prod 112/112 (Secure only in prod). Caught: login redirect used Next's host (localhost) instead of the browser's; a `/.//host` path that normalizes to `//host`. Breaks proved each layer separately.
```

## Lessons

What failed, was misunderstood or surprised a run, so the next session doesn't repeat it.

```
date       | task | what went wrong or was misunderstood → what to do instead
2026-11-08 | fv-parser | assumed the snapshot holds the raw lines users typed; it stores parsed results → generate inputs, use the snapshot only for realistic shapes (folded into recipe 2)
2026-11-08 | fix-editor-hydration | a fixed sleep missed the hydration warning at random, and Next dev reports a mismatch only once per browser session → a fresh browser per route and `app.hydrated(locator)` (folded into recipe 1)
2026-11-08 | fix-editor-hydration | two selectors in the feature map matched the wrong element → fixed in `.claude/flow/features/`; drive a feature once before trusting its file
2026-11-09 | require-login | the Secure cookie flag never shows in dev → anything about cookies or headers runs on `--mode prod` too (folded into recipe 13)
2026-11-09 | require-login | expected 401 on `//`, `\` and trailing-slash paths; Next answers them with 308 before the proxy runs → follow redirects for bypass shapes (folded into recipe 13b)
```
