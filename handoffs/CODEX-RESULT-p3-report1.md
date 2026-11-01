# Codex result — P3 job-report figures, round 1

## Current state

Implemented by Codex on `codex/p3-report1`, based on `8287a81d8769dc804ea56541e7e56538df06e41a`.
All changes intentionally uncommitted for the coordinator. P3 means field-capture phase 3; `report1`
matches the assigned first-round report handoff. No UI, PDF, Close job, persistence, pricing values,
pricing behavior, or rate-card writes added.

- `index.html`: pure `jobReport()` next to `fieldLineC`, returning material cents/entry counts,
  estimated and actual labor cents, person-hours/h per installed LF, finished/planned LF and run counts,
  frozen-quote or current revenue cents, margins, day coverage, completeness and close mark.
- `tests/job-report.spec.js`: literal hand-calculated fixture, empty actuals and missing-time cases;
  fixture also compares all `S`, active pricing and localStorage before/after the call.
- `Docs/development/DEVELOPER_LOG.md`: implementation/validation record.
- This result file: `handoffs/CODEX-RESULT-p3-report1.md`.

## Decisions / integration notes

- `materials.lines` is the total line **count**, matching the Field summary denominator;
  `days` is the logged-day count. Both are plain numbers.
- Estimate materials use captured `S.actuals.materials` estimate fields, exactly as the Field summary;
  no automatic loading or estimate fill-in. Negative actual quantities (returns) reduce actual costs.
- Actual margin uses entered lines only, as directed. No disagreement; consumers must display
  `complete: false` for partial entry rather than imply these are final costs.
- `complete` checks only blank material lines and days missing either time. Empty actuals are
  vacuously complete; it is entry coverage, not proof of job completion or reconciled quantities.
- Zero installed LF gives `hPerLF: null`; zero revenue gives `actPct: null`.
- Day logs contain times without an overnight marker. Reversed times or breaks longer than a shift
  contribute zero hours (no inferred next-day shift and no negative labor); missing times are skipped
  and counted. This is a defensive calculation choice, not a new capture/persistence rule.
- `closedAt` is echoed only. Coordinator still adds its sanitizer/persistence/UI support.
- Active `LABOR` is read as-is. Existing `useQuotePricing()` supplies frozen rates for quoted jobs;
  the report never switches rates or changes the quote.

## Validation (2026-10-31 America/New_York)

- RED: 3 failures, each `ReferenceError: jobReport is not defined`;
  `/tmp/duo/p3-report1-red.log`.
- GREEN: 3/3 passed; `/tmp/duo/p3-report1-green.log`.
- Full Playwright run: 286/291 passed, 5 failed waiting for CDN-loaded `window.jspdf` (20s timeouts);
  `/tmp/duo/p3-report1-full.log`. Recheck of all five failures and related cases: 22/22 passed
  without source, transport or configuration changes; `/tmp/duo/p3-report1-recheck.log`.
  Recheck command: `npx playwright test --config /tmp/duo/p3-report1-playwright.config.js
  tests/persistence-integrity.spec.js --grep 'T-P1|T-E1|R16|F2 estimate remains renderable'`.
  Every test passed across these runs; the initial full run itself was not wholly green.
- Persistence matrix: 12/12 passed, exit 0; `/tmp/duo/p3-report1-matrix.log`.
- `git diff --check`: PASS.
- Full-suite command: `npx playwright test --config /tmp/duo/p3-report1-playwright.config.js`.
  Another checkout's coordinator tests occupied 8080. The temporary config preserves the repository
  settings, points testDir/server at this checkout, uses port 8081 and puts output under `/tmp/duo`.
  No repository test configuration changed. Initial green attempt on default port hit the collision.
- `node scripts/cad-persistence-matrix.js` ran unchanged against this checkout on port 8091.

## Open / coordinator closeout

App section, separate Job report PDF, Close job/sanitizer support remain coordinator scope.
CDN intermittency remains a test-environment limitation; no product fix made outside scope.
Review the calculation choices above, integrate, then commit with attribution "Implemented by Codex".
Session-init reports stale main/head metadata (recorded `56c5d9f`, actual base `8287a81`), and an
upstream difference from recorded main. Audit: clean entry worktree, correct assigned branch,
HEAD exactly equals `origin/feat/field-capture-p3`, canonical `index.html`, app 5.4.0/schema 3.
The assigned handoff and recorded r5 owner answers supersede the stale design-only task record;
`SOURCE_OF_TRUTH.md` also retains an older authority ordering than `START_HERE.md`.
The global initiate-repo skill was not installed locally; repository entry checks were followed.
State/current-handoff refresh and two-commit closeout are deferred to the coordinator, per the
explicit limited scope and instruction to leave changes uncommitted.
