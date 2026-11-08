# Browse recipes

The start page lists recipe cards. A user switches between food, drinks and all, searches and
filters, opens a recipe, or adds it to the meal plan for one or more of the next 21 days.

## Sub-features

- `browse-list` shows a card per recipe with name, time and persons.
- `browse-kind` switches between `Mad`, `Drinks` and `Alle`; the heading reads `Opskrifter` or `Drinks`.
- `browse-search` narrows the cards by name.
- `browse-plan` adds a recipe to chosen dates through the `Vælg datoer` dialog.
- `browse-open` opens the recipe detail.

## How to get to it (user POV)

- Open the app (`/` redirects to `/recipes`) or tap the book icon in the top bar.
- `/drinks` redirects to `/recipes?type=drink`.

## Driving it with openDriver

Preconditions:
- Fixture instance, doctor green.

- **List.** `await app.goto("/recipes")`. The heading `Opskrifter` is visible and
  `page.locator("article h2", { hasText: "Testlasagne" })` is visible.
- **Drinks.** `await app.goto("/recipes?type=drink")`. The heading reads `Drinks` and `Testmojito`
  is the only card.
- **Search.** `await page.getByLabel("Søg efter opskrifter").fill("salat")`. Only
  `Testsalat med kylling` remains.
- **Add to meal plan.** `await page.getByRole("button", { name: /Tilføj til madplan/ }).first().click()`,
  then pick a date with `page.locator("div.fixed.inset-0 div.overflow-y-auto button").nth(2).click()`
  (positional: the dates have no stable names) and `page.getByRole("button", { name: "Færdig" }).click()`.
  `app.api("/api/weekPlan")` then holds an entry for that recipe dated two days from today, in
  local time (`YYYY-MM-DD`).
- **Open.** `await page.getByRole("button", { name: /Se opskrift/ }).first().click()`. The URL
  becomes `/recipes/<id>`.
- **Proof.** `await app.shot("recipes-browse")` and the week plan read back.

## Gotchas

- `Færdig` stays disabled until a date is selected.
- The dialog lists 21 days starting today; "today" is the browser's local date. It builds that
  list itself and ignores its `availableDates` prop (28 days from `RecipeContext`): a known
  follow-up, found by `merge-verdict` on 2026-11-08.
- Cards are server-rendered; the first visit after start-up is warm already (verify:up warms routes).
