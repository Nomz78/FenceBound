# FenceBound C0b ornamental handoff

Read `SOURCE_OF_TRUTH.md` for classification. Task authority: owner go-ahead for all
remaining C0b types (2026-10-24, "i want to give the go ahead on all of them"),
`HANDOFF.md` round 5 plan step 1, `Docs/reference/HARDWARE_SPEC_REFERENCE.md:539-560`.

## Outcome

- Branch `claude/counting-c0b-ornamental` from `b3426b8` (vinyl branch
  `claude/admiring-thompson-589ghg`). Commit `6336cc7`. PR #24, base the vinyl branch.
- `ornamental` joins `OWNER_POST_RULE_TYPES`: posts by role at owner-rule lengths,
  owner concrete (line 1 bag, 2 from 8 ft; terminals 2, 3 from 7 ft; edited depths by ratio).
- Panel width is the post spacing: panels (and bracket kits, 4 screws each) count per
  section at the run's spacing. Default spacing 8 ft (was 6); 6 ft stays selectable
  through run spacing and the existing quick preset. No new UI.
- Gate posts keep the generic `Gate Post` / `gate post` at owner-rule length (material
  unverified in the reference).
- Unchanged: price values, panel name, every other type.
- Open (owner call, not done): the panel row name has no width, so 6 ft and 8 ft panels
  on one job share one `Ornamental Panel 60"` row.

## Golden changes (100 LF, 4 ft walk + 12 ft double drive)

| Value | Old | New |
| --- | --- | --- |
| Ornamental Panel 60" | 15 | 12 |
| Ornamental Post 7' | 14 | 11 |
| Post Concrete | 28 | 13 |
| Panel Bracket Kit | 15 | 12 |
| Self-Tapping Screws | 60 | 48 |
| Gate posts | `Gate Post 10.5' (86" cut)` 4 | `Gate Post 7'` 4 |
| Gate Post Concrete | 8 | 8 |
| matCost / clientTotal, cents | 233850 / 496118 | 194670 / 443225 |
| T1 ornamental panels | 7+5+3 | 5+4+3 |

## Verification

- Red on `b3426b8`: default-spacing test (6, expected 8) and the 140-layout sweep
  (heights 4-8 ft x 6/8 ft spacing x lengths 8/9/16/17/40/100/163 x gated/ungated).
- Full gate on `6336cc7`: `npm test` 214 passed; `node scripts/cad-persistence-matrix.js`
  12 pass (jsPDF 2.5.1 via scratch-only preload, 364463 bytes, SHA-256 `98ccf17a…3df875`).
