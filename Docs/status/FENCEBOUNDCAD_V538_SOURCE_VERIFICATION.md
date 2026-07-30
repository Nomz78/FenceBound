# FenceboundCAD v5.3.8 Source Verification

Recorded: 2026-07-29

Canonical source: `index.html`

External comparison: `FenceboundCAD-v5.3.8-release-validation.html` supplied from the Desktop workspace

Line numbers refer to canonical `index.html` at starting commit `76ddb8d`.

## Run ownership

| Finding | Location | Classification | Evidence / runtime requirement |
| --- | --- | --- | --- |
| Persistent run IDs | `makeRunId()`, lines 653–654; creation lines 2397–2411 | VERIFIED IMPLEMENTED | Every new fence receives `runId`; test 3 observes stable owners across reload. Collision behavior is not stress-tested. |
| Run-owned specifications | `cloneRunSpecs()`/`hydrateRunSpecs()`, 641–652; creation 2397–2411 | VERIFIED IMPLEMENTED | Specs are cloned per run; test 1 verifies isolation. |
| Run-owned post spacing | `activePostSpacing()`/`setActivePostSpacing()`, 698–707 | VERIFIED IMPLEMENTED | Selected run owns spacing; defaults are used when no run is selected. Tests 1–2 cover both. |
| Selected-run editing | `selectedFenceRun()` and active helpers, 658–718 | VERIFIED IMPLEMENTED | Fence selection, or gate-to-owner selection, redirects controls to the run. |
| New-run default isolation | active helpers and creation path | VERIFIED IMPLEMENTED | Test 2 proves existing runs remain unchanged when defaults change. |
| Legacy migration | `migrateRunOwnership()`, 720–735 | VERIFIED PARTIAL | Missing run IDs/specs/spacing are hydrated; gates attach to nearest run. A dedicated legacy/orphan fixture matrix is still required. |

## Gate ownership

| Finding | Location | Classification | Evidence / runtime requirement |
| --- | --- | --- | --- |
| Gate `runId` and attachment | `nearestFenceRunForGate()`/`attachGateToRun()`, 665–688 | VERIFIED IMPLEMENTED | Gate inherits parent ID/type/spec snapshot; test 3 covers two gates and zero-run blocking. |
| Gate specification inheritance | `attachGateToRun()`, 681–687 | VERIFIED IMPLEMENTED | Snapshot is cloned at attachment. Later owner-height edits intentionally leave a snapshot that validation can flag as drift. |
| Gate BOM context | `calcAutoMaterials()`, 1431–1441 | VERIFIED IMPLEMENTED | Owner specs take precedence, then gate snapshot, then global specs. Test 4 checks mixed gate-post output. |
| Orphan/migrated gate behavior | migration 727–731; validation 3355–3368 | VERIFIED PARTIAL | Migration attempts nearest-run attachment; unresolved gates get `ORPHAN_GATE`. Dedicated ambiguous/no-owner migration tests remain. |

## Quantity generation

| Finding | Location | Classification | Evidence / runtime requirement |
| --- | --- | --- | --- |
| Per-run calculation | `calcAutoMaterials()`, 1295–1452 | VERIFIED IMPLEMENTED | Each fence uses its own type/specs/spacing; gates use their owner. |
| Consolidation after calculation | `calcAutoMaterials()`, 1454–1456 | VERIFIED IMPLEMENTED | Rows merge only after per-run generation, keyed by name and unit. |
| Mixed-system handling | same function; acceptance test 4 | VERIFIED PARTIAL | Chain link, wood, vinyl, and ornamental isolation/positive quantities pass. Contractor-certified line-item correctness remains unverified. |
| Remaining global assumptions | `getStats()` and embedded material/pricing definitions; `computePricing()` 3068–3133 | VERIFIED PARTIAL | Project totals, embedded definitions, and pricing remain global/bundled. This is implementation drift from target service ownership. |

## Persistence

| Finding | Location | Classification | Evidence / runtime requirement |
| --- | --- | --- | --- |
| Schema 3 | `snapshotState()`, 737–745 | VERIFIED IMPLEMENTED | Snapshot declares schema 3 and app version. |
| Canonical snapshot | `snapshotState()`, 737–745 | VERIFIED IMPLEMENTED | Includes metadata, elements, labels, materials, defaults, view/grid, costs, labor, markup, auto-post, and spacing. |
| Canonical apply/migration | `applyState()`, 746–774 | VERIFIED PARTIAL | Restores fields and calls migration, but directly assigns arrays and merges pricing into live objects. |
| Autosave | `saveSession()`, 775–780; boot 2528–2546 | VERIFIED IMPLEMENTED | Uses JSON serialization around snapshot and `applyState()`; test 8 passes. |
| Portable export/import | 2205–2214 and 2693–2712 | VERIFIED IMPLEMENTED | JSON serialization provides a detached file boundary; test 7 equality passes. |
| Internal Saved Jobs save | 2215–2223 | VERIFIED PARTIAL | Calls `snapshotState()` and preserves its fields, but stores the returned object directly in `S.savedJobs`; no deep clone. |
| Internal Saved Jobs load | 2224–2232 | VERIFIED DEFECT | Calls `applyState()`, but `applyState()` directly assigns saved arrays. Live post-load edits can mutate the in-memory job. Requires a regression test demonstrating edit-after-load/reload isolation. |
| Undo/redo | `snapshotDoc()`/`doUndo()`/`doRedo()`, 1502–1530 | VERIFIED PARTIAL | Only elements/labels are captured via raw JSON; restored spec add-ons are not hydrated. Runtime reproduction and scope decision required. |
| Pricing state | snapshot 743; apply 762–766; pricing persistence init 2530–2544 | VERIFIED PARTIAL | Project prices travel with snapshots and merge into memory. Historical-project versus company-default non-overwrite behavior requires an explicit test matrix. |
| Defaults/view state | snapshot 741–744; apply 752–771 | VERIFIED IMPLEMENTED | Specs, cost view, pan, zoom, grid, auto-post, and default spacing are represented. Reference isolation after internal load is defective as above. |

## Validation and outputs

| Finding | Location | Classification | Evidence / runtime requirement |
| --- | --- | --- | --- |
| Validation entry point | `validateProject()`, 3315–3388 | VERIFIED IMPLEMENTED | Checks metadata, runs, ownership, gates, posts, BOM/pricing, errors, and warnings. |
| Fatal vs warning classification | same function | VERIFIED IMPLEMENTED | `ok` depends on zero errors; warnings do not block. Test 5 covers representative codes. |
| Client estimate blocking | `exportEstimatePDF()`, 3424–3428 | VERIFIED IMPLEMENTED | Calls validation and returns on failure; tests 5–6 cover fail/pass. |
| Other outputs | plan export function; portable export 2205–2214; price export 3287–3295 | VERIFIED DEFECT (truthfulness boundary) | These paths do not call release validation and remain unblocked. Whether each should block is a doctrine/product decision. |
| Validation after load/import | load/import call `applyState()` and redraw paths; manual validation remains callable | REQUIRES RUNTIME TEST | No persisted validation result exists; validation is recalculated on demand. Dedicated post-load/import validation equality should be added. |

## Canonical/version drift

- `index.html` and the external candidate both declare `5.3.8-release-validation`, but SHA-256 hashes differ.
- The external candidate has a stale visible v5.3.4 header, unsafe malformed add-on hydration, a partial Saved Jobs snapshot, and direct manual load assignments.
- Canonical `index.html` corrects those points but retains the shared-reference load defect.
- Frozen `FenceboundCAD v5.3.4-embedded-project-index.html` has `APP_VERSION='5.3.1'`; preserve this filename/header mismatch as historical evidence.
- July 17 frozen-prototype doctrine conflicts with later accepted v5.3.8 continuation in `index.html`. This is a governance conflict requiring owner ratification, not a source ambiguity.
