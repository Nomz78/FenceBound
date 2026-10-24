# FenceBound C3 material-order export

Task authority: owner selected “Start C3 material-order export” on 2026-10-24;
`HANDOFF.md` C3 requires CSV and printable PDF orders matching the materials panel.
Branch: `codex/counting-c3`, based on cattle `2ddeccd56e2c0cb9b783ff6bea59949a42c4c0d8`.

## Implementation

- `index.html`: Materials tab Order CSV / Order PDF buttons; existing automatic
  order quantities plus manual order quantities from `withOrderQty`. Manual items
  now display both needed and order quantities and refresh with panel updates.
- Group by exact displayed name, unit, pack size and waste. Sum already-rounded
  orders, preserving per-section LF cuts and each manual line's existing rounding.
  Differing pack/waste definitions remain separate rows. No count/pricing changes.
- CSV columns: Item, Needed, Order, Unit, Pack size, Waste (%). Quote delimiters,
  embedded quotes/newlines; prefix formula-like text with an apostrophe for spreadsheets.
- PDF uses existing company accent and document styling, with wrapped identity before
  the first table, job identifier/page number on every page, and paginated descriptions
  and layout notes. Both formats contain counts only; no prices are exported.
- Layout validation runs without pricing/customer requirements and never sets estimate
  readiness. Unpriced items remain included; layout errors/warnings travel with exports.
  Invalid quantity/pack/waste values block export rather than using silent fallbacks.
- `tests/material-order-export.spec.js`: real CSV/PDF downloads; panel agreement,
  cut-stock rounding/waste, manual grouping, escaping, counts-only behavior, invalid
  input rejection, page identity, differing pack rules and a description spanning pages.

## Validation and review

Pre-commit gate recorded at `2026-10-24T13:25:52Z` on the C3 working tree based on
`2ddeccd`. This section preserves that working-tree checkpoint. The owner subsequently
approved two-commit closeout and push; the committed implementation HEAD and its fresh
gate belong in `Docs/CURRENT_HANDOFF.md` and `CURRENT_STATE.json`, written in the direct
documentation-closeout child after verification.

- Red before: eight new tests fail on an isolated copy of `2ddeccd:index.html`.
  The corrected MO7 fixture also fails there separately. Logs:
  `/tmp/fencebound-c3-original-red.log`, `/tmp/fencebound-c3-mo7-red.log`.
- Final export suite: 8/8, `/tmp/fencebound-c3-export.log`.
- Full suite: `npm test -- --output /tmp/fencebound-c3-full-final-results`, **230/230**
  in 4.2 minutes, `/tmp/fencebound-c3-full-final.log`. Normal repository browser/CDN
  setup, including PDF tests; no transport override or dependency changes.
- `node scripts/cad-persistence-matrix.js`: **12/12**,
  `/tmp/fencebound-c3-matrix.log`. It preceded only the PDF divider adjustment;
  no persistence, quantity or pricing code changed afterward.
- `git diff --check`: PASS. All existing golden BOMs and price values unchanged.
- Runtime SHA-256: `77bf37447e3b0985eb6cb0d602219b476d1f6b7fbd06d51f3dd3fd7d5a877887`.
- Visual check: Materials panel and actual rendered PDF inspected, including final
  divider spacing. Sample PDF: `/tmp/fencebound-c3-material-order.pdf`.

Initial focused run: 15/15 passed (six new cases plus C1/C2). Independent review found
one PDF usability issue: identity appeared after the item list. Repaired by moving full
identity before the first table and repeating a bounded job label on every page. Added
coverage for that fix and the review's same-name/different-pack and long-description cases.
Follow-up review found no remaining supported correctness or scope finding.

First full attempt: 132 passed, one failed (MO7), one interrupted, 96 not run; stopped
for fixture repair. The fixture used a parenthetical qualifier in a manual rate-card
key, but existing normalization removes that qualifier, so the runtime correctly used
the shared key. Corrected the fixture to automatic `post concrete bag` versus manual
`post concrete`. No production key/normalization change. Evidence:
`/tmp/fencebound-c3-full.log`. Reviewer confirmed the fixture correction and the final
presentation-only divider adjustment. Local scrutiny:
`AI/C3_MATERIAL_ORDER_REVIEW_2026-10-24.md` (ignored, not part of the PR).

## Startup audit and closeout

The initial checkout was clean wood `e2339f4`. Fetched/switched to the owner-named cattle
branch, verified `HEAD^ = 485325a` and local/origin equality, then branched for C3.
`npm run session:init` reports inherited drift because current status still describes wood.
Cattle's recorded PASS (222 tests, 12 matrix routes) was not represented as fresh validation.

Current status/handoff must be refreshed in the approved documentation-closeout child of
the tested implementation commit. Do not amend/rewrite the already-pushed cattle closeout.
The execution handoff is task evidence; `Docs/CURRENT_HANDOFF.md` remains the canonical
session boundary once refreshed. Commit/push closeout and external PR creation have separate
approval requirements. Proposed remote/branch: `origin`, `codex/counting-c3`; PR base:
`claude/counting-c0b-cattle`.

No price values, golden quantities, dependencies, schema/version, field rules or release
state changed. C4, commercial chain link and stack integration are outside C3.
