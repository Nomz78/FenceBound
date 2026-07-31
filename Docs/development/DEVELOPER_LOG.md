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
