# Admin

Maintains the two name lists the app offers in pickers: recipe categories and unit types.

## Sub-features

- `admin-categories` lists, adds and deletes recipe categories.
- `admin-units` lists, adds and deletes unit types.

## How to get to it (user POV)

- The shield icon in the top bar, or `/admin`.

## Driving it with openDriver

Preconditions:
- Fixture instance (5 categories, 10 unit types). Use a fresh `--id` when adding or deleting.

- **View.** `await app.goto("/admin")`. Heading `Admin Panel`; `Kylling` and `stk` are listed.
- **Add category.** `page.getByPlaceholder("Tilføj ny kategori").fill("Suppe")`, then the first
  `Tilføj` button. `Suppe` appears and `app.api("/api/admin/recipeCategories")` has 6 entries.
- **Delete.** Click the trash icon next to `Suppe` (no accessible name: it is the button in the
  same row). The entry disappears from the list and the API.
- **Units.** The same with `Tilføj ny enhed` and the second `Tilføj` button.
- **Proof.** `app.shot("admin")` plus both lists read back.

## Gotchas

- There is no confirmation on delete.
- Names are stored as typed; duplicates are allowed.
