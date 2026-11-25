# Indstillinger (admin)

Shows the household code to send to others in the household, and maintains the two name lists the
app offers in pickers: recipe categories and unit types.

## Sub-features

- `admin-household-code` shows the code hidden (`••••••••`); `Vis`/`Skjul` toggles it; `Del invitation`
  opens the share sheet with "Log ind på Home Project: <origin>/login – husstandskoden er: <code>", or
  copies it ("Invitationen er kopieret") where there is no share sheet; a failure says "Kunne ikke dele invitationen".
- `admin-categories` lists, adds and deletes recipe categories.
- `admin-units` lists, adds and deletes unit types.
- `admin-delete-confirm` a trash tap opens a dialog first: "Slet «<navn>»?", the consequence for
  recipes (categories) or ingredients (units) ending "Det kan ikke fortrydes.", red `Slet` and `Behold den`.
  Nothing is deleted until `Slet`; Escape and `Behold den` close it without deleting.
- When the server refuses an add or delete, a toast says "Kunne ikke tilføje kategorien" / "Kunne ikke
  slette kategorien" (and the same with "enheden"), and the list is fetched again, so it shows what is stored.

## How to get to it (user POV)

- The gear icon in the top bar (link `Indstillinger`), or `/admin`.

## Driving it with openDriver

Preconditions:
- Fixture instance (5 categories, 10 unit types). Use a fresh `--id` when adding or deleting.

- **View.** `await app.goto("/admin")`. Heading (h1) `Indstillinger`; the nav link `Indstillinger` has `aria-current="page"`; `Kylling` and `stk` are listed.
- **Household code.** Heading `Husstandskode`; `page.getByRole("button", { name: "Vis", exact: true })` reveals
  the instance's `householdCode` (`instance.json`). For `Del invitation`, grant `clipboard-read`/`clipboard-write`
  and remove `Navigator.prototype.share` in an init script, then read `navigator.clipboard.readText()`;
  stub `Navigator.prototype.share` to see what is shared.
- **Add category.** `page.getByRole("textbox", { name: "Ny kategori" }).fill("Suppe")`, then the first
  `Tilføj` button. `Suppe` appears and `app.api("/api/admin/recipeCategories")` has 6 entries.
- **Delete.** `page.getByRole("button", { name: "Fjern kategori: Suppe" })` (units: `Fjern enhed: <navn>`)
  opens `page.getByRole("dialog", { name: "Slet «Suppe»?" })`; nothing is deleted yet. Its
  `getByRole("button", { name: "Slet", exact: true })` deletes: the dialog stays open (button disabled) until the
  server answers, then the entry disappears from the list and the API. `Behold den` or Escape keeps it.
- **Units.** The same with the `Ny enhed` field and the second `Tilføj` button.
- **Failure.** `page.route("**/api/admin/recipeCategories", …)` answering 500 for POST/DELETE (same for
  `unitTypes`); expect the toasts above and the list unchanged (`.flow/no-data-loss/check.mjs`, check 6).
- **Proof.** `app.shot("admin")` plus both lists read back.

## Gotchas

- The code reaches the browser only in the server render of `/admin` (after `requireSession()`), never
  through `/api/*` or a bundle; `householdCode()` in `app/lib/session.ts` is server-only. A visited tab
  keeps it in Next's 30 s client cache and history. `public/sw.js` must never cache `/admin`.
- Screenshots after `Vis` show the code: take them on fixture instances only (test code), never production.
- Desktop Chrome on macOS/Windows has a share sheet too; the clipboard fallback is for browsers without one.

- The dialog is a native modal `<dialog>`: the page behind it is inert, so a toast can't be tapped while it is open.
- Names are stored as typed; duplicates are allowed.
