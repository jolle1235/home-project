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
                                #   --mode prod: next build + start; --env KEY=VALUE: override env (KEY= sets it empty)
npm run verify:snapshot         # read-only copy of production into .verify/snapshot (gitignored, never commit)
```

To prove a change on the real app, use the shared `verify` skill; this repo's harness, commands and gotchas are in `.claude/flow/profile.md` → Verify, and the user paths per feature in `.claude/flow/features/`. It never touches Atlas: instances run from a git worktree without `.env` files against an in-memory MongoDB seeded from `scripts/verify/fixtures/` (synthetic) or the local snapshot. The repo is public, so only fixture runs may be quoted on GitHub.

Tests cover only pure logic (ingredient parsing, recipe scraping, text tidying, safeFetch). CI (`.github/workflows/lint.yml`) runs `npm ci`, `npm run lint`, `npm test` and `fallow audit` on Node 20.

Env (`.env.local`, git-ignored): `MONGODB_URI`, `MONGO_DATABASE_NAME`, `HOUSEHOLD_CODE` (≥12 characters), `AUTH_SECRET` (≥32). Without the last two the app stays locked; see **Login**.

## Routing

Pages live under `app/features/<feature>/` and get their public URLs from **rewrites in `next.config.ts`**:

| Public URL | Source |
|---|---|
| `/recipes`, `/recipes/:id` | `features/recipes` |
| `/add-recipe` | `features/recipes/add-recipe` |
| `/shoppinglist` | `features/shoppingList` |
| `/weekPlanner` | `features/weekplanner` |
| `/admin` | `features/admin` |
| `/login` | `app/login` (outside `features`, so it renders without the app shell) |

`/` redirects to `/recipes`. A new feature page needs a matching rewrite pair (`/x` and `/x/:path*`), and usually a `Navbar` entry too.

## Feature module layout

Recent refactors moved code toward this layout. `recipes` and `shoppingList` follow it; use it for new work:

- `page.tsx`: an async server component that calls `server/*.server.ts` directly and passes `initialData` to `client/*PageClient.tsx`
- `server/*.server.ts`: Mongo access via a local `getDb()`; maps `ObjectId` ⇄ string `_id`. No `"use server"`: only server code imports these, and a `"use server"` module would be callable from the browser past the route checks
- `api/*.client.ts`: `fetch` wrappers for the API routes
- `hooks/`: TanStack Query hooks with optimistic `onMutate` + rollback + `invalidateQueries` (reference: `features/shoppingList/hooks/useShoppinglist.tsx`)
- `components/`, `types/`, `utils/`, `constants.ts` (query keys, API paths)

Older areas (`weekplanner`, `admin`) are still `"use client"` pages that fetch manually or use React context.

## API routes (`app/api/*/route.ts`)

Thin handlers. They delegate to a feature's `server/` module where one exists and return `NextResponse.json(...)`, or `{ error }` with a status code on failure. Every handler is exported wrapped in `withSession(...)` (`app/lib/auth.ts`), except `api/login`.

- `recipe`, `recipe/[id]`: CRUD (DELETE takes `_id` in the JSON body)
- `item`: ingredient item catalogue, search via `?term=`
- `shopping-list`: one document, `listId: "default"`; PUT replaces the whole array. Saving also writes item categories back to `items`.
- `weekPlan`: one document, `type: "weekPlan"`
- `admin/recipeCategories`, `admin/unitTypes`: name-only constants
- `upload` → stores the image buffer in the `images` collection; served by `images/[id]`. Also accepts JSON `{ url }` to copy a remote image (used for imported recipe images)
- `scrape`: imports a recipe from any URL via `features/recipes/server/scrape/`: extractor chain (site adapters → JSON-LD → microdata → OpenGraph) using cheerio, fetched through `app/lib/safeFetch.ts` (blocks internal addresses). `features/recipes/utils/recipeDraft.ts` turns the result into form state. To support a site without schema.org data, add an entry to `siteAdapters.ts`

## Data layer

- `app/lib/mongodb.ts` exports a shared `clientPromise`, cached on `global` in dev. Always reuse it.
- Collections: `recipes`, `items`, `shoppingList`, `weekPlan`, `images`, `recipeCategories`, `unitTypes`. Drinks are recipes with `type: "drink"` (missing `type` = food); `/drinks` and `/drinks/*` redirect to the drinks view of `/recipes` (see `redirects` in `next.config.ts`).
- Shared models: `app/model/` (`Item`, `Ingredient`, `Constant`). Feature types: `features/*/types/`. `_id` is always a string on the client.

## Global state

`app/features/layout.tsx` nests `ReactQueryProvider` → `RecipeProvider` → `ConstantsProvider` → `NavBar` + page for every feature page. `app/layout.tsx` only holds the document, toasts and the service-worker script, so `/login` (in `app/login`) gets no shell and makes no API calls.

- `ReactQueryProvider`: staleTime 5 min, gcTime 30 min, no refetch on focus, retry 1
- `RecipeProvider` (`context/RecipeContext.tsx`): despite its name, it holds the **week plan**
- `ConstantsProvider`: recipe categories and unit types

Prefer TanStack Query hooks over adding new contexts.

## Conventions

- **Avoid unnecessary `useEffect`** (`.cursor/rules/no-unnecessary-effects.mdc`). Use effects only to sync with external systems. Derive values inline or with `useMemo`, put logic in event handlers, reset state with `key`, and fetch with TanStack Query. Lint enforces this through `eslint-plugin-react-you-might-not-need-an-effect` and React Hooks `set-state-in-effect`.
- **Styling:** Tailwind with the semantic color tokens from `tailwind.config.js` (`background`, `foreground`, `primary`, `secondary`, `surface`, `soft`, `danger`, `muted`, each with a `-hover` variant where defined). They are backed by CSS variables in `app/globals.css`. Don't hard-code hex values. Icons come from `lucide-react`.
- **UI is mobile-first** (PWA, pull-to-refresh via `hooks/useScrollRefresh` + `components/PullToRefreshIndicator`). For design work, use the shared `ui-design-expert` skill.
- **Validation:** limits live in `app/utils/validationVariables.ts` and Yup schemas in `app/utils/validationSchema.ts`.
- **Ingredient input:** recipes (incl. drinks) and the shopping list both use `features/recipes/components/IngredientEditor.tsx`, which works on editor rows (`utils/ingredientRows.ts`: `rowsToIngredients` / `ingredientsToRows`). Pass `allowSections={false}` where sections and reordering make no sense.
- **Imports:** a mix of relative paths and the `@/*` alias. The alias maps to the repo root, so write `@/app/...`.

## Login (household code)

The whole app is behind one shared code; there are no user accounts. Two layers refuse anything without a valid session:

1. `proxy.ts` (Next 16's middleware) runs on every request except static files (its `matcher`). Only `/login` and `/api/login` are public; other pages redirect to `/login?next=…`, `/api/*` and `/_next/*` answer 401.
2. Next to the data: every API handler is wrapped in `withSession`, and server pages that read Mongo call `requireSession()` (both in `app/lib/auth.ts`).

The session is a stateless signed cookie (`hp_session`, `app/lib/session.ts`): HMAC with `AUTH_SECRET` over its expiry and a hash of the code, valid 365 days. Changing `HOUSEHOLD_CODE` logs every device out. If either env var is missing or too short, nothing is accepted (fail closed).

- **Deploying:** set `HOUSEHOLD_CODE` and `AUTH_SECRET` on Vercel for Production *and* Preview; a new value takes effect after a redeploy. Pick a long code: the 1-second delay on wrong codes doesn't stop parallel guessing.
- **New API route:** export its handlers through `withSession`. **New server page that reads Mongo:** call `requireSession()` first. Client pages are covered by their API routes.
- **Images** are served unoptimized (`images.unoptimized` in `next.config.ts`): Next's optimizer fetches its source without the user's cookie, so the browser loads `/api/images/<id>` itself (cached a year, privately).
- On iOS an installed PWA keeps its own cookies: the code is entered once in Safari and once in the app.

## Task flow

For any task to be done end to end (bug, refactor, feature, chore), use the `deliver` skill: `deliver "<task>"`, `deliver resume <slug>`. It runs these stages, each its own skill. The flow skills are shared with other projects: they come from the private repo `jolle1235/agent-skills` (its README covers install and update), installed into `.claude/skills/` and pinned in `skills-lock.json`. Change them there, not here, then `npx skills update -p -y`. What is specific to this repo lives only in `.claude/flow/` (no project skills): `profile.md` (how the app works, stack, commands, gates, conventions, canonical homes, review focus), `features/` (the feature map) and `verifier-notes.md` (proof recipes, task log, lessons from earlier sessions). Every stage reads them. To refresh the feature map and harness after app changes, run `/update-verify`.

1. `scope-task`: a brief with observable expected behaviour; asks only behaviour questions, showing what the app does today.
2. A plan, with `find-verifier` when the proof isn't obvious (this repo's recipes and lessons: `.claude/flow/verifier-notes.md`).
3. `plan-critique`: a fresh agent critiques the plan. 4. The user approves.
5. `before-after`: the same check on the base commit (red) and the change (green), on `verify` instances.
6. Clean: tsc, ESLint, tests and fallow, then `/simplify`, then `thermonuclear-review` and `solid-check` in parallel.
7. `commit`. 8. A PR (proof from fixture runs only). 9. `merge-verdict`: bugs, security and intent reviewers; READY, FIX (routed back to stage 1, 5 or 6, max 3 rounds) or HUMAN.

The flow stops at READY; only the user decides to merge. Run state lives in `.flow/<slug>/` (gitignored) and is mirrored in the PR body and verdict comments.

## Commits (fallow gate)

Every commit runs `fallow audit` (`.githooks/pre-commit`, enabled by `npm install` via the `prepare` script; config in `.fallowrc.jsonc`). For Claude, `.claude/hooks/fallow-gate.sh` also blocks `git commit` / `git push` while the audit fails, and CI runs it again.

- **When asked to commit, use the `commit` skill** (shared; its gate commands are in `.claude/flow/profile.md` → Commit). It runs the gate first and fixes failures using the `fallow` skill (installed from fallow-rs/fallow-skills). `deliver` calls it in stage 7.
- Dead code and duplication must be **0** in changed files (duplication threshold is 0). Pre-existing complexity is frozen in `.fallow-health-baseline.json`; only new over-threshold functions fail.
- Never use `--no-verify`, never edit the hooks or loosen `.fallowrc.jsonc` to get through, and never regenerate the health baseline to hide new complexity. Ask the user before adding a `fallow-ignore` suppression, and always state the reason in it.

## Gotchas

- The PWA uses `next-pwa` (see `runtimeCaching` in `next.config.ts`). `public/sw.js` and `public/workbox-*.js` are build output; don't hand-edit them.
- The README and PWA_README describe IndexedDB offline sync, but no IndexedDB code exists. Offline support is only service-worker caching.
- `app/utils/apiHelperFunctions.ts` starts with a `"use cliet"` typo, so the directive does nothing.
- `getRecipes()` caps results at 50.
- A production build (`npm run build && npm start`, or `verify:up --mode prod`) logs 404s for `/_vercel/speed-insights/script.js` locally; only Vercel serves it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
