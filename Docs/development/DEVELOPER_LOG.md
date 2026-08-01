# FenceBound Developer Log

Append one entry for every development session. Preserve prior entries.

## 2026-07-30 — FenceboundCAD persistence integrity

- **Objective:** Reproduce and minimally repair the authorized D-1 company-rate-card, D-2 undo add-on hydration, and D-3 Saved Jobs reference-isolation defects.
- **Start commit:** `76ddb8d0896a744b813a06f106a329c218680d19`
- **End commit:** Phase 6 closeout commit on `fix/cad-persistence-integrity-v4` (this entry); implementation repairs end at `55aff9e`.
- **Files changed:** `index.html`; `tests/persistence-integrity.spec.js`; `scripts/cad-persistence-matrix.js`; `CLAUDE.md`; this log; `Docs/phase-one-closeout-status.md`; the AI handoff template; and the session handoff.
- **Tests performed:** Unmodified 9-test baseline; eight focused red-before/green-after persistence regressions; full 17-test Playwright suite; twelve-route mixed-system persistence matrix; `git diff --check`.
- **Results:** Baseline 9/9 in 44.4 seconds. Before repairs, all eight focused tests were red. After repairs, 17/17 passed in 48.7 seconds. All twelve matrix routes passed.
- **Defects discovered:** D-1, D-2, and D-3 all reproduced. D-1's first isolation attempt also demonstrated that D-3 could mutate an in-memory historical snapshot before any Load.
- **Debt introduced or reduced:** Removed three persistence corruption paths; added durable regression and matrix coverage. O-5 full project/company pricing separation remains unresolved by design.
- **Decisions made:** Used a provenance guard rather than state redesign; preserved narrow undo scope; used the already-proven JSON boundary semantics for internal Saved Jobs. No pricing values, frozen/historical HTML, release artifacts, or out-of-scope modules changed.
- **Next authorized task:** Owner review of O-1 through O-7 and normal PR review; no release promotion is authorized.

## 2026-08-01 — FenceboundCAD cold-review remediation

- **Objective:** Remediate ratified persistence review findings, implement the owner-approved warn-not-block export policy, assess existing quote contamination and the continuity branch, and record ratified owner decisions.
- **Start commit:** `25d3b3eeb3fb460b8fee25bc0b5d4c1ec1018452`
- **End commit:** Remediation documentation/archive commit on `fix/cad-persistence-integrity-v4`; runtime repair is `44cba6d`.
- **Files changed:** canonical runtime/tests, AI context and status, developer log and handoff, `CHANGELOG.md`, plus historical HTML paths under `archive/`.
- **Tests performed:** parent-compatible red runs for R6/R4/R5 and O-4; focused green runs; complete Playwright suite; frozen-file checksum; diff/syntax/link checks.
- **Results:** R6/R4/R5 were red on the parent and green after repair. Invalid estimate export blocked and portable JSON lacked a warning on the parent; both PDF types and JSON carry recipient-visible warnings after repair. Original acceptance suite: 9/9 in 43.3 seconds. Focused persistence/export suite: 13/13 in 14.5 seconds. Twelve-route matrix: 12/12.
- **Defects discovered:** storage-write exceptions falsely reported success; provenance was sticky after pricing-free apply; missing/corrupt saved cards falsely reported recovery. R1/R2 predictions did not reproduce.
- **Debt introduced or reduced:** reduced persistence and export-truthfulness risk. Existing pre-fix saved-job contamination cannot be distinguished reliably from legitimate quote data; v6.0 pricing-store separation remains required.
- **Decisions made:** O-1, O-2, O-3, O-4, O-5, and O-7 recorded as ratified by the owner; O-6 remains undecided after inspection. No merge or tag performed.
- **Next authorized task:** PR review, owner decision on the continuity branch, and owner confirmation after merge before creating the release tag.

## 2026-08-01 — FenceboundCAD remediation cold-review close

- **Objective:** Correct the five authorized cold-review findings without expanding persistence, pricing, validation, or release scope.
- **Start commit:** `ee035dab3b4a06247189c5cee4a41c01cc6047cb`
- **End commit:** Session-close commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, this log, the persistence remediation handoff, and `CHANGELOG.md`.
- **Tests performed:** F1 red-before and green-after; real estimate PDFs for nineteen reachable validation error classes; capped-warning single-page check; plan warning/drawing geometry check; complete Playwright suites; twelve-route persistence matrix; `git diff --check`.
- **Results:** F1 reproduced on `ee035da`: the failed write left provenance false while the company card stayed unchanged. The repair preserves provenance across failure. All nineteen state-reachable estimate cases rendered with a populated total and without `NaN`, `undefined`, page errors, or exceptions. Exact final totals are recorded in the close report.
- **Defects discovered:** F1 was introduced by remediation commit `44cba6d`. Warn-not-block exposed a separate `PRICING_RUNTIME` export-resilience limitation: validation can catch a pricing exception, but estimate generation calls the same failing function again. `ADDON_STATE` is unreachable after hydration.
- **Debt introduced or reduced:** Restored transactional provenance behavior; added error-class estimate coverage; prevented warning banners from covering plan geometry. The separately recorded pricing-runtime resilience issue remains unresolved by instruction.
- **Decisions made:** Used preserve/clear/restore-on-failure rather than a force-write parameter. Validation logic, pricing values, math, merge state, and tags were unchanged.
- **Next authorized task:** Owner disposition of the pricing-runtime export-resilience finding and normal PR review. Do not merge or tag without authorization.

## 2026-08-01 — PRICING_RUNTIME export-resilience repair

- **Objective:** Repair the O-4 merge blocker so pricing-runtime failures cannot leave estimate, plan, or portable exports silent; investigate and record R11 defects without repairing them.
- **Start commit:** `3e18f3cf0c198d206941e5f97018d3dd7f4dbe4f`
- **End commit:** PRICING_RUNTIME closeout commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, `Docs/phase-one-closeout-status.md`, this log, the persistence remediation handoff, and `CHANGELOG.md`.
- **Tests performed:** R9 red-before and green-after through real portable import for null geometry, `constructor`, and `toString`; all three export formats per input; full Playwright suite; twelve-route persistence matrix; `git diff --check`.
- **Results:** Parent `3e18f3c` produced no estimate for null geometry. Export-local fallbacks now produce explicitly unpriced artifacts without changing pricing or validation behavior. Exact final totals are in the close report.
- **Defects discovered:** Manual `S.materials` are excluded from quote pricing and are recorded as an unintentional quoting-accuracy defect; failed portable import leaves partially applied state; route 10 does not price migrated jobs and unknown legacy types can silently yield incomplete/zero pricing.
- **Debt introduced or reduced:** Removed silent-export behavior for known pricing-runtime inputs. Export-only fallback structures are intentionally not a pricing repair. Three separate defects remain open by instruction.
- **Decisions made:** O-4 remains warn-not-block. `computePricing()`, validation logic, pricing values, `ADDON_STATE`, import semantics, and migration behavior were not changed.
- **Next authorized task:** Repair the manual-material quoting-accuracy defect before treating quote totals as complete; separately authorize atomic portable import and migrated-pricing coverage. No merge or tag was performed.

## 2026-08-01 — Manual-material quoting-accuracy repair

- **Objective:** Include hand-added project materials in the established material pricing path and make those costs visible on client estimates.
- **Start commit:** `8836b6186157810938e7d7b95b6f45bd208ac3ba`
- **End commit:** Manual-material pricing closeout commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, `CHANGELOG.md`, `CLAUDE.md`, `Docs/phase-one-closeout-status.md`, this log, and the persistence remediation handoff.
- **Tests performed:** known and unknown manual cost red/green; five quantity cases; exact automatic-only total identity; equivalent auto/manual markup; estimate-PDF visibility; full Playwright suite; twelve-route persistence matrix; `git diff --check`.
- **Results:** Parent excluded known and unknown manual rows completely. The repair uses one combined BOM and the existing pricing/validation path. Exact final totals are recorded in the close report.
- **Defects discovered:** No new defect. Estimate omission was confirmed as the presentation half of the same manual-material pricing defect.
- **Debt introduced or reduced:** Removed silent quote understatement for manual items. Older saved jobs with manual rows recompute higher; no computed total is persisted. Non-atomic import, route-10 pricing coverage, and dead `ADDON_STATE` remain unchanged.
- **Decisions made:** Empty, invalid, zero, and negative manual quantities normalize to zero; positive decimals remain numeric. Manual marked-up extensions are shown separately and removed only from the LF display allocation, not from pricing totals.
- **Next authorized task:** Owner review of quote changes and remaining import/migration defects. No merge or tag was performed.
