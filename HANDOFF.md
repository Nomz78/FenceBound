# HANDOFF — counting accuracy, round 2 (C1: order quantities)

Owner direction, 2026-10-15: *"Prices aren't inputted by the fencing software but by the
customer; it's more about accurate counting than pricing. Base it on how the other programs
work. I don't want to focus on the wrong thing — this dev is easy to get stuck in a loop."*

FenceBound's job is **drawing → exact, purchasable material counts.** The contractor supplies
every price. Owner 2026-10-17: "merged, begin c1".

## Current state (done, do not redo)

- `main` at `f7a2c59` (Nomz78/FenceBound#18 merged) holds:
  - the Step 1 repairs, with 14 golden materials lists in `tests/takeoff-counts.spec.js`
    and R15 = 28692 cents;
  - **C0**, `Docs/reference/HARDWARE_SPEC_REFERENCE.md`: 142 golden rows, of which 20 match,
    21 are owner choices, 3 are conditional bugs and 98 are unverified;
  - the market-readiness repairs: a material unit check on every line (`UNIT_MISMATCH`),
    company-card JSON import isolation, atomic portable import, sub-cent extension;
  - the intermittent R9 failure, fixed (`db7ffd4`, new test R9b).
- Gate on 2026-10-17: `npm test` 188/188 (PDF included), `node scripts/cad-persistence-matrix.js`
  12/12, `git diff --check` clean.
- Nomz78/FenceBound#17 is superseded by #18. The owner closes it.
- **C0b is blocked** on owner product choices (see "Open owner rulings"). **C1 has no blocker.**

## Cloud test setup (cdnjs is blocked by the proxy)

The repo pins Playwright 1.40, which looks for `chromium-1091`; the container has
`/opt/pw-browsers/chromium`. Build a **scratch-only** Node preload, never inside the repo,
that does both of these:
- routes `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` to npm
  `jspdf@2.5.1` `dist/jspdf.umd.min.js`. It must be 364463 bytes with SHA-256
  `98ccf17ae10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875`. Patch
  `playwright-core/lib/client/browser.js` `Browser.prototype.newContext` lazily, only once
  `m.Browser` exists, because the module is circular;
- passes `executablePath` from `playwright-core/lib/client/browserType.js`
  `BrowserType.prototype.launch`. Match the **client** path; the server module has a
  different signature.

Run with `NODE_OPTIONS=--require=<scratch>/preload.cjs npx playwright test`. Record the hash
in the developer log.

## Read first (only these)

1. `CLAUDE.md` working rules: red before, green after; never change price values; no
   artifacts in the tree.
2. This file.
3. `index.html`, by symbol (line numbers at `f7a2c59`):
   - `calcAutoMaterials` (1885), which builds the automatic lines;
   - `computePricing` (3819–~3900), where manual and automatic lines meet `lookupCost`
     and the unit check;
   - `centsOf` (3789);
   - `lookupCost` (1697) and `DEFAULT_COST_DB` (1371): every entry has `cost` and `unit`;
   - `updatePanel` (2493), the on-screen materials list;
   - `openCostEditor` (4359), where a pack size control belongs;
   - `snapshotState` and `applyState` (937–~1010): pack sizes must save and load with the
     job, and `applyState` must coerce them;
   - `validateProject`, near line 4658 (`UNIT_MISMATCH`).
4. `tests/takeoff-counts.spec.js` lines 1–60 (helpers) and 201–243 (`GOLDEN`, `bomFor`), and
   `tests/editable-site-adders.spec.js` lines 23 and 64–70 (R15).
5. `Docs/research/2026-10-15_market-readiness.md`, section "Finishing without more owner
   field knowledge", paragraph on purchasing policy.

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

## C1 — order quantities in purchasable units (this round)

Every materials line gets a contractor-editable **pack size**: fabric roll 50 ft, top rail
21 ft stick, ties per bag, screws per box, concrete per bag, pickets per bundle, and so on.
The default is 1, which reproduces today's behavior. Show both a *needed* and an *order*
quantity.

Rules:
- **Rounding policy per item.** Bulk items (fasteners, ties, concrete bags, caps, bands)
  round across the whole job: `order = ceil(sum(needed) / pack) × pack`. Cut stock (panels,
  rails, stick goods) must not be pooled across sections. Three hog-panel sections of
  40/26/18 LF need 7 sixteen-foot panels, but `ceil(84/16) = 6`. Either round per section,
  or leave cut stock at pack 1 and say so. Do not invent offcut reuse.
- **Pricing stays unit-faithful.** Price whatever unit the contractor's rate-card entry
  uses. If the rate is per pack, extend `order / pack` packs. If it is per piece or per LF,
  extend `order`. Keep the existing `UNIT_MISMATCH` guard and never convert silently.
- **Pack sizes are company defaults**, stored with the rate card. A job carries the values
  it was priced with. Loading a job must never write to the company card (the D-1 / v6.0
  invariant in `CLAUDE.md`).
- **No default pack values** beyond 1 unless a C0 citation supports them. Defaults are
  contractor data.

**Done when:**
- With every pack size at 1, all 14 goldens, R15 = 28692 and the full suite are unchanged.
- A red-before test shows a real pack size rounding the order up across the whole job for a
  bulk item.
- A red-before test shows cut stock not pooled across sections (the 40/26/18 hog-panel case,
  or the documented pack-1 restriction).
- A save and reload test keeps pack sizes with the job without touching the company card.
- The panel shows *needed* and *order*.
- `npm test`, the matrix and `git diff --check` all pass, and a developer-log entry is
  appended.

Stop after opening the PR. Do not start C2.

## Later tasks (unchanged; one per round)

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
2. Footing depths past 42" (currently extrapolated); vinyl split-rail default height.
3. Collinear joint between two runs: line post or end post (CAD-06).
4. Line-post concrete; residential post stock lengths; truss rods, sleeves, carriage bolts;
   rail ties on mid/bottom rails.
5. C0b product premises: the vinyl privacy panel system (two-channel or not), farm end
   H-braces, cantilever single or dual track, supported gate assemblies for types other than
   chain link, and chain-link commercial sizes. See the C0 reference, "Non-default comparisons".
6. C4 conflict: the ratified 168 LF fixture has two posts at the house. Is "attached to
   the wall" a separate end type from "post beside the house"?

## Branches

Start from `main` (`f7a2c59` or later). Push C1 to `claude/counting-c1`, one PR to `main`.
Later tasks: `claude/counting-c<N>` (or `codex/counting-c<N>` for Codex), each from the
previous task's merged `main`. Gate per task: `npm test`, `node scripts/cad-persistence-matrix.js`,
`git diff --check`, and an entry in `Docs/development/DEVELOPER_LOG.md`.
