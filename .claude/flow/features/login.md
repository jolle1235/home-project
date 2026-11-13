# Login

The whole app is behind one shared household code. A visitor without a valid session is sent to
`/login` (pages) or gets 401 (APIs). The right code keeps a device logged in for 365 days; changing
the code logs every device out.

## Sub-features

- `login-form` shows "Husstandskode" and "Log ind", without the app's navigation.
- `login-wrong` shows "Forkert kode. Prøv igen." and sets no cookie.
- `login-right` sets `hp_session` (httpOnly, SameSite=Lax, 365 days, Secure in production) and loads
  the page the visitor came from, or `/recipes` for anything off-site.
- `login-gate` sends anonymous page requests to `/login?next=…` and answers 401 on `/api/*`.
- `login-not-set-up` locks everything and says "Husstandskoden er ikke sat op" when the code (≥12)
  or `AUTH_SECRET` (≥32) is missing or too short.

## How to get to it (user POV)

- Open any page without a session; the app redirects to `/login`.
- Open `/login` directly.

## Driving it with openDriver

Preconditions:
- An instance started by this run; its code is `householdCode` in `.verify/runs/<id>/instance.json`.
- An anonymous driver: `openDriver({ id, login: false })`.

- **Gate.** `fetch(url + "/admin", { redirect: "manual" })` answers 307 with
  `Location: /login?next=%2Fadmin`; `fetch(url + "/api/recipe")` answers 401 JSON.
- **Wrong code.** `await app.goto("/login")`, fill `page.getByLabel("Husstandskode")` with a wrong
  code, click `page.getByRole("button", { name: "Log ind" })`. The page shows "Forkert kode" and
  `context.cookies()` has no `hp_session`.
- **Right code.** `await app.goto("/login?next=%2Fadmin")`, fill the instance's code, click
  "Log ind". The URL is `/admin`, and `Kylling` and `bundt` are listed without a reload.
- **Not set up.** `npm run verify:up -- --id <id> --env HOUSEHOLD_CODE=` starts a locked instance:
  `/login` says "Husstandskoden er ikke sat op" and `POST /api/login` answers 503.
- **Proof.** `app.shot("login")` and the cookie's attributes from `context.cookies()`.

## Gotchas

- The login redirect is a relative `Location`: Next reports `localhost` as the host of a server
  bound to `127.0.0.1`, so an absolute redirect would land on a host without the cookie.
- The `Secure` flag only appears in a production build (`--mode prod`).
