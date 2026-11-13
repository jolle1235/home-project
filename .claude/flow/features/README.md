# Feature map: home-project

The maintained source for verifying what a user of the recipe app can do. Read this index before
driving, then use the matching feature file as the recipe. Launch, doctor and cleanup are in
profile → Verify (`../profile.md`); the rules for driving are in the shared `verify` skill.

## Baseline preconditions

- An instance started by this run: `npm run verify:up -- --id <id>` (fixtures unless stated).
- `npm run verify:doctor -- <id>` passes.
- Drives use `openDriver({ id })` from `scripts/verify/driver.mjs`; `page` below is its Playwright page.
  The app is behind a household code: `openDriver` logs in with the instance's test code
  (`verify-household-code`, see `instance.json`); `openDriver({ id, login: false })` is an anonymous
  visitor. `app.api()` sends the session cookie.
- Fixture recipes: `Testlasagne` (food, sections, image), `Testsalat med kylling` (food),
  `Testmojito` (drink). Ids are in `scripts/verify/fixtures/README.md`.

## Driving conventions

- Start every recipe from a freshly seeded instance unless its preconditions say otherwise. A
  mutation changes the instance for later recipes; start a new `--id` when that matters.
- Prefer roles, labels, placeholders and the visible Danish text named here.
- Read saved state back through the API (`app.api("/api/...")`), not only from the screen.

## Proof and skip reporting

- Proof = a screenshot via `app.shot(name)` plus the state read back, with an empty `problems` list.
- Report an unreachable path with the step that failed and the unmet precondition. Do not report a
  skipped entry point as verified through another one.
- Only fixture runs may be quoted on GitHub (public repo).

## Feature entry contract

Each feature file has an H1, one paragraph on the user-visible behaviour, then exactly these H2
sections in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with openDriver`,
`Gotchas`. No implementation details: user paths, handles, required state and observable proof only.

## Features

- [Login](./login.md): the household code, staying logged in, what an anonymous visitor gets.

- [Browse recipes](./recipes-browse.md): list, food / drinks / all, search, filters, add to meal plan.
- [Recipe detail](./recipe-detail.md): person stepper, ingredient ticks, add to shopping list, edit link.
- [Recipe editor](./recipe-editor.md): create, edit, delete, import from a link, ingredient editor.
- [Shopping list](./shopping-list.md): add items, tick off, store, price, notes, persistence.
- [Week planner](./week-planner.md): the next weeks' grid, planned recipes, remove, open recipe.
- [Admin](./admin.md): recipe categories and unit types.
