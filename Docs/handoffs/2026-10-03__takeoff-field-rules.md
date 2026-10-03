# FenceBound current handoff

<!-- SESSION_METADATA
generatedAt: 2026-10-03T19:06:08Z
repositoryRoot: ~/Desktop/FenceBound
branch: fix/field-hole-depths
testedHead: cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908
repositoryHeadAtGeneration: cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908
upstream: origin/fix/field-hole-depths
worktreeClean: true
canonicalRuntime: index.html
applicationVersion: 5.4.0
schemaVersion: 3
gateStatus: PASS
gateHead: cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908
-->

Verified 2026-10-03 in `/Users/altairus78/Developer/fencebound-codex` on
`fix/field-hole-depths`. Canonical repository identity remains `~/Desktop/FenceBound`;
`index.html` is the canonical runtime. This is one documentation-only closeout child of
the tested implementation above, under the two-commit convention in `START_HERE.md`.

## Verified implementation and merged work

- **#6 — integer-cents pricing:** demo cost restored; “Add a material” remains staged until Save.
- **#8 — 168 LF fixture:** uses the authoritative house-terminated geometry and per-end
  hardware. Unchecked Top Rail stops ordering rail and sleeves.
- **#9 — owner defaults:** 4 ft chain link with top rail and bottom wire, 2-1/2" terminals
  and 1-5/8" line posts. Per fabric end: height in feet minus 1 tension bands;
  1 brace band + 1 cup per rail; 1 brace band per tension wire or barbed strand.
- **#10 — auto-post repair:** merged; the September pending-repair claim is superseded.
- **#11 — fastening and rulings:** 5 ties per bay per rail; 5 hog rings per bay per tension
  wire or razor ribbon; height in feet minus 1 ties per line post. The truss-rod connector
  is bought separately. FenceBound doesn't set prices; contractors supply their prices.
- **This branch — hole depths:** under 6 ft, line posts 18", terminal/corner/gate posts 24";
  6 ft and taller, line posts 24", terminal/corner/gate posts 30". Per-run depth overrides
  remain available. **R15 = 31122 cents ($311.22).**

## Verification

At `cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908`, completed `2026-10-03T19:06:08Z`:

- `npm test`: **96/96 passed**, full suite including PDF tests.
- `node scripts/cad-persistence-matrix.js`: **12/12 passed**.
- The 168 LF fixture reported no asserted quantity deltas; R15 reported 31122 cents.
- Test output is under ignored `test-results/`; persistence results were emitted to the console.
- `git diff --check` is the final documentation check before commit/push.

## Known defects and drift

The auto-post and “168 LF versus fixture” entries are removed from `CURRENT_STATE.json`.
All other carried defects remain there, including the separate installation/submittal depth
model, D6/D7, persistence/import limitations and pale PDF accents.

`session:init` reports PR merge commits as drift because its closeout check accepts only a
direct allowlisted documentation child. The existing governance-file allowlist limitation
also remains recorded. `scripts/session-init.js` was not edited.

Playwright 1.40.1 has npm audit advisory **GHSA-7mvr-c777-76hp**. Upgrade is deferred because
newer Playwright does not support macOS Catalina; dependencies remain unchanged.

Authority contradictions remain visible: the embedded Development Index is stale;
`CLAUDE.md` and `SOURCE_OF_TRUTH.md` retain older authority ordering and supplement listings
than `START_HERE.md`. This closeout follows the current Tier 1 workflow and owner task;
it does not revise those authority documents. System Atlas and O-6 drift remain indexed.

## Open questions and next task

1. **Next task: residential post purchase lengths.** Establish the available residential
   stock lengths and owner-approved selection rules. Schedule 40 is commercial; full sticks
   are cut to length. The runtime still uses 10.5 ft terminal and 9 ft line purchase lengths
   at every height. Obtain the stock-length ruling before implementation.
2. Should mid/bottom rails get ties? Currently yes, under the per-rail rule.
3. Should the under-6 ft hole-depth defaults be editable? Per-run overrides currently work;
   the cost-editor rate-card depth fields apply to the 6 ft+ tier.
4. Should `session:init` be fixed to recognize PR merge commits? Deferred; no script change.

The September 18 handoff is preserved verbatim as history in
`Docs/handoffs/2026-10-03__takeoff-field-rules.md`. Its pending work and prior test counts
are historical evidence, not current task instructions. Retail-reference research and
EIN-free software comparison remain historical proposals outside this closeout's scope.

## Restart

Run `initiate repo` from this checkout, then the FenceBound initialization check:

```bash
npm run session:init
```

<!-- BOOTSTRAP_START -->
FENCEBOUND FRESH SESSION BOOTSTRAP

Repository: ~/Desktop/FenceBound (verification checkout: /Users/altairus78/Developer/fencebound-codex)
Branch: fix/field-hole-depths
Verified HEAD: cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908 (implementation; one docs-only closeout child permitted)
Canonical runtime: index.html (5.4.0)
Schema: 3
Authority: tested source/runtime → frozen Engineering Bible + supplements → System Atlas → Development Index → current handoff/state → history
Last completed: Verified merged #6/#8/#9/#10/#11 rules and this branch's height-based hole depths; R15 = 31122 cents. Full suite 96/96 and persistence matrix 12/12 passed.
Active next task: Residential post purchase lengths; confirm owner stock lengths and schedule-40 commercial selection before implementation.
Owner decisions required: Residential stock lengths; mid/bottom rail ties (currently yes); under-6 ft depth editability; session:init merge handling. O-6 remains unresolved.
Known defects or drift: See CURRENT_STATE.json; session:init reports PR merge commits as drift; Playwright advisory GHSA-7mvr-c777-76hp upgrade deferred for Catalina compatibility.
Required reading: AGENTS.md, START_HERE.md, Docs/CURRENT_HANDOFF.md, CURRENT_STATE.json, PROJECT-INSTRUCTIONS.md, then task-relevant authority.
Required gate: npm run session:init; npm test (including PDF tests); node scripts/cad-persistence-matrix.js; git diff --check.
<!-- BOOTSTRAP_END -->

---

# Historical September 18 handoff (verbatim)

The following is superseded history, retained without edits.

# FenceBound current handoff

<!-- SESSION_METADATA
generatedAt: 2026-09-18T19:28:37Z
repositoryRoot: ~/Desktop/FenceBound
branch: main
testedHead: ad5c31471bd61ccdabb9593377c9eaed22d9f1e1
repositoryHeadAtGeneration: ad5c31471bd61ccdabb9593377c9eaed22d9f1e1
upstream: origin/main
worktreeClean: true
canonicalRuntime: index.html
applicationVersion: 5.4.0
schemaVersion: 3
gateStatus: PASS
gateHead: ad5c31471bd61ccdabb9593377c9eaed22d9f1e1
-->

Updated 2026-09-18 at the owner's request to leave a next-step note on main before exiting.
This is a documentation-only closeout of `ad5c314`; runtime/tests are unchanged from the prior
tested implementation `559c1d8`. The current gate covers initialization, source identity and
documentation checks. Browser suites were not rerun on main for this note.

## Next session — review the local pricing repair first

The canonical checkout `/Users/altairus78/Desktop/FenceBound` is on
`fix/cad-auto-post-integrity` with an **uncommitted** repair, tests and reports. Preserve that dirty
worktree. Do not switch/reset it to main or copy the stale `Fencebounddeploy/index.html` over it.
The exit instruction authorized this note on main, not merging or publishing the repair.

1. Inspect the repair and `Docs/execution/CAD_AUTO_POST_INTEGRITY_2026-09-18.md` in that local
   checkout. Move-tool duplication, spacing recalculation, gate-opening post exclusion and copied
   run ownership were repaired. Local validation passed 86 browser tests and 12 persistence routes;
   independent review found no remaining blocker. These results describe the local candidate,
   not main. No pricing-rate values changed; saved coordinates remain intact on load.
2. Present the pending closeout: commit the repair/tests/evidence, then update state/current and
   dated handoffs/developer log under the two-commit convention, and push the focused branch after
   explicit approval. Preserve unrelated AGENTS.md edits, review extracts, ZIP and deployment copy.
3. Reconcile actual field quantities before claiming reliable estimates. The authoritative
   house-terminated 168 LF example and executable closed-loop fixture disagree: tension bars
   10/12, tension bands 50/60, terminal brace bands 60/24, line brace bands 10/16, rail-end cups
   30/24 and caps 0/8. Driven-line-post assumptions also differ. Prior blanket D1–D5 closeout
   claims below do not settle that contradiction. Historical corrupted drawings are not repaired
   automatically by the local patch.
4. Then assess a separate dated, local retail-material comparison. The owner requested Lowe's and
   Home Depot research for field sales/customer comparisons and weekly/monthly market tracking.
   The local proposal is `Docs/planning/RETAIL_PRICE_REFERENCE_2026-09-18.md`. Product matching,
   pack quantities, location, freshness and permitted data access are prerequisites; retail
   materials must remain separate from installed-price and profit claims.

The owner also wants independent fence-estimating software usable **without an EIN**. ArcSite's
documented individual/Apple subscription route is the strongest provisional candidate; complete
onboarding and relevant fence takeoff access still need checking before purchase. FenceTrace's
visible signup lacks an EIN field, but checkout and conflicting advertised prices remain
unverified. Compare exported quantities against identical drawings; another tool's defaults do
not automatically override the owner's field specification. No account or purchase was made.

## Previous September 6 outcome — historical baseline

- Canonical local repository: `~/Desktop/FenceBound` on `main`.
- The 5.3.1+feat artifact was ported onto the canonical 5.3.8 release-validation source without
  reverting intervening work.
- Shipped modules are full backup/restore, CSV rate-card import, local company profile and estimate
  branding, interface hierarchy refinements, and cross-platform SVG icon cleanup.
- Prices still travel with jobs; company branding does not. The single-file, offline, no-account
  architecture remains intact.
- Company terms default to empty and are omitted from PDFs unless explicitly supplied. Internal
  plan sheets deliberately do not require a company profile.
- Owner field practice for chain-link post classification, lengths, holes, 60-pound concrete bags,
  per-end termination hardware, and the 6-plus-1 assembly is ratified in the v5.4.0 authoritative
  supplement and the D1–D5 portion is implemented in the canonical runtime.
- The 168 LF reference job and its known-correct D1–D5 quantities are the required regression
  fixture and now runs in the default gate.
- D1–D5 landed: post roles and terminations share one per-run tally, linear materials and labor are
  gate-net, role-specific embed/length/concrete defaults persist with jobs, and the BOM distinguishes
  brace-band and truss-assembly components.
- R15 now records the owner-ratified corrected baseline `386.195`; its former `382.01` value encoded
  the superseded pre-D1–D5 quantities.

## Previous implementation verification

- Tested implementation commit: `559c1d87ab8ec2e57de47c2b4758c55766c5fe00`.
- `npm test`: **71/71 passed**.
- `node scripts/cad-persistence-matrix.js`: **12/12 passed**.
- Extracted runtime script `node --check`: passed.
- `git diff --check`: passed.
- Independent review completed; all supported findings were repaired and revalidated.

## Previous product-state record — qualified by the exit note above

D1–D5 are closed at the tested implementation commit. The 168 LF regression fixture passes in the
default suite. No further takeoff work is authorized by this handoff.

Five candidates remain explicitly deferred and are not authorized for implementation:

1. D6 price-first per-LF plus material-multiplier margin support.
2. D7 first-class “6 plus 1” assembly.
3. Separate real installation depth and submittal specification depth.
4. JSON price-import provenance behavior.
5. Pale PDF accent contrast.

The authoritative behavior and architecture record is
`Docs/authoritative/FenceBound_Engineering_Bible_v5.4.0_Port_Authority_2026-08-28.md`. Historical
drift and carried defects remain indexed in `CURRENT_STATE.json`. O-6 continuity-branch disposition
remains unresolved.

Repository tooling has one deferred false-positive defect: `session:init` rejects approved
one-child documentation closeouts when they include governance files outside its current allowlist.
The allowlist needs to accommodate the approved closeout structure; no tooling change was made in
this session.

## Restart

From anywhere inside this repository, type:

```bash
initiate repo
```

The workflow reads `AGENTS.md`, then the Tier 1 files in `START_HERE.md` order and runs the
FenceBound-specific read-only initialization check.

<!-- BOOTSTRAP_START -->
FENCEBOUND FRESH SESSION BOOTSTRAP

Repository: ~/Desktop/FenceBound
Branch: main
Verified HEAD: ad5c31471bd61ccdabb9593377c9eaed22d9f1e1 (documentation/source-identity gate; main runtime unchanged)
Canonical runtime: index.html (5.4.0)
Schema: 3
Authority: tested source/runtime → frozen Engineering Bible + supplements → System Atlas → Development Index → current handoff/state → history
Last completed: Saved the exit note on main. The automatic-post repair is tested but uncommitted in the canonical checkout on fix/cad-auto-post-integrity.
Active next task: Review and approve the local repair closeout first; reconcile field quantities before developing retail comparisons.
Owner decisions required: Repair commit/push closeout; conflicting field quantities; EIN-free benchmark access and retail data source; O-6 remains unresolved.
Known defects or drift: See CURRENT_STATE.json and Docs/planning/FenceboundCAD_v5.4.0_deferred_defects.md.
Required reading: AGENTS.md, START_HERE.md, Docs/CURRENT_HANDOFF.md, CURRENT_STATE.json, PROJECT-INSTRUCTIONS.md, then task-relevant authority.
Required gate: npm run session:init; use PROJECT-INSTRUCTIONS.md for task-specific validation.
<!-- BOOTSTRAP_END -->
