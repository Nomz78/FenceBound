# FenceBound C0b split rail handoff

Read `SOURCE_OF_TRUTH.md` for classification. Task authority: owner go-ahead for all
remaining C0b types (2026-10-24), `HANDOFF.md` round 5 plan step 2,
`Docs/reference/HARDWARE_SPEC_REFERENCE.md` ruling 4 (:527), W2 (:534), Final owner answers (:539).

## Outcome

- Branch `claude/counting-c0b-splitrail` from `6336cc7` (ornamental). Commit `8be571b`.
  PR #25, base `claude/counting-c0b-ornamental`.
- Types `woodsplit2`, `woodsplit3`, `woodsplit3fb`, `vinylsplit2`, `vinylsplit3` join
  `OWNER_POST_RULE_TYPES`; posts by role at height + 2 ft; concrete 1 bag line, 2 terminal.
  Wood split gains a post concrete row (ruling 1 names wood). The S15 lengths in W2 are
  superseded by the Final owner answers.
- Default centers 10 ft 4 in (`SPLIT_RAIL_CENTERS_FT`); default heights 3 ft (2 rail),
  4 ft (3 rail). Wood split rails count per bay at the run spacing (was a fixed 10 ft).
- UI text only: spacing label `10 ft 4 in` via `spacingText`; split quick presets use the
  type default (`data-spacing="type"`), labelled `10'4"`; draw hint and NO_LINE_POSTS
  warning use the same label.
- Gate posts: generic `Gate Post` / `gate post` at owner-rule length.
- Limits: the spacing slider is whole feet (dragging leaves 10'4"); no 4-rail type exists
  for W2's 5 ft default.

## Golden changes (100 LF, 4 ft walk + 12 ft double drive)

| Type | Posts | Post Concrete | Gate posts x4 | matCost / clientTotal, cents |
| --- | --- | --- | --- | --- |
| woodsplit2 | 6' -> 5' (8) | none -> 10 | 10.5' (74" cut) -> 5' | 98700/235545 -> 105200/244320 |
| woodsplit3 | 6' (8) | none -> 10 | -> 6' | 106800/259500 -> 113300/268275 |
| woodsplit3fb | 6' (8) | none -> 10 | -> 6' | 118560/288396 -> 125060/297171 |
| vinylsplit2 | 6' -> 5' (8) | 16 -> 10 | -> 5' | 129700/290415 -> 125800/285150 |
| vinylsplit3 | 6' (8) | 16 -> 10 | -> 6' | 142300/320445 -> 138400/315180 |

Rails unchanged on the fixture (9 bays at 10'4" as at 10'). Money moves only through concrete.

## Verification

- Red on `6336cc7`: defaults test and five 42-layout sweeps (heights 3-5 ft, lengths
  10/11/20/31/62/100/163, gated/ungated).
- Full gate on `8be571b`: `npm test` 220 passed; persistence matrix 12 pass.
