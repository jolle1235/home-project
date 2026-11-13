# Reviewer briefs

Paste the role's brief into the agent prompt, with `<slug>`, `<pr>`, `<round>` and `<head sha>`
filled in. Every reviewer reads `CLAUDE.md` and `.flow/<slug>/brief.md` first, and the diff at
`.flow/<slug>/reviews/pr.diff`.

## Shared rules (include in every brief)

> You did not write this change. Do not edit the branch. You may write scratch files under
> `.flow/<slug>/reviews/<role>/` and start your own verification instance
> (`npm run verify:up -- --id verdict-<role>-<round> --ref <head sha>`, fixtures only; see
> `.claude/skills/verify-home-project/SKILL.md`), and you must stop it when done
> (`npm run verify:down -- verdict-<role>-<round>`).
>
> A finding needs evidence: a command and its output that show the failure, or, when it cannot be
> run, the exact code path from input to failure with `file:line` at each step. Opinions without
> evidence are dropped. Say whether the PR introduced the problem or it already existed.
>
> Reply with one block per finding, then `NONE` if there are none:
> ```
> ID: <role>-<n>
> SEVERITY: blocker | major | minor
> INTRODUCED: yes | no
> WHERE: path:line
> CLAIM: one sentence
> EVIDENCE: command + output, or the code path
> ```
> From round 2: first list each earlier finding as `FIXED` or `STILL OPEN` with evidence, then
> review only `git diff <previous head>..HEAD`.

## bugs

> Find correctness defects this change introduces. Read every changed file in full and the callers
> of every changed export. Probe the edges this app tends to get wrong: empty lists and missing
> optional fields; drinks versus food (`type` missing means food); dates, "today" and time zones
> (`toDateKey`, the week grid); optimistic TanStack updates without rollback, or the wrong query
> key; state that should reset per item (`key`); values that differ between server and client
> render (hydration); debounced saves that lose or duplicate a write; quantities and unit
> conversion. Prove each with a run: a scratch vitest file, or a script with
> `scripts/verify/driver.mjs` against your instance.

## security

> Find ways the change lets input do something it should not. Trace every value from a request
> (query string, JSON body, form data, uploaded file, URL to import) to where it is used:
> - Mongo: operators smuggled through JSON bodies (`{ "$gt": "" }`), `$where`, `$regex` built from
>   raw input (injection and catastrophic backtracking), `new ObjectId(input)` without validation.
> - Server-side requests: any fetch of a user-supplied URL must go through `app/lib/safeFetch.ts`.
> - Browser: `dangerouslySetInnerHTML`, user-controlled `href`/`src` (`javascript:` URLs).
> - Uploads: size and content type checks in `app/api/upload`.
> - Secrets: env values reaching client code or logs; anything committed.
> The app has no authentication at all; report that only as a pre-existing follow-up
> (`INTRODUCED: no`) unless the change makes it worse. Prove what you can against your instance;
> otherwise give the input → sink path.

## intent

> Judge whether the change does what the brief asks, from the user's side. Read
> `.flow/<slug>/brief.md` and form your own expectations before reading the PR body or
> `.flow/<slug>/plan.md`. Then, on your own instance of the PR head:
> 1. Check every line of `## Expected after` by driving the app (use the feature files in
>    `.claude/skills/verify-home-project/features/`).
> 2. Re-run the PR's own proof: `node .flow/<slug>/check.mjs verdict-intent-<round>` must exit 0
>    (for a refactor, its output must equal `.flow/<slug>/evidence/before.txt`).
> 3. Run `npm run verify:smoke -- verdict-intent-<round>`; compare with
>    `.flow/<slug>/evidence/smoke-before.txt` for new failures or problems.
> 4. Check scope: nothing changed that the brief did not ask for; user-visible changes are reflected
>    in the feature map; `## Decisions` are implemented as answered.
> A mismatch between brief and behaviour is `major` or `blocker`; say which line of the brief it
> breaks.
