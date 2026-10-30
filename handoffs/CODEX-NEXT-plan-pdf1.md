# CODEX-NEXT — plan PDF rebuild, round 1 (REDO 4)

## Current state

- Owner authorized all six REDO items on 2026-10-30 (`Docs/development/DEVELOPER_LOG.md`, entry
  "REDO 1: click-to-chain drawing"). Claude is on REDO 1 (drawing) on `feat/redo1-click-chain-drawing`; this
  is the second active track. Keep to `exportPDF()` so the two tracks don't conflict.
- The REDO list itself: `git show 371850a:HANDOFF.md | sed -n 54,70p`.
- Audit F5/F7c already fixed the plan PDF's post summary (gate posts) and legend (used types only). Keep their
  tests green: `tests/audit-repairs.spec.js` "F5 plan PDF post summary", "F7c plan PDF legend".

## Read first

- `index.html`: `function exportPDF()` (symbol search; about line 3163) — the plan PDF.
- `index.html`: `companyDisplayName`, `companyContactLine`, `hexToRgb`, `COMPANY` — the contractor profile,
  already used by `exportEstimatePDF()`; reuse them, don't add a new profile store.
- `tests/audit-repairs.spec.js:122-200` — how plan-PDF strings are captured in tests.

## Steps

1. **Light theme:** white page, dark linework and text; fence-type colors still readable when printed in grey.
   Done when a test checks the page background fill is white (no full-page dark rect).
2. **Contractor branding:** header shows `companyDisplayName()` and contact line, in the brand color from
   `COMPANY`; "FenceBound" appears at most as a small "made with" footer. Done when a strings test finds the
   company name in the header and no "FenceBound" title.
3. **Scale bar:** a labeled bar (e.g. 0 / 10 / 20 ft) sized from the actual drawing scale used on the page, plus
   a north arrow is optional. Done when a test reads the bar label and its length matches the scale to 1%.
4. New tests fail before and pass after; show both. Run `npm test` (about 5 minutes, 217 tests now) to a log file.
5. Append to `Docs/development/DEVELOPER_LOG.md`, commit, push `feat/redo4-plan-pdf`, open a PR to `main`.
6. Write `handoffs/CODEX-RESULT-plan-pdf1.md` (commits, PR number, before/after test counts, anything open).

Don't change counts, pricing values or the estimate PDF (that's REDO 5, next).

## Branches

Start: `main` (pull first; your worktree is behind at `82a148f`). Push: `feat/redo4-plan-pdf`.
