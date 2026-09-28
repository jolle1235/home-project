# CLAUDE.md

Personal recipe / meal-plan / shopping-list / drinks PWA. Next.js 16 (App Router, Turbopack in dev), React 19, MongoDB (official driver, no ORM), TanStack Query, Tailwind 3, react-hook-form + Yup. Deployed on Vercel (home-project-weld.vercel.app). User-facing text and toasts are in **Danish**.

## Commands

```bash
npm run dev                 # next dev --turbopack (PWA/service worker disabled in dev)
npm run build && npm start  # needed to test PWA / service worker
npm run lint                # ESLint 9 flat config (eslint.config.mjs)
npm run generate-pwa-icons  # regenerates public/icon/* via sharp
```

There is no test suite. CI (`.github/workflows/lint.yml`) runs `npm ci && npm run lint` on Node 20 only.

Env (`.env.local`, git-ignored): `MONGODB_URI`, `MONGO_DATABASE_NAME`.

## Routing

Pages live under `app/features/<feature>/` and get their public URLs from **rewrites in `next.config.ts`**:

| Public URL | Source |
|---|---|
| `/recipes`, `/recipes/:id` | `features/recipes` |
| `/add-recipe` | `features/recipes/add-recipe` |
| `/shoppinglist` | `features/shoppingList` |
| `/weekPlanner` | `features/weekplanner` |
| `/drinks`, `/drinks/:id` | `features/drinks` |
| `/admin` | `features/admin` |

`/` redirects to `/recipes`. A new feature page needs a matching rewrite pair (`/x` and `/x/:path*`), and usually a `Navbar` entry too.

## Feature module layout

Recent refactors moved code toward this layout. `recipes` and `shoppingList` follow it; use it for new work:

- `page.tsx`: an async server component that calls `server/*.server.ts` directly and passes `initialData` to `client/*PageClient.tsx`
- `server/*.server.ts`: `"use server"` Mongo access via a local `getDb()`; maps `ObjectId` ⇄ string `_id`
- `api/*.client.ts`: `fetch` wrappers for the API routes
- `hooks/`: TanStack Query hooks with optimistic `onMutate` + rollback + `invalidateQueries` (reference: `features/shoppingList/hooks/useShoppinglist.tsx`)
- `components/`, `types/`, `utils/`, `constants.ts` (query keys, API paths)

Older areas (`drinks`, `weekplanner`, `admin`) are still `"use client"` pages that fetch manually or use React context.

## API routes (`app/api/*/route.ts`)

Thin handlers. They delegate to a feature's `server/` module where one exists and return `NextResponse.json(...)`, or `{ error }` with a status code on failure.

- `recipe`, `recipe/[id]`, `drink`, `drink/[id]`: CRUD (DELETE takes `_id` in the JSON body)
- `item`: ingredient item catalogue, search via `?term=`
- `shopping-list`: one document, `listId: "default"`; PUT replaces the whole array. Saving also writes item categories back to `items`.
- `weekPlan`: one document, `type: "weekPlan"`
- `admin/recipeCategories`, `admin/unitTypes`: name-only constants
- `upload` → stores the image buffer in the `images` collection; served by `images/[id]`
- `scrape`: fetches a URL and extracts the JSON-LD `Recipe` with cheerio; `features/recipes/utils/mummumRecipeConvertion.ts` maps it to a `Recipe`

## Data layer

- `app/lib/mongodb.ts` exports a shared `clientPromise`, cached on `global` in dev. Always reuse it. (`upload` and `images/[id]` still open their own `MongoClient`, which is legacy.)
- Collections: `recipes`, `items`, `shoppingList`, `weekPlan`, `drinks`, `images`, `recipeCategories`, `unitTypes`.
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
- **Imports:** a mix of relative paths and the `@/*` alias. The alias maps to the repo root, so write `@/app/...`.

## Gotchas

- `app/utils/middleware.ts` (CORS) is **not active**: Next only loads middleware/proxy from the project root.
- The PWA uses `next-pwa` (see `runtimeCaching` in `next.config.ts`). `public/sw.js` and `public/workbox-*.js` are build output; don't hand-edit them.
- The README and PWA_README describe IndexedDB offline sync, but no IndexedDB code exists. Offline support is only service-worker caching.
- `api/ingredient/route.ts` uses collection `"Items"` (capital I), while everything else uses `"items"`.
- `app/utils/apiHelperFunctions.ts` starts with a `"use cliet"` typo, so the directive does nothing.
- `getRecipes()` caps results at 50.
- Unused dependencies: MUI/emotion, react-dnd, amqplib, next-connect, multer. Don't build on them without asking.
