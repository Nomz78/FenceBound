# 04 — Test baseline (2026-10-15)

Repo: /home/user/FenceBound, branch claude/focused-bell-rirwad, HEAD 82a148f. No tracked files modified, nothing committed.

## Environment
- `npm ci` run (node_modules was missing). Pinned @playwright/test 1.40.1 expects chromium-1091; only chromium-1194 is installed.
- Full suite: scratch config `scratchpad/gate/playwright.gate.config.js` (extends repo config; launchOptions.executablePath=/opt/pw-browsers/chromium; outputDir in scratchpad).
- Matrix script: `PLAYWRIGHT_BROWSERS_PATH=scratchpad/gate/browsers` (chromium-1091 symlink -> chromium-1194).
- cdnjs.cloudflare.com is BLOCKED by the egress proxy (`CONNECT tunnel failed, response 403`). index.html loads jsPDF 2.5.1 from cdnjs, so `window.jspdf` never appears.

## Results
| Gate | Result |
|---|---|
| `npm test` (96 tests) | **67 passed, 29 failed** (11.8 min) |
| `node scripts/cad-persistence-matrix.js` | **12/12 routes pass**, exit 0 |
| `npm run session:init` | exit 1, **DRIFT DETECTED** (environmental) |

### Failing tests (all 29 identical cause)
All fail with `page.waitForFunction: Timeout 20000ms exceeded` at `waitForFunction(() => !!window.jspdf)` — jsPDF unavailable because cdnjs is blocked. None are logic failures.
- persistence-integrity.spec.js:356 T-E1 invalid estimate and plan PDFs export with warning
- persistence-integrity.spec.js:482 R16 manual material visible on estimate PDF
- persistence-integrity.spec.js:544 F2 estimate renderable for 19 cases (NO_FENCE_RUNS, PROJECT_NAME, CUSTOMER_NAME, JOB_ADDRESS, RUN_ID_MISSING, RUN_ID_DUPLICATE, FENCE_TYPE, RUN_LENGTH, HEIGHT, POST_HEIGHT, EMBEDMENT, POST_SPACING, ORPHAN_GATE, GATE_TYPE, GATE_WIDTH, NO_BOM, MISSING_COST, ZERO_COST, TOTAL_INVALID)
- persistence-integrity.spec.js:558 F3 warning caps details, estimate one page
- persistence-integrity.spec.js:576 F4 plan warning reserved space
- persistence-integrity.spec.js:605 R9 exports survive imported null start / constructor fence type / toString fence type (3)
- phase-one-acceptance.spec.js:250 #6 successful validation and client estimate PDF
- v5.4-port.spec.js:135 missing company profile warns but does not block estimate export
- v5.4-port.spec.js:150 long company term paginates in estimate PDF

Interpretation: all non-PDF tests (67) pass. Recorded baseline in CURRENT_STATE is 96/96 + matrix 12/12; the 29-test gap is fully explained by network, not a regression (unverified until run with cdnjs reachable).

### session:init drift
- branch mismatch: actual claude/focused-bell-rirwad vs recorded fix/field-hole-depths
- recorded HEAD cdbb366 != actual 82a148f; upstream none vs origin/fix/field-hole-depths
- Otherwise: worktree clean, app 5.4.0, schema 3, handoff metadata agrees with state. Plus 4 "known" warnings.

## Worktree check
`git status --porcelain` after runs: only `?? Docs/research/2026-10-15_estimator-audit/` (created 02:57 with audit .md and repro/ harness files) — NOT created by the test run (another agent's output); left untouched. test-results went to scratchpad. node_modules/ is ignored. No /tmp PDF leftovers of note beyond tests' own os.tmpdir() files.
