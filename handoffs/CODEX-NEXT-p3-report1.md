# CODEX-NEXT — field capture P3 job-report figures, round 1

Coordinator: Claude Code. **Authorized by the owner 2026-10-31 (duo r5):** field capture P3, the job report.
Owner answers (developer log, "duo r5: field capture P3 owner answers"): separate Job report PDF; labor compared
in **dollars** (person-hours × `crewHourlyRate`) with actual h/LF shown; installed LF = runs marked `finished`,
no `installedOverride`; a "Close job" mark (`actuals.closedAt`). **Your part is only the pure figures function
and its fixture test.** Claude builds the app section, the PDF and Close job on top. No pricing **values** or
pricing behavior change; nothing writes `S.quote`, `S.actuals` or the company rate card.

## Read first

- `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` lines 36-63 (§2 data), 84-104 (§5-§6).
- `index.html` by symbol: `sanitizeActuals`, `sanitizeMaterialLine`, `fieldRunStage`, `fieldLineC`,
  `updateFieldMaterials` (estimate/actual material sums), `centsOf`, `computePricing` (the `return {` object:
  `cents`, `laborCost`, `clientTotal`, `flags`), `useQuotePricing` (a quoted job prices at its frozen rates).
- Style reference: `tests/field-capture*.spec.js` (how actuals are set up in a test).

## Task

1. Add `jobReport()` near the Field-tab code. Pure: reads `S`, `computePricing()` and `LABOR`; mutates nothing.
   Returns integer cents for money and plain numbers otherwise, `null` where a figure is unknown:
   - `materials: {estC, actC, linesEntered, lines}`: the same sums the Field materials summary shows
     (`fieldLineC`); `actC` over entered lines only.
   - `labor: {estC, personHours, actC, hPerLF}`: `estC` = estimate labor cost (`computePricing().cents`);
     `personHours` = Σ per day crew × (end − start − breakMin)/60, days without both times skipped and counted in
     `daysWithoutTimes`; `actC` = `centsOf(LABOR.crewHourlyRate, personHours)`; `hPerLF` = personHours ÷
     installed LF (null when LF is 0).
   - `installed: {lf, plannedLF, runsFinished, runsTotal}`: LF of fence runs whose `fieldRunStage` is `finished`.
   - `revenueC`: `S.quote.total` in cents when quoted, else `computePricing()` client total; `quoted: bool`.
   - `margin: {estC, actC, actPct}`: revenue − (materials + labor), estimate and actual. Actual uses entered
     lines only (no estimate fill-in), and the report carries `complete: false` when any material line is blank
     or any day lacks times. Note it in your result file if you disagree.
   - `days`, `daysWithoutTimes`, `closedAt` (echo `S.actuals.closedAt ?? null`; Claude adds the field).
2. Red first: new `tests/job-report.spec.js` with one fixture job (2 fence runs of known LF, one finished, a
   priced quote, 2 days with crew/times/break, 3 material lines, one blank) and **every expected figure written
   out by hand in the test as a literal** with a one-line comment of the arithmetic. Plus: empty actuals →
   zeros/nulls without throwing; a day missing times is skipped and counted. Show red (function absent).
3. Green, then the full gate: `npx playwright test` and `node scripts/cad-persistence-matrix.js`, each to a log
   under `/tmp/duo/p3-report1-*.log`; report counts.

## Done when

Red then green shown; full gate counts reported; `git diff --check` clean; developer log appended;
`handoffs/CODEX-RESULT-p3-report1.md` written. Leave the work uncommitted on `codex/p3-report1`; the coordinator
commits ("Implemented by Codex"). Note any design question you had to decide.
