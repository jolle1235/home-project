---
name: commit
description: Commit changes in this repo through the fallow pre-commit gate. Runs the same checks as .githooks/pre-commit (fallow audit) plus ESLint, and if they fail, fixes the findings with the vendored `fallow` skill before committing. Never bypasses the hook. Use whenever the user says "commit", "commit this", "commit and push", or "/commit".
---

# Commit through the fallow gate

Every commit in this repo is gated by `fallow audit` (see `.githooks/pre-commit`, `.fallowrc.jsonc`).
The Claude hook in `.claude/hooks/fallow-gate.sh` blocks `git commit` / `git push` while the audit fails, and `--no-verify` is denied in `.claude/settings.json`.
Your job is to make the gate pass by **fixing the code**, not by getting around the gate.

## Rules
- Never use `--no-verify` / `-n`, never change `core.hooksPath`, never edit or delete `.githooks/pre-commit` or `.claude/hooks/fallow-gate.sh` to get a commit through.
- Never regenerate `.fallow-health-baseline.json` to hide new complexity. It exists only to grandfather complexity that predates the gate.
- Never loosen `.fallowrc.jsonc` (thresholds, `ignorePatterns`, `gate`) without the user's explicit approval.
- A `// fallow-ignore-next-line <issue-type>` suppression needs a reason in the same comment, and you must ask the user first.
- Commit or push only what the user asked for. Don't push unless asked.

## Steps

1. **See what's changing.** Run `git status` and `git diff` (and `git diff --cached`). Stage only the files that belong to this change. Never stage `.env*` files or build output (`public/sw.js`, `public/workbox-*.js`).

2. **Run the gate yourself, before `git commit`.** Use the same base as the hook:
   ```bash
   UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
   BASE="$( [ -n "$UPSTREAM" ] && git merge-base "$UPSTREAM" HEAD || echo master )"
   npx fallow audit --base "$BASE" --format json --quiet --explain
   git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx' '*.js' '*.mjs' | xargs -r npx eslint
   ```
   Exit code 0 means pass. Exit code 1 means findings (not a tool error). Read `verdict` and the findings arrays from the JSON.
   ESLint runs only on staged files, because master has pre-existing lint errors elsewhere. Fix errors in the files you touch; don't go fixing unrelated files unless asked.

3. **If the audit fails, load the `fallow` skill** (`.claude/skills/fallow/SKILL.md`, see `references/issue-types.md` and `references/gotchas.md`) and fix by category:

   | Finding | How to fix |
   |---|---|
   | unused export / type | `npx fallow dead-code --trace <file>:<export> --format json --quiet` to confirm nothing uses it, then remove the `export` (or the symbol). For a batch: `npx fallow fix --dry-run --format json --quiet`, review, then `npx fallow fix --yes`. |
   | unused file | Trace it, then delete it. If a framework loads it by convention (Next route, config), add it to `entry` in `.fallowrc.jsonc` and **tell the user**. |
   | unused / unlisted dependency | `npx fallow dead-code --trace-dependency <name>`, then `npm uninstall <name>` or `npm install <name>`. |
   | duplication (threshold is 0) | `npx fallow dupes --trace dup:<fingerprint> --format json --quiet` to see every copy. Extract one shared helper/component in the nearest common place (`app/utils/`, `app/components/`, or the feature's `utils/` / `components/`) and use it from every site. |
   | new complexity (cyclomatic > 20, cognitive > 15, CRAP ≥ 30) | `npx fallow health --complexity --complexity-breakdown --format json --quiet` shows which branches add up. Split the function: extract helpers, use early returns, use lookup tables instead of `if` chains, move JSX blocks into small components. If splitting would make the code worse, stop and ask the user. |
   | circular dependency | Move the shared piece into its own module that both sides import. |
   | ESLint error | Fix it, following CLAUDE.md conventions (especially "avoid unnecessary `useEffect`"). |

   After fixing, re-run step 2. If you changed behaviour, also run `npm test`.

4. **Loop at most 3 times.** If the gate still fails after three rounds of fixes, stop. Show the user the remaining findings and what you tried, and ask how to proceed. Do not commit.

5. **Commit.** Once the audit passes and lint is clean, stage the fix-ups too and run `git commit` with a short, imperative message in the style of `git log --oneline`. End it with the attribution trailer your harness asks for. The hook runs again; if it still fails, return to step 3.

6. **Report.** Give the commit hash and subject, plus a short list of what the gate caught and how you fixed it (e.g. "removed unused export `foo` from `app/utils/x.ts`", "extracted `formatAmount` to remove a duplicate in A and B").

## Reviewing instead of committing
If the user asks for a review of the branch before committing or merging, use the `fallow-review` skill (`npx fallow review --base <ref>`).
