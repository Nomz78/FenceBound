# FenceBound — AI Session Context

## Canonical runtime
`index.html` — single-file browser app, 3,639 lines. FenceboundCAD.
Contains CAD authoring, run/gate ownership, BOM, pricing, validation,
persistence, PDF export. No build step. Serve over HTTP; do not open via file://
(localStorage is per-origin and file:// diverges from the test environment).

Versioned `.html` files at repo root (v5.3.1, v5.3.4-embedded, RateCard) are
**historical artifacts**. Not canonical. Do not edit.
`FenceboundCAD v5.3.4-embedded-project-index.html` is **frozen** by governance.

## Authority
1. `Docs/FenceBound_Engineering_Bible_Edition_1.0.md` is the frozen base;
   `Docs/authoritative/` supplements it. Currently the supplement is the
   2026-07-17 Integrated Governance record.
2. Accepted source and `tests/phase-one-acceptance.spec.js` define implemented
   behavior.
3. `SOURCE_OF_TRUTH.md` defines the repository authority hierarchy.
4. `Docs/status/` and `Docs/reference/` provide status and navigation.
5. Owner decisions supersede recommendations; both remain recorded.

Generated AI output is never canonical. Source wins over documentation.
Conflicts are recorded, not silently reconciled.

## Tests
`npm run test:phase-one` — Playwright, `tests/` only.
`test/` is the separate NCDOT connector suite. Do not confuse the two.
Requires npm registry, Playwright browsers, and cdnjs (jsPDF test).

## Known defects
See GitHub Issues. Persistence-boundary class in `index.html`: project state
crossing a persistence boundary without correct serialization.

## Working rules
- Two active tracks maximum (July 17 execution controls).
- Smallest justified change. No feature work inside a defect repair.
- New tests must fail before the fix and pass after. Demonstrate both.
- Never alter pricing **values**. Pricing **behavior** changes need a defect.
- Append to `Docs/development/DEVELOPER_LOG.md` every session.
- Standalone handoff in `Docs/execution/` per the template.
- Promote no release candidate. Owner decision only.
