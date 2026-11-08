---
name: thermonuclear-review
description: Uncompromising structural review of a diff in this repo - hunts for the restructuring that makes the change smaller, special cases bolted onto existing flows, files and components that sprawl, layers that only pass things through, loose types, and logic outside its canonical home. Findings only; never edits. Use in the clean stage of `deliver`, or when asked for a "thermonuclear", "deep", "strict" or "structural" review of a branch or diff.
---

# Thermonuclear review

Correctness is checked elsewhere (`before-after`, `merge-verdict`), and fallow already counts
duplication, unused code and complexity. This review is for judgment: is this the simplest shape
the change could have had, and does it leave the codebase easier to read than it found it?

Read `.claude/skills/principle-minimize-reader-load/SKILL.md` and
`.claude/skills/principle-subtract-before-you-add/SKILL.md` first.

## Scope

The diff from the merge base, including uncommitted work:
`git diff $(git merge-base origin/master HEAD)`. Read every changed file in full, not just the
hunks, and the callers of every changed export (`grep -rn "<name>" app`).

## What to look for, in priority order

1. **The move that deletes code.** Can the change be reframed so branches, flags, helpers or a
   whole layer disappear? Look for a data shape that makes the special case the normal case (a map
   instead of an `if` chain, one derived value instead of two synced states). Moving complexity to
   another file is not a simplification.
2. **Special cases in existing flows.** A new boolean prop, an `if (type === ...)` in a shared
   component, an early return for one caller, a second flag that must stay in sync with the
   first. Each one is a design problem. Name the structure that would absorb it.
3. **Sprawl.** A component past ~150 lines doing several jobs, a file growing past ~500 lines
   (`add-recipe/page.tsx` is already 729, `IngredientEditor.tsx` 570: changes there should shrink
   them or extract, not add). Split by responsibility, not by line count.
4. **Layers that only pass things through.** Wrappers with one caller, props threaded through
   components that don't use them, a context or hook that just renames another. Inline them.
5. **Types and boundaries.** `any`, `as` casts, optional fields that are never actually optional,
   API JSON used without a type, `_id` mixing `ObjectId` and `string` outside the `server/` mapping.
   Parse at the boundary, trust the types inside.
6. **Canonical homes.** New code that re-derives something one of these already owns is a blocker:

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
   | Fetching a recipe | `app/features/recipes/api/recipe.client.ts` → `fetchRecipe` |
   | Query keys | `SHOPPING_LIST_QUERY_KEY` (`features/shoppingList/constants.ts`), `["recipes"]`, `["recipe", id]`, `["weekPlan"]`, `["constants"]` |
   | Buttons, dialogs, pull-to-refresh | `app/components/` (`Button`, `IconButton`, `ConfirmationDialog`, `CalenderDialog`, `PullToRefreshIndicator`) and `app/hooks/useScrollRefresh` |
   | Validation limits and schemas | `app/utils/validationVariables.ts`, `app/utils/validationSchema.ts` |
   | Colours | the semantic tokens in `tailwind.config.js`, never hex |

7. **React and Next in this repo.** Effects only for external systems (CLAUDE.md); derive instead
   of syncing state; reset with `key`; TanStack Query for server state with the keys above;
   server components for initial data in the feature layout; Danish user-facing text.
8. **Leftovers.** `console.log`, commented-out code, TODOs with no follow-up, debug flags,
   temporary instrumentation from a verifier.

## Output

Write `.flow/<slug>/reviews/thermonuclear.md` (or reply directly when run alone):

```
VERDICT: CLEAN | CHANGES
1. [BLOCKER|SHOULD|NIT] path:line - what is wrong
   Smaller version: the concrete rewrite (a sketch, not prose)
   Behaviour-preserving: yes | no (why)
```

- Few, high-conviction findings beat many small ones. "Rename this" is not a finding when the
  real issue is structural.
- Approve (`CLEAN`) only when there is no unexploited simplification, no special-case growth, no
  sprawl the diff caused, no pass-through layer, and nothing re-derived from a canonical home.
  Say plainly when the change is fine.
- Behaviour-preserving findings are applied by the caller; the rest go to the user or the PR's
  follow-ups.
