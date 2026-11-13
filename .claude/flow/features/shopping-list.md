# Shopping list

One shared list. A user adds items, ticks them off while shopping, and sets store, price and notes.
Recipes add their ingredients here too.

## Sub-features

- `list-view` shows the heading `Indkøbsliste` and one row per item.
- `list-add` adds items through the ingredient field at the top.
- `list-tick` ticks an item off (its checkbox) and keeps it on the list.
- `list-details` sets store (`Vælg butik`), `Pris` and `Noter...` on an item.
- `list-persist` keeps every change after a reload.

## How to get to it (user POV)

- The cart icon in the top bar, or `/shoppinglist`.

## Driving it with openDriver

Preconditions:
- Fixture instance: the list holds `mælk` (1 l) and `lime` (3 stk, ticked).

- **View.** `await app.goto("/shoppinglist")`. Heading `Indkøbsliste`; `mælk` and `lime` visible.
- **Add.** Type into `page.getByRole("combobox", { name: "Ingrediens", exact: true })` (one per row, so use `.first()`) (e.g. `2 dl fløde`), then press the `Tilføj 1 til listen` button. Enter only moves focus.
  The row appears and `app.api("/api/shopping-list")` has one more item.
- **Tick.** Click the checkbox of `mælk`. After a short wait the stored item has `marked: true`.
- **Persist.** `page.reload()`; the same rows and ticks are shown.
- **Proof.** `app.shot("shopping-list")` plus the list read back.

## Gotchas

- Known bug at the time of writing: the page logs a hydration mismatch because ingredient-editor
  row ids are time-based (`row-<time>-<n>`); smoke reports it as a problem until it is fixed.
- Saves are debounced; read back after ~2 s.
- Saving also writes each item's category back to the item catalogue.
