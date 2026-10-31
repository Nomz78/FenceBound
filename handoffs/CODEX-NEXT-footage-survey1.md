# CODEX-NEXT — quote without a drawing: takeoff survey, round 1 (read-only)

## Current state

- Owner, 2026-10-31: owners quote from fence types/specs, footage, equipment and crew size; **the drawing comes
  last, for the foreman**. FenceBound is drawing-first: footage, posts and price all come from drawn runs.
  Claude is designing a **quote without a drawing**: footage lines (type, height, LF, gates, ends/corners) priced
  by the existing takeoff and pricing, then "Draw it for the foreman" later. Labor methods per job: per foot
  (today), crew × days, multiplier (D6, later). Equipment as line items.
- Your job: the read-only survey of the riskiest unknown, **how typed footage can feed the existing takeoff
  without geometry**. **Change no code and no test.** One new file only.
- Context: `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md`, `Docs/planning/PRIORITY_RANKING_2026-10-31.md`,
  your own `handoffs/CODEX-RESULT-field-survey1.md` §1 (on main).

## Read first

- `index.html` by symbol search: `getStats`, `calcAutoMaterials`, `computePricing`, `gateOwnerRun`,
  `snapshotState`/`applyState`, the run element shape (`S.elements` type `run`/`gate`, `specs`/`runSpecs`).

## Steps

1. **Geometry inputs.** Which takeoff figures depend on geometry (corner/terminal detection, line-post spacing,
   section cut lengths, gate ownership, collinear joins, slope), and which depend only on LF, height, type and
   specs. Function + line for each. Done when every `getStats`/`calcAutoMaterials` output is classified.
2. **Minimum inputs per footage line.** What a typed line must carry for the same BOM: LF, type, height/specs,
   ends, corners, gates (type, width), anything else. Done when the list is complete and each item is tied to
   step 1.
3. **Options to feed the takeoff.** At least: (a) synthesize straight runs from typed lines (corners as joined
   segments) and reuse `getStats` unchanged; (b) a parallel stats builder from typed counts; (c) others you find.
   For each: what stays identical to a drawn job, what can diverge, what tests would prove equality, and how
   "Draw it later" reconciles drawn vs quoted LF. Facts and trade-offs; no pick.
4. **Equality check.** For one fixture shape (e.g. a 3-sided 150 LF wood privacy yard with one walk gate), state
   what a typed-line quote would need to reproduce the drawn job's BOM and total, and whether that holds under
   each option. Reasoning from source only; do not run code.

Write `handoffs/CODEX-RESULT-footage-survey1.md` (sections 1-4, terse, path:line references). Leave it
uncommitted; the coordinator commits.

## Branches

Start: `codex/footage-survey1` from `origin/main` (`56c5d9f`). Coordinator pushes.
