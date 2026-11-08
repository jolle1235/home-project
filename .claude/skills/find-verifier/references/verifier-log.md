# Verifier log

One line per verifier actually used. Read the recent lines before proposing; add a line after the
task's proof has run. New techniques and corrected recipes go into `verifier-catalog.md` in the same
PR.

```
date       | task slug | kind | technique | caught something | note
2026-11-08 | fv-parser (skill test) | refactor | 2 golden replay | yes | 17,290 generated lines through linesToRows, deterministic; removing the `ltr` alias in a base copy changed 696 lines. Catalog entry 2 corrected: the snapshot stores parsed results, not raw lines.
```
