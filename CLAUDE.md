# FenceBound — AI Session Context
## Canonical runtime
`index.html` — canonical single-file FenceboundCAD browser app.
Contains CAD, BOM, pricing, validation, persistence, and PDF export. No build
step. Serve over HTTP; do not open via file://
(localStorage is per-origin and file:// diverges from the test environment).
Do not hardcode its line count in session guidance; it changes with every
accepted repair. Locate runtime constructs by symbol search.

Historical versioned HTML is under `archive/` and is not canonical.
`archive/FenceboundCAD v5.3.4-embedded-project-index.html` remains **frozen**;
moving it did not authorize editing it. FenceScraper v3 remains active at root.

Owner-ratified exemption: v5.3.8 `index.html` continuation is authorized only
for defect repair and data integrity. No feature work until v6.0.

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
`npm run test:phase-one` — Playwright, `tests/` only. `test/` is the separate
NCDOT connector suite; do not confuse the two.
Requires npm registry, Playwright browsers, and cdnjs (jsPDF test).

## Known defects
D-1 rate-card write-back, D-2 undo hydration, and D-3 Saved Jobs reference
isolation were repaired in the 2026-07-30 session. Regression coverage is in
`tests/persistence-integrity.spec.js`. O-5 separation is deferred to v6.0; the
D-1 repair is a provenance guard, not that redesign.

Phase 1 remediation audit found no unguarded provenance caller and no persisted
Set outside `specs`/`runSpecs`; R1 and R2 were predictions, not defects. Do not
restate them as confirmed findings.

Manual `S.materials` pricing was repaired after `8836b61`. Remaining integrity
defects: failed portable import is not atomic; matrix route 10 does not price
migrated jobs and unknown legacy types can produce incomplete/zero pricing. See
the 2026-08-01 persistence handoff.

FenceScraper public-market evidence is deferred in favor of field data capture.
Preserve its context and accepted statewide/regional design; resume only under
the conditions in `Docs/execution/FENCESCRAPER_PUBLIC_MARKET_EVIDENCE_DEFERRAL_2026-08-01.md`.

v6.0 pricing requirement: "A project carries a frozen quoted-price snapshot. The
company rate card is a separate store. Loading a project never writes to the
company rate card."

Undo-label invariant: every `snapshotDoc()` capture deep-clones labels, and an
undo/redo snapshot is popped from its stack before its label array becomes live.
This is a load-bearing assumption; future history refactors must preserve it or
introduce explicit restore cloning with a red-before test.

## Working rules
- Two active tracks maximum (July 17 execution controls).
- Smallest justified change. No feature work inside a defect repair.
- New tests must fail before the fix and pass after. Demonstrate both.
- Never alter pricing **values**. Pricing **behavior** changes need a defect.
- Append to `Docs/development/DEVELOPER_LOG.md` every session.
- Standalone handoff in `Docs/execution/` per the template.
- Promote no release candidate. Owner decision only.
