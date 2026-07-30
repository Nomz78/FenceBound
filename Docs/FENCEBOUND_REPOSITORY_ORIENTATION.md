# FenceBound Repository Orientation

Updated: 2026-07-29 (America/New_York)

## 1. Purpose

This is the concise entry document for repository navigation. It identifies where each kind of truth lives, the current CAD checkpoint, known drift, and the next authorized task. It does not replace the Engineering Bible, source, tests, System Atlas, or module-local status.

Evidence labels: **VERIFIED** observed in committed source/tests/governance; **PROVISIONAL** implemented but incompletely verified or unsettled; **TARGET** approved direction not implemented; **CANDIDATE** awaiting approval; **RETIRED** superseded behavior or artifact.

## 2. Authority model

1. Engineering Bible: doctrine, architecture, constraints, accepted direction, and governance.
2. Repository source and tests: implemented and verified behavior.
3. System Atlas and this orientation: placement, ownership, dependencies, maturity, and navigation.
4. Module-local development indexes: local implementation status, defects, dependencies, tests, and punch lists.
5. Git history: accepted engineering history.
6. Developer Log and AI Handoff: chronological continuity.

Conflicts are recorded, not silently reconciled. Doctrine governs intended architecture; source/tests govern actual behavior.

## 3. Repository map

| Path | Responsibility | State |
| --- | --- | --- |
| `SOURCE_OF_TRUTH.md` | Repository authority map and session completion rule | VERIFIED |
| `Docs/FenceBound_Engineering_Bible_Edition_1.0.md` | Frozen Edition 1.0 doctrine | VERIFIED |
| `Docs/authoritative/` | Approved governance supplements | VERIFIED |
| `index.html` | Canonical local-launch/GitHub Pages CAD runtime | VERIFIED |
| `tests/phase-one-acceptance.spec.js` | CAD Phase One acceptance evidence | VERIFIED |
| `Docs/reference/FenceBound_System_Atlas_v0.2.md` | Current System Atlas | VERIFIED |
| `Docs/status/FENCEBOUNDCAD_DEVELOPMENT_INDEX.md` | CAD-local status, defects, tests, and next task | VERIFIED |
| `Docs/development/DEVELOPER_LOG.md` | Append-only session history | VERIFIED |
| `Docs/development/AI_HANDOFF_TEMPLATE.md` | Future-session handoff contract | VERIFIED |
| `FenceboundCAD v5.3.4-embedded-project-index.html` | Frozen forensic prototype | RETIRED |
| root `FenceBound Development Bible Revision*.docx` | Historical superseded records | RETIRED |

## 4. Current product tracks

- **FenceboundCAD:** `index.html` is the current accepted implementation. Release-candidate integrity work is active; Phase Two and architecture extraction are not authorized.
- **FenceScraper/NCDOT:** accepted source and tests remain present; no work is authorized by this continuity session.
- **Rate Card/pricing data:** current files remain in place. Pricing doctrine and values are outside this session.
- **DT-001/field evidence:** structured data and status remain under `data/dt-001/`; not changed here.

## 5. FenceboundCAD checkpoint

**VERIFIED:** `index.html` declares `APP_VERSION='5.3.8-release-validation'` and project `schemaVersion:3`. It includes run IDs, run-owned specifications and spacing, selected-run editing, isolated new-run defaults, gate ownership, per-run quantity calculation followed by consolidation, migration, autosave/export through `snapshotState()`, import/internal load through `applyState()`, validation, and fatal client-estimate blocking.

**VERIFIED:** the supplied external `FenceboundCAD-v5.3.8-release-validation.html` is an earlier candidate, not repository authority. It differs from `index.html` in the header, malformed add-on hydration, and unrepaired internal Saved Jobs code.

**PROVISIONAL:** v5.3.8 is a release candidate, not a released or business-truth-certified quantity/pricing system. Business-rule economics, other browsers/devices, and undo/redo persistence remain incompletely verified.

## 6. Persistence-path map

| Path | Writer | Reader | Current evidence |
| --- | --- | --- | --- |
| Autosave | `saveSession()` → `snapshotState()` | boot → `applyState()` | VERIFIED by acceptance test 8 |
| Portable project | `do-export` → `snapshotState()` | file input → `applyState()` | VERIFIED by test 7 |
| Internal Saved Jobs | `do-save` → `snapshotState()` | saved-job click → `applyState()` | VERIFIED field completeness; VERIFIED DEFECT shared references after load |
| Legacy ownership | `migrateRunOwnership()` | called by `applyState()` | VERIFIED statically and exercised by load paths |
| Undo/redo | `snapshotDoc()` raw JSON clone | direct element/label assignment | PROVISIONAL; run-spec `Set` hydration is not proven |
| Company pricing defaults | local pricing storage | loaded before project state | PROVISIONAL boundary; project snapshots merge historical pricing over live memory |

## 7. Test and validation map

- `npm run test:phase-one`: nine Playwright CAD acceptance tests.
- `npm test`: configured Playwright suite.
- `python3 data/dt-001/validate_dt001.py`: structured-data validation.
- Root/node commands in `SOURCE_OF_TRUTH.md`: FenceScraper, NCDOT, parser, and benchmark tests.
- `validateProject()`: structural, ownership, specification, and pricing checks.
- `exportEstimatePDF()`: blocks on fatal validation errors.
- Plan PDF and portable JSON export do not call release validation and remain unblocked.

## 8. Release/version map

| Artifact | Version/state |
| --- | --- |
| `index.html` | **CANDIDATE** v5.3.8 release validation; canonical repository CAD |
| supplied Desktop v5.3.8 file | **RETIRED** earlier external candidate |
| `FenceboundCAD v5.3.4-embedded-project-index.html` | **RETIRED** frozen forensic baseline; filename says 5.3.4 while embedded `APP_VERSION` says 5.3.1 |
| `FenceboundCAD v5.3.1.html` | **RETIRED** historical predecessor |

No repository tags currently define a formal release.

## 9. Documentation map

- Doctrine/governance: Engineering Bible and `Docs/authoritative/`.
- Implemented truth: source, tests, and Git history.
- System placement/maturity: System Atlas.
- Repository navigation/current checkpoint: this file.
- CAD-local status and punch list: CAD development index.
- Chronology: Developer Log.
- Transfer payload: AI Handoff template and completed handoff.
- Historical closeout evidence: `Docs/phase-one-closeout-status.md`.

## 10. Known drift and documentation debt

- **Governance conflict:** the July 17 supplement prohibits v5.3.5 work on the frozen prototype, but later accepted commits continued development in canonical `index.html` through v5.3.8. The frozen file itself was not edited. Owner ratification is required to classify the later implementation as an authorized supersession; documentation cannot infer that decision.
- **Documentation drift:** the embedded CAD development index still says v5.3.4 and carries an obsolete punch list. The Markdown CAD index now governs local status; runtime HTML was not edited in this documentation session.
- **Historical mismatch:** the frozen v5.3.4 filename embeds `APP_VERSION='5.3.1'`. Preserve it as forensic evidence.
- **Saved Jobs defect:** internal Save/Load now reuse canonical functions, but no deep clone separates `S.savedJobs` from loaded live arrays/objects. Post-load edits can mutate the in-memory saved snapshot.
- **Test gap:** test 9 checks restoration after pre-load edits, not mutation after load; undo/redo also uses a partial raw-JSON document snapshot rather than the canonical project snapshot/hydration path.
- **Release gap:** no tag or changelog identifies v5.3.8 as a completed release.

## 11. Exact continuation point

The next authorized application task is a narrow saved-job and persistence-integrity session: reconfirm canonical internal Save/Load behavior, test all state boundaries (including project pricing history versus company defaults), and run the mixed-system round-trip matrix. Do not expand architecture or start new features. Produce a new release candidate only after integrity tests pass.

## 12. Session-entry checklist

1. Confirm branch, commit, upstream, divergence, and clean worktree.
2. Read `SOURCE_OF_TRUTH.md`, the Engineering Bible/governance supplement, this orientation, the System Atlas, and the relevant module index.
3. Confirm the exact authorized task and prohibited scope.
4. Inspect current source/tests before relying on prior handoff claims.
5. Run relevant verification, update continuity documents only when facts change, append the Developer Log, and return a standalone handoff.
