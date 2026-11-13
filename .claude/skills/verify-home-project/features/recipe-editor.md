# Recipe editor

One form creates and edits recipes and drinks: name, time, persons, source link, image,
categories, ingredients (with optional sections) and description. A recipe can also be imported
from a link and deleted.

## Sub-features

- `editor-create` saves a new recipe with `Gem opskrift`.
- `editor-edit` loads an existing recipe and saves with `Opdater opskrift`.
- `editor-delete` removes a recipe after confirmation (`Slet opskrift`).
- `editor-ingredients` adds rows through the `Ingrediens` field, with `Antal`, `Enhed`, `Note`
  and optional sections (`Sektionsnavn`).
- `editor-import` fills the form from a recipe URL (`Hent igen fra link` → `Hent`).

## How to get to it (user POV)

- `Tilføj opskrift` / `Tilføj drink` on the recipe list.
- `Rediger` on a recipe page.
- `/add-recipe`, `/add-recipe?type=drink`, `/add-recipe?id=<id>`.

## Driving it with openDriver

Preconditions:
- Fixture instance. Use a fresh `--id` for create and delete, so other recipes see clean data.

- **Open empty.** `await app.goto("/add-recipe")`. `page.getByLabel("Navn")` is empty.
- **Edit loads.** `await app.goto("/add-recipe?id=6650000000000000000000a1")`. Wait until an input
  holds `Testlasagne`; the submit button reads `Opdater opskrift`.
- **Create.** Fill `getByLabel("Navn")`, `getByLabel("Tid (minutter)")`, `getByLabel("Antal personer")`,
  add an ingredient through `page.getByLabel("Ingrediens")`, then
  `page.getByRole("button", { name: "Gem opskrift" }).click()`. `app.api("/api/recipe")` contains it.
- **Delete.** On the edit page, `Slet opskrift` and confirm. The recipe is gone from `/api/recipe`.
- **Import.** Needs network to the source site; prefer recorded HTML (see the scrape tests) over
  live sites. `Hent igen fra link` → fill the `https://…` field → `Hent`.
- **Proof.** `app.shot("recipe-editor")` plus `/api/recipe` read back.

## Gotchas

- Edit mode waits for fresh data before it renders the form; wait for the name, not a fixed sleep.
- Import calls the outside world through `safeFetch` (internal addresses are blocked); do not use it
  in proofs that must be repeatable.
- Saving also registers unknown units as new unit types.
