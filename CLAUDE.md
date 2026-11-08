# CLAUDE.md

Personal recipe / meal-plan / shopping-list PWA (drinks are recipes too). Next.js 16 (App Router, Turbopack in dev), React 19, MongoDB (official driver, no ORM), TanStack Query, Tailwind 3, react-hook-form + Yup. Deployed on Vercel (home-project-weld.vercel.app). User-facing text and toasts are in **Danish**.

## Commands

```bash
npm run dev                 # next dev --turbopack (PWA/service worker disabled in dev)
npm run build && npm start  # needed to test PWA / service worker
npm run lint                # ESLint 9 flat config (eslint.config.mjs)
npm run generate-pwa-icons  # regenerates public/icon/* via sharp
npm test                    # vitest: unit tests for pure utils (app/**/*.test.ts)
npx fallow audit --base master  # the commit gate: dead code, duplication, new complexity
npm run verify:up -- --id <id>  # isolated app instance (worktree + in-memory Mongo); then verify:doctor / verify:smoke / verify:down
npm run verify:snapshot         # read-only copy of production into .verify/snapshot (gitignored, never commit)
```

To prove a change on the real app, use the `verify-home-project` skill (`.claude/skills/verify-home-project/`). It never touches Atlas: instances run from a git worktree without `.env` files against an in-memory MongoDB seeded from `scripts/verify/fixtures/` (synthetic) or the local snapshot. The repo is public, so only fixture runs may be quoted on GitHub.

Tests cover only pure logic (ingredient parsing, recipe scraping, text tidying, safeFetch). CI (`.github/workflows/lint.yml`) runs `npm ci`, `npm run lint`, `npm test` and `fallow audit` on Node 20.

Env (`.env.local`, git-ignored): `MONGODB_URI`, `MONGO_DATABASE_NAME`.

## Routing

Pages live under `app/features/<feature>/` and get their public URLs from **rewrites in `next.config.ts`**:

| Public URL | Source |
|---|---|
| `/recipes`, `/recipes/:id` | `features/recipes` |
| `/add-recipe` | `features/recipes/add-recipe` |
| `/shoppinglist` | `features/shoppingList` |
| `/weekPlanner` | `features/weekplanner` |
| `/admin` | `features/admin` |

`/` redirects to `/recipes`. A new feature page needs a matching rewrite pair (`/x` and `/x/:path*`), and usually a `Navbar` entry too.

## Feature module layout

Recent refactors moved code toward this layout. `recipes` and `shoppingList` follow it; use it for new work:

- `page.tsx`: an async server component that calls `server/*.server.ts` directly and passes `initialData` to `client/*PageClient.tsx`
- `server/*.server.ts`: `"use server"` Mongo access via a local `getDb()`; maps `ObjectId` ⇄ string `_id`
- `api/*.client.ts`: `fetch` wrappers for the API routes
- `hooks/`: TanStack Query hooks with optimistic `onMutate` + rollback + `invalidateQueries` (reference: `features/shoppingList/hooks/useShoppinglist.tsx`)
- `components/`, `types/`, `utils/`, `constants.ts` (query keys, API paths)

Older areas (`weekplanner`, `admin`) are still `"use client"` pages that fetch manually or use React context.

## API routes (`app/api/*/route.ts`)

Thin handlers. They delegate to a feature's `server/` module where one exists and return `NextResponse.json(...)`, or `{ error }` with a status code on failure.

- `recipe`, `recipe/[id]`: CRUD (DELETE takes `_id` in the JSON body)
- `item`: ingredient item catalogue, search via `?term=`
- `shopping-list`: one document, `listId: "default"`; PUT replaces the whole array. Saving also writes item categories back to `items`.
- `weekPlan`: one document, `type: "weekPlan"`
- `admin/recipeCategories`, `admin/unitTypes`: name-only constants
- `upload` → stores the image buffer in the `images` collection; served by `images/[id]`. Also accepts JSON `{ url }` to copy a remote image (used for imported recipe images)
- `scrape`: imports a recipe from any URL via `features/recipes/server/scrape/`: extractor chain (site adapters → JSON-LD → microdata → OpenGraph) using cheerio, fetched through `app/lib/safeFetch.ts` (blocks internal addresses). `features/recipes/utils/recipeDraft.ts` turns the result into form state. To support a site without schema.org data, add an entry to `siteAdapters.ts`

## Data layer

- `app/lib/mongodb.ts` exports a shared `clientPromise`, cached on `global` in dev. Always reuse it. (`images/[id]` still opens its own `MongoClient`, which is legacy.)
- Collections: `recipes`, `items`, `shoppingList`, `weekPlan`, `images`, `recipeCategories`, `unitTypes`. Drinks are recipes with `type: "drink"` (missing `type` = food); `/drinks` and `/drinks/*` redirect to the drinks view of `/recipes` (see `redirects` in `next.config.ts`).
- Shared models: `app/model/` (`Item`, `Ingredient`, `Constant`). Feature types: `features/*/types/`. `_id` is always a string on the client.

## Global state

`app/layout.tsx` nests `ReactQueryProvider` → `RecipeProvider` → `ConstantsProvider` → `NavBar` + page.

- `ReactQueryProvider`: staleTime 5 min, gcTime 30 min, no refetch on focus, retry 1
- `RecipeProvider` (`context/RecipeContext.tsx`): despite its name, it holds the **week plan**
- `ConstantsProvider`: recipe categories and unit types

Prefer TanStack Query hooks over adding new contexts.

## Conventions

- **Avoid unnecessary `useEffect`** (`.cursor/rules/no-unnecessary-effects.mdc`). Use effects only to sync with external systems. Derive values inline or with `useMemo`, put logic in event handlers, reset state with `key`, and fetch with TanStack Query. Lint enforces this through `eslint-plugin-react-you-might-not-need-an-effect` and React Hooks `set-state-in-effect`.
- **Styling:** Tailwind with the semantic color tokens from `tailwind.config.js` (`background`, `foreground`, `primary`, `secondary`, `surface`, `soft`, `danger`, `muted`, each with a `-hover` variant where defined). They are backed by CSS variables in `app/globals.css`. Don't hard-code hex values. Icons come from `lucide-react`.
- **UI is mobile-first** (PWA, pull-to-refresh via `hooks/useScrollRefresh` + `components/PullToRefreshIndicator`). For design work, see `.agents/skills/ui-design-expert/SKILL.md`.
- **Validation:** limits live in `app/utils/validationVariables.ts` and Yup schemas in `app/utils/validationSchema.ts`.
- **Ingredient input:** recipes (incl. drinks) and the shopping list both use `features/recipes/components/IngredientEditor.tsx`, which works on editor rows (`utils/ingredientRows.ts`: `rowsToIngredients` / `ingredientsToRows`). Pass `allowSections={false}` where sections and reordering make no sense.
- **Imports:** a mix of relative paths and the `@/*` alias. The alias maps to the repo root, so write `@/app/...`.

## Task flow

For any task to be done end to end (bug, refactor, feature, chore), use the `deliver` skill: `deliver "<task>"`, `deliver resume <slug>`. It runs these stages, each its own skill in `.claude/skills/`:

1. `scope-task`: a brief with observable expected behaviour; asks only behaviour questions, showing what the app does today.
2. A plan, with `find-verifier` when the proof isn't obvious (its catalog and log live in `find-verifier/references/`).
3. `plan-critique`: a fresh agent critiques the plan. 4. The user approves.
5. `before-after`: the same check on the base commit (red) and the change (green), on `verify-home-project` instances.
6. Clean: tsc, ESLint, tests and fallow, then `/simplify`, then `thermonuclear-review` and `solid-check` in parallel.
7. `commit`. 8. A PR (proof from fixture runs only). 9. `merge-verdict`: bugs, security and intent reviewers; READY, FIX (routed back to stage 1, 5 or 6, max 3 rounds) or HUMAN.

The flow stops at READY; only the user decides to merge. Run state lives in `.flow/<slug>/` (gitignored) and is mirrored in the PR body and verdict comments.

## Commits (fallow gate)

Every commit runs `fallow audit` (`.githooks/pre-commit`, enabled by `npm install` via the `prepare` script; config in `.fallowrc.jsonc`). For Claude, `.claude/hooks/fallow-gate.sh` also blocks `git commit` / `git push` while the audit fails, and CI runs it again.

- **When asked to commit, use the `commit` skill** (`.claude/skills/commit/`). It runs the gate first and fixes failures using the vendored `fallow` skill. `deliver` calls it in stage 7.
- Dead code and duplication must be **0** in changed files (duplication threshold is 0). Pre-existing complexity is frozen in `.fallow-health-baseline.json`; only new over-threshold functions fail.
- Never use `--no-verify`, never edit the hooks or loosen `.fallowrc.jsonc` to get through, and never regenerate the health baseline to hide new complexity. Ask the user before adding a `fallow-ignore` suppression, and always state the reason in it.

## Gotchas

- The PWA uses `next-pwa` (see `runtimeCaching` in `next.config.ts`). `public/sw.js` and `public/workbox-*.js` are build output; don't hand-edit them.
- The README and PWA_README describe IndexedDB offline sync, but no IndexedDB code exists. Offline support is only service-worker caching.
- `app/utils/apiHelperFunctions.ts` starts with a `"use cliet"` typo, so the directive does nothing.
- `getRecipes()` caps results at 50.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
