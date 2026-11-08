# Week planner

Shows the rest of this week and the next two full weeks as day cards. Each card lists the recipes
planned for that day; a recipe can be opened or removed.

## Sub-features

- `plan-grid` shows day cards from today (the rest of this week plus 14 days).
- `plan-entries` shows planned recipes on their local day.
- `plan-remove` removes an entry with its `×` button.
- `plan-open` opens the recipe with `Opskrift`.

## How to get to it (user POV)

- The calendar icon in the top bar, or `/weekPlanner`.
- Recipes are planned from the recipe list (`Tilføj til madplan`).

## Driving it with openDriver

Preconditions:
- Fixture instance: `Testlasagne` is planned today, `Testsalat med kylling` in two days.

- **Grid.** `await app.goto("/weekPlanner")`. Heading `Madplan`; the first day card heading equals
  today in `da-DK` short form (`new Date().toLocaleDateString("da-DK", { weekday: "short", month: "short", day: "numeric" })`).
  Card count = days left in this week (Sunday = 1) + 14.
- **Entries.** The first card contains `Testlasagne`; the card two days later contains
  `Testsalat med kylling`.
- **Remove.** Click the `×` in the `Testlasagne` row. `app.api("/api/weekPlan")` no longer has it.
- **Open.** Click `Opskrift` in a row → `/recipes/<id>`.
- **Proof.** `app.shot("week-planner")` plus the week plan read back.

## Gotchas

- Dates are stored as local `YYYY-MM-DD`; tests around midnight or in another time zone should set
  the browser's `timezoneId` explicitly.
- The server renders an empty grid; the days appear after hydration. Wait for a day card.
