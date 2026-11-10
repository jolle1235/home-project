# Verifier log

One line per verifier actually used. Read the recent lines before proposing; add a line after the
task's proof has run. New techniques and corrected recipes go into `verifier-catalog.md` in the same
PR.

```
date       | task slug | kind | technique | caught something | note
2026-11-08 | fv-parser (skill test) | refactor | 2 golden replay | yes | 17,290 generated lines through linesToRows, deterministic; removing the `ltr` alias in a base copy changed 696 lines. Catalog entry 2 corrected: the snapshot stores parsed results, not raw lines.
2026-11-08 | fix-editor-hydration | bug | 1 UI drive | yes | stopped at approval; BEFORE on base red on /shoppinglist (warning, aria-controls, Enter). Drives found the hydration timing trap and two wrong feature-map selectors; lessons added to entry 1.
2026-11-09 | require-login | feature | 13b anonymous request matrix + 13 production build + 5 unit | yes | BEFORE 72/110 red; AFTER dev 130/130, prod 112/112 (Secure only in prod). Caught: login redirect used Next's host (localhost) instead of the browser's; a `/.//host` path that normalizes to `//host`. Breaks proved each layer separately.
```
