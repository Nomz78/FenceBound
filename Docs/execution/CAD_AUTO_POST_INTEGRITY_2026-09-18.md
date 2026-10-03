# CAD automatic-post integrity repair

Date: 2026-09-18. Branch: `fix/cad-auto-post-integrity`.
Base HEAD: `ad5c31471bd61ccdabb9593377c9eaed22d9f1e1`.
Status: local, uncommitted candidate; no publication or deployment performed.

## Authorized result

The owner authorized repair of automatic-post ownership and recalculation after a diagnostic
showed a stationary 42-foot fence gaining a post and quote value every time the Move tool released
an endpoint. With shipped placeholder rates, the diagnostic increased $983.01 to $996.98 and
$1,010.96 without changing fence length. Spacing changes failed to regenerate posts, and gates
left line posts inside their openings.

The repair replaces automatic posts by owning run ID, never by matching coordinates across runs.
No-op moves leave stored posts intact. Explicit run/spacing and gate placement/move/deletion edits
rebuild the affected run. Gate segments, including their endpoints, exclude automatic line posts.
Other runs, manual posts and boundaries remain separate. This retains the existing spacing grid;
it does not invent a new spacing algorithm for fence sections between gates.

Slider, preset and mouse/touch spacing controls use the same setter, with undo snapshots.
Automatic-posts-off runs stay off. Copy/paste serializes run add-ons correctly and assigns copied
fences fresh IDs and independent posts. Ambiguous duplicate IDs in old drawings trigger a message
and refuse post replacement; existing validation also reports RUN_ID_DUPLICATE.

Type-switch history is captured before changing type/spacing. Both deletion inputs share the same
gate restoration path. Rates, markups, pricing formulas, release version and saved schema remain
unchanged. Loading saved drawings and undo/redo preserve stored coordinates without regeneration.

## Verification

- Before production edits: six targeted browser regressions failed and the boundary/saved-load
  guard passed. Before follow-up repairs, three additional scrub/copy checks failed.
- Final focused suite: 15/15 passed.
- `npm test`: 86/86 passed, including the unchanged existing 71 tests.
- `node scripts/cad-persistence-matrix.js`: 12/12 passed.
- Both embedded scripts parsed using `vm.Script`; new test file passed `node --check`.
- `git diff --check`: passed.
- Independent read-only review identified copied-run ownership and spacing-scrub gaps; both were
  repaired and reviewed again. Final review reported no blocking findings.
- Browser coverage uses real UI controls for spacing, copy/paste, delete, undo and redo; drawing
  fixtures invoke production handlers with controlled coordinates. No human field-use approval
  or visual-design evaluation is claimed.

The later Development Index changes are static documentation. Its stale D1–D5 statements now
distinguish implemented behavior from unresolved specification conflicts.

## Limits and remaining pricing work

Old snapshots may retain duplicate or misplaced automatic posts. They are not silently rewritten
or repriced merely by loading. Explicit edits regenerate the affected run and can change its
quantities. Existing duplicate run IDs must be resolved separately; this patch does not guess
their ownership. Manual posts, overlapping/off-line gates, gate ownership reassignment after
movement, and general drawing validity need their own assessment.

The August 28 authoritative 168 LF example has two house terminals and two corners. The executable
fixture closes four fence runs. The specification versus fixture quantities are tension bars
10/12, tension bands 50/60, terminal brace bands 60/24, line brace bands 10/16, rail-end cups 30/24,
and caps 0/8. Driven line-post embed/concrete assumptions also differ. This repair does not change
that fixture or adjudicate those owner decisions. Passing tests must not be described as proof
that all material takeoffs or estimates are correct.

Deployment provenance: canonical source is root `index.html`; untracked
`Fencebounddeploy/index.html` exactly matches historical `4dca3d5:index.html` (Git blob
`0d4e93c7f66f0f79b06cbaeac4ed6eb6bb56a11c`). No tracked deployment configuration establishes the
currently published build. Do not equate that stale copy with this tested candidate.

## Operator check

Serve this checkout over HTTP in a separate test browser profile and use a disposable drawing.
Draw a 42-foot chain-link run at 10-foot spacing; note the four line posts and total. Release a
Move endpoint without moving it and translate the run repeatedly: quantity and total should stay
stable. Select it and change spacing to 6 feet: six line posts should appear; undo/redo should
restore the corresponding quantity and total. Put a gate over a post, move and delete the gate,
then undo/redo; no line post should remain on an edited gate opening. Copy/paste the run and change
only the copy's spacing; the original must retain its posts. Compare quantities first; placeholder
rates are not supplier quotes.

## Related research and closeout

Retail-price reference and individual-access estimating-software research is in
`Docs/planning/RETAIL_PRICE_REFERENCE_2026-09-18.md`. It is a proposal, not a shipped feature.

Preserved pre-existing work: `AGENTS.md`, the two root review extracts, the ZIP, and
`Fencebounddeploy/`. None belongs in this repair's commit. A future approved closeout must update
the current state/handoff and archive via the repository's two-commit convention; the existing
current handoff still describes the prior committed implementation.
