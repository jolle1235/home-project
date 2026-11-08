---
name: solid-check
description: Review a diff against the SOLID principles as they apply to React, Next.js and TypeScript in this repo - one reason to change per component, hook and server module; extension through data and composition rather than edited branches; honest props and variant contracts; narrow props and contexts; UI that depends on hooks and api modules, not on fetch or Mongo. Guards against over-engineering too. Findings only; never edits. Use in the clean stage of `deliver`, or when asked to "check SOLID", "check responsibilities", or "is this well separated?".
---

# SOLID check

SOLID was written for classes. Here it is applied to what this codebase is made of: components,
hooks, server modules, API routes and their types. Read
`.claude/skills/principle-model-the-domain/SKILL.md` and
`.claude/skills/principle-subtract-before-you-add/SKILL.md` first: the cure must never be heavier
than the smell.

## Scope

The same diff as `thermonuclear-review`: `git diff $(git merge-base origin/master HEAD)`, every
changed file read in full. Judge what the diff adds or touches, not the whole codebase.

## The five questions

**S: one reason to change.**
Does a changed component fetch, mutate, format and lay out all at once? Does a hook do two
unrelated jobs? Does an API route shape HTTP responses *and* hold Mongo queries? In this repo, data
lives in `server/*.server.ts`, fetching in `api/*.client.ts`, server state in `hooks/`, pure logic
in `utils/`, and UI in `components/` (see the feature module layout in CLAUDE.md).

**O: extend by adding, not by editing.**
Would the next variant (another recipe type, another store, another unit) mean editing an `if` or
`switch` in several places? Prefer a table or registry the variant is added to (`RECIPE_TYPES`,
`shoppingStores` are the existing pattern), or composition through props and children.

**L: contracts that hold for every variant.**
Does every variant of a component honour the same props contract (`Button` variants, drink versus
food recipe paths)? Does a function accept a type and then silently ignore or throw on part of it?
Then narrow the type or handle the whole of it.

**I: narrow props and contexts.**
Does a component take a whole `Recipe` and use one field? Does a context bundle unrelated values
(`RecipeContext` holds the week plan), so consumers re-render for changes they don't use? Pass what
is used, and split contexts by what changes together. Prefer a TanStack Query hook over a new
context.

**D: depend on the seam, not the machinery.**
Does UI call `fetch` or touch Mongo directly instead of an `api/*.client.ts` function or a query
hook? Does a server module open its own `MongoClient` instead of using `clientPromise`? Does pure
logic import from React or Next?

## Guardrails

- No interface, abstract base or factory for a single implementation. No dependency-injection
  scaffolding. An extra layer must remove more reader load than it adds.
- Don't flag code the diff didn't touch, unless the diff makes its problem worse.
- Duplication, unused code and complexity counts belong to fallow; don't repeat them here.

## Output

Write `.flow/<slug>/reviews/solid.md` (or reply directly when run alone):

```
VERDICT: CLEAN | CHANGES
1. [S|O|L|I|D] [BLOCKER|SHOULD|NIT] path:line - the smell, in one sentence
   Smaller version: the concrete change
   Behaviour-preserving: yes | no (why)
```

Say plainly when the change is well separated. A short `CLEAN` is a good result.
