# FenceBound C0b cattle handoff

Read `SOURCE_OF_TRUTH.md` for classification. Task authority: owner go-ahead for all
remaining C0b types (2026-10-24; round 6 started on the owner's "Go ahead with cattle r6"),
`HANDOFF.md` round 6 plan, `Docs/reference/HARDWARE_SPEC_REFERENCE.md` Final owner answers (:539-560).

## Outcome

- Branch `claude/counting-c0b-cattle` from `80856d8` (split rail). Commit `485325a`.
  PR #26, base `claude/counting-c0b-splitrail`.
- `cattlefield`, `cattlehog` join `OWNER_POST_RULE_TYPES`. Wood corner/brace posts and gate
  posts at owner terminal length (height + 2 ft below 8 ft) and bags (2 per terminal at
  4-6 ft). Driven T-posts unchanged, no concrete.
- Mid-line brace every 200 ft (`CATTLE_BRACE_EVERY_FT`, `cattleMidBraces`): one at each
  200 ft point strictly inside a fabric section, `ceil(len/200) - 1` per section. Each adds
  1 `Wood Corner/Brace Post`, 2 `Brace Wire`, terminal-rule concrete. T-post count unchanged.
- Gate posts: generic `Gate Post` / `gate post` at owner-rule length.
- T3 (off-table footing depths) moved from `cattlehog` to `temporary`, the last type whose
  gate posts use the footing table. Same cases; run post concrete 0 (temporary has none).
- Limit: a mid-line brace is counted as one post plus wire, as the plan said ("keep it
  simple"); a two-post H-brace or horizontal brace member is not modelled.

## Golden changes (100 LF, 4 ft walk + 12 ft double drive)

| Type | Gate posts x4 | Other counts | matCost / clientTotal, cents |
| --- | --- | --- | --- |
| cattlefield | 10.5' (74" cut) -> 6' | unchanged | 86264/205736 unchanged |
| cattlehog | 10.5' (74" cut) -> 6' | unchanged | 113648/255725 unchanged |

Fixture sections (40, 26, 18 ft) are under 200 ft, so no mid-line braces there.

## Verification

- Red on `80856d8`: two 32-layout sweeps (heights 4-5 ft, lengths
  150/199/200/201/399/400/401/650, gated/ungated) failed.
- Full gate on `485325a`: `npm test` 222 passed; persistence matrix 12 pass.

## Next

C0b is complete across all types. Next per `HANDOFF.md` steps: C3 (material order export),
C4 (house/wall termination); commercial chain link as its own type is a later PR. Each needs
the owner's go-ahead.
