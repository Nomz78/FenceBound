# FenceBound Phase One Closeout Status

Date: 2026-07-28 (America/New_York)

Branch: `fix/phase-one-run-ownership-validation`

Implementation commit: `b05ea08`

Acceptance-suite commit: `c826023`

App version: `5.3.8-release-validation`

Project schema: `3`

Baseline: frozen `archive/FenceboundCAD v5.3.4-embedded-project-index.html`

## Authority and lineage

- **Confirmed:** `index.html` is the canonical local-launch and GitHub Pages entry point. It now contains the integrated, self-contained single-file CAD runtime.
- **Confirmed:** `archive/FenceboundCAD v5.3.4-embedded-project-index.html` remains the frozen historical/forensic baseline and was not edited.
- **Confirmed:** the external Desktop files `FenceboundCAD-v5.3.5-run-owned-specs.html` through `FenceboundCAD-v5.3.8-release-validation.html` form sequential, narrow descendants of the v5.3.4 baseline. They are historical candidates, not repository authority.
- **Confirmed:** the pre-closeout `index.html` was v5.3.1 even though the v5.3.4 baseline was already tracked separately.
- **Implemented-unverified:** none.

## Implemented scope

- **Implemented-unverified (before this session):** v5.3.5 introduced persistent run IDs, cloned run-owned specs and spacing, post ownership snapshots, schema v2 migration, per-run BOM calculation, and post-run consolidation.
- **Implemented-unverified (before this session):** v5.3.6 separated selected-run edits from new-run defaults and synchronized the selected run to the specification panel.
- **Implemented-unverified (before this session):** v5.3.7 attached each gate to its nearest run, blocked gates in jobs with no runs, persisted gate ownership/spec snapshots, moved to schema v3, and derived gate BOM items from the owning run.
- **Implemented-unverified (before this session):** v5.3.8 added `validateProject()`, the validation report/status UI, fatal estimate-export gating, removal of the signable quick-reference path, and run-derived mixed-height estimate descriptions.
- **Verified-statically:** the integrated inline JavaScript parses successfully.
- **Confirmed:** no FenceScraper, Rate Card, distributor-reference, overhead-tool, Engineering Bible, or Phase Two implementation was changed.

## Localized repairs

- **Known-defect (reproduced):** internal Save used raw JSON cloning on run specs. `Set` add-ons became `{}`, and a loaded saved job later crashed `snapshotState()` with `TypeError: object is not iterable`. The internal snapshot also omitted the portable snapshot's cost/labor/markup and spacing fields.
- **Implemented-unverified:** internal Save was changed to reuse `snapshotState()`, internal Load was changed to reuse `applyState()`, and legacy/malformed add-on hydration now accepts only `Set` or array values and otherwise safely uses an empty set.
- **Verified-statically:** the header version was corrected from stale `v5.3.4` display text to `v5.3.8`.
- **Confirmed:** the focused internal-save regression passed after the repair.

## Automated test evidence

Command:

```bash
npm test -- tests/phase-one-acceptance.spec.js
```

Environment: Playwright Test 1.40.1, bundled Chromium 120, headless, HTTP server at `127.0.0.1:8080`, one worker.

Final result: **9 passed in 44.2 seconds**.

| Evidence | Result | Classification |
| --- | --- | --- |
| Run-spec isolation and edit persistence | Pass | Confirmed |
| New-run defaults remain separate from selected-run edits | Pass | Confirmed |
| Gate ownership, ownership after run height edit, autosave/reload persistence, zero-run gate blocking | Pass | Confirmed |
| BOM material-system isolation, gate-post ownership, positive finite row quantities | Pass | Confirmed |
| Blank/untitled project, blank customer, blank address, zero-run, missing-cost blocking; warning surfacing | Pass | Confirmed |
| Valid mixed-system validation and client estimate PDF download/text | Pass | Confirmed |
| Portable JSON clean import round-trip (runs, gates, IDs, specs, owners, footage, BOM, validation, total) | Pass | Confirmed |
| Autosave/refresh recovery and visible restoration notice | Pass | Confirmed |
| Internal Save/Load isolation plus spacing, markup, and pricing retention | Pass after repair | Confirmed |

The suite prints captured BOM rows, validation results, and exact portable before/after release records. The round-trip records were equal. PDF assertions confirmed project/customer/address, both 72-inch and 48-inch run-derived descriptions, a finite positive total, and absence of `QUICK REFERENCE`.

## Tests not performed / limits

- **Deferred:** no manual clicking or manual visual acceptance was performed; the mission explicitly required automated Playwright interaction.
- **Deferred:** line-item economics and business-rule quantity correctness were not certified. The suite proves ownership/isolation, expected fixture quantities, finite positive quantities, and stable round-trip output.
- **Deferred:** unrelated FenceScraper, Rate Card, distributor-reference, overhead, and NCDOT suites were not rerun because those areas were not changed.
- **Deferred:** browsers other than bundled Chromium 120 and devices other than this macOS 10.15.7 host were not tested.

## Known unresolved issues and release risk

- **Deferred / low release risk:** Playwright is pinned to 1.40.1 because current Chromium 149 cannot load on macOS 10.15.7 (`AVFAudio.framework` is unavailable). `npm audit` reports two high-severity issues in the development-only pinned toolchain. This does not ship in `index.html`; upgrade the test host/toolchain when the host OS is upgraded.
- **Deferred / operational risk:** jsPDF is still loaded at runtime from cdnjs. Estimate export requires that existing network dependency to load. This behavior predates the closeout and was not redesigned.
- **Confirmed:** no Phase One acceptance blocker remains in the exercised scope after the internal-save repair.

## Exact next controlled task

Review commits `b05ea08` and `c826023` plus this status record, confirm the branch diff is restricted to `index.html`, Playwright test infrastructure, and this closeout record, then merge `fix/phase-one-run-ownership-validation` into `main` through the repository's normal review path. Do not begin Phase Two in that review.

## 2026-07-30 persistence-integrity correction

The prior statement that “no Phase One acceptance blocker remains in the
exercised scope” and the row classifying internal Save/Load isolation as
confirmed were too broad. The original ninth test checked value restoration but
did not check object identity after Save or Load.

Three persistence-boundary defects were subsequently reproduced:

- **D-1:** project pricing loaded into the live cost objects could be written
  back over the company rate card by an unrelated cost-editor save.
- **D-2:** document undo/redo serialized run add-on `Set`s as `{}`, silently
  removing add-on BOM rows.
- **D-3:** internal Saved Jobs retained live references on both Save and Load;
  later pricing, label, manual-material, and element edits mutated saved jobs,
  and a later Save/Delete made contamination durable.

All three are repaired on `fix/cad-persistence-integrity-v4`. The repair adds a
project-pricing provenance guard and saved-rate-card reload action, serializes
and hydrates run specs in the existing narrow undo snapshot, and applies the
existing JSON persistence semantics at internal Saved Jobs boundaries. No
pricing values or historical HTML files changed.

Verification: the original 9 tests remain unmodified and pass; 8 focused
regressions pass, for **17/17** total. A separate mixed-system twelve-route
matrix also passes with no lost, duplicated, orphaned, or unexpectedly mutated
state. Release promotion remains an owner decision.

## 2026-08-01 cold-review remediation

- Company-rate-card writes now report storage failure instead of claiming
  success; all three callers check the result before closing or showing success.
- Pricing provenance clears when a pricing-free state is applied.
- Saved-rate-card reload distinguishes successful recovery, no saved card, and
  corrupt storage.
- Invalid projects may be exported under the owner-ratified warn-not-block
  policy. Estimate PDFs, plan PDFs, and portable JSON mark themselves **NOT
  FULLY VERIFIED** and list the information that was not verified.
- The audit found no unguarded pricing-provenance caller and no persisted Set
  outside `specs`/`runSpecs`. Those predicted defects did not exist.
- Historical versioned HTML moved to `archive/`; the frozen v5.3.4 artifact's
  bytes were unchanged.
