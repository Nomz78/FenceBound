# CLAUDE-NEXT — duo, round 3

## Current state

- `main` `f4ece25` (#53 merged). Open: **#54** `feat/quick-quote-q1`: quick quote Q1 (`e92dea4`, Claude) + Q1t
  parity tests (`84c9647`, Implemented by Codex), plus this file and the F13 brief. Gate on the branch:
  `npx playwright test` 268/268, matrix 12/12. Owner merges: `! gh pr merge 54 --merge`.
- Owner rulings 2026-10-31 (developer log "duo r2"): typed sides; `crewHourlyRate` per person-hour; equipment
  own markup; hours labor keeps the gate fee (F13 = defect); field capture all as designed (run taps, two
  stages posts set/finished, "Your numbers" inside the rate-card editor).
- Authorized: Q1 + Q1t (done, #54), **F13 repair** (Codex, running or queued), **field capture P1** (Claude, next).
  Two-track limit: track 1 now = field capture P1, track 2 = F13.
- Codex: `../FenceBound-codex` on `codex/f13-gate1` off `f4ece25`, brief `handoffs/CODEX-NEXT-f13-gate1.md`.
  Owner launches `bash /tmp/duo/f13-gate1.run` (or types "Read and do handoffs/CODEX-NEXT-f13-gate1.md" into
  the Codex tab). Its old qq-parity1 files are in `git stash` there (already copied into #54; drop after merge).
- Q1 notes: the flag is `jobLayout()` from `schematic:true` on runs (not `S.layout`); `markLayoutDrawn()` runs on
  draw/move/delete. Not done: the "Drawing changed the price $X → $Y" notice (design §3), per-side type in the
  form (API supports it). `CURRENT_STATE.json` head is stale: refresh at the next PR closeout.

## Read first

- `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` §1-3 and §6 (lines 20-75, 95-104).
- `handoffs/CODEX-RESULT-field-survey1.md` §2-3 (lines 28-52).
- In `index.html`, by symbol: `snapshotState`, `applyState` (persistence), `jobLayout`/`buildTypedLayout`
  (run ids a schematic carries), `updateDrawers` (drawer pattern).

## Remaining steps

1. **When Codex finishes F13:** check `handoffs/CODEX-RESULT-f13-gate1.md` exists in `../FenceBound-codex`;
   review the diff; copy to branch `fix/f13-hours-gate-labor` off `main`; rerun both gates; commit
   "Implemented by Codex"; PR. Done when the PR is open with red/green shown.
2. **Field capture P1** (Claude), branch `feat/field-capture-p1` off `main` (after #54 merges): `S.actuals`,
   sanitizer, snapshot, boot rule, Field tab, day log, run taps (two stages), save-failure flag. Done when a day
   logged on a phone viewport survives reload, Save, export/import, and bad actuals are dropped on load
   (red-before tests; both gates).
3. Developer log each session; check the handoff rule at each stopping point.

## Branches

Start: `feat/quick-quote-q1` until #54 merges, then `main`. New work on fresh branches off `main`.
