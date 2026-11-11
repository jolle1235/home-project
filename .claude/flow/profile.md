# Flow profile: home-project

Read by the shared flow skills (`deliver` and its stages, from `jolle1235/agent-skills`).
Template and section meanings: `.claude/skills/deliver/references/profile-template.md`.

## Repo

- Base branch: `master`
- PR base: `master`
- Public repo: yes. Only fixture runs may be quoted on GitHub; nothing from the production snapshot.
- `gh` account: `jolle1235` (if `gh` fails with "must be a collaborator": `GH_TOKEN="$(gh auth token --user jolle1235)"`)
- Language: user-facing text and toasts in Danish; code in English.
- Read first: CLAUDE.md only.

## Verify

- Skill: `verify-home-project` (`.claude/skills/verify-home-project/SKILL.md`)
- Feature files: `.claude/skills/verify-home-project/features/`
- Fixtures: `scripts/verify/fixtures/`
- Up: `npm run verify:up -- --id <id> [--ref <sha>] [--data fixtures|snapshot] [--mode prod] [--env KEY=VALUE]`
- Doctor: `npm run verify:doctor -- <id>`
- Smoke: `npm run verify:smoke -- <id>`
- Down: `npm run verify:down -- <id>`; all: `npm run verify:down -- --all`
- Driver: `scripts/verify/driver.mjs` → `openDriver({ id })` (logs in with the instance's household code)
- Private data: `--data snapshot` (a local copy of production made by `npm run verify:snapshot`; never quote it)

## Check script

```js
// node .flow/<slug>/check.mjs <instance-id>
import { openDriver } from "../../scripts/verify/driver.mjs";

const app = await openDriver({ id: process.argv[2] });
const { page } = app;
const results = [];
const expect = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail });

await app.goto("/shoppinglist");
await page.getByRole("heading", { name: "Indkøbsliste" }).waitFor();
// ... drive the user path from the feature file; read saved state back with app.api(...)
expect("no hydration mismatch on /shoppinglist", true); // decided from problems below

await app.shot("check");
const { problems } = await app.close();
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"} ${r.name}${r.detail ? ` | ${r.detail}` : ""}`);
for (const p of problems) console.log(`PROBLEM ${p}`);
process.exit(results.every((r) => r.ok) && problems.length === 0 ? 0 : 1);
```

## Gates

1. Types: `npx tsc --noEmit`
2. Lint: `npx eslint <changed .ts/.tsx/.js/.mjs files>` (master has pre-existing lint errors elsewhere)
3. Tests: `npm test` (vitest, `app/**/*.test.ts`)
4. Static gate: `npx fallow audit --base origin/master`, fixed with the `fallow` skill

## Commit

- Gate:
  ```bash
  UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  BASE="$( [ -n "$UPSTREAM" ] && git merge-base "$UPSTREAM" HEAD || echo master )"
  npx fallow audit --base "$BASE" --format json --quiet --explain
  git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx' '*.js' '*.mjs' | xargs -r npx eslint
  ```
- Hooks: `.githooks/pre-commit` (fallow audit, enabled by `npm install`), and for Claude
  `.claude/hooks/fallow-gate.sh` on `git commit` / `git push`; `--no-verify` is denied in
  `.claude/settings.json`.
- Never stage: `.env*`, `public/sw.js`, `public/workbox-*.js`, `.verify/`, `.flow/`.
- Rules: dead code and duplication must be 0 in changed files (threshold 0). Never regenerate
  `.fallow-health-baseline.json`; never loosen `.fallowrc.jsonc`. A `fallow-ignore` needs the
  user's OK and a reason. Unused files that Next loads by convention go to `entry` in
  `.fallowrc.jsonc` (tell the user).

## Merge

- Command: `gh pr merge <n> --squash --delete-branch`
- After merge: `npm run verify:down -- --all`

## After each task

none

## Stack

- Next.js 16 App Router: read `node_modules/next/dist/docs/` before using an API; `proxy.ts` is the middleware.
- Effects only for external systems (enforced by lint): derive inline or with `useMemo`, logic in handlers, reset with `key`.
- Server state through TanStack Query hooks with optimistic `onMutate` + rollback + `invalidateQueries`; no new contexts.
- Feature layout: async `page.tsx` server component → `server/*.server.ts` → `initialData` → `client/*PageClient.tsx`.
- Every API handler wrapped in `withSession`; every server page reading Mongo calls `requireSession()` first.
- Tailwind semantic tokens only (no hex); icons from `lucide-react`; mobile-first.
- Danish user-facing copy.

## Layers

- Data: `app/features/<f>/server/*.server.ts` (Mongo via `clientPromise`, `ObjectId` ⇄ string `_id`; no `"use server"`)
- HTTP: `app/api/*/route.ts`, thin, delegating to `server/`
- API clients: `app/features/<f>/api/*.client.ts`
- Server state: `app/features/<f>/hooks/`
- Pure logic: `app/features/<f>/utils/`, `app/utils/`
- UI: `app/features/<f>/components/`, shared in `app/components/`

## Canonical homes

| Concern | Home |
|---|---|
| Calendar-day keys | `app/utils/dateUtils.ts` → `toDateKey` |
| URL helpers, capitalisation | `app/utils/stringUtils.ts` → `isRemoteUrl`, `withScheme`, `capitalise` |
| Ingredient text → quantity/unit | `app/features/recipes/utils/parseIngredientLine.ts` |
| Editor rows ⇄ ingredients | `app/features/recipes/utils/ingredientRows.ts` |
| Ingredient input UI | `app/features/recipes/components/IngredientEditor.tsx` |
| Recipe text tidying | `app/features/recipes/utils/tidyRecipeText.ts` |
| Server-side fetch of user URLs | `app/lib/safeFetch.ts` |
| Name-only constant routes | `app/lib/nameCollectionRoute.ts` |
| Mongo client | `app/lib/mongodb.ts` → `clientPromise` (never a new `MongoClient`) |
| Session checks | `app/lib/auth.ts` → `withSession`, `requireSession`; cookie in `app/lib/session.ts` |
| Fetching a recipe | `app/features/recipes/api/recipe.client.ts` → `fetchRecipe` |
| Query keys | `SHOPPING_LIST_QUERY_KEY` (`features/shoppingList/constants.ts`), `["recipes"]`, `["recipe", id]`, `["weekPlan"]`, `["constants"]` |
| Buttons, dialogs, pull-to-refresh | `app/components/` (`Button`, `IconButton`, `ConfirmationDialog`, `CalenderDialog`, `PullToRefreshIndicator`) and `app/hooks/useScrollRefresh` |
| Validation limits and schemas | `app/utils/validationVariables.ts`, `app/utils/validationSchema.ts` |
| Colours | the semantic tokens in `tailwind.config.js`, never hex |

## Size hotspots

`app/features/recipes/add-recipe/page.tsx` (~730 lines), `app/features/recipes/components/IngredientEditor.tsx` (~570).

## Bug-prone edges

- Drinks versus food (`type` missing means food).
- Dates, "today" and time zones (`toDateKey`, the week grid).
- Optimistic TanStack updates without rollback, or the wrong query key.
- State that should reset per item (`key`).
- Server/client render differences (hydration).
- Debounced saves that lose or duplicate a write.
- Quantities and unit conversion.

## Security sinks

- Mongo: operators smuggled through JSON bodies (`{ "$gt": "" }`), `$where`, `$regex` built from raw
  input (injection and catastrophic backtracking), `new ObjectId(input)` without validation.
- Access: a new API route not wrapped in `withSession`, a server page reading Mongo without
  `requireSession()`, a path added to the public list in `proxy.ts`. Check with catalog entry 13b.
- Server-side requests: any fetch of a user-supplied URL must go through `app/lib/safeFetch.ts`.
- Browser: `dangerouslySetInnerHTML`, user-controlled `href`/`src` (`javascript:` URLs).
- Uploads: size and content type checks in `app/api/upload`.
- Secrets: `HOUSEHOLD_CODE`, `AUTH_SECRET`, `MONGODB_URI` reaching client code or logs.

## Verifier catalog

- Project catalog: `.claude/flow/verifier-catalog.md`
- Log: `.claude/flow/verifier-log.md`
