# CODEX-NEXT — F13 gate labor under hours override, round 1

Coordinator: Claude Code. Owner ruling 2026-10-31 (developer log, duo r2): **hours-based labor still adds the
per-gate install fee.** That confirms audit F13 as a defect; this is its repair. Smallest change, no features.

## Read first

- `Docs/research/2026-10-15_estimator-audit/01-pricing-audit.md` lines 218-222 (F13).
- `index.html` `computePricing`, section "2. LABOR COST" (search `LABOR COST — $/LF by type`): the gate-install
  block (`gateUnitC`, `laborBySecC[owner.fenceType]`) sits inside the `else` of `if(useHours)`, so hours mode
  drops it.
- A labor test for style: `rg -n "labor-hours" tests/` (pick the closest spec).

## Task

1. Red first: a new test in `tests/f13-hours-gate-labor.spec.js`: one run + one walk gate, `labor-hours` = 0.5:
   the labor lines contain both "Crew labor" and "Walk Gate install", `laborCostC` = crew cents + gate cents,
   and the gate's cents land in its owning run's section (`laborBySecC`/section totals). Show it failing.
2. Fix: gate install labor applies in both modes (move the gate block out of the `else`). Per-LF labor still
   gives way to crew hours. No pricing **values** change; no other behavior.
3. Green: the new test, then the full gate: `npx playwright test` and `node scripts/cad-persistence-matrix.js`,
   each to a log file; report counts. Existing tests that encoded the old drop: list them and the change.
4. Out of scope (note only): the empty-drawing + hours total with no PDF lines (F13 bullet 3); relabelling
   hours as person-hours (owner ruled `crewHourlyRate` is per person-hour; crew × days is quick quote Q2).

## Done when

Red then green shown; full gate counts reported; `git diff --check` clean; developer log appended;
`handoffs/CODEX-RESULT-f13-gate1.md` written. Leave the work uncommitted; the coordinator commits
("Implemented by Codex").

## Branches

Start: `codex/f13-gate1` (fresh off `main` `f4ece25`). Push (coordinator): `fix/f13-hours-gate-labor`.
