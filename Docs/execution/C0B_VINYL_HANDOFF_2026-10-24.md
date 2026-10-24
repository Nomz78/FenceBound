# FenceBound C0b vinyl privacy handoff

Read `SOURCE_OF_TRUTH.md` for classification. Task authority is the owner's request
"Start vinyl as the next C0b PR" (2026-10-24), `HANDOFF.md` step 2, and
`Docs/reference/HARDWARE_SPEC_REFERENCE.md:539` (Final owner answers).

## Outcome

- Start: `bd60cc2` (`claude/counting-c0b-chainlink`, wood PR #22 merged in). Branch
  `claude/admiring-thompson-589ghg` (owner: branch naming "whatever is easier").
- Vinyl privacy 6/8 ft (`vinylprivacy6`, `vinylprivacy8`) join `OWNER_POST_RULE_TYPES`:
  line post length = height + 2 ft; end/corner/gate = height + 2 ft below 8 ft, 1.5 x
  height from 8 ft (hole capped at 48 in). Same lengths merge into one `Vinyl Post` row.
- Concrete: lines 1 bag below 8 ft, 2 from 8 ft; terminals 2 below 7 ft, 3 from 7 ft;
  edited depths scale by ratio and round up. Off-table footing warnings no longer apply.
- Gate posts keep the generic `Gate Post` item and `gate post` key, now labelled with
  the owner-rule length (as chain link). The reference marks vinyl gate-post material
  unverified (V-H only implies vinyl gate posts), so no material/key change was made.
- Unchanged: panels, rails, caps, screws, gate kits, price values, vinyl split rail
  (goes with the split-rail PR) and every other type.
- Inherited limit: vinyl posts are sold in fixed stock sizes (V-A); the rule lengths
  (e.g. 12 ft terminals on 8 ft fence) are not mapped to a stock SKU.

## Golden changes (100 LF, 4 ft walk + 12 ft double-drive gates)

| Value | Old | New |
| --- | --- | --- |
| vinylprivacy6: posts | `Vinyl Post 9'` 11 | `Vinyl Post 8'` 11 |
| vinylprivacy6: Post Concrete | 33 | 13 |
| vinylprivacy6: gate posts | `Gate Post 10.5' (104" cut)` 4 | `Gate Post 8'` 4 |
| vinylprivacy6: Gate Post Concrete | 12 | 8 |
| vinylprivacy6: matCost / clientTotal, cents | 338244 / 624030 | 322644 / 602970 |
| vinylprivacy8: posts | `Vinyl Post 11'` 11 | `Vinyl Post 10'` 9 + `Vinyl Post 12'` 2 |
| vinylprivacy8: Post Concrete | 33 | 24 |
| vinylprivacy8: gate posts | `Gate Post 11' (128" cut)` 4 | `Gate Post 12'` 4 |
| vinylprivacy8: Gate Post Concrete | 12 | 12 |
| vinylprivacy8: matCost / clientTotal, cents | 338244 / 650070 | 332394 / 642172 |

Money moves only through concrete: 24 (6 ft) and 9 (8 ft) fewer bags at $6.50, x1.35
markup. Post and gate-post keys are unchanged, so their unit prices are unchanged.

## Verification

- Red: the four new tests fail against `bd60cc2` (`/tmp/fencebound-vinyl-red.log`).
- Sweeps: both types, heights 4-8 ft, lengths 8/9/16/17/40/100/163 ft, with and without
  a centred 4 ft gate (140 layouts); expectations from geometry and the owner rules.
- Edited depths: 6/8 ft L layouts, depths 30/36/42/31 in, rounding and no off-table warning.
- Takeoff suite green after the change (`/tmp/fencebound-vinyl-takeoff.log` before goldens).
- Full gate on `a194c16`: `npm test` 212/212 (jsPDF 2.5.1 from npm via scratch-only
  preload, 364463 bytes, SHA-256 `98ccf17a…3df875`), `node scripts/cad-persistence-matrix.js`
  12/12, `git diff --check` PASS. Logs `/tmp/fencebound-vinyl-gate.log`, `-matrix.log`.

Push only the branch above; PR against `claude/counting-c0b-chainlink`, then stop.
