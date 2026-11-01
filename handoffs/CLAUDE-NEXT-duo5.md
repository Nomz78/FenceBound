# CLAUDE-NEXT — duo, round 5

## Current state

- `main` `9c54ef7`: #57 **field capture P2** (materials actuals, `1fb3198`) and #58 **"Drawing changed the
  price" notice** (Implemented by Codex, `6789e36`) merged. Gate on the combined code: `npx playwright test`
  288/288, `node scripts/cad-persistence-matrix.js` 12/12.
- **Authorized (owner, 2026-10-31): field capture P3**, the job report (design §5 first bullet, §6 P3: "report
  figures match a fixture job by hand"). One track; a second needs the owner. Not authorized: P4 "Your numbers",
  per-side type in the quick-quote form, F13 bullet 3.
- Codex worktree `../FenceBound-codex` is on `feat/qq-price-notice` (merged), clean, no stashes; its interactive
  session is closed. Branch it fresh off `main` for a Codex job (launcher pattern: `/tmp/duo/qq-notice1.run`).
- `CURRENT_STATE.json` head is stale (`56c5d9f`): refresh at this round's PR closeout.

## Read first

- `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` lines 36-63 (§2 data), 84-104 (§5-§6).
- `Docs/development/DEVELOPER_LOG.md`: search "Field capture P1" and "duo r4: authorization" (P1/P2 facts).
- `index.html` by symbol: `sanitizeActuals`, `sanitizeMaterialLine`, `fieldRunStage`, `updateFieldMaterials`,
  `fieldLineC` (actuals); `computePricing` return (`laborLines`, `matLines`, `clientTotal`, `cents`);
  `exportEstimatePDF` and `tests/estimate-pdf.spec.js`, `tests/plan-pdf.spec.js` (PDF patterns).

## Open questions (ask the owner before building; AskUserQuestion, one round)

1. **Which PDF gets the report page?** The estimate PDF goes to the customer and the report shows cost and margin.
   Recommend a separate "Job report" PDF (or the Plan PDF), never the customer estimate.
2. **Estimated labor:** the estimate is $/LF (hours only in hours mode). Compare labor **dollars** (actual
   person-hours × `crewHourlyRate` vs estimate labor $) and show actual h/LF; or something else?
3. **Installed LF:** runs marked finished (design §2 `installedOverride` is not built). Recommend finished-run LF
   with no override in P3.
4. **Closed jobs:** `closedAt` is not built; P4 needs it ("≥3 closed jobs"). Add a "Close job" mark in P3 or
   leave it to P4?

## Remaining steps

1. Ask the questions above; record answers in the developer log. Done when logged.
2. Split: design §6 gives P3 to Codex (report/PDF). Suggested: Codex builds the pure figures function
   (`jobReport()` → materials est/actual, person-hours, labor $, installed LF, margin) with a hand-computed
   fixture test; Claude builds the app section and PDF page on top. Done when both are on one branch.
3. Red-before tests; both gates; PR. Done when the PR is open with counts in its body.

## Branches

Start: `docs/duo-handoff5` (this handoff; PR to `main`), else `main`. New work: `feat/field-capture-p3`.
