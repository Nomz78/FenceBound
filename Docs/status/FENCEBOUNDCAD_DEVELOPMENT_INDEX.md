# FenceboundCAD Development Index

Updated: 2026-07-29

Local current version: `5.3.8-release-validation`

Canonical runtime: `index.html`

This file owns CAD-local implementation status, defects, dependencies, tests, and the CAD punch list. The Engineering Bible governs doctrine; source/tests govern behavior; the System Atlas governs module placement and maturity.

## Implementation status

- **VERIFIED IMPLEMENTED:** persistent run IDs; run-owned specifications and post spacing; selected-run editing; isolation of new-run defaults; legacy run/gate ownership migration.
- **VERIFIED IMPLEMENTED:** gate `runId`, nearest-parent attachment, owner specification snapshot, owner-derived gate BOM context, and zero-run gate blocking.
- **VERIFIED IMPLEMENTED:** per-run BOM generation followed by name/unit consolidation; mixed-system fixture coverage; gate material generation.
- **VERIFIED IMPLEMENTED:** project schema 3; canonical `snapshotState()` and `applyState()`; autosave and portable export/import; internal Saved Jobs field completeness through the canonical functions.
- **VERIFIED IMPLEMENTED:** release validation with errors/warnings and fatal blocking of client estimate PDF.
- **PROVISIONAL:** v5.3.8 remains a release candidate. Line-item business correctness, browser/device breadth, and full persistence mutation coverage are not certified.

## Known defects and risks

- **VERIFIED DEFECT:** internal Save stores the snapshot object directly in `S.savedJobs`; internal Load passes the stored object to `applyState()`, which directly assigns arrays. Loaded live state can therefore share references with—and mutate—the in-memory saved job.
- **REQUIRES RUNTIME TEST:** `snapshotDoc()` uses raw JSON cloning for undo/redo, while `doUndo()`/`doRedo()` directly assign elements and labels. Run-spec `Set` values may not survive hydrated.
- **VERIFIED LIMIT:** plan PDF, portable JSON export, and other outputs do not call `validateProject()`; only client estimate PDF is release-gated.
- **PROVISIONAL BOUNDARY:** `applyState()` merges project snapshot costs/labor/markup into the current in-memory pricing objects. Historical project pricing is preserved, but the company-default isolation/restore behavior needs a dedicated matrix.
- **GOVERNANCE CONFLICT:** later accepted v5.3.8 development conflicts with the July 17 prohibition on post-v5.3.4 prototype work and requires owner ratification.

## Dependencies

- Browser local storage and File APIs.
- jsPDF from cdnjs for PDF output.
- Playwright 1.40.1 and bundled Chromium 120 on the current legacy macOS test host.
- Pricing objects embedded in the single-file runtime.

## Test notes

`npm run test:phase-one` maps to nine Playwright tests covering run isolation, defaults, gates, BOM isolation, validation, estimate output, portable round trip, autosave, and internal Saved Jobs. The accepted closeout record reports 9 passed in 44.2 seconds. Test 9 verifies restore after edits made before load, but not mutation after load followed by reload. No test currently isolates Saved Jobs post-load references, undo/redo add-on hydration, or the complete company-default/project-pricing boundary.

## Next CAD task

Confirm saved-job and persistence integrity without architecture expansion:

1. Reproduce canonical internal Save/Load behavior from synchronized `main`.
2. Exercise full state equality and reference isolation.
3. Verify legacy migration and historical project pricing without overwriting company defaults.
4. Run a mixed-system matrix across internal save/load, portable export/import, autosave/reload, and undo/redo.
5. Report every lost, duplicated, orphaned, changed, or mutated value.
6. Create a new release candidate only after integrity tests pass.
