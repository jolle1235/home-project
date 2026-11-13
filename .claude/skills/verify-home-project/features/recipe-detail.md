# Recipe detail

A recipe page shows the image, time, persons, ingredients grouped by section, and the description.
The user scales the recipe for more or fewer persons, unticks ingredients they already have, and
adds the rest to the shopping list with scaled amounts.

## Sub-features

- `detail-view` shows name, time, persons, sections, ingredients and description.
- `detail-scale` changes persons with the − / + stepper and rescales every amount.
- `detail-tick` starts with every ingredient ticked; unticking removes it from the next add.
- `detail-add` adds the ticked ingredients to the shopping list and shows a toast.
- `detail-edit` opens the editor through `Rediger`; `Tilbage` returns to the list.

## How to get to it (user POV)

- Tap `Se opskrift` on a card in the recipe list.
- Open `/recipes/<id>` directly.

## Driving it with openDriver

Preconditions:
- Fixture instance; `Testlasagne` is `/recipes/6650000000000000000000a1` (4 persons, 6 ingredients).

- **View.** `await app.goto("/recipes/6650000000000000000000a1")`. Headings `Testlasagne` and
  `Ingredienser` are visible; section headings `Kødsovs` and `Bechamel` are shown.
- **Scale.** The stepper buttons have no names: use
  `page.locator("div.inline-flex.items-center.rounded-xl button").last().click()` for +.
  `4 personer` becomes `5 personer` and `500.0 g` becomes `625.0 g`.
- **Tick.** `page.locator('input[type="checkbox"]')` has 6 boxes, all checked. Uncheck the first.
- **Add.** `await page.getByRole("button", { name: "Tilføj valgte til indkøbslisten" }).click()`.
  A toast `5 ingredienser tilføjet til indkøbslisten` appears. After ~2.5 s,
  `app.api("/api/shopping-list")` has 5 more items.
- **Nothing ticked.** Uncheck all and press the button: the toast `Vælg mindst én ingrediens.`
  appears, nothing is saved, and the button stays enabled.
- **Edit.** `page.getByRole("button", { name: "Rediger" }).click()` → `/add-recipe?id=<id>`.
- **Proof.** `app.shot("recipe-detail")` plus the shopping list read back.

## Gotchas

- The shopping list save is debounced; read it back after a short wait.
- Amounts are shown with one decimal (`500.0 g`); compare text, not numbers.
- An ingredient without an amount is added as `1 stk`.
