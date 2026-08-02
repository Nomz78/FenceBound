# FenceBound session handoff — 2026-08-01

Read `SOURCE_OF_TRUTH.md` and `CLAUDE.md` first. This is a consolidated day
record. It orients a future session without requiring it to read five documents
in the correct order. It does not restate what those documents already hold;
where something is recorded adequately elsewhere, this file points to it.

Base at time of writing: `main` @ `d669b41`. Classification: documentation only.

## S1 — What shipped

PR [#2](https://github.com/Nomz78/FenceBound/pull/2) merged at `fef779a` and is
tagged `v5.3.9`, an annotated tag whose object SHA is
`a22a85a5fb9d8b0fbb1dfd9eddc5ccb68e247b59`.

**Commit count corrected.** The PR contains **15 commits** — the range reachable
from `fef779a` but not from its first parent `76ddb8d`, beginning at `642231b`.
Seven predate 2026-08-01 (six dated 07-31, one dated 07-30); the persistence
integrity work of the July 30 session is inside this range. A separate count of
ten commits reachable from HEAD since midnight is *not* the PR count: it excludes
the seven older PR commits and includes two post-merge documentation commits
(`4d49d06`, `d669b41`). Any future statement of "today's commits" must say which
of the two sets it means.

**Defect count corrected.** `CHANGELOG.md` records **ten** user-visible fixes
under `Unreleased — 2026-08-01`, not six. The symptom-language list is complete
there and is not duplicated here. In summary, the ten cover: saved-job load
overwriting company prices; live edits mutating an internal Saved Job; undo/redo
dropping run add-ons; storage-write failure falsely reporting success; sticky
pricing provenance after a pricing-free load; false success from
"Reload saved rate card"; a suppressed second warning after a failed price save;
silent export failure on unreadable pricing data; hand-added materials missing
from job totals; and negative manual quantities silently omitted.

**Version-string mismatch is intentional and already recorded.** The in-app
header and `APP_VERSION` at `fef779a` still read `v5.3.8` and
`5.3.8-release-validation`. Full rationale is at
`Docs/execution/CAD_PERSISTENCE_REMEDIATION_HANDOFF_2026-08-01.md`,
section "v5.3.9 tag and in-app version label" — the tag was required to point
exactly at the merge commit, and changing runtime strings afterward would have
created a commit outside that target. A future release must update the UI string
and `APP_VERSION` in the same commit that establishes its release identity.

## S2 — What was introduced and caught

**F1 — pricing provenance cleared before the storage write was confirmed.**
Introduced by remediation commit `44cba6d`, the commit whose stated purpose was
making persistence and export failures visible. The cost editor cleared
loaded-project provenance before browser storage confirmed the company-card
write; if that write failed, a later attempt could replace the company rate card
without repeating the warning. Found in cold review on `ee035da`, reproduced
red-before, and repaired by preserving the prior flag, clearing it only for the
`saveCostDB()` call, and restoring it on failure.

This is recorded in full in two places and is not restated further here:
`Docs/execution/CAD_PERSISTENCE_REMEDIATION_HANDOFF_2026-08-01.md`, section
"2026-08-01 session-close cold review"; and `Docs/development/DEVELOPER_LOG.md`,
entry "2026-08-01 — FenceboundCAD remediation cold-review close".

The point of recording it here is that a repair commit introduced a defect of
the same class it was written to eliminate, and only a cold review after the fact
caught it. A day record listing only successes would teach a future session
nothing.

## S3 — Deferred

FenceScraper public-market evidence is **deferred, not cancelled**. NCDOT bid
data cannot produce a Charlotte-area fence rate on a useful timeline: common
permanent-fence items in Divisions 8/9/10 need roughly 5–10 years to reach the
accepted evidence threshold, and less common items may never reach it. The slot
moved to field data capture, which produces owner-controlled cost immediately.

Coverage counts, the sample-size table, Section 866/867 join keys, the accepted
statewide-with-regional-subset design, corrected premises, and resumption
conditions are held in
`Docs/execution/FENCESCRAPER_PUBLIC_MARKET_EVIDENCE_DEFERRAL_2026-08-01.md`.
Figures are deliberately not restated here; that document is the source.

## S4 — Active track

**Field data capture.** Not yet designed. No prompt issued.

The question it exists to answer: the owner has no historical cost data. Every
cost figure in the system to date is either a supplier list price, an estimate,
or an inference. Recording **actual material cost, labor hours, and installed
quantity per job** is the only source of verified cost the owner controls
directly — it does not depend on a public data source, a vendor's willingness to
publish, or a threshold that takes years to accumulate.

Prior records name field capture as the next authorized task and as the recipient
of the deferred slot, but state its purpose only as "owner-controlled material
cost and labor hours." Installed quantity per job, and the absence of historical
cost data as the motivating condition, are recorded here for the first time.

## S5 — Carried forward, unassigned

None of the following is assigned to a track. All are open.

1. **Non-atomic portable import.** `applyState(st)` runs before draw, panel,
   material, and drawer updates; if a later call throws, the catch reports
   "Import failed" but the imported state remains live. A failed import is not a
   no-op and should restore the complete prior state.
2. **Matrix route 10 does not price migrated jobs.** It checks generated run IDs,
   gate owners, and hydrated add-ons only. It never calls `computePricing()` or
   compares totals after migration, so unknown legacy types can produce
   incomplete or zero pricing without erroring.
3. **Dead `ADDON_STATE` validation code.** Unreachable because `validateProject()`
   hydrates add-ons before testing their type. Removal appears safe *only* while
   that ordering and hydration contract hold; it was not removed.
4. **`S.materials.qty` persists as a STRING.** The add-material handler stores the
   HTML input's `.value` directly; normalization happens only when
   `computePricing()` builds the combined BOM. Every consumer must coerce
   explicitly and must not rely on implicit arithmetic conversion. The pricing
   boundary's normalization is a load-bearing backstop for portable imports and
   older saved jobs — do not remove it as redundant with the UI guard.
5. **Pre-fix saved jobs may carry undetectable D-3 contamination.** Records under
   `fencebound_v2_jobs` written before the D-3 repair may contain mutations that
   later Saves or Deletes made durable. The schema stores no original hash, prior
   snapshot, mutation provenance, write timestamp, or audit log, so a changed
   price, label, material row, or element is structurally identical whether it
   was saved intentionally or leaked from the live project. **Contamination
   cannot be distinguished from legitimate edits by inspection.** Shared values
   across jobs are not evidence, because legitimate jobs routinely share a rate
   card. No audit view or migration exists; any recovery policy is an owner
   decision. Assessment in full:
   `Docs/execution/CAD_PERSISTENCE_REMEDIATION_HANDOFF_2026-08-01.md`, section
   "Existing saved-quote contamination assessment".

Items 1–4 also appear in the carried-forward list of the FenceScraper deferral
handoff. Item 5 does not, and is not in `CLAUDE.md`'s known-defects section
either; before today it existed only inside the remediation handoff's narrative.

## S6 — Owner rulings in force

Eleven ruling IDs exist. Ten are decided; O-6 is open. No ID carries conflicting
final text. Where the July 30 integrity handoff still poses O-1 through O-7 as
open questions, the August 1 remediation handoff supersedes it.

| ID | Ruling | Recorded in full |
| --- | --- | --- |
| O-1 | v5.3.8 `index.html` continuation ratified for defect repair and data integrity only; no feature work until v6.0. | `CLAUDE.md:14`; remediation handoff §Outcome |
| O-2 | This work receives a release tag and CHANGELOG; annotated `v5.3.9` must point exactly at merge commit `fef779a`. | Remediation handoff §"v5.3.9 tag and in-app version label" |
| O-3 | Undo/redo migration to canonical full-state persistence deferred to v6.0; the minimal repair was sufficient. | Remediation handoff §Outcome; `DEVELOPER_LOG.md` 2026-08-01 cold-review remediation entry |
| O-4 | Validation warns without blocking export. Estimate PDFs, plan PDFs, and portable JSON state **NOT FULLY VERIFIED** and list missing information on the artifact. | Remediation handoff §Audit and repairs |
| O-5 | Full project/company pricing state separation deferred to v6.0. The D-1 provenance guard is not that redesign. | Remediation handoff §Outcome; `CLAUDE.md:38` |
| O-6 | **UNDECIDED.** The external continuity bundle's repository future. Branch `docs/repository-continuity-atlas-v538-sync` is kept for provenance, neither merged nor deleted, pending this decision. | Remediation handoff §Continuity branch assessment |
| O-7 | Root historical-file archiving complete. Corrected in scope: `FenceScraper-v3.0-Validated-Market-Rate-Mapping.html` is an active runtime with required sibling scripts and stayed at root; only historical versioned HTML moved to `archive/`. | Remediation handoff §Outcome and §Continuity branch assessment |
| O-8 | The FenceScraper track produces MARKET OBSERVATIONS only. It may never write to COST_DB, LABOR, MARKUP, or the company rate card — no path, no flag, no deliberate-action escape. | Deferral handoff §"Owner rulings carried forward verbatim" |
| O-9 | No invented burden adjustment. If a comparison needs one, the comparison is not yet supportable — say so. | Deferral handoff §"Owner rulings carried forward verbatim" |
| O-10 | Missing evidence stays UNKNOWN. It never becomes zero. | Deferral handoff §"Owner rulings carried forward verbatim" |
| O-11 | Market Benchmark Book v1.1 schema stands. Extend only if the source requires it; justify any addition. | Deferral handoff §"Owner rulings carried forward verbatim" |

O-6 is the only open ruling and is the only decision blocking disposition of the
continuity branch. It is not listed in any carried-forward register.

## S7 — Working method that produced today's result

Recorded deliberately. This is reusable and easy to lose, and two of the five
practices below appear nowhere else in the repository.

- **Audit before repair.** Predicted defects R1 and R2 did not exist: every
  `saveCostDB()` UI caller already cleared provenance first, and no `Set` outside
  `specs`/`runSpecs` crossed a JSON boundary. Auditing first avoided writing
  fixes for imaginary bugs. `CLAUDE.md` already forbids restating them as
  confirmed findings.
- **Red-before, green-after — without borrowing.** A test must fail on the parent
  commit and pass after, and must not depend on functions the fix introduces.
  The original T-P1 evidence violated this by calling `reloadSavedCostDB()`, a
  function the D-1 fix created; that was test debt, not valid pre-fix setup, and
  was rebuilt through the existing cost-editor Save path. `CLAUDE.md` §Working
  rules states the rule; the borrowing failure mode is recorded only in the
  remediation handoff.
- **Report premises the source contradicts.** Prompt assumptions were wrong in
  every session this week: `index.html` line counts, the number of Bible status
  documents, which document governs, the FenceScraper artifact version, a file
  extension, the PR commit count, and the user-visible defect count. Catching
  these was worth more than the repairs. Precedent is in the July 30 handoff
  §"Pre-flight and source discrepancies" and the deferral handoff §"Corrected
  premises", but no governance document states it as a standing rule.
- **Report inability rather than narrowing the task.** When a required input is
  missing, say so and stop. Do not silently shrink scope to what is reachable and
  present the result as complete. Not previously recorded.
- **Refuse truncated authorizations.** An instruction that ends mid-sentence is
  not an instruction. Request the remainder rather than inferring intent. This
  rule was exercised repeatedly today and prevented at least one incorrect
  repository action. Not previously recorded.

## Verification

- No runtime source changed. No test suite was run, and none was required.
- Source for every claim above: `SOURCE_OF_TRUTH.md`, `CLAUDE.md`, the July 30
  integrity handoff, the August 1 remediation handoff, the FenceScraper deferral
  handoff, and the CHANGELOG and developer-log entries added today.
- Facts verified against Git rather than documentation: PR #2 commit count (15,
  via `git rev-list --count fef779a ^76ddb8d`); tag type and object SHA (`tag`,
  `a22a85a5fb9d8b0fbb1dfd9eddc5ccb68e247b59`); ruling-ID inventory (11 IDs, O-6
  open); user-visible fix count (10, from `CHANGELOG.md`).
- No file matching `SESSION_HANDOFF*` previously existed in the repository.

## What this document adds that was recorded nowhere

Stated plainly so a future session can tell the difference between a summary and
a new record:

1. The working method of S7 as a method. Two of its five practices — report
   inability rather than narrowing, and refuse truncated authorizations — had no
   prior record anywhere.
2. The motivating condition for field data capture (no historical cost data) and
   installed quantity per job as a captured field. Prior records named only
   material cost and labor hours.
3. D-3 contamination as a carried-forward item. It was documented, but not in any
   carried-forward register.
4. O-6 identified as the sole open ruling and as unlisted in any carried-forward
   register.
5. The corrected commit count, the tag object SHA, and the corrected user-visible
   defect count, none of which appeared in documentation.
6. A single entry point spanning the day's five documents.
