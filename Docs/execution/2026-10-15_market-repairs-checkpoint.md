# Market-readiness repair checkpoint — 2026-10-15

Continuation of `Docs/research/2026-10-15_market-readiness.md`, limited to its four
reproduced software defects. Branch: `codex/market-readiness-repairs`.
Original experiment baseline: `424750b06ef876b826a26329d0fc3f13bd583435`.
The measured experiment and working-tree gates below predate the approved commits.
For the current tested repair commit and fresh closeout gate, read
`Docs/CURRENT_HANDOFF.md`; the original baseline does not contain these repairs.

Task classification: the unit guard is related to C1, but implements neither pack
sizes nor order quantities. This is not C0b: no source-backed BOM counts changed.

## Implemented acceptance cases

1. Automatic and manual material lines enforce matching price units. A 100 LF
   fabric quantity with a $160/roll CSV rate is unpriced, emits `UNIT_MISMATCH`,
   and cannot be FINAL-READY. Compatible aliases such as feet/LF still price.
   No roll-length conversion is guessed; warn-not-block export remains intact.
2. JSON prices merge onto defaults plus the persisted company card, never the
   borrowed live job card. Borrowed pricing requires confirmation. Cancellation,
   corrupt company storage, and failed persistence preserve live pricing,
   provenance, and the persisted card. Bare-number legacy prices inherit company
   units. A display exception after a successful save reports that prices saved.
3. Portable job import retains the previous job until hydration, display updates,
   and autosave storage succeed. Failure restores original run identities,
   selection, undo/redo, default/per-run type memory, and pricing/provenance.
   Job controls are redrawn when recovery rendering succeeds; a persistent display
   exception cannot prevent model rollback but can leave a stale view.
   Incoming-only prices do not leak. Success clears the old history.
4. Material rates retain supplied decimal precision through quantity and markup
   extension, then round half-up to integer cents. Examples: 1,000 × $0.014 =
   $14.00 cost / $18.90 at 35% markup; 1,000 × $0.004 = $4.00; 1 × $1.005 =
   $1.01; 2.5 × $0.014 = $0.04. Decimal integer arithmetic handles half-cent
   boundaries without a dependency. Material unit-rate output preserves precision.

Unit input precision remains bounded by JavaScript Number parsing; this is not
an arbitrary-precision input format. Gate labor and demo/slope still use their
existing cent-rounded unit rules. Their precision policy is separate remaining
work, not covered by the material repair. Price values and quantities are unchanged.

## Validation and independent review

`tests/market-readiness-repairs.spec.js` contains the durable regressions. The
initial 11 cases all failed before runtime edits and passed afterward. Expanded
coverage against `git show HEAD:index.html` served separately over HTTP produced
13 failures and one passing success-path control; the repaired runtime passed all
14. The reviewer-requested post-save display-error regression also failed before
its repair. Final focused run: 15/15; updated IB3/R9 checks: 4/4.

Independent read-only review examined the raw runtime diff, tests, and authority,
and checked decimal arithmetic separately. No blocking finding in the four scoped
repairs. Its supported display-error finding was repaired; the second-import
test now waits for file processing rather than an earlier matching toast. The
reviewer verified those changes and the checkpoint's scope qualifications.

The first completed full suite reported 183 passes / four failures. IB3 dismissed
the newly required JSON confirmation; it now accepts it without changing numeric
assertions. Three R9 export tests depended on the old partially applied failed
imports. They now assert failed-import rollback, then apply the same malformed
legacy state directly and retain every original PDF/JSON warning assertion.
The revised R9 tests failed against the original runtime in all three cases.
Independent review confirmed that these test changes preserve their safety checks.
An earlier full attempt was stopped for the review correction before completion.

Final gate on the uncommitted working tree, 2026-10-15:

- `npm test`: **187/187 passed**, including PDF tests, 11.0 minutes with the ordinary
  repository configuration. No CDN wrapper or dependency change.
- `node scripts/cad-persistence-matrix.js`: **12/12 passed**.
- `git diff --check`: **PASS**.
- `npm run session:init`: **DRIFT**, expected stale branch/head/upstream metadata.
- Runtime SHA-256: `f842fce572b1d55395c3eae43869d9bcadb37d79cd552ad2bbb2382dad687f3d`.

Scratch validation logs: `/tmp/fencebound-market-repairs-*.log`. No external
services or customer records were modified.

## Measured checkpoint and revised forecast

The instrumented regression-preparation through final-validation window was
**17:19:51–17:49:27 UTC, 29 minutes 36 seconds**. It includes implementation,
failure-path experiments, test waits, independent review, and integration fixes.
Earlier authority reconstruction and initial code inspection were not timed, so
this is a lower bound on session effort, not a complete human engineering-hours
measurement. One lead writer and one bounded read-only reviewer were used.

Output: **four reproduced defects repaired**, 15 new focused tests (14 failure
cases plus one success control), three existing hostile-input regressions
strengthened, and the JSON-coercion test adapted to the required confirmation.
The new cases were demonstrated red before their associated fixes and green
afterward. No field/product decision was required. Integration costs included
the four existing test-contract failures and the review follow-up; they are
counted in the observed window rather than hidden as additional work.

Retire the original **3–5 engineering-day** allowance for this completed repair
package. Keeping the other package estimates unchanged gives **17–30 engineering
days / 102–180 focused hours remaining** for the limited contractor pilot:

| Remaining package | Engineering days |
|---|---:|
| Supported assemblies and acceptance examples | 2–3 |
| Product identity, parameters, gates and autofill | 5–8 |
| Packs, waste and order export | 4–6 |
| Persistence and standalone delivery | 3–5 |
| Independent acceptance and pilot corrections | 3–8 |
| Total remaining | **17–30** |

This is a remaining-work forecast, not extrapolation of four defects per half
hour to the rest of the product. The original 20–35-day estimate overestimated
this bounded repair batch. Assembly evidence, product choices, and pilot feedback
have different constraints and have not yet supplied measured throughput.
The wider/all-type estimates and percentage rubric are not newly calibrated.
Reforecast those packages after their own completed acceptance cases. The five-day
experiment cap was not exhausted; this is an early checkpoint at completion of
its four ranked repair targets. No assembly acceptance case was started.

## Remaining scope and repository boundary

The pilot is still blocked by supported-assembly evidence, variant identity,
parameter compatibility, purchasing quantities/waste/order output, offline PDF
delivery, broader recovery, and pilot acceptance. No supported assembly was
selected, doctrine changed, price value edited, or release promoted in this batch.
No new field ruling was needed.

The mixed working tree was separated by task on continuation. At that checkpoint,
each worktree held only its own deliverable and developer-log addition:

| Task | Branch | Working directory | Task files besides developer log |
|---|---|---|---|
| C0 reference (evidence gaps remain) | `codex/counting-c0` | `/Users/altairus78/Developer/fencebound-c0-review` | `Docs/reference/HARDWARE_SPEC_REFERENCE.md` |
| Readiness assessment | `codex/market-readiness-assessment` | `/Users/altairus78/Developer/fencebound-readiness-review` | `Docs/research/2026-10-15_market-readiness.md` |
| Four software repairs | `codex/market-readiness-repairs` | `/Users/altairus78/Developer/fencebound-codex` | `index.html`, `tests/market-readiness-repairs.spec.js`, `tests/input-boundary-validation.spec.js`, `tests/persistence-integrity.spec.js`, this checkpoint |

At separation, all three branches pointed to the original baseline and their task
additions were uncommitted. The assessment uses C0 evidence; this checkpoint refers
to the assessment. The subsequent owner-approved closeout preserves the order
C0 → assessment → repairs, with each branch based on its predecessor's completed
closeout and each task's own developer-log addition retained. Predecessor files are
now inherited by this repair branch, not duplicated as repair changes.

The original combined files were backed up outside Git before separation. Runtime
and test contents were preserved byte-for-byte; the reported full-suite and matrix
results above remain prior working-tree evidence, not a gate on a repair commit.
At separation, `Docs/CURRENT_HANDOFF.md` and `CURRENT_STATE.json` described another
branch/HEAD. The zero-drift audit confirmed the three commits after their recorded `ea67c4e`
are documentation-only, and the live runtime version/schema remain 5.4.0/3.
Session initialization then reported branch/HEAD/upstream drift; it was not a
runtime regression. Approval, commits, pushes, and metadata synchronization were
still outstanding at that checkpoint.

Continuation verification: exact task file sets and isolated log entries passed;
`git diff --check` and deliverable whitespace checks passed in all three worktrees.
Six runtime/test/reference/assessment files matched the pre-split SHA-256 manifest.
Independent read-only review found no blocking issue in the completed split.
Its path and historical-status clarifications were applied. No new tests were needed
for the separation. The original closeout proposal is in ignored local
`AI/market-task-split-closeout.md`; the owner's subsequent explicit approval governs
the closeout, not that proposal file.

## Approved closeout preparation

The owner approved creating the three branches, committing, validating, and pushing,
with **no PRs**. C0 is committed and pushed at `12907fc3346ead9f6980bd55d6b967f40a8e0a68`;
the assessment is committed and pushed at `dfc0ee17905f2cfc3dc1f08214b9a3bdc74c7fc1`.
This repair branch was fast-forwarded to the assessment before restoring only its
own task delta. Runtime and tests remain byte-identical to the original repair
checkpoint. The repair task commit is followed by the repository's single permitted
metadata-closeout child; its hashes and fresh validation results are recorded in
the current handoff and `Docs/handoffs/2026-10-15__market-readiness-repairs-closeout.md`.

The assessment closeout records an intermittent pre-repair R9 pageerror and CDN
timeouts. A scratch-only transport of integrity-verified jsPDF 2.5.1 is used for
the repair closeout gate; its exact command, artifact hash, and limits belong to
the current handoff. This does not implement offline delivery or establish that
the separate intermittent pageerror's trigger has been fixed.

Restart: run `npm run session:init`, read this checkpoint and the four Tier 1
files, then verify the current tested commit, closeout child, and live Git status.
