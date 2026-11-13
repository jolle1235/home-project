# Verification fixtures

Synthetic data for verification instances (`npm run verify:up`, the default `--data fixtures`).
Nothing here comes from production: the repo is public. Proof posted on GitHub (PR bodies,
verdict comments) must come from runs on this data, never from `--data snapshot`.

One file per collection, as an EJSON array (`{"$oid": ...}`, `{"$binary": ...}`, `{"$date": ...}`).
`weekPlan` entries use `dayOffset` (days from today) instead of a date, so the planner always
shows them. Recipe and image `_id`s are fixed, so checks can link to them:

| Id | Document |
|---|---|
| `6650000000000000000000a1` | Testlasagne: food, ingredient sections, has an image |
| `6650000000000000000000a2` | Testsalat med kylling: food, no image |
| `6650000000000000000000a3` | Testmojito: drink |
| `6650000000000000000000f1` | the PNG used by Testlasagne |

When a task needs data that isn't here, add it in the same PR as the task.
