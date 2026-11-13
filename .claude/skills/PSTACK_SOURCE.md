# Vendored pstack skills

Copied unchanged from https://github.com/backnotprop/pstack (a standalone mirror of
Poteto's `cursor/plugins/pstack`) at commit `a6342ded43a2437e3c664b46c2cff103787773fd`.
MIT licence, Copyright (c) 2026 Lauren Tan. The full text is in `PSTACK_LICENSE`.

| Skill | Used by |
|---|---|
| `create-verification-skill` (+ `references/feature-map-example/`) | generated `verify-home-project` |
| `maintain-verification-skill` | periodic upkeep of `verify-home-project` |
| `principle-prove-it-works` | `plan-critique`, `before-after`, `find-verifier` |
| `principle-fix-root-causes` | `before-after` (bug fixes) |
| `principle-test-behavior-not-implementation` | `before-after`, `find-verifier` |
| `principle-minimize-reader-load` | `thermonuclear-review` |
| `principle-subtract-before-you-add` | `plan-critique`, `thermonuclear-review`, `solid-check` |
| `principle-model-the-domain` | `scope-task`, `solid-check` |

Most of them set `disable-model-invocation: true`, so the skills above **read them by path**
(`.claude/skills/<name>/SKILL.md`) rather than invoking them.

## Names that point outside this set

The vendored text mentions pstack skills that are not copied here. In this repo:

- `show-me-your-work` (decision trail) → the run's `.flow/<slug>/` folder and the PR body.
- `interrogate` (only findings proven by a run survive) → the re-check step in `merge-verdict`.
- `control-ui` / `control-cli` → `verify-home-project`.
- `.cursor/skills/` → `.claude/skills/`.

## Updating

Download the same folders at a newer commit, read the diff, update the SHA above. Never edit the
vendored files in place; put repo-specific rules in the skills that use them.
