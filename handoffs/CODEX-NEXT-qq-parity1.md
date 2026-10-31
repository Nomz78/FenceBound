# CODEX-NEXT — quick quote parity tests (Q1t), round 1

Coordinator: Claude Code. Owner authorized 2026-10-31: quick quote Q1 (Claude builds) and Q1t (you: tests).
Owner ruling: **typed sides build a schematic layout** priced by the existing takeoff.

## Read first

- `Docs/planning/QUICK_QUOTE_DESIGN_2026-10-31.md` §1 and §4 (lines 21-45, 76-82).
- `handoffs/CODEX-RESULT-footage-survey1.md` §4 (your U-shaped fixture).
- Fixture style: `tests/audit-repairs.spec.js` lines 25-40, 140-150 (drawn runs, `attachGateToRun`).

## The contract you test (Claude implements it in `index.html`; do not edit `index.html`)

```js
buildTypedLayout({
  fenceType: 'woodprivacy', height: 72,          // job defaults
  sides: [50, 50, 50],                            // feet; or {length, fenceType, height} per side
  shape: 'open',                                  // 'open' | 'closed' (closed adds the closing side if needed)
  gates: [{ side: 1, gateType: 'walk', width: 4, offset: 20 }], // side index; offset ft from side start;
})                                                // offset omitted = centered on the side
// -> { ok: true } or { ok: false, errors: [...] }
```

Geometry: start at (0,0), first side heads +x (east), each next side turns +90° in screen coordinates
(east → south → west → north), world = feet × `GRID_FT`. For a closed shape the sides must close the loop.
It replaces `S.elements` with ordinary fence runs (fresh `runId`s), gates attached with `attachGateToRun`,
and auto posts exactly as a newly drawn run of that type/height gets them (the drawing tool's spec path),
then sets `S.layout = 'typed'`. Banner, PDF title and validation warning are Claude's UI tests, not yours.

## Task

New file `tests/quick-quote-parity.spec.js`. For each fixture, build the **drawn** job directly (as the existing
specs do, with specs from the same path the drawing tool uses; say which in your RESULT) and the **typed**
job via `buildTypedLayout`, then assert equal: normalized BOM (`calcAutoMaterials` name, unit, qty, priced
qty), labor lines, and every cents figure from `computePricing`. Fixtures:

1. U: your survey §4 fixture (woodprivacy 72, sides 50/50/50, walk gate side 1 offset 20).
2. L: two sides, chainlink, no gates.
3. Closed loop: four sides 40/30/40/30, one double gate centered.
4. End gate: gate flush at the end of the last side (offset = length − width).
5. Two types: sides of two fence types (per-side `fenceType`).

Plus one guard: `buildTypedLayout` with a gate wider than its side returns `ok:false` and leaves `S.elements`
unchanged.

## Done when

- The tests exist and **fail now** on `main` (function missing): show the failing run (count and first error).
  They pass once Claude's Q1 lands; you do not need to see them pass.
- `git diff --check` clean; existing suite untouched.
- Append to `Docs/development/DEVELOPER_LOG.md`; write `handoffs/CODEX-RESULT-qq-parity1.md` (fixtures, the
  spec path you used, any contract ambiguity you hit). Leave the work uncommitted; the coordinator commits
  ("Implemented by Codex").

## Branches

Start: `codex/qq-parity1` (fresh off `main` `f4ece25`). Push (coordinator): `test/quick-quote-parity1`.
