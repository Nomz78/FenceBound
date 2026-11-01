# CLAUDE-NEXT — duo, round 6

## Current state

- `main` `cfb6011`: #60 **field capture P3** merged. It holds `jobReport()` (Implemented by Codex, `5c24fb0`), a
  null-quote-total fix (`17a8553`), the Field-tab Job report section, `exportJobReportPDF()` (own file, internal,
  never the customer estimate) and Close/Reopen job (`S.actuals.closedAt`). Gate on the merged tree:
  `npx playwright test` 297/297, `node scripts/cad-persistence-matrix.js` 12/12.
- `CURRENT_STATE.json` refreshed to `cfb6011` in this round's docs PR (`docs/duo-handoff6`).
- Codex worktree `../FenceBound-codex` is on `codex/p3-report1` (merged), clean. Branch it fresh off `main` for
  a Codex job (launcher pattern: `/tmp/duo/p3-report1.run` + `.prompt`).
- **Nothing is authorized.** Candidates for the owner: P4 "Your numbers" (design §5-§6; needs ≥3 closed jobs,
  which can now accumulate), per-side type in the quick-quote form, F13 bullet 3, and the job-report follow-up
  below.
- Open observation (not a defect filed): the report's estimated materials sum only the lines loaded into the
  Field tab (`S.actuals.materials`). A job with no lines loaded shows $0 estimated materials and an inflated
  estimated margin. Possible fix: fall back to `computePricing().cents.matCost` when no lines are loaded.

## Read first

- `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` lines 84-104 (§5-§6), for P4.
- `Docs/development/DEVELOPER_LOG.md`: search "duo r5" (owner answers, P3 integration).
- `index.html` by symbol: `jobReport`, `jobReportRows`, `updateFieldReport`, `exportJobReportPDF`.

## Remaining steps

1. Ask the owner which track to authorize (AskUserQuestion, one round). Done when the answer is logged.
2. Brief, build, red-before tests, both gates, PR. Done when the PR is open with counts in its body.

## Branches

Start: `docs/duo-handoff6` (this handoff; PR to `main`), else `main`. New work: a fresh `feat/…` off `main`.
