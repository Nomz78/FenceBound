# FenceBound CAD persistence remediation handoff

Read `SOURCE_OF_TRUTH.md` and `CLAUDE.md` first. This handoff supersedes the
open owner-decision section in the 2026-07-30 persistence handoff.

## Outcome

- Branch: `fix/cad-persistence-integrity-v4`; PR
  [#2](https://github.com/Nomz78/FenceBound/pull/2) remains unmerged.
- Start: `25d3b3e`; runtime remediation: `44cba6d`.
- No pricing values, undo architecture, frozen HTML contents, merge, or tag.
- O-1 ratified v5.3.8 `index.html` continuation for defect/data-integrity work
  only. O-3 and O-5 are deferred to v6.0. O-4 warn-not-block is implemented.
  O-7 archive work is complete. O-6 remains undecided.
- Phase 1 observed `index.html` at 3,670 lines; remediation ended at 3,713.
  `CLAUDE.md` no longer hardcodes a count because it immediately drifts after
  accepted repairs; sessions locate constructs by symbol.

## Audit and repairs

- R1 was withdrawn: every `saveCostDB()` UI caller deliberately clears pricing
  provenance first. R2 was withdrawn: no Set outside `specs`/`runSpecs` crosses
  a JSON boundary. These predicted defects did not exist.
- R3 was declined because no active label alias or red-before test exists.
  Load-bearing invariant: `snapshotDoc()` deep-clones labels, and undo/redo pops
  the snapshot before assigning its label array live. Any history refactor must
  preserve that ownership transfer or add explicit restore cloning.
- R6: `saveCostDB()` returns false on storage failure. Editor Save, factory
  Reset, and price Import all check it, keep the editor open, and show
  “Save failed — storage full or blocked.”
- R4: `applyState()` now sets provenance from the incoming state on every call,
  clearing it when no pricing is present.
- R5: saved-rate-card reload reports loaded, missing, or corrupt accurately and
  does not replace live values on missing/corrupt storage.
- O-4: validation warns without blocking export. Estimate PDFs, plan PDFs, and
  portable JSON say **NOT FULLY VERIFIED** and list plain-language missing
  information on the artifact itself.

## Why both historical repairs were necessary

D-1 and D-3 protect different boundaries. D-3's deep clone alone would have
prevented symptom 1a because later live edits could not mutate the internal
Saved Job. D-1 remains necessary for 1b: boot restore merges the autosaved
project's historical prices into live pricing before any user action. The
provenance guard prevents those boot-restored project prices from silently
becoming the company rate card.

The original T-P1 red-before evidence required amending its setup to call
`reloadSavedCostDB()`, a function introduced by the D-1 fix. This was test debt,
not valid pre-fix setup. The remediation test now establishes the newer company
card through the existing cost-editor Save path and accepts its explicit
confirmation.

## Existing saved-quote contamination assessment

Pre-fix Saved Jobs under `fencebound_v2_jobs` can contain D-3 mutations. The
first Save wrote a clean JSON string, but live references could later mutate the
in-memory record; any subsequent Save or Delete serialized the entire array and
made those changes durable.

**Inspection alone cannot distinguish contamination from legitimate data.**
The schema stores no original hash, prior snapshot, mutation provenance,
storage-write timestamp, or audit log. A changed price, label, material row, or
element has the same valid structure whether intentionally saved or leaked from
the live project. Shared values across jobs are not proof because legitimate
jobs commonly share a rate card.

Therefore existing browser quotes cannot be certified clean from
`STORAGE_KEY` alone. A read-only inventory could show app version, saved time,
pricing fingerprints, and cross-job similarities for manual comparison, but it
could not honestly label a record “contaminated.” No audit view or migration was
built; any recovery policy remains an owner decision.

## Continuity branch assessment

Branch `docs/repository-continuity-atlas-v538-sync` is two commits beyond main:

| Commit | Content | Classification |
| --- | --- | --- |
| `f26078a` — repository orientation and v5.3.8 status | Ten documentation files: unique orientation, Atlas v0.2, CAD indexes/status, and changes to README/authority map; its developer-log/template concepts partly overlap newer scaffolding | Unique unmerged work mixed with stale snapshots |
| `98d481d` — portable AI working bundle | One developer-log entry documenting an external bundle and its verification | Unique historical execution record; external bundle itself is absent |

Files introduced or changed by `f26078a`:

| File | At current HEAD |
| --- | --- |
| `Docs/FENCEBOUND_REPOSITORY_ORIENTATION.md` | Absent; unique unmerged work |
| `Docs/README.md` | Present but different; branch edit is unmerged/stale |
| `Docs/development/AI_HANDOFF_TEMPLATE.md` | Absent; overlaps current `Docs/execution/AI_HANDOFF_TEMPLATE.md` but is not identical |
| `Docs/development/DEVELOPER_LOG.md` | Present but different; current log lacks the July 29 entry |
| `Docs/reference/FenceBound_System_Atlas_v0.2.md` | Absent; unique unmerged work |
| `Docs/status/FENCEBOUNDCAD_DEVELOPMENT_INDEX.md` | Absent; unique unmerged work |
| `Docs/status/FENCEBOUNDCAD_V538_SOURCE_VERIFICATION.md` | Absent; unique unmerged work |
| `Docs/status/FenceBound_Engineering_Bible_Implementation_Progress_2026-07-29.md` | Absent; unique unmerged work |
| `README.md` | Present but different; branch edit is unmerged/stale |
| `SOURCE_OF_TRUTH.md` | Present but different; branch edit is unmerged/stale |

`98d481d` changes only `Docs/development/DEVELOPER_LOG.md`; its portable-bundle
entry does not exist in the current log and the external directory/ZIP is not
in the repository.

The orientation/status files exist nowhere else at HEAD. The current developer
log and execution handoff template overlap in purpose but are not identical.
Several branch claims are now stale: estimate blocking, unresolved Saved Jobs
references, unresolved undo hydration, and unratified O-1.

Recommendation: **keep the branch for provenance; do not merge it wholesale or
delete it.** If O-6 later authorizes integration, cherry-pick/rewrite only
still-useful unique orientation/Atlas material against current facts while
preserving the two original commits. No action was taken.

Source/prompt correction for O-7: `FenceScraper-v3.0-Validated-Market-Rate-Mapping.html`
is versioned but is an active runtime with required root-level sibling scripts,
not a historical artifact. It remained at root; only historical versioned HTML
moved to `archive/`.

## v6.0 pricing requirement

"A project carries a frozen quoted-price snapshot. The company rate card is a
separate store. Loading a project never writes to the company rate card."

## Verification

- R6/R4/R5: red on parent, green after repair.
- O-4: parent blocked invalid estimate download and omitted JSON warning; both
  PDF types and portable JSON pass recipient-warning tests after repair.
- Original acceptance suite: 9/9 in 43.3 seconds. Focused
  persistence/export suite: 13/13 in 14.5 seconds. Twelve-route matrix: 12/12.
- Historical v5.3.4 SHA-256 remained
  `c870f7de2801020d5ecba5fbc6691f3897ed3c8bdfecba06eee6314701828d28`.

## Release handling

`CHANGELOG.md` uses user-visible symptom language. Do not merge or tag during
this session. After the owner confirms PR merge, create the owner-approved
release tag so future audits can identify builds that may have corrupted saved
quotes.

## 2026-08-01 session-close cold review

Cold review found F1, a defect **introduced by remediation commit `44cba6d`**.
The cost editor cleared loaded-project pricing provenance before browser storage
confirmed the company-card write. If that write failed, a later attempt could
replace the company rate card without repeating the warning. The repair uses
option (b): each deliberate Save, factory Reset, and price Import preserves the
prior flag, temporarily clears it for `saveCostDB()`, and restores it on failure.
This keeps `saveCostDB()`'s guard intact and makes the transaction rule explicit
without adding a force-write API that other callers could misuse.

Warn-not-block removed the former structural guarantee that estimate generation
only received validation-clean state. Nineteen state-reachable validation error
classes now have real-PDF regression coverage: each export must download without
an exception, contain neither `NaN` nor `undefined`, and include a populated
estimate total. Warning details are customer-facing, separated with semicolons,
capped at four details plus a remainder count, and remain on one page at the cap.

Two validation-code premises require qualification. `ADDON_STATE` is not
state-reachable because `validateProject()` hydrates add-ons before testing their
type, so malformed persisted input becomes a `Set` first. `PRICING_RUNTIME` is an
exception sentinel: if `computePricing()` throws during validation, the estimate
exporter's required second call throws too. That class cannot satisfy the
no-exception export assertion without changing pricing failure handling. Per the
review instruction, no math or blocking behavior was patched; this is a separate
export-resilience defect for owner disposition.

The plan warning previously rendered after the canvas image and therefore could
obscure drawing geometry. The exporter now reserves warning space above the
drawing and scales the canvas into the remaining region. A geometry regression
asserts that the warning ends before the drawing begins.

`loadCostDB()` has one caller, `init()`. It runs immediately after the pricing
provenance flag initializes false and before autosave restoration. No caller
depends on the old unconditional clear when saved-card storage is missing or
corrupt.
