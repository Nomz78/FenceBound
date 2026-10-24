# HANDOFF — counting, round 4

## Current state
- C1 pack sizes: PR #19 (`claude/counting-c1`, `a4fb3fd`) merged into `main`.
- C2 waste %: PR #20 (`claude/quirky-tesla-wyxrmc`, `e5938d1`) merged into C1.
- C0b chain link: PR #21 merged into C2. These are the live GitHub base/merge states
  checked this round; downstream merges are not a claim of final integration into main.
- Owner final answers remain in `Docs/reference/HARDWARE_SPEC_REFERENCE.md:539`.
- C0b wood privacy/shadowbox is implemented on `claude/counting-c0b-wood`, starting
  at `dd5f49d` (based on `claude/counting-c0b-chainlink`). Four red-before regressions
  cover 140 default layouts and edited line/end/corner/gate depths. Golden changes and
  evidence: `Docs/execution/C0B_WOOD_HANDOFF_2026-10-24.md`; final gate and tested commit:
  `Docs/CURRENT_HANDOFF.md`.
- Wood PR #22 merged into `claude/counting-c0b-chainlink` (`bd60cc2`).
- C0b vinyl privacy (owner: "Start vinyl as the next C0b PR", 2026-10-24) is implemented on
  `claude/admiring-thompson-589ghg` (`a194c16`, from `bd60cc2`); PR against
  `claude/counting-c0b-chainlink`. Evidence and goldens: `Docs/execution/C0B_VINYL_HANDOFF_2026-10-24.md`.
  Vinyl split rail is left for the split-rail PR. Vinyl gate-post material stays generic (unverified).
- Next (needs owner go-ahead): ornamental, split rail (wood + vinyl), cattle, each its own PR.

## Wood plan (step 2; implemented this round)
Owner direction 2026-10-24: test rules across many heights/lengths, not one sample job.
Old saved jobs are out of scope.
1. In `index.html` rename the generic chain-link helpers so wood can share them:
   `chainLinkHoleDepthIn`, `chainLinkBagsAtDefaultDepth`, `chainLinkDepthIn`,
   `chainLinkConcreteBags` (they already hold the owner rules, not chain-link specifics).
2. Wood privacy/shadowbox branches in `calcAutoMaterials`: posts `Post 4x4x<len>'` with
   line len = height + 2 ft, terminals per "Final owner answers" (one row when lengths match,
   two rows when they differ, at 8 ft+). Concrete: line 1 bag (2 at 8 ft+), terminals 2
   (3 at 7 ft+), replacing `concreteBagsForPosts('terminal',typePostCount,sp)`.
3. Gate posts on wood runs: 4x4 at terminal length (W-G illustrations use 4x4),
   `Gate Post 4x4x<len>'`, costKey `post`; gate concrete per the terminal rule. Change the
   `cl` check in the gate loop and the `CONCRETE_DEPTH_OFF_TABLE` skip to a shared list of
   types on the owner post rules.
4. Leave pickets, rails, screws, caps alone (reference labels them unverified, not bugs).
5. Fixture (6 ft, 8 ft spacing: 9 line + 2 terminal): `Post 4x4x8'` 11 (was `4x4x9'`),
   Post Concrete 33 → 13, `Gate Post 10.5' (104" cut)` → `Gate Post 4x4x8'` 4, gate concrete
   12 → 8. matCost/clientTotal will move (gate post key `gate post` $24 → `post` $11).
**Done when:** a red-before sweep test (heights 4–8 ft × several lengths, both styles, expected
counts written from the rules) passes; goldens updated old → new; full gate green; PR against
`claude/counting-c0b-chainlink`.

## Read first (only these)
1. `Docs/reference/HARDWARE_SPEC_REFERENCE.md` lines 516–end: owner rulings. The table
   "Final owner answers" (from line 539) overrides anything earlier, including the
   **confirm** rows. The owner said the questions were "being made way too hard": apply
   the rules as written; do not reopen them.
2. Same file lines 85–132 (chain link rules) and 257–280 (chain link BOM comparison).
3. `index.html`: `DEFAULT_FOOTING`/`DEFAULT_POST_EMBED_IN` (~line 645), `bagsForHole` /
   `footingBagsForDepth` (~1282), `chainLinkPostCutIn`/`chainLinkPurchaseFt` (~1895),
   `concreteBagsForPosts` (~1911, line posts currently get 0 bags), `calcAutoMaterials`
   chain link branch (~1940).
4. `tests/takeoff-counts.spec.js` chain link golden.

## Steps
1. **C0b chain link** — branch `claude/counting-c0b-chainlink` from `claude/quirky-tesla-wyxrmc`
   (owner: branch naming "whatever is easier"). Changes: carriage bolts one per band (30 on
   the fixture, was 48); top rail swedged (default, 0 sleeves) or plain 21 ft with sleeves;
   truss/brace at every terminal; Master Halco tie spacing (15 in posts, 24 in rails);
   post lengths and concrete per "Final owner answers"; 48 in max depth.
   **Done when:** each moved count has a red-before test citing the reference line, the
   golden diff lists every value old → new, full gate passes, PR opened against the C2 branch.
2. Then one PR per remaining type (wood, vinyl, ornamental 6/8 ft panel = spacing default 8,
   split rail 10'4" centers with 3/4/5 ft heights, cattle with mid-line brace every 200 ft),
   each branched from the previous. Commercial chain link as its own type is a later PR.
3. After C0b: C3 (material order export), C4 (house/wall termination) as below.

## Test setup in the cloud
cdnjs is blocked; serve jsPDF 2.5.1 from npm through a preload in the scratchpad (never in
the tree). UMD 364463 bytes, SHA-256 `98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875`.
Playwright wants `/opt/pw-browsers/chromium-1091/chrome-linux/chrome`: symlink it to
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

---

# Round 1 task list (background; steps above take precedence)

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
- **Sources beat opinion.** A count is correct when it matches a cited distributor/manufacturer
  spec (task C0) or an owner ruling — not when another model says so. Do not re-audit; do not re-research.
- **Owner-ruling items are walls.** If a task needs one of the open rulings below, stop and
  write the question into the PR. Never guess a field rule.
- **Two strikes.** If the same test still fails after two fix attempts, stop, commit nothing
  broken, and write up what you saw.
- **Out of scope** (do not touch): tax, overhead, margin, labor model, good/better/best,
  quote snapshot/v6 engine, satellite imagery, price values, FenceScraper.
- A golden in `tests/takeoff-counts.spec.js` may change only as the direct result of the
  task; list every moved value old → new in the PR.

## Tasks, in order

### C0 — Hardware spec reference from distributor and manufacturer literature (do first)
Owner ruling 2026-10-15: *"On hardware, use specs from the other software and brochures from
Merchants Metals (formerly Hudson Fence Supply), Capital Fence Supply and others used around
Albemarle, Charlotte and Greensboro, NC."* The owner has no personal distributor pricing and
does not vouch for distributors beyond those named; prices stay contractor-entered.

Build `Docs/reference/HARDWARE_SPEC_REFERENCE.md`: per fence type (chain link residential and
commercial, wood, vinyl, aluminum/ornamental, split rail, farm/wire), the parts list rules —
post sizes by height, gate posts and gate hardware by gate type and width, fittings per
terminal/corner/gate post, fastener spacing, concrete per hole. **Every rule cites its source**
(catalog/brochure/installation-guide name, page or URL, date). Sources in order of preference:
Merchants Metals, Capital Fence Supply, then other regional distributors and manufacturers'
installation guides (Master Halco, Stephens Pipe & Steel, vinyl/aluminum manufacturers),
then the commercial software's published specs. Where sources disagree, list both; the
owner picks. If a site blocks downloads, ask the owner to drop the PDF in
`~/Developer/_inbox` and verify it by SHA-256 and byte count before using it (CLAUDE.md).
Then compare the app's current BOM for each type against the reference.
**Done when:** the reference exists with citations, and a diff table labels every app count
*matches*, *bug (source says X)*, or *owner choice (sources disagree)*. No code changes in C0.

### C0b — Apply the reference
One PR per fence type: change counts only where C0 labeled *bug* or the owner chose.
Gate parts for non-chain-link types come from here (this replaces open ruling 1).
**Done when:** each changed count has a red-before test citing the reference line.

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

1. ~~Gate parts per non-chain-link type~~ — ruled 2026-10-15: from distributor specs (C0).
2. ~~Footing depths past 42"; vinyl split-rail default height~~ — ruled 2026-10-23.
3. ~~Collinear joint (CAD-06)~~ — ruled 2026-10-23.
4. ~~Line-post concrete; post stock lengths; trusses, sleeves, carriage bolts; rail ties~~ — ruled 2026-10-23.

All 2026-10-23 rulings, and the C0 owner choices, are in
`Docs/reference/HARDWARE_SPEC_REFERENCE.md` § "Owner rulings — 2026-10-23". Rows marked
**confirm** still need the owner's yes before C0b changes that count.

## Branches

Start from `claude/focused-bell-rirwad` (or `main` once it is merged). Push each task to
`codex/counting-c<N>`. Gate per task: `npm test`, `node scripts/cad-persistence-matrix.js`,
`git diff --check`, append to `Docs/development/DEVELOPER_LOG.md`.
