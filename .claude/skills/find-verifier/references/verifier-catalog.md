# Verifier catalog

Techniques for proving a change in this repo. Each entry: **Use when**, **Signal**, **Recipe**
(with this repo's tools), **Cost**, **Blind spots**. Add or correct entries only from real runs
(see `verifier-log.md`).

Shared tools: `npm run verify:up -- --id <id> [--ref <sha>] [--data fixtures|snapshot]`,
`verify:doctor`, `verify:smoke`, `verify:down`, the driver in `scripts/verify/driver.mjs`, vitest
(`npm test`, files `app/**/*.test.ts`), and git.

---

## 1. UI drive with assertions

- **Use when:** the task changes what a user sees or can do on a page.
- **Signal:** visible text, roles, counts, and the state read back through `app.api(...)`, plus the
  driver's `problems` list (console errors, page errors, failing API calls).
- **Recipe:** a `.flow/<slug>/check.mjs` with `openDriver({ id })`, following the steps in the
  matching feature file. BEFORE on `--ref <base>`, AFTER on the working tree.
- **Cost:** about 1 minute per instance.
- **Blind spots:** paths the script does not take; layout (see 7).

## 2. Golden replay of recorded inputs

- **Use when:** refactoring or rewriting a function that turns input into output, such as
  `parseIngredientLine`, `tidyRecipeText`, `formatInstructions`, `recipeToDraft` /
  `scrapedToDraft`, `unifyUnit`, `sortByCenter`, or the scrape normalizers.
- **Signal:** the full list of `input → output` pairs; any difference is a finding.
- **Recipe:** collect inputs from data (every ingredient line, description and recipe in
  `.verify/snapshot/recipes.bson` gives hundreds of real cases; read it with `BSON.deserialize` as in
  `scripts/verify/seed.mjs`). Run the function at the base commit, either in a
  `verify:up --ref <base>` worktree or with `git stash` around a small runner script, and write
  `evidence/golden-before.jsonl`. Run again after the change and `diff`. Commit only a small
  synthetic golden set as a vitest test; the snapshot replay stays local.
- **Cost:** minutes. Needs a snapshot (`npm run verify:snapshot`) for the real inputs.
- **Blind spots:** inputs nobody has typed yet. Add edge cases by hand.

## 3. Differential run (old vs new side by side)

- **Use when:** replacing an implementation and both can live in one process for a moment.
- **Signal:** `old(x) === new(x)` for every generated or recorded `x`.
- **Recipe:** in a scratch vitest file, import the new function and paste or import the old one
  (`git show <base>:<path>`); loop over the inputs from 2. Delete the old copy before committing.
- **Cost:** low.
- **Blind spots:** side effects; shared state.

## 4. Round-trip and property checks

- **Use when:** paired conversions such as `ingredientsToRows` / `rowsToIngredients`,
  `recipeToDraft` and back, parse and format.
- **Signal:** `back(forth(x))` equals `x` (normalised), for every fixture and snapshot case.
- **Recipe:** a vitest test over the fixtures plus a local snapshot run.
- **Cost:** low.
- **Blind spots:** both directions sharing the same bug.

## 5. Unit test, red first

- **Use when:** pure logic with clear edge cases (dates, quantities, units, parsing).
- **Signal:** a test that fails on the base code for the reason in the brief.
- **Recipe:** write the test, run `npx vitest run <file>` on the unchanged code and save the
  failure to `evidence/unit-before.txt`, implement, run again. Commit the test with the fix.
- **Cost:** lowest.
- **Blind spots:** wiring, rendering, data flow.

## 6. Characterization snapshot

- **Use when:** a behaviour-preserving refactor of a page or API route.
- **Signal:** the normalised output (`page.locator("main").ariaSnapshot()`, visible text, or API JSON
  with ids and timestamps removed) is identical before and after.
- **Recipe:** `check.mjs` prints the normalised output; run it on both instances and `diff`.
- **Cost:** about 1 minute.
- **Blind spots:** styling; anything you normalised away.

## 7. Visual diff

- **Use when:** layout, spacing, colour, responsive behaviour.
- **Signal:** the pixel difference between screenshots at the same viewport, above a threshold,
  in the region that should change and nowhere else.
- **Recipe:** screenshots of the same route on the BEFORE and AFTER instances (`app.shot`). There is
  no diff helper yet: the first task that needs one adds `scripts/verify/pixeldiff.mjs` (pixelmatch
  and pngjs as devDependencies, run from an npm script so fallow sees it) and updates this entry.
  Freeze time-dependent content first (see 11).
- **Cost:** low once the helper exists.
- **Blind spots:** other viewports; hover and focus states.

## 8. Data-state diff

- **Use when:** saves, merges, the category write-back, deletes: anything that writes Mongo.
- **Signal:** the documents before and after one user action. Exactly the intended change, nothing
  else.
- **Recipe:** connect to the instance's `mongoUri` (in `.verify/runs/<id>/instance.json`), dump the
  touched collections, drive the action, dump again, and diff.
- **Cost:** low.
- **Blind spots:** writes that happen later (debounced saves): wait before the second dump.

## 9. Logs and instrumentation

- **Use when:** "it saves twice", refetch loops, N+1 requests, race conditions.
- **Signal:** a count or an order of events: requests per action (`page.on("request")`), server log
  lines in `.verify/runs/<id>/logs/next.log`, temporary `console.info` markers.
- **Recipe:** count the events for one action on BEFORE and AFTER. Remove temporary logs before the
  commit (`thermonuclear-review` flags leftovers).
- **Cost:** low.
- **Blind spots:** events nobody logged.

## 10. Performance numbers

- **Use when:** "slow", bundle size, render cost.
- **Signal:** one number with a unit, before → after (the median of N runs on the same machine), and
  the reason it moved.
- **Recipe:** warm up first; then N=10 timed runs with `performance.now()` around the action in the
  driver, or a Playwright trace; `npm run build` route sizes for bundle questions. Explain what
  limits the number before trusting it.
- **Cost:** about 10 minutes.
- **Blind spots:** dev mode is not production; build and start for real numbers (see 13).

## 11. Fake clock and time zone

- **Use when:** anything with dates, "today", week grids, the date keys in `app/utils/dateUtils.ts`.
- **Signal:** the same assertion under `TZ=Europe/Copenhagen` and `TZ=UTC`, and around midnight.
- **Recipe:** vitest with `vi.setSystemTime(...)` and `TZ=... npx vitest run <file>`; in the browser,
  `browser.newContext({ timezoneId: "Europe/Copenhagen" })` and `page.clock.setFixedTime(...)`.
- **Cost:** low.
- **Blind spots:** server and client in different zones: test both sides.

## 12. Recorded external input

- **Use when:** scraping and importing (`app/features/recipes/server/scrape/`), remote images.
- **Signal:** extraction results from saved HTML, never from live sites.
- **Recipe:** follow `scrape.test.ts`: save the page HTML as a test fixture and assert the
  extracted draft.
- **Cost:** low.
- **Blind spots:** the site changing later.

## 13. Production build checks

- **Use when:** the PWA and service worker, caching, anything that differs between dev and prod.
- **Signal:** behaviour of `npm run build && npm start`, offline (`context.setOffline(true)`), cache
  hits.
- **Recipe:** build inside a verify worktree; Next's dev lock does not apply to `start`.
- **Cost:** about 3 minutes.
- **Blind spots:** Vercel-specific behaviour.

## 14. Static guarantee

- **Use when:** "make sure this can't happen again" and the bug was a shape or wiring mistake.
- **Signal:** the compiler, lint or fallow rejects the bad version.
- **Recipe:** a type that makes the bad state impossible, an ESLint rule, or a fallow rule; prove it
  by writing the bad version and watching `tsc` / `npm run lint` / `npx fallow` fail.
- **Cost:** varies.
- **Blind spots:** runtime data that bypasses the types (parse it at the boundary).
