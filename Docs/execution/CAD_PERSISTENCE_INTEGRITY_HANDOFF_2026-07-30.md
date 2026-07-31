# FenceBound CAD persistence-integrity handoff

Read `SOURCE_OF_TRUTH.md` first. This branch contains three confirmed,
minimally repaired FenceboundCAD persistence-boundary defects and their
regression/matrix evidence.

## Outcome

- Objective: protect the company rate card, preserve run add-ons through
  undo/redo, and isolate internal Saved Jobs from live references.
- Branch: `fix/cad-persistence-integrity-v4`, based on synchronized
  `origin/main` commit `76ddb8d`.
- Phase commits: `642231b`, `12b2e01`, `3cc96df`, `78e9bd8`, `55aff9e`, plus
  the Phase 6 closeout commit containing this handoff.
- Confirmed/repaired: D-1, D-2, and D-3.
- Scope not changed: pricing values, factory reset behavior, snapshot scope,
  undo semantics, frozen/historical HTML, feature work, other modules, release
  tags, and `CHANGELOG.md`.

## Pre-flight and source discrepancies

- Baseline: clean synchronized main; `index.html` 3,639 lines; Playwright
  targets `tests/`; unmodified suite 9/9 in 44.4 seconds.
- The initially checked-out continuity branch was two commits ahead of main and
  contained files the session prompt described as absent/uncommitted. It was
  preserved and excluded; work branched from main.
- Main contains one Markdown and one DOCX file in `Docs/status/`, not four
  Engineering Bible status documents as the prompt stated.
- `SOURCE_OF_TRUTH.md` makes the frozen Markdown Bible the canonical base and
  the July 17 DOCX its approved supplement. The prompt described the supplement
  alone as governing; source ordering was preserved.
- Baseline symbol coordinates matched the 3,639-line premise. Runtime edits
  naturally moved later coordinates; symbols, not prompt line numbers, were
  used.

## Reproduction evidence

- **1a:** historical `111`, company `222`; after Load and unrelated editor Save,
  live and stored values were both `111`, with no warning.
- **1b:** boot restore produced live `111` while the company store remained
  `222`; the live session was contaminated before user action.
- **1c:** source/UI inspection confirmed Reset restores factory defaults and
  persists them; Export/Import were the only prior route back to a user's rate
  card. A distinct saved-rate-card reload action did not exist.
- **2:** undo restored `addons` as `[object Object]`, value `{}`; redo also
  remained `{}`. Top-wire and three barbed-wire BOM rows disappeared.
- **3a:** saved price changed from `111` to `222` after a later editor edit.
- **3b:** saved labels gained `later label`.
- **3c:** saved materials gained `temporary row`, then lost `saved row` when the
  live array was spliced.
- **3d:** after Save → Load → edit, saved elements changed from 1 to 2 and the
  second Load returned 2.
- **3e:** deleting another job serialized the contaminated `222`; reload
  confirmed durable contamination.

The first 1a attempt did not isolate D-1: D-3 changed the in-memory historical
snapshot to `222` before Load. Repeating across a reload boundary isolated and
confirmed D-1.

## Repairs

- **D-1 (`3cc96df`):** `applyState()` marks loaded pricing provenance;
  `saveCostDB()` refuses silent persistence; the editor requires an explicit
  consequence-naming confirmation; deliberate editor/reset/import writes clear
  provenance; “Reload saved rate card” restores `COSTDB_KEY`. Autosave never
  writes the company store.
- **D-2 (`78e9bd8`):** `snapshotDoc()` still captures only elements and labels,
  but serializes run specs; undo/redo hydrates only those specs. No
  `applyState()` or ownership migration entered the undo path.
- **D-3 (`55aff9e`):** internal Save deep-clones `snapshotState()` before adding
  Saved Jobs metadata; internal Load deep-clones before `applyState()`.

JSON audit: persisted add-on Sets are serialized to arrays; Maps and remaining
Sets/Infinity/functions are transient; dates are strings; undefined spec keys
are dropped consistently with existing portable/autosave routes; no circular
snapshot references were found.

## Verification

```bash
npm run test:phase-one
npx playwright test tests/persistence-integrity.spec.js
npx playwright test
node scripts/cad-persistence-matrix.js
git diff --check
```

- Red: all eight focused tests failed before repair with the observed values
  above. T-P2 and T-P3 include provenance assertions because their underlying
  pre-repair storage behavior already passed; this makes the new guard itself
  red-before/green-after.
- Green: **17/17** Playwright tests passed in 48.7 seconds: original 9 unchanged
  plus T-P1–P3, T-U1, and T10–T13.
- Matrix fixture: chain link, wood, vinyl, ornamental, two gates, one label,
  one manual material row, and two run add-ons.

## Twelve-route matrix

| # | Route | Result | Difference classification |
| --- | --- | --- | --- |
| 1 | Internal Save → Load | Pass | None |
| 2 | Save → Load → edit → Load | Pass | Changed: unsaved extra run discarded |
| 3 | Save → cost edit → Load | Pass | Changed: company card deliberately changed; job kept quoted price |
| 4 | Old job → editor Save | Pass | Changed: save canceled after warning; company card stayed `222` |
| 5 | Old job → autosave → reload | Pass | Changed: live project `111`; company card stayed `222` |
| 6 | Overwrite by project name | Pass | Changed: one record replaced; no duplicate |
| 7 | Internal delete | Pass | Changed: selected record removed in memory/storage |
| 8 | Portable Export → Import | Pass | None |
| 9 | Autosave → refresh | Pass | None |
| 10 | Legacy schema/run/gate migration | Pass | Changed: IDs/owners added and add-ons hydrated |
| 11 | Undo/redo before/after Load | Pass | None |
| 12 | Cost editor Export → Import | Pass | Changed: temporary edit replaced by exported value |

Compared: full snapshot, reference identity, validation codes, BOM rows, total
footage, pricing total, and company rate-card state. No route lost, duplicated,
or orphaned data, and none unexpectedly mutated data.

## Documentation and external records

- `Docs/phase-one-closeout-status.md` now corrects its earlier overbroad internal
  Save/Load isolation claim.
- No `Docs/status/` factual CAD-persistence claim required correction.
- Atlas v0.1 mentions local save/recovery and planned persistence auditing but
  does not assert the defective paths were isolated; it was inspected and not
  rewritten.
- GitHub CLI is not installed. Public API inspection found no existing defect
  issues, but authenticated issue creation/closure could not be completed in
  this environment. Create and close D-1, D-2, and D-3 issues during PR review,
  referencing `3cc96df`, `78e9bd8`, and `55aff9e`.

## Owner decisions still required

- **O-1:** ratify or reverse v5.3.8 continuation relative to July 17 governance.
- **O-2:** decide whether this work receives a release tag/CHANGELOG.
- **O-3:** decide whether undo/redo eventually migrates to canonical full-state
  persistence; the minimal repair was sufficient, so no escalation was needed.
- **O-4:** decide export validation gating policy.
- **O-5:** decide full project/company pricing state separation.
- **O-6:** decide the external continuity bundle's repository future.
- **O-7:** decide root historical-file/duplicate-Bible archiving.

No decision above was made here and no release promotion is authorized.

## Cold-review package

Review `origin/main..HEAD`, the three repair commits, the focused tests, matrix
script/output, closeout correction, developer log, and this handoff. Prioritize
provenance transitions, confirmation cancel behavior, narrow undo scope,
reference identity, and unchanged pricing values.

## Archive contract

If required, use `git archive` so only committed source is included; exclude
`.git`, dependencies, caches, secrets, browser profiles, and generated clutter.
