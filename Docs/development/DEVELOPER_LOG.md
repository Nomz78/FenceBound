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
