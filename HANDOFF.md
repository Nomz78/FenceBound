# HANDOFF — Codex: counting accuracy, round 1

Owner direction, 2026-10-15: *"Prices aren't inputted by the fencing software but by the
customer; it's more about accurate counting than pricing. Base it on how the other programs
work. I don't want to focus on the wrong thing — this dev is easy to get stuck in a loop."*

So FenceBound's job is: **drawing → exact, purchasable material counts.** The contractor
supplies every price. Prices × counts is already correct after Step 1. Everything below is
about counts.

## Current state (done, do not redo)

- Branch `claude/focused-bell-rirwad`, tested head in `Docs/CURRENT_HANDOFF.md`.
  Not merged to `main` yet.
- 2026-10-15 audit: `Docs/research/2026-10-15_estimator-audit/00-SUMMARY.md`.
- Step 1 defect repairs landed with red/green tests: exact-key pricing, editable upcharges,
  input validation, gate/run ownership, job isolation, per-type counts, golden BOMs for all
  14 types (`tests/takeoff-counts.spec.js`), customer section prices. R15 = 28692 cents.
- Gate at head: `npm test` 172/172 (PDF included), `node scripts/cad-persistence-matrix.js` 12/12.

## Read first (only these)

1. `CLAUDE.md` working rules (red-before/green-after; never change price values; no artifacts in tree).
2. `Docs/research/2026-10-15_estimator-audit/00-SUMMARY.md` — sections "Why it keeps not
   getting finished" and "Design gaps".
3. `Docs/research/2026-10-15_estimator-audit/02-inventory-takeoff-audit.md` §2 and §4.
4. `Docs/research/2026-10-15_estimator-audit/05-research-software.md` "Synthesis" (how
   Fence Cloud / ArcSite turn a drawing into an order).
5. `tests/takeoff-counts.spec.js` (golden BOMs — these lock *today's* output, not truth).

## Loop-breaker rules (mandatory)

- **One task per branch, one PR per task**, branched from the previous task's branch. Stop
  after opening the PR; do not start the next task in the same run unless told to.
- **Reality beats opinion.** A count is correct when it matches the owner's real job (task C0)
  or an owner ruling — not when another model says so. Do not re-audit; do not re-research.
- **Owner-ruling items are walls.** If a task needs one of the open rulings below, stop and
  write the question into the PR. Never guess a field rule.
- **Two strikes.** If the same test still fails after two fix attempts, stop, commit nothing
  broken, and write up what you saw.
- **Out of scope** (do not touch): tax, overhead, margin, labor model, good/better/best,
  quote snapshot/v6 engine, satellite imagery, price values, FenceScraper.
- A golden in `tests/takeoff-counts.spec.js` may change only as the direct result of the
  task; list every moved value old → new in the PR.

## Tasks, in order

### C0 — Real-job acceptance fixtures (needs owner input; do first)
Ask the owner for 2–3 jobs they actually built: the layout (lengths, corners, gates, height,
type) and the supplier order/invoice quantities. Draw each in the app, compare line by line,
and commit each as an acceptance test plus a short table of differences.
**Done when:** each real job is a test, and every difference is labeled *bug*, *owner rule
needed*, or *intentional* (owner decides).

### C1 — Order quantities in purchasable units
Every BOM item gets a contractor-editable **pack size** (fabric roll 50 ft, top rail 21 ft
stick, ties per bag, screws per box, concrete per bag, pickets per bundle, etc.; default 1
= today's behavior). Show *needed* and *order* (= ceil(needed / pack)) quantities; pricing
uses whatever unit the contractor's rate-card entry is in (the existing `UNIT_MISMATCH`
guard stays). Pros all do this (report 05).
**Done when:** with all pack sizes = 1 every golden and R15 are unchanged; with real pack
sizes, a red-before test shows the order rounds up per item across the whole job.

### C2 — Contractor-editable waste/overage per item
A percentage per item, default 0 (no value change), applied to *needed* before pack rounding.
**Done when:** defaults leave every golden unchanged; a test proves 10% on pickets rounds as
expected.

### C3 — Material order / pick list output
A printable/exportable list of order quantities grouped by item (CSV + the existing PDF
style) — the "material order" every commercial tool produces. Counts only; prices optional.
**Done when:** the export equals the on-screen order quantities in a test.

### C4 — House/wall termination
The owner's 168 LF fixture is house-terminated, but the app has no house-end element, so a
run ending at a house is counted as a post plus concrete. Add an end type "wall/house" that
uses the owner-ruled wall hardware (ask if unknown) and no post or concrete.
**Done when:** the 168 LF fixture uses it and its counts match the owner's field numbers.

## Open owner rulings (walls — ask, don't guess)

1. Gate posts/concrete/kit per non-chain-link fence type (currently chain-link parts for all).
2. Footing depths past 42" (currently extrapolated); vinyl split-rail default height.
3. Collinear joint between two runs: line post or end post (CAD-06).
4. Line-post concrete; residential post stock lengths; truss rods, sleeves, carriage bolts;
   rail ties on mid/bottom rails.

## Branches

Start from `claude/focused-bell-rirwad` (or `main` once it is merged). Push each task to
`codex/counting-c<N>`. Gate per task: `npm test`, `node scripts/cad-persistence-matrix.js`,
`git diff --check`, append to `Docs/development/DEVELOPER_LOG.md`.
