# FenceBound C0b wood privacy/shadowbox handoff

Read `SOURCE_OF_TRUTH.md` for classification. Task authority is the owner's wood-only
request, `HANDOFF.md` step 2, and `Docs/reference/HARDWARE_SPEC_REFERENCE.md:539`
(Final owner answers, superseding earlier confirm rows); W-G at line 141 supplies 4x4.

## Outcome

- Start: `dd5f49d57f906610024840e3affcdafeceb5ae9e`, branch `claude/counting-c0b-wood`,
  based on `claude/counting-c0b-chainlink`. The tested implementation commit and final
  gate are recorded by the direct documentation-closeout child in `Docs/CURRENT_HANDOFF.md`.
- Wood privacy/shadowbox posts: line length = height + 2 ft; end/corner/gate length =
  height + 2 ft below 8 ft, 1.5 times height from 8 ft, default hole depth capped at 48 in.
  Same lengths merge; distinct lengths stay separate. Gates are 4x4 with cost key `post`.
- Concrete: lines 1 bag below 8 ft, 2 from 8 ft; terminals 2 below 7 ft, 3 from 7 ft.
  Edited depths scale the per-hole bags by depth and round up. Shared owner-rule helpers
  preserve chain-link behavior. Legacy off-table warnings no longer apply to these wood types.
- Pickets, rails, screws, caps, gate kits, price values and other fence types unchanged.
  Split rail is a separate later task. Old saved jobs are outside this task's scope.
- Inherited limit: spec-panel depth defaults remain generic; these types use owner-rule
  depths in counts until explicitly edited. No spec-panel redesign is included.

## Golden changes (100 LF, 4 ft walk + 12 ft double-drive gates)

| Value | Old | New |
| --- | --- | --- |
| Both styles: post label, quantity 11 | `Post 4x4x9'` | `Post 4x4x8'` |
| Both styles: Post Concrete (60lb bag) | 33 | 13 |
| Both styles: gate post label, quantity 4 | `Gate Post 10.5' (104" cut)` | `Gate Post 4x4x8'` |
| Both styles: gate post cost key | `gate post` | `post` |
| Both styles: Gate Post Concrete (60lb bag) | 12 | 8 |
| Privacy matCost, cents | 271435 | 250635 |
| Privacy clientTotal, cents | 520818 | 492738 |
| Shadowbox matCost, cents | 267145 | 246345 |
| Shadowbox clientTotal, cents | 528047 | 499967 |

All other golden rows and quantities remain unchanged. Existing rates explain the
20800-cent material reduction: 24 fewer bags at $6.50 plus four gate posts moving
from the $24 pipe key to the $11 wood key. At existing 35% markup, client totals fall
28080 cents. No rate value changed.

## Verification

- Four new C0b-wood regressions fail against starting runtime `dd5f49d`:
  `/tmp/fencebound-wood-red.log`. The stronger 31-in off-table gate-depth cases also
  fail against that runtime: `/tmp/fencebound-wood-depth-red.log`.
- Two sweeps cover both styles, heights 4/5/6/7/8 ft, lengths 8/9/16/17/40/100/163 ft,
  with and without a centered 4-ft gate (140 layouts). Expected post counts derive from
  geometry; lengths and bags derive from the owner rules, not application helpers.
- Two edited-depth tests cover 6/8-ft L-shaped layouts with three line posts, two ends,
  one shared corner, and two gate posts. Depths 30/36/42/31 in verify rounding and
  absence of the obsolete footing-table warning.
- Focused gate: `npx playwright test tests/takeoff-counts.spec.js --output /tmp/fencebound-wood-takeoff-results`:
  34/34 passed, including all 14 type goldens. Log `/tmp/fencebound-wood-takeoff.log`.
- Initial full gate on `ae159a3` exposed E6/E8: the legacy price oracle assumed pipe
  gate posts, and CSV import mapped the new wood gate label to `gate post`. Stopped
  after 71 passes, two failures and one interrupted test (134 not run); raw evidence
  `/tmp/fencebound-wood-first-gate.log`. Added an exact wood-gate name mapping to `post`
  and updated E6 to assert the customized wood rate (no skipped wood assertions).
  E6/E8 then passed 2/2: `/tmp/fencebound-wood-mapping.log`.
- Required full gate on the final implementation commit: `npm test` and
  `node scripts/cad-persistence-matrix.js`; final outcomes in `Docs/CURRENT_HANDOFF.md`.

## Review and closeout

Independent read-only review examines the raw diff, owner rules, red evidence and
money deltas. Its outcome is recorded in the final current handoff. Startup audit found
inherited state files still describing the market-readiness branch; the explicit owner
request and root handoff supersede that historical task/prohibition on PRs. Closeout
refreshes current state using the repository's two-commit convention.

Push only `origin/claude/counting-c0b-wood`; create its PR against
`claude/counting-c0b-chainlink`, then stop. No merge, main push, release or next task.
