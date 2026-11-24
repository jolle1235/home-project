# Shopping list

One shared list. A user adds items, ticks them off while shopping, and sets store, price and notes.
Recipes add their ingredients here too.

## Sub-features

- `list-view` shows the heading `Indkøbsliste` and one row per item.
- `list-add` adds items through the ingredient field at the top.
- `list-tick` ticks an item off (its checkbox) and keeps it on the list.
- `list-details` sets store (`Vælg butik`), `Pris` and `Noter...` on an item. Each row's fields are named
  after the item: `Købt: <vare>` (checkbox), `Antal: <vare>`, `Butik: <vare>`, `Pris: <vare>`, `Note: <vare>`;
  the category button is `Kategori: <navn>` (or `Vælg kategori`).
- `list-clear-marked` `Fjern markerede` (shown while something is ticked) removes the ticked rows at once
  and toasts "<n> varer fjernet" ("1 vare fjernet") with `Fortryd` for 5 s; `Fortryd` puts the rows back
  where they were (screen and stored).
- `list-clear` `Tøm listen` opens the dialog "Tøm indkøbslisten?" ("Alle <n> varer fjernes for alle i
  husstanden. Det kan ikke fortrydes."), red `Tøm listen` and `Behold listen`; nothing is emptied until confirmed.
- `list-persist` keeps every change after a reload.
- `list-save-error` a failed save puts the change back and says "Kunne ikke gemme indkøbslisten – prøv igen".

## How to get to it (user POV)

- The cart icon in the top bar, or `/shoppinglist`.

## Driving it with openDriver

Preconditions:
- Fixture instance: the list holds `mælk` (1 l) and `lime` (3 stk, ticked).

- **View.** `await app.goto("/shoppinglist")`. Heading `Indkøbsliste`; `mælk` and `lime` visible.
- **Add.** Type into `page.getByRole("combobox", { name: "Ingrediens", exact: true })` (one per row, so use `.first()`) (e.g. `2 dl fløde`), then press the `Tilføj 1 til listen` button. Enter only moves focus.
  The row appears and `app.api("/api/shopping-list")` has one more item.
- **Tick.** Click `page.getByRole("checkbox", { name: "Købt: mælk" })`. After a short wait the stored item has `marked: true`.
- **Fjern markerede.** `page.getByRole("button", { name: "Fjern markerede" })`; the toast has
  `page.getByRole("button", { name: "Fortryd" })` (tap within 5 s). Read the list back after ~2 s.
- **Tøm listen.** `page.getByRole("button", { name: "Tøm listen" })` opens
  `page.getByRole("dialog", { name: "Tøm indkøbslisten?" })`; its own `Tøm listen` button empties the list.
- **Persist.** `page.reload()`; the same rows and ticks are shown.
- **Proof.** `app.shot("shopping-list")` plus the list read back.

## Gotchas

- Known bug at the time of writing: the page logs a hydration mismatch because ingredient-editor
  row ids are time-based (`row-<time>-<n>`); smoke reports it as a problem until it is fixed.
- Saves are debounced and run one at a time in tap order; read back after ~2 s.
- Adding from a recipe waits for the stored list first; the "N ingredienser tilføjet" toast shows after saving.
- Pull-to-refresh does nothing while a save is pending.
- Saving also writes each item's category back to the item catalogue.
