# CODEX-NEXT — field data capture survey, round 1 (read-only)

## Current state

- Owner, 2026-10-31: next tracks are (1) the **field data capture design**, then (2) a **priority ranking**
  (order of operations) of the remaining work. Claude writes the design and the ranking. Your job is the
  read-only survey both depend on. **Change no code and no test.** Your only output is one new file.
- Field data capture = recording **actual material cost, labor hours and installed quantity per job**, so the
  owner gets verified cost data (today every cost is a list price, estimate or inference). Context:
  `Docs/execution/SESSION_HANDOFF_2026-08-01.md` S4 (lines 79-94) and
  `Docs/research/2026-10-15_estimator-audit/06-research-methodology.md` section 2.1 (lines 97-105).

## Read first

- `index.html` by symbol search: `snapshotState`, `applyState`, `getStats`, `computePricing`, the Saved Jobs
  write (`STORAGE_KEY`), `AUTOSAVE_KEY`, `COSTDB_KEY` / `COST_DB` / `LABOR`, `S.quote`, `writeQuoteToSavedJob`,
  the portable export/import functions. Do not read the whole file.

## Steps

1. **Estimate side (what actuals compare against).** For one job: where the estimated material lines
   (item, qty, unit, unit cost), labor lines (hours or $, by what driver: LF, post, gate, brace) and
   installed-quantity figures (LF by type, posts, gates) are computed, with function names and line numbers.
   Is the labor model hours-based or $-based? Done when each figure has a function + line.
2. **Job record shape.** The fields of a Saved Jobs record, the autosave snapshot and the portable export, and
   where `S.quote` (frozen price + signature) sits. Which stable job id exists (`S.jobId`?). Done when the
   survey lists the keys and the function that writes each store.
3. **Attachment points.** Where an `actuals` record per job could live without breaking the v6.0 rule
   ("loading a project never writes to the company rate card") or the 6b quote/rate-card split, and which
   sanitizer (`applyState`, import) would need to accept it. Facts and options only; no recommendation.
4. **Storage budget.** Current localStorage keys and any size caps (`SIGNATURE_MAX_CHARS`, `UNDERLAY_MAX_PX`,
   others). Done when listed with line numbers.
5. **Open-work inventory for the ranking.** Grep the repo docs (`Docs/`, `handoffs/`, `CLAUDE.md`) for items
   recorded as deferred, open, out of scope or owner-pending (e.g. O-5/v6.0, O-6, 6c e-sign audit trail,
   FenceScraper deferral, estimator-audit data gaps). One line each with its source path:line. Done when the
   list is complete and deduplicated.

Write `handoffs/CODEX-RESULT-field-survey1.md` (sections 1-5, terse, path:line references). Leave it
uncommitted; the coordinator commits.

## Branches

Start: `codex/field-survey1` from `origin/main` (`eddb986`). Coordinator pushes.
