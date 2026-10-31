# FenceBound Developer Log

Append one entry for every development session. Preserve prior entries.

## 2026-07-30 — FenceboundCAD persistence integrity

- **Objective:** Reproduce and minimally repair the authorized D-1 company-rate-card, D-2 undo add-on hydration, and D-3 Saved Jobs reference-isolation defects.
- **Start commit:** `76ddb8d0896a744b813a06f106a329c218680d19`
- **End commit:** Phase 6 closeout commit on `fix/cad-persistence-integrity-v4` (this entry); implementation repairs end at `55aff9e`.
- **Files changed:** `index.html`; `tests/persistence-integrity.spec.js`; `scripts/cad-persistence-matrix.js`; `CLAUDE.md`; this log; `Docs/phase-one-closeout-status.md`; the AI handoff template; and the session handoff.
- **Tests performed:** Unmodified 9-test baseline; eight focused red-before/green-after persistence regressions; full 17-test Playwright suite; twelve-route mixed-system persistence matrix; `git diff --check`.
- **Results:** Baseline 9/9 in 44.4 seconds. Before repairs, all eight focused tests were red. After repairs, 17/17 passed in 48.7 seconds. All twelve matrix routes passed.
- **Defects discovered:** D-1, D-2, and D-3 all reproduced. D-1's first isolation attempt also demonstrated that D-3 could mutate an in-memory historical snapshot before any Load.
- **Debt introduced or reduced:** Removed three persistence corruption paths; added durable regression and matrix coverage. O-5 full project/company pricing separation remains unresolved by design.
- **Decisions made:** Used a provenance guard rather than state redesign; preserved narrow undo scope; used the already-proven JSON boundary semantics for internal Saved Jobs. No pricing values, frozen/historical HTML, release artifacts, or out-of-scope modules changed.
- **Next authorized task:** Owner review of O-1 through O-7 and normal PR review; no release promotion is authorized.

## 2026-08-01 — FenceboundCAD cold-review remediation

- **Objective:** Remediate ratified persistence review findings, implement the owner-approved warn-not-block export policy, assess existing quote contamination and the continuity branch, and record ratified owner decisions.
- **Start commit:** `25d3b3eeb3fb460b8fee25bc0b5d4c1ec1018452`
- **End commit:** Remediation documentation/archive commit on `fix/cad-persistence-integrity-v4`; runtime repair is `44cba6d`.
- **Files changed:** canonical runtime/tests, AI context and status, developer log and handoff, `CHANGELOG.md`, plus historical HTML paths under `archive/`.
- **Tests performed:** parent-compatible red runs for R6/R4/R5 and O-4; focused green runs; complete Playwright suite; frozen-file checksum; diff/syntax/link checks.
- **Results:** R6/R4/R5 were red on the parent and green after repair. Invalid estimate export blocked and portable JSON lacked a warning on the parent; both PDF types and JSON carry recipient-visible warnings after repair. Original acceptance suite: 9/9 in 43.3 seconds. Focused persistence/export suite: 13/13 in 14.5 seconds. Twelve-route matrix: 12/12.
- **Defects discovered:** storage-write exceptions falsely reported success; provenance was sticky after pricing-free apply; missing/corrupt saved cards falsely reported recovery. R1/R2 predictions did not reproduce.
- **Debt introduced or reduced:** reduced persistence and export-truthfulness risk. Existing pre-fix saved-job contamination cannot be distinguished reliably from legitimate quote data; v6.0 pricing-store separation remains required.
- **Decisions made:** O-1, O-2, O-3, O-4, O-5, and O-7 recorded as ratified by the owner; O-6 remains undecided after inspection. No merge or tag performed.
- **Next authorized task:** PR review, owner decision on the continuity branch, and owner confirmation after merge before creating the release tag.

## 2026-08-01 — FenceboundCAD remediation cold-review close

- **Objective:** Correct the five authorized cold-review findings without expanding persistence, pricing, validation, or release scope.
- **Start commit:** `ee035dab3b4a06247189c5cee4a41c01cc6047cb`
- **End commit:** Session-close commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, this log, the persistence remediation handoff, and `CHANGELOG.md`.
- **Tests performed:** F1 red-before and green-after; real estimate PDFs for nineteen reachable validation error classes; capped-warning single-page check; plan warning/drawing geometry check; complete Playwright suites; twelve-route persistence matrix; `git diff --check`.
- **Results:** F1 reproduced on `ee035da`: the failed write left provenance false while the company card stayed unchanged. The repair preserves provenance across failure. All nineteen state-reachable estimate cases rendered with a populated total and without `NaN`, `undefined`, page errors, or exceptions. Exact final totals are recorded in the close report.
- **Defects discovered:** F1 was introduced by remediation commit `44cba6d`. Warn-not-block exposed a separate `PRICING_RUNTIME` export-resilience limitation: validation can catch a pricing exception, but estimate generation calls the same failing function again. `ADDON_STATE` is unreachable after hydration.
- **Debt introduced or reduced:** Restored transactional provenance behavior; added error-class estimate coverage; prevented warning banners from covering plan geometry. The separately recorded pricing-runtime resilience issue remains unresolved by instruction.
- **Decisions made:** Used preserve/clear/restore-on-failure rather than a force-write parameter. Validation logic, pricing values, math, merge state, and tags were unchanged.
- **Next authorized task:** Owner disposition of the pricing-runtime export-resilience finding and normal PR review. Do not merge or tag without authorization.

## 2026-08-01 — PRICING_RUNTIME export-resilience repair

- **Objective:** Repair the O-4 merge blocker so pricing-runtime failures cannot leave estimate, plan, or portable exports silent; investigate and record R11 defects without repairing them.
- **Start commit:** `3e18f3cf0c198d206941e5f97018d3dd7f4dbe4f`
- **End commit:** PRICING_RUNTIME closeout commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, `Docs/phase-one-closeout-status.md`, this log, the persistence remediation handoff, and `CHANGELOG.md`.
- **Tests performed:** R9 red-before and green-after through real portable import for null geometry, `constructor`, and `toString`; all three export formats per input; full Playwright suite; twelve-route persistence matrix; `git diff --check`.
- **Results:** Parent `3e18f3c` produced no estimate for null geometry. Export-local fallbacks now produce explicitly unpriced artifacts without changing pricing or validation behavior. Exact final totals are in the close report.
- **Defects discovered:** Manual `S.materials` are excluded from quote pricing and are recorded as an unintentional quoting-accuracy defect; failed portable import leaves partially applied state; route 10 does not price migrated jobs and unknown legacy types can silently yield incomplete/zero pricing.
- **Debt introduced or reduced:** Removed silent-export behavior for known pricing-runtime inputs. Export-only fallback structures are intentionally not a pricing repair. Three separate defects remain open by instruction.
- **Decisions made:** O-4 remains warn-not-block. `computePricing()`, validation logic, pricing values, `ADDON_STATE`, import semantics, and migration behavior were not changed.
- **Next authorized task:** Repair the manual-material quoting-accuracy defect before treating quote totals as complete; separately authorize atomic portable import and migrated-pricing coverage. No merge or tag was performed.

## 2026-08-01 — Manual-material quoting-accuracy repair

- **Objective:** Include hand-added project materials in the established material pricing path and make those costs visible on client estimates.
- **Start commit:** `8836b6186157810938e7d7b95b6f45bd208ac3ba`
- **End commit:** Manual-material pricing closeout commit on `fix/cad-persistence-integrity-v4`.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, `CHANGELOG.md`, `CLAUDE.md`, `Docs/phase-one-closeout-status.md`, this log, and the persistence remediation handoff.
- **Tests performed:** known and unknown manual cost red/green; five quantity cases; exact automatic-only total identity; equivalent auto/manual markup; estimate-PDF visibility; full Playwright suite; twelve-route persistence matrix; `git diff --check`.
- **Results:** Parent excluded known and unknown manual rows completely. The repair uses one combined BOM and the existing pricing/validation path. Exact final totals are recorded in the close report.
- **Defects discovered:** No new defect. Estimate omission was confirmed as the presentation half of the same manual-material pricing defect.
- **Debt introduced or reduced:** Removed silent quote understatement for manual items. Older saved jobs with manual rows recompute higher; no computed total is persisted. Non-atomic import, route-10 pricing coverage, and dead `ADDON_STATE` remain unchanged.
- **Decisions made:** Empty, invalid, zero, and negative manual quantities normalize to zero; positive decimals remain numeric. Manual marked-up extensions are shown separately and removed only from the LF display allocation, not from pricing totals.
- **Next authorized task:** Owner review of quote changes and remaining import/migration defects. No merge or tag was performed.

## 2026-08-01 — Manual-quantity input guard and PR close

- **Objective:** Reject negative manual quantities at UI entry, preserve pricing-boundary compatibility for imported/older data, verify the branch, and merge owner-authorized PR #2.
- **Start commit:** `3eae4fa90d1c1ade4847b0103f45bc5df544038a`
- **End commit:** Manual-quantity guard commit on `fix/cad-persistence-integrity-v4`; merge commit on `main` recorded in the close report.
- **Files changed:** `index.html`, `tests/persistence-integrity.spec.js`, this log, the persistence remediation handoff, and `CHANGELOG.md`.
- **Tests performed:** negative-entry red/green; loaded-negative backstop; unchanged empty/non-numeric/zero/decimal behavior; full Playwright suite; twelve-route persistence matrix; `git diff --check`.
- **Results:** Negative UI input is rejected with visible feedback and no row. Imported/older negative strings still normalize to zero without `NaN`. Exact final totals are recorded in the close report.
- **Defects discovered:** None. The HTML number input accepted negative values because it had no minimum and the handler did not validate them.
- **Debt introduced or reduced:** Added an entry guard and retained the persistence-boundary backstop. Non-atomic import, route-10 migrated-pricing coverage, and dead `ADDON_STATE` remain unchanged.
- **Decisions made:** Empty and non-numeric quantities continue to normalize to zero. The persisted string-type contract is now documented as load-bearing. Tag creation remains pending owner confirmation of the proposed version.
- **Next authorized task:** Owner confirmation of the release-tag version after PR #2 merge.

## 2026-08-01 — FenceScraper public-market evidence deferral

- **Objective:** Preserve the accepted NCDOT source and sample-size findings, record the owner's deferral, and hand the active slot to field data capture.
- **Start commit:** `4d49d0676574d0ea799fe98cdc9a34a92ffe89b1`
- **End commit:** Documentation-only session-close commit on `main`.
- **Files changed:** `CLAUDE.md`, this log, and `Docs/execution/FENCESCRAPER_PUBLIC_MARKET_EVIDENCE_DEFERRAL_2026-08-01.md`.
- **Tests performed:** Documentation/content inspection and `git diff --check`; no runtime suite because no source changed.
- **Results:** The handoff preserves the ratified source limitations, coverage counts, complete sample-size table, Section 866/867 join keys, accepted statewide/regional design, corrected premises, O-8 through O-11, resumption conditions, and carried-forward work.
- **Defects discovered:** None. Reconnaissance established that annual averages cannot produce bid spread or contract-level provenance and that local observations cannot reach useful coverage on a practical timeline.
- **Debt introduced or reduced:** No code debt introduced. Source acquisition remains unproven and explicitly deferred rather than being represented as complete.
- **Decisions made:** The public-market evidence track is deferred, not cancelled. Its slot transfers to field data capture. If resumed, acquisition is statewide with a mandatory Divisions 8/9/10 subset, insufficient evidence remains labeled insufficient, and no geographic or burden conversion is invented.
- **Next authorized task:** Field data capture for owner-controlled material cost and labor hours. FenceScraper resumes only under the conditions in its deferral handoff.

## 2026-08-01 — Consolidated day handoff

- **Objective:** Consolidate the 2026-08-01 day record into a single handoff.
- **Start commit:** `d669b412dc737d8b51132952cbd73b6d3ae043a3`
- **End commit:** Documentation-only consolidation commit on `main`.
- **Files changed:** `Docs/execution/SESSION_HANDOFF_2026-08-01.md`, `Docs/development/DEVELOPER_LOG.md`, and `CLAUDE.md`.
- **Tests performed:** No tests run because no runtime source changed.
- **Results:** Added the consolidated session handoff and recorded three premise corrections: PR #2 is 15 commits, not twelve; `CHANGELOG.md` records 10 user-visible fixes, not six; and the `v5.3.9` tag object SHA is `a22a85a5fb9d8b0fbb1dfd9eddc5ccb68e247b59`.
- **Defects discovered:** None; documentation-only work.
- **Debt introduced or reduced:** Reduced day-record fragmentation without changing runtime behavior.
- **Decisions made:** The consolidated handoff is the current session entry point. Existing authority records remain unchanged.
- **Next authorized task:** Use the consolidated handoff for subsequent session orientation.

## 2026-08-02 — Repository session initialization and self-handoff

- **Objective:** Make the repository the reliable, read-only entry point for future AI-assisted sessions without changing product behavior.
- **Start commit:** `85355bf3edda6d7859c83be6802f94a2cb4d0877`
- **Tested implementation commit:** `b44adcec5e3ae40dbb6ae152ba48df34958f3df2`; followed by the documentation-only closeout commit containing this entry.
- **Files changed:** Added `START_HERE.md`, `PROJECT-INSTRUCTIONS.md`, `CURRENT_STATE.json` and its schema, `scripts/session-init.js`, `Docs/CURRENT_HANDOFF.md`, and `Docs/handoffs/`; redirected existing repository entry-point references and added the npm command.
- **Tests performed:** `npm run test:phase-one` after the implementation commit; initializer syntax and state loading; read-only initialization output; Markdown path checks performed by the initializer; `git diff --check`.
- **Results:** Phase One 9/9 passed in 43.4 seconds. Runtime remained `5.3.8-release-validation`, schema 3. Initialization detects Git/runtime/handoff/state/link/document drift and prints the fresh-session bootstrap.
- **Defects discovered:** No new product defect. Documentation drift was made explicit: embedded v5.3.4 Development Index, older Atlas v0.1 baseline, intentional v5.3.9 tag/runtime-label mismatch, and unmerged continuity-branch orientation/Atlas candidates.
- **Debt introduced or reduced:** Removed reliance on chat history and filename archaeology. The existing `Docs/` capitalization was retained because this checkout's case-insensitive filesystem cannot safely host a separate lowercase `docs/` tree.
- **Decisions made:** Adopted a two-commit closeout: a tested implementation commit followed by one allowlisted documentation-only child. Initializer accepts only that exact relationship; anything further is drift.
- **Next authorized task:** Field data capture design remains the active product task; O-6 continuity-branch disposition remains the sole open owner ruling.

## 2026-08-15 — Global Codex workflow integration

- **Objective:** Adopt the global `initiate repo` operating workflow, migrate the canonical local
  path to `~/Desktop/FenceBound`, and preserve FenceBound-specific authority and closeout rules.
- **Tested implementation commit:** `9041c65a0854441a95ba277282b17d41fcf987d5`;
  followed by this documentation-only closeout commit.
- **Files changed:** Root workflow instructions and ignore policy, canonical-path references,
  current state/handoff, this log, and the archived session handoff.
- **Tests performed:** `npm run test:phase-one`, initializer syntax, state JSON/schema-version load,
  read-only session initialization, and `git diff --check`.
- **Results:** Phase One 9/9 passed. Runtime remains `5.3.8-release-validation`, schema 3. No product
  source or behavior changed.
- **Decisions made:** `initiate repo` is the normal entrypoint; FenceBound initialization,
  authority, gates, and two-commit closeout remain repository-specific phases.
- **Next authorized task:** Field data capture design remains active; O-6 remains unresolved.

## 2026-08-28 — FenceboundCAD v5.4.0 port and Zero-Drift closeout

- **Objective:** Port the working 5.3.1+feat artifact onto canonical 5.3.8 release validation
  without reverting intervening work, then synchronize repository authority to the verified result.
- **Baseline:** `b7294ecccd8cf636d337fb309877844a0667ebf9`.
- **Tested implementation commit:** `0d3211c9436d3fc40d8d4f3f8ea0090c967b85a1`;
  followed by the documentation-only closeout commit containing this entry.
- **Files changed:** Canonical `index.html`; phase-one and v5.4 Playwright coverage; deferred-defect
  record; current state, startup guidance, authoritative supplement, current/archive handoffs, and
  this log.
- **Tests performed:** Full Playwright suite, twelve-route persistence matrix, extracted runtime
  script syntax check, Unicode-remnant scan, `git diff --check`, independent review, and repository
  session initialization.
- **Results:** Full suite 69/69 passed; persistence matrix 12/12 passed. Shipped backup/restore,
  CSV rate-card import, local company profile and estimate branding, interface hierarchy updates,
  and cross-platform SVG icon cleanup as runtime 5.4.0 with schema 3 unchanged.
- **Defects discovered:** JSON price import still overwrites the saved rate card without the
  provenance confirmation used elsewhere. Pale company accents can reduce branded PDF contrast.
- **Debt introduced or reduced:** Backup and CSV false-success/provenance paths were repaired;
  persisted non-object rate cards now surface as corrupt; company terms no longer silently ship
  another contractor's warranty. Historical embedded Development Index and Atlas drift remain.
- **Decisions made:** Prices travel with jobs while branding remains local. Missing company profile
  is client-validation-only and does not block export. Terms default empty. Toast errors rely on
  styling rather than Unicode warning glyphs. The prior no-feature-before-v6 restriction was
  superseded for this explicit owner-authorized port only.
- **Next authorized task:** None. O-6 and the two deferred v5.4.0 defect candidates require owner
  direction before implementation.

## 2026-08-28 — Takeoff field-specification and governance closeout

- **Objective:** Synchronize v5.4.0 governance, ratify owner-supplied chain-link field practice,
  record the D1–D5 regression fixture and five deferred candidates, and close without runtime work.
- **Tested implementation commit:** `0d3211c9436d3fc40d8d4f3f8ea0090c967b85a1`;
  followed by the documentation-only closeout commit containing this entry.
- **Files changed:** Governance and handoff documents, v5.4.0 authoritative supplement,
  deferred-defect register, developer log, and export ignore policy. No runtime or test code changed.
- **Tests performed:** Documentation/state validation, repository session initialization,
  `git diff --check`, and independent documentation review.
- **Results:** Governance now describes v5.4.0 at `0d3211c`; chain-link post and per-end termination
  field rules and the known-correct 168 LF fixture are authoritative; walkthrough exports are
  ignored and the generated estimate was removed.
- **Decisions made:** Owner field practice takes precedence over external cross-checks and is
  implemented later as overridable defaults. D1 is the next authorized task. D6, D7, dual-depth
  modeling, JSON provenance, and pale PDF contrast remain deferred.
- **Next authorized task:** Begin D1 only, add the ratified fixture, then re-measure D2–D5.

## 2026-09-06 — D1–D5 takeoff reconciliation

- **Objective:** Reconcile post-role counts, gate-net materials and labor, role-specific embed and
  purchase lengths, termination hardware, and 60-pound concrete quantities against the 168 LF
  owner-ratified fixture.
- **Tested implementation commit:** `559c1d87ab8ec2e57de47c2b4758c55766c5fe00`;
  followed by the documentation-only closeout commit containing this entry.
- **Files changed:** Canonical `index.html`, the promoted 168 LF regression fixture, the R15 pricing
  baseline, current state/handoff, archived handoff, and this log.
- **Tests performed:** Full Playwright suite, twelve-route persistence matrix, both embedded-script
  syntax checks, test-file syntax checks, `git diff --check`, and independent review.
- **Results:** Full suite 71/71 passed and the persistence matrix passed 12/12. The 168 LF fixture
  reports no deltas. R15 changed from `382.01` to owner-ratified `386.195` because the former value
  encoded defective pre-D1–D5 quantities.
- **Decisions made:** Line posts use driven 18-inch embed with no concrete; terminal/corner/gate
  posts use set embed and the owner bag schedule. Gate openings reduce linear materials and per-LF
  labor. Existing saved auto-post coordinates are retained rather than regenerated on load.
- **Next authorized task:** None. D6, D7, and remaining product decisions require owner direction.

## 2026-09-18 — Exit note on main

- **Owner direction:** Exit after noting the next step on main; no repair merge was requested.
- **Scope:** Current state/handoff and this note only. Main runtime/tests are unchanged from
  `ad5c314`, which has the same runtime/test sources as the prior verified `559c1d8` implementation.
- **Pending work:** The canonical checkout holds the uncommitted `fix/cad-auto-post-integrity`
  candidate (86 browser tests, 12 persistence routes and independent review passed). Review and
  authorize its closeout first. Preserve unrelated dirty files.
- **Next correctness decision:** Reconcile the house-terminated field reference with the different
  closed-loop regression quantities. Retail material comparisons follow that work; permitted
  data access and product equivalence are prerequisites. Benchmark software must allow access
  without an EIN. No software purchase or retailer feature was implemented.
- **Gate:** Initialization, unchanged source comparison and documentation diff checks; prior
  browser evidence is preserved as historical evidence, not a new main test run.

## 2026-10-01 — Integer-cents pricing proposal integrated (branch `fix/integer-cents-pricing`)

- **Owner direction:** Evaluate the external proposal `fencebound-proposal-files.zip`, integrate
  it and open a pull request.
- **Inbound verification:** The ZIP's SHA-256 is
  `4d8f4c59f7399e444fc2bbd200b1a581ebd0769fda47f829093738d6b15f4070` and its size is 85,810
  bytes. Per-file hashes are in the handoff. The diff against main contained only the described
  changes.
- **Integrated (`a6bb2fb`):**
  - integer-cents money math in `computePricing()`, with a `cents` block;
  - a provisional `truss rod connector` seed, which repairs the permanent MISSING_COST on
    mid-rail + truss-rod jobs;
  - an "Add a material" row in the cost editor;
  - R15 changes from `386.195` to `38622` cents (`386.22`).
- **Repaired in the proposal (`c271e98`):**
  - Demo/haul cost was dropped from the client price (−$243.00 on 60 LF). Test C4 was red, then
    green.
  - The cost editor's Add bypassed Cancel. Test C5 and the revised C3 were red, then green.
- **Tests:**
  - Main baseline: 42 passed, 29 failed.
  - Branch: 47 passed, 29 failed. The failure set is identical by name; all 29 are jsPDF
    timeouts because cdnjs was blocked in this container.
  - Persistence matrix: 12/12 passed.
  - Syntax checks and `git diff --check`: passed.
- **Owner decisions pending:**
  - ratify or replace the `$2.50/ea` connector seed;
  - ratify R15 `386.22`;
  - run the PDF-path tests with network access before merging.
- **Handoff:** `Docs/execution/INTEGER_CENTS_PRICING_HANDOFF_2026-10-01.md`.
- **Owner decision (2026-10-01):** The truss-rod connector is purchased separately from the rod,
  so the separate BOM connector line is not a double count. No code change was made.
- **Owner direction (2026-10-01): FenceBound does not set prices.** Contractors enter their own
  costs, labor and markup; built-in seed prices are placeholders only. Product effort goes to
  material takeoff correctness — quantities and ratios per run, post role, gate and termination.
  The integer-cents work stands as arithmetic on contractor-entered prices; it is not a pricing
  policy. The next correctness task remains reconciling the 168 LF field reference against the
  executable fixture (see `Docs/CURRENT_HANDOFF.md`, item 3).

## 2026-10-01 — Per-end termination hardware brought to the owner field specification

- **Owner direction:** Use the documented references and correct the takeoff. Material
  quantities and ratios are the product; prices are the contractor's.
- **Finding:** The 168 LF fixture modelled a closed square (12 ends). The authoritative job in the
  v5.4.0 supplement is house-terminated (10 ends). The "field vs fixture" disagreement in the
  2026-09-18 handoff was therefore a fixture geometry error plus real runtime defects, not two
  competing specifications.
- **Red before the fix (main):** terminal brace bands 18 vs 60, line-size brace bands 15 vs 10,
  rail-end cups 20 vs 30, post caps 8 vs 0. Tension bars 10 and tension bands 50 (fabric height
  minus 1 per end) were already correct.
- **Repair:** per fabric end, framing 2 terminal bands + 2 rail-end cups; bottom wire +1 terminal
  band; barbed +1 terminal band per strand; mid rail 1 line-size band + 1 cup; barbed wire carries
  zero post caps, including on gate posts. Without a top rail the prior behavior is kept because
  the specification does not state that case.
- **Not changed:** barb arm count (an arm on every post is D7, still deferred), truss counts, line
  post placement, any price value.
- **Tests:** fixture green with zero deltas; R15 moves to 39567 cents (fully attributed); the
  persistence matrix passed 12/12. The jsPDF tests still cannot run in the cloud container.
- **Auto-post repair:** `fix/cad-auto-post-integrity` exists only as uncommitted work in the
  owner's local checkout; it was not reachable from this session and has not been committed.
- **Owner ruling (2026-10-02): top rail is standard on chain link.** A run without top rail is a
  spec change, not normal practice: tension wire (bottom wire, and now top wire) runs through the
  loop caps or barb arms. That variant is recorded, not implemented. The no-top-rail per-end
  hardware keeps its prior counts until the owner authorizes that spec. Repaired the defect where
  an unchecked Top Rail still ordered top rail and sleeves. The red test showed both rows present
  on the takeoff; after the fix the test passes.
- **Owner field rules (2026-10-02), implemented:**
  - Defaults: chain link defaults to 4 ft with top rail and bottom tension wire, and no mid rail.
    Bottom wire is standard at every height. Terminal, corner and gate posts are 2-1/2" nominal
    (stored as 2.375" OD, following the existing nominal-to-OD convention). Line posts are 1-5/8".
  - Per fabric end:
    - tension bands: fabric height in feet minus 1;
    - each rail (top, mid, bottom): one terminal brace band and one rail-end cup;
    - each tension wire (bottom, top) and each barbed strand: one terminal brace band;
    - the mid rail also lands on the first line post with a line-size band and a cup.
  - Effect on yesterday's change: this replaces its 2-band framing reading for top rail. The 168
    LF reference still matches the supplement exactly. A checked chain-link Bottom Rail is now
    ordered.
  - R15 moves to 34369 cents.
- **Open, pending owner ratios:**
  - Wire ties: the runtime uses 5 per LF, with no documented basis.
  - Hog rings for tension wire are missing.
  - The ASTM F567, CLFMI and Merchants Metals sources were blocked from the cloud container, and
    the search summaries conflicted, so no spacing was invented.
- **Open question:** whether the 10.5 ft terminal and 9 ft line post purchase lengths in the
  supplement also apply at 4 ft. The 4 ft defaults currently cut 80" from 10.5 ft sticks and 63"
  from 9 ft line posts.

## 2026-10-03 — Fastening rules (wire ties, hog rings)

- **Owner rules:**
  - 5 fasteners per bay, spread evenly, whatever the bay length.
  - Wire ties go on each rail. Hog rings go on each tension wire and on razor ribbon, copying
    the tie placement.
  - Line posts take (fabric height in feet − 1) ties, the same as the tension-band rule.
- **Implemented:**
  - Bays per run = line posts + fabric sections (gates split a run).
  - Replaces the undocumented flat 5 ties per LF and adds a Hog Rings line.
  - Adds a placeholder `hog rings` seed cost so the line validates.
  - The red test showed 200 ties; with the fix it shows 29.
  - R15 moves to 34092 cents.
- **Owner ruling, not yet implemented — post purchase lengths:** shorter fences get shorter
  posts. Buying full sticks and cutting them applies mainly to schedule 40 pipe. The runtime
  still applies the supplement's 10.5 ft terminal and 9 ft line purchase lengths at every
  height. This needs the stock lengths and the schedule-40 criterion before it can change.

## 2026-10-03 — Hole-depth verification and field-rules closeout

- **Tested implementation:** `cdbb36656ab9e59d07f3fe7ffe98b79bc7f0c908` on `fix/field-hole-depths`.
- **Gate completed 2026-10-03T19:06:08Z:** `npm test` passed 96/96, including PDF tests;
  `node scripts/cad-persistence-matrix.js` passed 12/12. R15 = 31122 cents;
  the house-terminated 168 LF fixture reported no asserted quantity deltas.
- **Merged record:** #6 integer-cents pricing, demo cost restored, “Add a material” staged
  until Save; #8 house-terminated fixture and per-end hardware, unchecked Top Rail removes
  rail/sleeves; #9 4 ft defaults (top rail + bottom wire, 2-1/2" terminals, 1-5/8" line posts),
  height−1 tension bands per end, 1 band + 1 cup per rail, 1 band per wire/strand;
  #10 auto-post repair; #11 5 ties per bay per rail, 5 hog rings per bay per wire or razor
  ribbon, height−1 ties per line post. Connector bought separately; FenceBound doesn't set prices.
- **This branch:** under 6 ft line/terminal depths 18"/24"; 6 ft+ 24"/30"
  (terminal includes corner/gate). Per-run overrides remain available.
- **Docs-only closeout:** state/current handoff/log and new
  `Docs/handoffs/2026-10-03__takeoff-field-rules.md`, preserving September 18 content
  verbatim as history. Removed the auto-post and 168 LF fixture-conflict defect entries;
  retained the rest. Recorded session:init merge-commit drift without editing its script.
- **Deferred dependency issue:** Playwright 1.40.1 npm audit advisory GHSA-7mvr-c777-76hp;
  newer Playwright does not support macOS Catalina. No dependency change.
- **Next:** residential post purchase lengths (schedule 40 = commercial; full sticks cut
  to length). Owner questions: residential stock lengths; mid/bottom rail ties (currently
  yes); under-6 ft depth editability; session:init handling of PR merge commits.
- **Authority drift:** older CLAUDE/SOURCE_OF_TRUTH ordering and supplement listings differ
  from START_HERE; embedded Development Index remains stale. Recorded, not revised.

## 2026-10-15 — Estimator, inventory and CAD deep audit (cloud session)

- **Branch:** `claude/focused-bell-rirwad` from `82a148f`. Docs/evidence only; no runtime or test change.
- **Method:** seven parallel agents — pricing, takeoff and CAD audits run against a scratch copy of
  `index.html` in headless Chromium; test baseline; three web-research reports (fence software,
  contractor methodology/NC tax, estimating-engine architecture).
- **Result:** `Docs/research/2026-10-15_estimator-audit/` (summary, six reports, test baseline,
  repro scripts). Concrete-as-post mispricing in `lookupCost` hand-verified; R15 embeds it.
- **Gate:** `npm test` 67/96 (29 jsPDF-only failures, cdnjs blocked by proxy); matrix 12/12.
- **Next:** owner Step 0 rulings, then exact-key pricing as the first defect repair.

## 2026-10-15 — Exact-key pricing repair (audit F1/F2, inventory F-1/F-2)

- **Branch:** `claude/focused-bell-rirwad`. Implementation commit `efd2b5b`
  (`index.html`, new `tests/exact-key-pricing.spec.js`, R15/R16 updates).
- **Defect:** `lookupCost` priced BOM lines by fuzzy display-name matching. Concrete priced as
  wood `post` / `gate post`; wood and chain-link rails shared keys; both brace-band sizes shared
  `brace band`; unrelated manual names borrowed prices; results depended on rate-card key order.
- **Repair:** every auto BOM line carries an explicit `costKey` (69 line names enumerated across
  all fence types, gate types, add-ons and barb arms); concrete → `post concrete bag`. New keys
  seeded at the price each line resolved to before: `wood top rail` 1.85, `wood mid rail` 1.85,
  `wood bottom rail` 4.20, `terminal size brace band` 0.80, `line size brace band` 0.80;
  `bottom rail` is now chain-link only; `brace band` removed. Fuzzy fallbacks removed; manual rows
  price only from their exact normalized name. Unmatched lines raise `MISSING_COST`. No seed
  price value changed.
- **Owner ruling (2026-10-15, "approve new R15"):** R15 31122 → **28692** cents (concrete
  4 bags at $6.50 instead of $11: 4 × 450 × 1.35 = 2430). R16 (jsPDF) now adds a
  `post cap special` entry at the `post cap` price, since the manual row no longer borrows it.
- **Red/green:** E1–E5 5/5 failed on the unmodified runtime, 5/5 passed after.
- **Gate:** Playwright 72 passed / 29 failed (all 29 the known jsPDF/cdnjs baseline);
  `node scripts/cad-persistence-matrix.js` 12/12; `git diff --check` clean.
- **Not done / follow-ups:** saved rate cards that customised the old shared `top rail`,
  `mid rail`, `bottom rail` or `brace band` keep that price only for the chain-link line; wood rails
  and band sizes fall back to seed values (per instruction; no migration of user prices). Barb-arm
  orientations still share `barb arm`. CSV import still keys rows by normalized name, so
  "2x4 Top Rail" in a supplier CSV lands on chain-link `top rail` (audit F15 area, not changed).
- **Follow-up (fix commit after `efd2b5b`):** both items above repaired. Pre-split saved cards,
  price files and job files seed the split keys from the saved shared-key price each line was
  charged; CSV rows named as BOM lines land on that line's cost key. E6–E8 red then green;
  suite 75 passed / 29 jsPDF-only; matrix 12/12.
- **Editable site upcharges (owner ruling 2026-10-15, "make add-ons editable"; audit F12),
  commit `5f4241a`:** the four hardcoded site adders are now company rate-card values, seeded
  with the former constants: demo/removal `LABOR.demoPerLF` 3 ($/LF), grade/slope
  `LABOR.slopePerLF` 0.5 ($/LF), hard dig `LABOR.hardDigPct` 30 (% of labor), urban
  `MARKUP.urbanPct` 15 (% of client subtotal). They persist via `saveCostDB` under the
  `_pricingFromLoadedProject` guard and ride the existing job-file, JSON import/export, backup,
  reset and reload paths; old cards fall back to seeds; `siteAdderRate()` substitutes the seed for
  any non-finite or negative stored value. Cost editor "Site upcharges" section; Save rejects
  negative/blank/non-numeric input. Urban/hard-dig % labels, the urban stat row and the PDF urban
  row read the edited value. No pricing value changed; R15 stays 28692.
  New `tests/editable-site-adders.spec.js` SA1–SA7 (10 tests): 10/10 red on `7c63be7`, 10/10
  green. Suite 85 passed / 29 jsPDF-only; matrix 12/12; `git diff --check` clean.
  Not done (out of scope): F6 job persistence of the upcharge checkboxes; F13/F14; per-run or
  slope-%-graded adders; the PDF urban row is not test-covered here (jsPDF blocked by cdnjs).
- **Boundary coercion (owner directive 2026-10-15 "start the fixes", audit Step 1.2; pricing
  F3/F4/F8/F11, inventory qty known defect):** one rule, `coerceNonNegNumber()`, applies at every
  pricing boundary: finite numbers >= 0 pass, plain decimal strings ("12", "12.5", ".5") coerce,
  everything else (NaN, Infinity, negatives, "1e2", "12,50", "35%", blank) is rejected.
  `sanitizePricingInputs()` runs it over costs/labor/markup for job load (`applyState`, so saved
  jobs, autosave and job-file import), the saved rate card and backup restore
  (`mergeSavedCostDB`) and JSON price import. Legacy bare-number costs load as `{cost,unit}`.
  JSON price import and backup restore refuse the whole file before writing anything; a loaded
  job keeps the bad value and `computePricing` lists it in `invalidInputs` (unpriced line, or
  0 for a non-numeric rate), which blocks `isFinalReady` and raises validation error
  `INVALID_PRICING_INPUT`. FINAL-READY also requires every cents total to be finite. Cost editor
  Save rejects any negative/blank/malformed cost, labor, gate, markup or crew-rate field.
  CSV money: `$1,234.50`, `12.50`, `45¢`/`45c` (= 0.45), `(3.20)` negative; comma decimals
  (`12,50`, `0,85`, `1.234,56`) are a row error, not a guess; `3.20 per 100` is a row error.
  Manual qty is stored as a number at entry ('1e2' and blank rejected); old string qtys load as
  numbers; non-plain loaded qtys stay, price at 0 and are reported. Site-adder keys stay with
  `siteAdderRate()` (seed fallback, accepted in `5f4241a`). No pricing value changed; R15 stays
  28692. A finite negative rate keeps its value in the arithmetic so F2 `TOTAL_INVALID`
  (markup -100) still fires alongside the new error. New `tests/input-boundary-validation.spec.js`
  IB1–IB10 (19 tests): 19/19 red on `c2e682a`, 19/19 green. Suite 104 passed / 29 jsPDF-only
  (same failing set as baseline); matrix 12/12; `git diff --check` clean.
  Not done: matrix route 10 / unknown legacy fence types; failed portable import atomicity;
  footing/post-OD/embed inputs keep their existing guards.
- **Gate/run ownership (owner directive 2026-10-15 "start the fixes", audit Step 1.3; CAD-02..05,
  inventory F-13 and F-7), `ee08eae`:** a gate is owned by its run only when both edges lie within
  `GATE_ON_RUN_TOL` (= `GRID_FT*SQRT1_2`, 0.71 ft, half the default 1 ft snap-cell diagonal) of the
  run line and inside its span; `nearestFenceRunForGate` (any distance) is gone. Unowned gates are
  not deducted or priced, block FINAL-READY and raise `ORPHAN_GATE`; new errors `GATE_OVERLAP` and
  `GATE_LONGER_THAN_RUN`. Gate edges at a run end, corner or neighbouring gate share one post;
  termination ends count per fabric section. Moving/stretching a run carries its gates; deleting a
  run removes its gates and auto posts (one undo each). Line posts are spaced per section between
  gates. CAD-06 untouched (owner rule pending). Moved expectation (F-7 correction only):
  `auto-post-integrity` gate test positions `[[10,0],[30,0],[40,0]]`→`[[10,0],[37,0]]` and
  `[[10,0],[20,0],[40,0]]`→`[[10,0],[20,0]]`. R15 stays 28692; 168 LF fixture values unchanged.
  New `tests/gate-run-ownership.spec.js` (4 tests): 4/4 red on `0e866ac`, 4/4 green. Suite 108
  passed / 29 jsPDF-only (baseline set); matrix 12/12; `git diff --check` clean.
  Not done: gate seating/presets onto the line (v6.0 CAD); a gate spanning a collinear joint is
  unowned (it lies on neither run); per-section panel counts (Step 1.5); posts already stored
  inside an opening in saved jobs are not rewritten on load (rebuilt on the next edit).
- **Gate seating at every snap (follow-up, `90527a0`):** coarse snaps (6/8/10 ft) put gate edges up
  to snapFt×0.71 ft off a diagonal run, so drawn gates were false `ORPHAN_GATE`s. Placement,
  move and paste now project a gate aimed at a run (edges within max(0.71 ft, snapFt×0.71 ft) of
  its line, ≤45°, inside its span) onto the line; validation keeps the strict tolerance. On load,
  pre-`ee08eae` gates slightly off their bound run (or unbound, nearest run) are projected when
  within 7.07 ft (largest snap reach); farther gates stay orphan. No expectation moved; R15 28692.
  Tests 5–6 in `gate-run-ownership.spec.js`: 2/2 red, 2/2 green. Suite 110 passed / 29
  jsPDF-only; matrix 12/12; `git diff --check` clean.
- **Job-state isolation (owner directive 2026-10-15 "start the fixes", audit Step 1.4; pricing
  F5/F6, CAD-01, CAD-12, CAD-13, inventory F-6), `ef58957`:** the four site-upcharge checkboxes
  and the labor-hours override are saved with the job (`siteUpcharges`, `laborHours` in
  `snapshotState`) and restored by `applyState`; older jobs and Clear reset them to off/auto.
  Clear now starts the next quote: `restoreCompanyRateCard()` leaves loaded-project pricing by
  reloading the saved company rate card (else shipped defaults) and never writes it. Restore was
  chosen because nothing in source or docs records an owner choice to keep loaded prices; the only
  trace was the cost-editor `confirm()` (audit F5). Loading a saved job or importing a job file
  clears undo/redo (history holds drawings only). Saved jobs carry `jobId`; Save updates only the
  open job's record and saves a different job under a taken name as "Name (n)" (no prior app
  pattern; " (2)" per directive). Move keeps a `structuredClone`, so Escape restores
  `specs.addons` as a Set; carried gates are restored too. `selectFenceType` remembers specs per
  type per owner (run, or drawing defaults; reset on job load), so a type round trip restores
  stripped components, add-ons and height. Undo-label invariant untouched. No pricing value
  changed; R15 stays 28692; no expectation moved. New `tests/job-state-isolation.spec.js` (6
  tests): 6/6 red on `895760b`, 6/6 green. Suite 116 passed / 29 jsPDF-only (baseline set);
  matrix 12/12; `git diff --check` clean.
  Not done: Undo of Clear restores the drawing but not the loaded pricing/upcharges (it cannot
  overwrite another job: `jobId` is cleared); Clear still keeps job name/customer and manual
  materials; the grade selector still auto-checks the slope box (F6 item 3); legacy saved jobs
  without `id` re-save as "Name (2)". (Both job-identity items repaired in the follow-up below.)
- **Job identity follow-up (`3977725`):** `ensureSavedJobIds()` gives each saved job without an `id`
  (every record saved before `ef58957`) a stable unique id and persists it, at startup and before a
  job loads, so load → Save updates it in place. Clear now also resets the job name, customer,
  address, notes and manual materials (`S.materials`, a pricing leak otherwise); the existing
  confirm is kept. Undo of Clear restores the drawing only; `jobId` stays cleared, so Save makes a
  new record and cannot overwrite the old job (test 8 checks the stored record is byte-identical).
  Tests 7–8: 2/2 red on `c7d21f8`, 2/2 green. Suite 118 passed / 29 jsPDF-only (baseline set);
  matrix 12/12; `git diff --check` clean; R15 stays 28692.
- **Remaining Tier 2 counts (owner directive 2026-10-15 "start the fixes", audit Step 1.5;
  inventory F-3, F-4, F-8, F-9, F-10, F-11, F-12, F-14):** each its own commit and red→green test
  in new `tests/takeoff-counts.spec.js`. Re-verified against current code first; all eight were
  still present (F-11 partly: `FENCE_TYPE` already errored, but `isFinalReady` stayed true).
  - `d481612` (T1) panels, rail spans, temporary stands/couplers round per fabric section
    (`getStats` row `sectionFt`, `unitsPerSection`). Gated audit case: vinyl 11→12, ornamental
    14→15, temporary 8→9 (couplers = panels − sections, stands = panels + sections).
  - `f5b1f23` (T2) vinyl split rails = bays at the run's post spacing × rails (100 LF: 26→20).
  - `df859dc` (T3) off-table hole depth: no ratified bag-yield model exists, so next deeper table
    depth (beyond 42" the 42" entry scaled up, rounded up) plus `CONCRETE_DEPTH_OFF_TABLE`
    warning. Legacy 28": 0→3 bags per terminal/gate post.
  - `b36301d` (T4) field cattle + Barbed Wire add-on: no second strand set, no barb arms.
  - `fbddeb6` (T5) Post-tool posts count as line posts of the run section they stand on (not
    again on an end, corner, gate or existing post); `POST_NOT_ON_FENCE` and `NO_LINE_POSTS`
    warnings.
  - `b1e6a09` (T6) manual material priced only when its unit (via `UNIT_ALIASES`) matches the
    rate-card unit; otherwise unpriced, not FINAL-READY, `UNIT_MISMATCH` error. Cost view shows
    `/unit`.
  - `5f1116d` (T7) Face Board checkbox controls the face-board line; choosing the type turns it on.
  - `4813e49` (T8) legacy/unknown fence type → `unsupportedTypes`, never FINAL-READY; no BOM
    invented.
  - `d5a025f` golden BOM per fence type (14), 100 LF + 4 ft walk + 12 ft double drive; 6 fail on
    `a6e20d0`, 8 characterize unchanged output.
  No pricing value changed; R15 stays 28692; no existing expectation moved. Gate: 140 passed
  (all non-jsPDF) / 29 jsPDF-only excluded (cdnjs blocked); matrix 12/12; `git diff --check` clean.
  Not changed (owner rulings pending): line-post concrete, post stock lengths, truss rods on
  non-corner ends, sleeves/carriage bolts, CAD-06 joint post, per-run fabric rounding.
  **Owner questions:** (1) gates on every non-chain-link type get chain-link pipe gate posts
  ("Gate Post 10.5'/11'"), chain-link gate concrete (temporary panels included) and one flat kit
  per gate type; what should wood, vinyl, ornamental, split-rail, cattle and temporary gates get?
  (2) woodsplit3fb runs saved before `5f1116d` carry `hasFaceBoard:false` and reopen without the
  face board line until the box is checked; migrate them to on? (3) depths beyond 42" are
  extrapolated; ratify or extend the footing table. (4) Vinyl split rail has no default height and
  still inherits the previous type's height (audit, not repaired here).
- **Face board regression follow-up:** owner question 2 above was a regression from `5f1116d`, not
  an owner choice. Saved specs always carried `hasFaceBoard:false` explicitly (whole-spec
  serialization), so the checkbox now records `faceBoardChosen`, and on load (`applyState` →
  `migrateRunOwnership`) a Split + Face Board run without a user-set flag gets its face board
  back; a user-unchecked flag stays off. T9: red on `00ecaab` (272520 for 288396 cents), green.
  Gate 141 passed / 29 jsPDF-only excluded; matrix 12/12; R15 stays 28692.
- **Customer documents (audit F7/F16, directive step 1.6), `37cdd86`:** each section's amount on
  the panel client view and the estimate PDF now comes from its own costs. Merged BOM lines keep
  `sectionQty` per fence type, and gates go to their owning run. `computePricing().sectionCents`
  holds each section's materials, gate and $/LF labor, demo and grade (by its gross LF), hard dig
  (by its labor) and markup. Each split uses largest-remainder integer cents (`apportionC`).
  Crew-hours labor is job-level and is shared by gross LF. Urban premium and manual materials stay
  their own lines, as the PDF already listed them. `customerDocumentLines(P,stats)` feeds both
  documents. Amounts are shown in exact cents: R16 already required cents on manual lines, and with
  cents the lines sum to the total without any re-rounding. Repro: ornamental was shown at the
  blended $1,644.78 and now shows its own $2,493.47. CDS1–2 were red on `6381d74` and are green
  now. No pricing value changed, R15 stays 28692, and no existing expectation moved.
  **First full run including jsPDF:** a scratch-only wrapper (one `*.wrap.js` per spec, adding a
  `context.route` for the cdnjs jsPDF 2.5.1 URL to an npm `jspdf@2.5.1` UMD file, then
  `require` of the repo spec) ran 172 tests: 169 passed and 3 failed. All 3 are pre-existing
  failures of R9 (`persistence-integrity` ×3: null start throws in `validateProject`; the
  constructor/toString types no longer produce `PRICING_RUNTIME`). They fail the same way on
  `6381d74`. Not repaired here. Matrix 12/12; `git diff --check` clean.
- **R9 regression repair, `5b9e99e`:** a bisect with jsPDF routed through a scratch worktree found
  R9 3/3 passing on `82a148f` through `5f4241a`. `f41b5f0` broke the "constructor" and
  "toString" cases. Those type names collide with Object properties, so the footage tally is
  corrupt. Before `f41b5f0` that corrupt footage crashed pricing by accident; after it the job
  priced as INVALID_PRICING_INPUT. `computePricing` now throws on any non-finite section footage,
  which restores PRICING_RUNTIME. `ee08eae` broke the null-start case: its GATE_OVERLAP loop
  (and later `fbddeb6`'s `getStats` warnings) threw inside `validateProject`. The loop now
  skips runs without endpoints, and the warnings are skipped when `getStats` cannot measure the
  drawing. R9 was red 3/3 and is green 3/3; no expectation changed. **Full suite with jsPDF
  routed: 172/172.** Matrix 12/12; R15 stays 28692. The earlier entry's note that these 3
  failures were older than this session was wrong: they were regressions from this session.
- **Session closeout:** Step 1 complete; full suite 172/172 including PDF tests (cdnjs routed to
  npm jspdf@2.5.1 in a scratch wrapper), matrix 12/12. CURRENT_HANDOFF and CURRENT_STATE updated;
  prior handoff preserved in `Docs/handoffs/2026-10-15__field-hole-depths-closeout.md`.
- **Owner redirection (2026-10-15):** contractors supply prices; priority is accurate,
  purchasable counts, modeled on commercial tools. v6.0 pricing-engine items (tax, overhead,
  margin, labor model, snapshot) deprioritized. Codex handoff `HANDOFF.md` (C0-C4) with
  loop-breaker rules; C0 asks the owner for real past jobs as acceptance fixtures.
- **Owner ruling (2026-10-15):** hardware rules come from distributor/manufacturer literature
  (Merchants Metals, formerly Hudson Fence Supply; Capital Fence Supply; others serving
  Albemarle/Charlotte/Greensboro NC) and commercial-software specs. Owner has no own
  distributor pricing. HANDOFF.md C0 is now a cited hardware spec reference; C0b applies it.

## 2026-10-15 — C0 hardware reference (local, awaiting closeout)

- **Scope:** C0 only, on `codex/counting-c0` from `424750b` on
  `claude/focused-bell-rirwad`. Added `Docs/reference/HARDWARE_SPEC_REFERENCE.md`;
  no runtime, tests, golden BOM quantities, price values, or dependencies changed.
- **Evidence:** Manufacturer/distributor literature and all 142 existing golden BOM rows
  across 14 types. Product-specific alternatives and existing owner walls remain explicit.
  Strict C0 completion is not claimed: missing product/SKU and fastening information is
  labeled unverified rather than fabricated as a match or source disagreement. No C0b/C1 work.
- **Owner clarification:** Capital Fence Supply is in “Statesville, NC. basically in
  Charlotte, NC.” Official research found Capitol Wholesale's Charlotte branch and the
  distinct Merchants Metals Statesville branch; exact intended supplier identity remains
  unresolved. No supplier contacted and no account/pricing assumptions made.
- **Initialization:** `session:init` found pre-existing stale HEAD metadata (`ea67c4e`
  recorded versus `424750b` actual). All three intervening commits were documentation only;
  no governance/tooling repair included.
- **Validation:** 2026-10-15, unchanged runtime at `424750b`: `npm test` 172/172,
  including PDF tests without the prior cloud wrapper; persistence matrix 12/12.
  Static checks and 14-type/142-line documentation coverage passed. Independent review
  found three documentation issues, all repaired (hog-panel scope, vinyl cap kit contents,
  concrete wording); missing evidence remains unresolved.
- **Closeout:** No commit, push or PR created. Human closeout and the explicit external
  PR-creation gate remain outstanding; no release or synchronization claim.
- **Task separation on continuation:** C0's reference and this log addition are now
  isolated in `/Users/altairus78/Developer/fencebound-c0-review` on `codex/counting-c0`.
  Reference contents are unchanged. Readiness assessment and software repairs belong
  to their own branches; neither is a C0 deliverable. No new runtime test run is claimed.

## 2026-10-15 — C0 hardware reference: approved closeout

- Owner approved the three-branch commit/validate/push sequence; no PRs are authorized.
- Task implementation commit: `0a0f43e585f000734b8304c8cdd572900227c1b7` on `codex/counting-c0`. This entry is in its
  direct documentation-closeout child. Only the task's own files/log addition were
  introduced; predecessor work is inherited through the ordered branch stack.
- Fresh gate: `npm test` 172/172, persistence matrix 12/12,
  `git diff --check` PASS. Timestamp: `2026-10-15T18:24:44+00:00`. Ordinary HTTP/PDF configuration.
- Task-specific files, historical red/green evidence where applicable, limitations,
  and validation artifacts are recorded in `Docs/handoffs/2026-10-15__counting-c0-reference-closeout.md`.
- Independent task/boundary review found no unresolved blocking finding. State and
  current/archive handoffs now describe this tested branch. Push and initialization
  are verified live after this metadata commit; earlier pending/local status is historical.

## 2026-10-15 — Market readiness experiment and completion estimate

- **Owner direction:** Assess the path to a market-ready program, including pricing,
  inventory/takeoff, autofill and parameters, assuming no further owner field knowledge
  beyond the repository and public sources. First milestone is a contractor pilot with
  manual onboarding; the wider applicable repository scope remains the later goal.
  Owner explicitly confirmed no in-product AI/API pulls: AI is a development tool only.
- **Deliverable:** `Docs/research/2026-10-15_market-readiness.md`, a research assessment
  with a weighted capability rubric, current counterexamples, source/field limitations,
  proposed acceptance gates and cumulative effort ranges. Scope and percentages are
  planning judgments, not release approval or amendments to field doctrine.
- **Observed:** Four HTTP browser counterexamples: automatic LF quantities accept a
  roll price without a mismatch warning; JSON price import can overwrite company prices
  with loaded-job prices; failed portable import partially changes the active job;
  sub-cent hardware prices are rounded before extension. Parameter probes also expose
  panel/bay incompatibility and inherited vinyl ranch height.
- **Validation:** Unchanged runtime at `424750b`: `npm test` 172/172 (6.7 minutes,
  ordinary HTTP/PDF configuration); persistence matrix 12/12; additional 140-case
  consistency experiment 700/700 checks. These passes do not negate the counterexamples
  or independently establish manufacturer assembly correctness. Scratch probes/logs
  remain under `/tmp/fencebound-readiness-*` and `/tmp/fencebound-market-readiness-*`.
- **Review:** Independent review checked scope, evidence qualifications, score and
  calendar arithmetic. Repaired its schedule finding by making the five-day experiment
  a ranked timebox rather than a guaranteed complete batch. Estimates remain judgment.
- **Preservation at assessment completion:** Existing C0 reference and prior developer-log entry preserved.
  No runtime, test, price, dependency, doctrine or release-state changes; no commit,
  push, PR or deployment. Existing session-init metadata drift remains explicit.
- **Task separation on continuation:** The assessment and this log addition are now
  isolated in `/Users/altairus78/Developer/fencebound-readiness-review` on
  `codex/market-readiness-assessment`. The report preserves its original pre-repair
  baseline and forecast. Its C0 evidence is in the predecessor task's worktree;
  the later repair results and revised forecast belong to the repair checkpoint.
  No new runtime test run is claimed.

## 2026-10-15 — Market readiness assessment: approved closeout

- Owner approved the three-branch commit/validate/push sequence; no PRs are authorized.
- Task implementation commit: `089957fce8fcdc0dcfa594c70c2ff85c0f353eb7` on `codex/market-readiness-assessment`. This entry is in its
  direct documentation-closeout child. Only the task's own files/log addition were
  introduced; predecessor work is inherited through the ordered branch stack.
- Fresh gate: `npm test` 172/172, persistence matrix 12/12,
  `git diff --check` PASS. Timestamp: `2026-10-15T18:44:20+00:00`.
- Test command: `NODE_OPTIONS=--require=/tmp/fencebound-pinned-jspdf.cjs npm test`. Matrix command: `node scripts/cad-persistence-matrix.js`.
  Scratch-only verified jsPDF 2.5.1 transport; configuration/assertions unchanged. See handoff for artifact hash and CDN limitation.
- Validation qualification: The first full run on this same commit passed 171/172; R9's null-start
export test captured `Cannot read properties of null (reading 'x')`. The unchanged
case then passed three isolated repeats, and the final full-suite rerun passed
172/172 with the transport setup described above. An intervening ordinary run was
stopped after CDN-related page-load timeouts: 84 passed, 2 failed, 1 interrupted,
85 not run. Direct CDN requests also timed out while the local server returned 200.
No runtime or test edits were made between attempts. The original R9 failure was
intermittent in these runs; its trigger was not established or repaired in this
documentation task. Logs: `/tmp/fencebound-closeout-assessment-tests-first.log`
and `/tmp/fencebound-closeout-assessment-r9-recheck.log`; interrupted run:
`/tmp/fencebound-closeout-assessment-tests-cdn-interrupted.log`.
- Task-specific files, historical red/green evidence where applicable, limitations,
  and validation artifacts are recorded in `Docs/handoffs/2026-10-15__market-readiness-assessment-closeout.md`.
- Independent task/boundary review found no unresolved blocking finding. State and
  current/archive handoffs now describe this tested branch. Push and initialization
  are verified live after this metadata commit; earlier pending/local status is historical.

## 2026-10-15 — Market-readiness money and import repairs

- **Authorization:** Owner continued the fresh session from the market-readiness
  assessment's ranked repair experiment. Scope: its four reproduced software defects;
  no new assembly, field ruling, price value, dependency, or release authorization.
- **Implementation:** All material lines enforce price-unit compatibility. JSON prices
  merge onto the persisted company card with borrowed-price confirmation and persistence
  rollback. Portable imports restore original job/pricing/history references on failure,
  including failed autosave storage. Material rates extend at supplied decimal precision
  before half-up cent rounding; customer unit-rate output preserves that precision.
- **Evidence:** Added 15 focused tests. Initial 11 failed on the original runtime;
  expanded original-runtime run failed 13 cases with one passing success control.
  The review follow-up failed before its repair. All 15 then passed. Updated IB3 to
  accept the new JSON confirmation. R9 now verifies rollback before directly loading
  malformed legacy state; all original export-warning assertions remain. Its three
  rollback cases failed against the original runtime; all four updated IB3/R9 cases
  pass after repair. No numerical baseline or golden BOM changed.
- **Review:** Independent read-only review found no blocking issue. Repaired its
  supported finding: a display error after JSON prices commit now reports that prices
  saved, rather than falsely reporting import failure. Reviewer checked the fix and
  confirmed that updated existing tests retain their pricing/export safety assertions.
- **Gate:** Final `npm test` 187/187 (11.0 minutes, ordinary PDF configuration);
  persistence matrix 12/12; `git diff --check` PASS. The first completed full run
  had 183 passes and four test-contract failures described above. `session:init`
  still reports the pre-existing metadata drift, now on the repair branch.
- **Checkpoint:** `Docs/execution/2026-10-15_market-repairs-checkpoint.md` records the
  acceptance cases, validation, measured window, forecast, and remaining limitations.
  Gate labor and demo/slope precision remain outside this material fix. Persistent
  display errors can leave stale views after model rollback. Market readiness is blocked.
- **Measurement:** Instrumented preparation-to-validation window: 17:19:51–17:49:27
  UTC, 29m36s, excluding untimed startup/initial inspection. Four defects repaired;
  this is a lower bound on effort, not a general engineering velocity. Retiring the
  completed 3–5-day package leaves a provisional 17–30 engineering days / 102–180
  focused hours for the pilot, with all other package estimates unchanged.
- **Repository at repair completion:** Local work on `codex/market-readiness-repairs`, based on `424750b`.
  Preserved the inherited C0 reference, assessment, and log entries. Canonical handoff
  metadata remains stale pending approved two-commit closeout. No commit, push or PR.
- **Task separation on continuation:** This branch now contains only the four repairs,
  their tests, this log entry, and the repair checkpoint. C0 and the assessment, with
  their own log additions, are preserved in separate review worktrees named in the
  checkpoint. Runtime/tests are byte-identical to the prior validated working tree.
  The unit guard relates to C1 but implements no pack sizes or order quantities;
  this is not C0b and changes no source-backed BOM counts. Branch stacking and
  two-commit closeout remain pending; no new runtime validation run is claimed.
- **Separation verification:** Exact task file sets, isolated log additions, byte
  preservation, and patch/whitespace checks passed across the three worktrees.
  Independent read-only review found no blocking issue after path/status clarifications.

## 2026-10-15 — Market-readiness software repairs: approved closeout

- Owner approved the three-branch commit/validate/push sequence; no PRs are authorized.
- Task implementation commit: `25f0cd917e1b5d3304510921d498630a3939e1a7` on `codex/market-readiness-repairs`. This entry is in its
  direct documentation-closeout child. Only the task's own files/log addition were
  introduced; predecessor work is inherited through the ordered branch stack.
- Fresh gate: `npm test` 187/187, persistence matrix 12/12,
  `git diff --check` PASS. Timestamp: `2026-10-15T18:51:39+00:00`.
- Test command: `NODE_OPTIONS=--require=/tmp/fencebound-pinned-jspdf.cjs npm test`. Matrix command: `NODE_OPTIONS=--require=/tmp/fencebound-pinned-jspdf.cjs node scripts/cad-persistence-matrix.js`.
  Scratch-only verified jsPDF 2.5.1 transport; configuration/assertions unchanged. See handoff for artifact hash and CDN limitation.
- Validation qualification: The predecessor assessment's initial R9 pageerror and CDN-interrupted run are
preserved in `Docs/handoffs/2026-10-15__market-readiness-assessment-closeout.md`.
The current passing gate does not establish that the earlier intermittent error's
unconfirmed trigger is fixed. No new runtime or test edits were made during this
closeout; their bytes match the previously reviewed repair checkpoint.
- Task-specific files, historical red/green evidence where applicable, limitations,
  and validation artifacts are recorded in `Docs/handoffs/2026-10-15__market-readiness-repairs-closeout.md`.
- Independent task/boundary review found no unresolved blocking finding. State and
  current/archive handoffs now describe this tested branch. Push and initialization
  are verified live after this metadata commit; earlier pending/local status is historical.

## 2026-10-17 — PR #17 pre-merge check and intermittent R9 root cause

- Ran PR #17's pre-merge check in a Claude cloud container on `codex/counting-c0`
  (`c200ad0`): `npm test` 187/187, persistence matrix 12/12, `git diff --check` PASS.
  jsPDF 2.5.1 was served from npm through a scratch-only preload (UMD 364463 bytes,
  SHA-256 `98ccf17a…3df875`, matching the 2026-10-15 record), which also pointed
  Playwright at the preinstalled Chromium. No repo configuration changed.
- R9 repeated: 1 failure in 75 runs, and 2 in 12 fresh cold-start runs of the
  "null start" case. Stack: `resizeCanvas` → `draw` → `drawFenceRun` read `start.x` of
  the malformed legacy run R9 places in live state. The canvas `ResizeObserver` and the
  300 ms boot `resizeCanvas` timer decide whether a redraw lands inside the export
  window, hence the intermittency. Present on `main` too; not introduced by #17.
- Defect: one legacy run missing an endpoint aborted the whole canvas redraw, so every
  element after it went undrawn. With two or more runs, `buildCornerSet` in `draw` also threw.
- Repair: `draw` builds its corner set only from fence runs with both endpoints, and
  `drawFenceRun` skips a run missing one. Drawing only; takeoff, pricing and validation
  are untouched (validation still reports the run).
- Red before: new R9b (`tests/persistence-integrity.spec.js`) loads a missing-start run
  plus a valid run and calls `draw()` directly; it failed with
  `Cannot read properties of null (reading 'x')`, first in `drawFenceRun`, then in
  `buildCornerSet` after the first guard. Green after: R9b passes.
- After repair: R9 "null start" cold 0/12 failures; R9 ×25 (all variants + R9b) 100/100;
  `npm test` 188/188; matrix 12/12; `git diff --check` PASS.
  No price values, golden BOM counts, schema or application version changed.

## 2026-10-17 — C1 order quantities in purchasable units (`claude/counting-c1`)

- Task: HANDOFF.md C1, branched from `main` `f7a2c59`. Owner direction: "merged, begin c1".
- Change (`index.html`): a rate-card entry may carry a contractor `pack` (line units
  per purchasable pack, default 1, must be a number of 1 or more). Every automatic line
  gains `pack` and `order`; `qty` stays the needed count. Bulk lines round across the
  whole job (`ceil(needed/pack)×pack`). LF lines carry their fabric-section lengths
  (`cutFt`) and round per section, never pooled; no offcut reuse is assumed.
  Pricing extends `order` when the rate is in the line's unit, or `order/pack` packs
  when the rate is in another unit and the pack is above 1. With pack 1 a different
  unit is still `UNIT_MISMATCH`. Pack sizes save with the company card (the card
  reload previously dropped any extra field, now keeps `pack`) and ride along in job
  files. `applyState` and imports coerce them; an invalid one blocks FINAL-READY
  (`INVALID_PRICING_INPUT`). Loading a job never writes the company card (D-1 guard
  unchanged). Cost editor gains a pack-size box per row. The materials panel shows
  "need N" and "order N unit". No default pack above 1, no price value changed.
- Red before / green after: new `tests/order-quantities.spec.js` O1–O5 failed 5/5
  against `main`'s `index.html` (O4 on the real defect: a reloaded card returned
  `pack` undefined) and pass 5/5 after.
- Gate: `npm test` 193/193 (188 prior unchanged, all 14 goldens and R15 included),
  persistence matrix 12/12, `git diff --check` PASS.
- Test command: `NODE_OPTIONS=--require=<scratch>/preload.cjs npx playwright test`,
  scratch-only preload outside the repo. jsPDF 2.5.1 from npm (registry sha512
  integrity verified), UMD 364463 bytes, SHA-256
  `98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875`, matching the
  2026-10-15 records. HANDOFF.md's copy reads `98ccf17ae10c…`, a one-character typo.
## 2026-10-29 — v5.4.0 launch-readiness, UI and market audit (Claude Code, docs only)

- **Observed gate on `main` @ `82a148f`:** `npm test` 95/96; persistence matrix 12/12. R9 "imported null start"
  threw `Cannot read properties of null (reading 'x')` once in the full suite and passed 3/3 alone (intermittent).
- **Findings (unrepaired):** literal `$${''}` in the labor hint (`index.html:595`); FINAL-READY badge ignores
  validation and placeholder pricing; customer estimate PDF exports on the placeholder baseline; gate-post and
  off-line gate accounting questions (need owner ruling); plan PDF dark/unbranded; mobile layout unusable.
- **Owner direction:** fix as many as possible and sort each into fix or redo. The plan is in root `HANDOFF.md`.

## 2026-10-29 — audit-repairs r1: F1 intermittent null-start crash (Claude Code)

- **Root cause (captured stack):** `ResizeObserver → resizeCanvas → draw → drawFenceRun` read `el.start.x` on an
  imported run whose `start` is null. Import keeps malformed runs on purpose (R9 expects `PRICING_RUNTIME`), so the
  crash surfaced whenever a layout change redrew the canvas, which made R9 intermittent.
- **Fix:** `isPoint()` guard; `draw()` and `buildCornerSet()` skip elements without finite coordinates. Import and
  validation unchanged (did not sanitize at import, which would contradict R9's accepted expectations).
- **Test:** `Audit F1 canvas redraw survives imported null start` failed before (page-error stack above) and passes
  after. Full suite 97/97; `persistence-integrity.spec.js
  --repeat-each=20` 1000/1000.
## 2026-10-29 — audit-repairs r1: F2 labor-hint literal (Claude Code)

- **F2:** the labor-hours hint (`index.html`, static HTML) rendered `$${''}55/hr`; the `${''}` was a template-literal
  fragment that never runs in markup. Replaced with `$`. New `tests/audit-repairs.spec.js` F2 failed before
  (received `$${''}55/hr`) and passes after. Full suite 97/97.

## 2026-10-29 — audit-repairs r1: F3 FINAL-READY badge (Claude Code)

- **F3:** the totals badge showed FINAL-READY whenever `P.isFinalReady` (every BOM line costed), even with validation
  errors open and the shipped placeholder rate card. The badge now needs `P.isFinalReady`, `!usingSeedPrices()`
  and `validateProject().ok`; costed-but-unverified shows "Pricing complete · not verified". `P.isFinalReady`
  itself is unchanged (C1 and persistence tests assert it). No pricing values or math touched.
- **Tests:** `F3 badge is not FINAL-READY…` failed before (badge read FINAL-READY) and passes after; the green-path
  test guards FINAL-READY with a saved rate card and passing validation. Full suite 98/99: the one failure was R9
  null start, the F1 flake fixed separately in PR #30 and absent from this branch. Persistence matrix 12/12.

## 2026-10-29 — audit-repairs r1: defect record F4 (Claude Code)

- **Defect F4 (pricing behavior):** `exportEstimatePDF()` stamps NOT FULLY VERIFIED only when `validateProject()`
  fails. A job that passes validation while `usingSeedPrices()` is true (no saved rate card) exports a customer
  estimate priced on the shipped North Carolina placeholder baseline with no warning on the PDF.
  Recorded in `CURRENT_STATE.json` `knownDefects` before any repair, per the working rules.

## 2026-10-29 — audit-repairs r1: F4 repair (Claude Code)

- **Fix:** `exportEstimatePDF()` adds a `PLACEHOLDER_PRICING` item to the copy of validation used for the PDF stamp
  when `usingSeedPrices()` is true, so the existing NOT FULLY VERIFIED block appears with "Prices are the shipped
  placeholder baseline, not this company's saved rate card." `validateProject()`, the plan PDF, the portable
  export and all pricing values are unchanged. Removed the F4 `knownDefects` entry.
- **Tests:** `F4 estimate PDF on placeholder pricing carries the NOT FULLY VERIFIED stamp` failed before and passes
  after; `F4 estimate PDF on a saved rate card is not stamped` guards the clean path. Full suite 101/101.

## 2026-10-29 — audit-repairs r1: F7 cosmetics (Claude Code)

- **F7a:** estimate PDF whole-dollar amounts (line totals, urban premium, total, deposit) keep their `toFixed(0)`
  rounding and gain thousands separators (`$1,209`, matching the app). Two-decimal PDF amounts are unchanged.
  On the test job the PDF total equals the app total; the audit's `$1,541`/`$1559` gap was not reproduced.
- **F7b:** the canvas draws one `0'` label at the origin (the y-axis label at 0 is skipped).
- **F7c:** the plan PDF TYPES legend lists only fence types used by the job's runs.
- **F7d NOT repaired — conflict recorded:** hiding raw codes in the validation modal breaks accepted tests
  `phase-one-acceptance.spec.js` test 5 and `v5.4-port.spec.js:135`, which require `CUSTOMER_NAME` and
  `COMPANY_PROFILE` in the modal. Reverted; owner decision needed.
- **Tests:** F7a–c failed before and pass after; screenshots of the origin, modal, plan PDF and estimate PDF
  were checked (session scratchpad, not committed). Full suite with F7d: 103 passed, 2 failed (both F7d);
  after the revert, the three affected spec files pass 28/28.

## 2026-10-29 — audit-repairs r2: defect record F5 (Claude Code)

- **Defect F5 (pricing behavior):** `getStats()` counts every run end as a terminal or corner post and every gate
  as two gate posts. When a gate post sits on a run end, that post is counted twice. That run end also counts as
  a fabric end (tension bar, bands, brace bands, rail ends, bolts, truss), and the gate adds a bay, although the
  run's fabric stops at the gate's other post. Recorded in `CURRENT_STATE.json` `knownDefects` before any repair.
- **Owner rules applied:** the gate post replaces the end post (counts once, as a gate post). Hardware follows the
  fabric: each run whose fabric reaches a post gets termination hardware there, so another run that continues
  from that post (a corner) keeps its hardware.
- **Correction to the r2 ruling entry:** hand-placed (non-auto) posts are not counted in the materials list, so a
  hand-placed post under a gate post cannot double count. F5 covers run-end posts only.

## 2026-10-29 — audit-repairs r2: F5 gate-post de-duplication (Claude Code)

- **Repair:** `getStats()` collects gate post points. A run end at a gate post is no longer counted as a
  terminal/corner post. If the gate belongs to that run, the end is recorded as `gateEndCt`. It is then removed
  from fabric ends (termination hardware), truss assemblies and bays, because that run's fabric stops at the
  gate's other post. Other runs ending at the same post keep their fabric end. No pricing values changed.
  Removed the F5 `knownDefects` entry.
- **Tests:** `F5 gate post on a run end…` and `F5 gate post on a corner…` failed before (2 and 3 end posts) and
  pass after. `F5 mid-run gate counting is unchanged` guards the existing case. Full suite 107/107.
- **Open for the owner:** the side panel's post summary also omits gate posts from Total posts; the ruling named
  the plan PDF only.

## 2026-10-29 — audit-repairs r2: F5 plan PDF gate posts (Claude Code)

- **Repair (owner ruling):** the plan PDF post summary adds a `Gate: N` line, and Total Posts includes gate posts,
  matching the line, terminal/corner and gate post quantities in the materials list. The side panel is unchanged
  pending an owner answer.
- **Tests:** `F5 plan PDF post summary shows gate posts…` failed before (no `Gate:` line) and passes after.
  Full suite 108/108.

## 2026-10-29 — audit-repairs r2: F6 gate snap and refuse (Claude Code)

- **Repair (owner ruling):** a newly drawn gate is projected onto its nearest run (`closestPointOnSeg`). It is
  refused with "Draw the gate on a fence run" when either end is more than 2 ft from the run (or 26 screen px
  when zoomed far out), or when the snapped gate is shorter than the minimum run. The fabric deduction is the
  snapped width. The 2 ft tolerance is an agent choice (drawing snaps to a 1 ft grid); the owner may change it.
- **Not covered:** moving an existing gate with the Move tool can still take it off its run. A refused gate
  leaves one empty undo step, as the existing "no run" refusal already does.
- **Tests:** `F6 a gate drawn just off its run snaps…` and `F6 … clearly off any run is refused` failed before
  and pass after. Full suite 110/110.

## 2026-10-29 — audit-repairs r3 F5 side panel (Claude Code)

- **F5 side panel (owner ruling r3 Q1):** the side panel's post summary shows a `Gate posts` row and includes gate
  posts in Total posts, matching the plan PDF (#35). Red-before test `F5 side panel post summary shows gate posts
  in Total posts like the plan PDF` failed (Total posts 6, no gate row), then passed. Suite 111/111.

## 2026-10-29 — audit-repairs r3 F6 Move tool (Claude Code)

- **F6 Move tool (owner ruling r3 Q3):** moving a gate (body drag or end drag) snaps it onto its own run; a move
  that ends more than 2 ft off is refused and the gate returns to where it was. The F6 rule is now one helper,
  `snapGateToRun`, shared by drawing and moving. A gate dragged onto a different run is refused rather than
  reattached (before, it kept deducting from its old run). Three red-before tests failed (gate left where
  dropped), then passed. Suite 114/114.
## 2026-10-29 — audit-repairs r1 closeout and owner rulings (Claude Code)

- **PRs:** #29 F2, #30 F1, #31 F3, #32 F4, #33 F7a–c (merge order and details in root `HANDOFF.md`).
- **Owner rulings:** F5: a gate post coincident with a run end post replaces it (counts once, as a gate post).
  F5: the plan PDF post summary shows gate posts and includes them in Total Posts.
- **Open for the owner (asked in r2):** F6 off-line gate handling (recommended: snap onto the run); F7d hiding
  validation codes, which conflicts with two accepted tests.
- **Handoff:** `HANDOFF.md` rewritten for audit-repairs r2.

## 2026-10-29 — audit-repairs r2 owner rulings (Claude Code)

- **F6 off-line gate (owner: yes):** a gate drawn off its run snaps onto the nearest run; a gate too far from any
  run is refused with a message. Owner asked about starting from a known gate post location: still supported by
  placing a post and starting the run from it (run starts snap to standalone posts), then drawing the gate.
  A hand-placed post under a gate post must count once, so F5 de-duplication covers that case too.
- **F7d validation codes (owner: keep for now):** codes stay visible in the validation modal for debugging.
  Hide them before release; whether the beta shows them is undecided. No code or test change now.

## 2026-10-29 — audit-repairs r2 closeout (Claude Code)

- **PRs:** #34 F5 de-duplication, #35 F5 plan PDF, #36 F6 snap/refuse (stacked on #33 in that order). F7d deferred
  by owner ruling. Open owner questions and the merge order are in root `HANDOFF.md` (r3).

## 2026-10-29 — audit-repairs r3 owner rulings (Claude Code)

- **Q1 side-panel Total posts (owner: yes):** the side panel's post summary includes gate posts in Total posts,
  matching the plan PDF (#35). Fixed on its own `fix/` branch with a red-before test.
- **Q2 F6 snap tolerance (owner: keep 2 ft):** no change.
- **Q3 Move tool (owner: yes):** moving an existing gate snaps it onto its run, and refuses the move if it ends
  more than 2 ft off, same rule as F6 for new gates. Fixed on its own `fix/` branch with a red-before test.

## 2026-10-29 — audit-repairs r3 merges (Claude Code)

- **Owner: merge in order.** Merged #29, #30, #31–#36, #39, #38 into `audit/v540-launch-review`. Each branch had a
  developer-log conflict only; both sides kept. #37's retarget failed (`gh pr edit` hit the classic-Projects
  deprecation error), so it merged into `fix/f6-gate-snap`; #39 re-landed `fix/f5-panel-gate-posts` on the audit
  branch, and #38 was retargeted via the REST API. Merged suite 115/115.

## 2026-10-29 — audit-repairs r3: audit branch reconciled into main (Claude Code)

- **Owner: put results in main; reconcile onto main's code.** `main` had 49 commits the audit branch lacked,
  re-implementing gate ownership (`rebindGate`, seating), gate-post counting (`runGateLayout`) and customer money
  (`customerMoney`). The 9 `index.html` conflicts took main's side; non-conflicting audit fixes (F1–F4, F7b, F7c,
  side-panel gate posts) kept.
- **F5:** main's counting model passes every audit F5 test unchanged.
- **F6 / r3 Q3 ported:** a drawn or moved gate seats onto a run within `gateDrawReach()` (2 ft, or 26 px on
  screen, or main's snap reach, whichever is larger) and is refused otherwise (draw: not added; move: reverted).
  A moved gate may re-bind to another run (main supports it, so the #38 cross-run refusal is dropped).
- **Tests changed to match owner rulings:** `gate-run-ownership` test 1 (off-run, perpendicular and oversized
  gates are refused, so no ORPHAN_GATE / GATE_LONGER_THAN_RUN from drawing; those codes remain for saved jobs and
  now lack a drawing-path test). F7a now expects main's cents format with separators. Audit F1 uses main's
  legacy-state loader because malformed imports are now rejected atomically.
- **Handoff:** main's `HANDOFF.md` (Codex counting accuracy) kept; audit handoff moved to
  `handoffs/CLAUDE-NEXT-audit-repairs3.md`. Suite 212/212.

## 2026-10-30 — REDO 4: light contractor plan PDF (Codex, round 1)

- **Authorization:** owner's REDO 4 prompt authorizes light theme, existing contractor branding and a scale
  bar. Its final “Leave changes uncommitted” instruction supersedes commit/push/PR and two-commit closeout.
  Work is on owner-named `feat/redo4-plan-pdf`, from current `main` at `41ea935`.
- **Implementation:** only `exportPDF()` in canonical `index.html` changes. White paper, dark text and vector
  geometry, darker fence colors plus matching legend dash patterns, contractor header using the existing
  profile helpers, small Made with FenceBound footer. Fits world geometry independently of screen pan/zoom;
  draws runs with gate openings, gate leaves, posts, boundaries, dimensions and labels. A labeled 1/2/5
  scale bar uses the same mm/world-unit scale as the geometry. No north arrow without geographic orientation.
- **Preserved:** F5 gate posts/Total Posts, F7c used-type legend, validation warning, all pricing/count logic,
  and estimate PDF. Runtime outside `exportPDF()` is byte-for-byte unchanged; REDO 1 drawing track unaffected.
- **Red before / green after:** four new `tests/plan-pdf.spec.js` cases failed against the original exporter
  (white background, contractor profile/header and two scale/zoom cases). After repair, all four and the
  existing F5/F7c PDF regressions pass: **6/6**. Tests inspect real jsPDF calls/output strings; scale lengths
  agree within 1% for 60 ft and 600 ft runs despite off-screen pan and different viewport zooms.
  Logs: `/tmp/fencebound-redo4-red.log`, `/tmp/fencebound-redo4-green.log`.
- **Gate:** first full `npm test`: **215 passed / 1 failed**; warning-placement test still captured removed
  `addImage()`. Updated only its capture to the vector drawing frame, preserving the placement assertion;
  `tests/persistence-integrity.spec.js` is the fifth changed file. Final focused **7/7 PASS**
  (`/tmp/fencebound-redo4-green-final.log`); first full log `/tmp/fencebound-redo4-full-first.log`.
  Final full `npm test` **216/216 PASS** in 5.0 min, completed 2026-10-30T17:14:31Z
  (`/tmp/fencebound-redo4-full.log`); base checkout 212 tests + 4 new = 216.
  Persistence matrix **12/12 PASS** (`/tmp/fencebound-redo4-matrix.log`); `git diff --check` PASS.
  Actual mixed-type/gate PDF rendered and inspected: `/tmp/fencebound-redo4-preview.pdf` / `.png`.
  `npm ci` restored dependencies without changing manifests/lockfile; no CDN transport workaround needed.
- **Status drift:** session init reports October 15 branch/HEAD metadata; source-of-truth docs differ on
  authority order. Referenced October 30 REDO 1 log entry is absent at this HEAD; direct owner prompt supplies
  authorization. Global `$initiate-repo` skill unavailable locally; documented entry checks performed.
  Historical status files retained rather than claiming a committed closeout. No release/doctrine change.
- **Open:** single-page sidebar retains existing capacity limits for unusually long job fields/material lists.
  No new commit/push/PR by instruction. Result: `handoffs/CODEX-RESULT-plan-pdf1.md` (the owner's requested name).

## 2026-10-30 — REDO 1: click-to-chain drawing (Claude Code)

- **Owner authorization (2026-10-30):** "all need to be done, push in the order of debugging necessary" — all six
  REDO items (`371850a:HANDOFF.md:54-70`) are authorized feature work. Order, by what later work is debugged
  through: 1 drawing interaction, 2 visual system, 3 mobile/tablet layout, 4 plan PDF, 5 estimate PDF,
  6 platform (v6.0; needs owner choices of providers before code).
- **REDO 1:** with the fence, boundary or gate tool, a click (no drag) starts a polyline; each later click commits a
  segment and continues from its end (a gate ends after one segment); double-click, Enter or Escape finishes;
  switching tools cancels. Drag-per-segment drawing is unchanged. Segment commit moved into
  `commitDrawnSegment()`; history is still pushed before the gate checks, so a refused gate keeps its undo step.
  Hint text names the new gesture. Counting is unchanged: chained runs are ordinary runs sharing endpoints.
- **Tests:** `tests/click-chain-drawing.spec.js` (5). Before the fix 4 failed (the tool-switch case passes
  trivially there); after, 5/5. Full `npm test` result below.
- **Full suite:** `npm test` 217/217 (4.8 min). REDO 4 (plan PDF) briefed to Codex: `handoffs/CODEX-NEXT-plan-pdf1.md`.

## 2026-10-30 — REDO 2: visual system (Claude Code)

- **Light field theme by default**, dark one click away (header "Dark"/"Light", saved per device in
  `localStorage` `fb-theme`, applied before first paint). Light tokens under `:root[data-theme="light"]`; dark
  `--text3` raised to 4.5:1. New tokens `--overlay`, `--on-accent`, `--accent-hover`.
- **Readable type:** every 9–11 px UI size raised to 12 px (dev index panel untouched).
- **Action hierarchy:** header icons carry text labels (Fit, Reset, Undo, Redo, Job, Jobs, theme); Clear moved
  beside Undo, away from the exports; **Plan PDF** is the primary (accent) button; PNG is secondary.
- **Canvas:** `canvasPalette()` and `ink()` keep linework readable on white (fence/gate colors darkened to 3:1
  only on light; dark unchanged). `labelInk()` keeps old white labels visible. Fence-type data is unchanged.
  The plan PDF captures the live canvas, so on light it now gets dark linework (REDO 4 builds on this).
- **Tests:** `tests/visual-system.spec.js` (4): 4 failed before, 4/4 after.
- **Full suite:** 221/221 (5.2 min, port 8081 config so Codex's 8080 run is not disturbed).
- **Handoff (REDO r1 → r2):** #43 (REDO 4, Codex) committed by the coordinator; REDO 5 handed to Codex
  (`handoffs/CODEX-NEXT-estimate-pdf1.md`, running at handoff). Next: `handoffs/CLAUDE-NEXT-redo2.md`.

## 2026-10-30 — REDO 5: customer estimate PDF (Codex, round 1)

- **Authorization / boundary:** owner authorized all six REDO items and requested this estimate rebuild;
  explicitly leave changes uncommitted for the coordinator. Actual start is clean
  `feat/redo5-estimate-pdf` at `c69e650643f256f89147dde12163903080432899`, the committed REDO 4
  plan exporter. This supersedes the older metadata and two-commit closeout for this task.
  No CSS/panel edits, price values, counting logic, stores, legal wording, dependencies or release changes.
- **Implementation:** canonical `index.html` only, within the PDF functions. Extracted REDO 4 vector
  rendering into `drawPdfProjectDrawing` (named for its shared PDF project-drawing purpose); both exports
  call it. The estimate adds a white framed drawing page and scale bar. The scale bar's vertical position
  is relative to the supplied drawing frame, preserving its previous position on the landscape plan.
  Adds a scope page with each type's gross LF from `stats.fence`, run heights, and allocated posts from
  `stats.byRunId` plus `stats.gatePostsByGate`, matching BOM ownership without recounting geometry.
  Lists every owned gate's existing type label and opening width. Existing company terms/placeholders,
  deposit/validity, acceptance/signature/date, price lines/totals and customer-money formatting remain.
  Existing DEFAULT_TERMS is empty: no legal text was invented. Price rows/totals gain page-break guards.
  The drawing page also carries the existing unverified/seed-pricing warning where applicable.
- **Red / green evidence:** new `tests/estimate-pdf.spec.js`: scope and drawing assertions failed against
  the original exporter; existing terms/deposit/validity/signature control passed (**2 failed / 1 passed**).
  Log `/tmp/fencebound-redo5-red.log`. After implementation the same three pass, with existing audit
  repairs (including F4 and F7a), customer-document sections and REDO 4 plan tests: **27/27 PASS**,
  `/tmp/fencebound-redo5-targeted.log`. Assertions inspect actual jsPDF output strings and drawing calls;
  the long-terms control checks all text stays within page height and the last term/signature survive.
- **Visual check:** rendered actual fixture quote, scope/terms/acceptance and drawing pages inspected:
  `/tmp/fencebound-redo5-preview.pdf`, `/tmp/fencebound-redo5-preview-{1,2,3}.png`.
- **Gate:** first full suite **218 passed / 1 failed**: existing F3 asserted one page. Updated only
  its obsolete layout expectation in `tests/persistence-integrity.spec.js` to three pages plus new section
  labels; all warning-detail assertions unchanged. Focused F3 then **1/1 PASS**. Logs:
  `/tmp/fencebound-redo5-full.log`, `/tmp/fencebound-redo5-warning-green.log`.
  Final `npm test`: **219/219 PASS** in 5.0 min, completed 2026-10-30T17:29:19+00:00;
  `/tmp/fencebound-redo5-full-final.log`. Persistence matrix **12/12 PASS**,
  `/tmp/fencebound-redo5-matrix.log`; `git diff --check` PASS. Tested uncommitted runtime on base
  `c69e650643f256f89147dde12163903080432899`, not a new implementation commit.
  Result: `handoffs/CODEX-RESULT-estimate-pdf1.md` (owner-requested filename).
- **Drift:** session:init reports historical October 15 branch/HEAD/upstream metadata; live branch/HEAD
  and clean start were verified against the owner's REDO 4/5 instructions. Global initiate-repo skill
  absent after local search; documented entry checks performed directly. Tier 1 hierarchy differs from
  CLAUDE.md/SOURCE_OF_TRUTH ordering; owner authorization and canonical source control this narrow work.
  Historical state/handoff files retained for the coordinator's committed closeout.

## 2026-10-30 — REDO r2: merges, REDO 5 intake, REDO 3 mobile layout (Claude Code)

- **Merges (owner: "merge the prs too"):** #41 (REDO 1) merged to `main`. The retarget of #42 to `main` failed
  silently (gh CLI "Projects (classic)" error), so #42 merged into `feat/redo1-click-chain-drawing`; the same
  commits went to `main` through replacement PR #44. #43 (REDO 4): `main` merged in (log conflict, both sides
  kept), full suite 225/225, then merged. Future base edits: check `baseRefName` after `gh pr edit`.
- **REDO 5 intake:** Codex's estimate-PDF work reviewed and committed (`868d60c`, "Implemented by Codex"). The
  vector plan moved unchanged into `drawPdfProjectDrawing()` (scale bar now frame-relative); scope reuses the
  `getStats()` records; prices/totals only gained page-break guards. F3 keeps its warning assertions; its
  one-page check becomes the three-page layout. Codex: 2 red / 1 control before, 219/219 full after.
- **REDO 3 (≤ 768 px):** toolbar becomes a horizontal strip under the canvas; the panel becomes an in-flow
  bottom sheet (`#sheet-grip`: tap cycles collapsed / half / full, drag snaps to the nearest; a panel tab opens
  a collapsed sheet; legend hidden when collapsed); the header hides `.btn-lbl`, the zoom readout and
  separators, and moves Job, Jobs, PNG, theme, Reset zoom and Clear into a "More" menu (`#more-menu`) whose
  items click the real buttons. Every header button now has an `aria-label`. Drawers span the width. Hint
  wraps. Desktop layout is unchanged. Zoom +/− scroll into view at 390 px (pinch and Fit remain).
- **Tests:** `tests/mobile-layout.spec.js` (11, at 390×844 and 768×1024 plus a desktop control). Before: 6 failed;
  the toolbar-fit, touch-drawing (CDP `Input.dispatchTouchEvent`) and desktop tests passed as guards. After:
  11/11. The sheet tests first read the panel mid-animation under load (2 failures in a 232-test run);
  they now poll the height. Full suite after merging `main` (REDO 4 + 5): 239/239 (4.3 min).
- **Handoff (REDO r2 → r3):** `handoffs/CLAUDE-NEXT-redo3.md`. Next: REDO 6, owner choices first.

## 2026-10-30 — REDO r3: REDO 6 platform choices (Claude Code)

- **Owner choices (AskUserQuestion, 2026-10-30):**
  - Underlay: **image upload** with manual two-point scale. No tiled imagery, no provider or API key.
  - Accounts/cloud save: **local-first O-5 split**. A project carries a frozen quoted-price snapshot; the company
    rate card is a separate store; loading a project never writes the rate card. localStorage plus file
    export/import; no accounts or server in REDO 6.
  - E-signature: **built-in signature pad** (drawn signature, typed name, date) on the estimate, embedded in the
    PDF and stored with the frozen quote. No vendor.
- **Order:** underlay first (smallest, independent), then the O-5 split, then the signature pad (it stores into
  the frozen quote, so it follows the split).
- **REDO 6a, site-image underlay:** Job info drawer → "Site image": Add/Replace image, Set scale, Remove,
  Opacity. Uploads are downscaled to ≤ 2000 px JPEG (localStorage budget) and centred in view; drawn under the
  grid at the saved opacity. Set scale: two unsnapped clicks, then a prompt for the real distance in feet; the
  scale changes about the first point. Esc or a tool change cancels. `underlay` rides in `snapshotState()`
  (autosave, saved jobs, job files); `applyState` drops anything but a base64 png/jpeg/webp/gif data URL with
  finite placement. An underlay alone now counts as session content to restore. PNG export includes it; the
  plan PDF does not. Not in undo history.
- **Tests:** `tests/site-underlay.spec.js` (5). Before (worktree at `344eedf`): 5 failed. After: 5/5.
  Full suite: 244/244 (4.5 min).
- **Merge:** #47 merged by the owner (`gh pr merge` is blocked for the agent by the auto-mode classifier).
- **Handoff (REDO r3 → r4):** `handoffs/CLAUDE-NEXT-redo4.md` on `feat/redo6-price-snapshot`. Next: 6b O-5 split.

## 2026-10-30 — REDO r4: 6b O-5 price-snapshot design (Claude Code)

Requirement (CLAUDE.md, v6.0): "A project carries a frozen quoted-price snapshot. The company rate card is a
separate store. Loading a project never writes to the company rate card."

**Today (`aa889b9`).** The live globals `COST_DB/LABOR/MARKUP/FOOTING/POST_OD_IN/POST_EMBED_IN` are both the
rate card and the current job's prices. `snapshotState()` copies them into every job file; `applyState()`
merges a job's copy over whatever is live and sets `_pricingFromLoadedProject` (the D-1 guard), which makes
`saveCostDB()` refuse and makes five rate-card write paths (cost editor save/reset, CSV import, price-file
import, backup restore) ask "These displayed prices came from the loaded project…". The two stores are one
store with a guard flag.

**Design (proposed; owner decisions below).**
1. *Two stores.* Company rate card = `localStorage[COSTDB_KEY]` (else shipped defaults), unchanged format.
   Project snapshot = new `quote` field in the job state:
   `{frozenAt, pricing:{costs,labor,markup,footing,postODIn,postEmbedIn}, total}`, deep-cloned. The snapshot
   holds *rates*, so a geometry edit to a quoted job reprices at the frozen rates; `total` records what was quoted.
2. *Active pricing.* The globals stay as "prices in effect for the open job" (no rewrite of the 57 read
   sites): `S.quote ? quote.pricing : company card`. `applyState()` builds them from the company card, then
   the snapshot over it (never over whatever was live), and never calls `saveCostDB()`.
3. *Rate-card edits.* The cost editor, CSV/price-file import and backup restore always operate on the company
   card: with a quote open they swap the company card into the globals (`capturePricingState` /
   `restorePricingState`), write it, and swap the quote back. The open job's prices do not change, so the five
   "came from the loaded project" confirms go away; a toast says the job keeps its quoted prices.
4. *Re-price.* An explicit "Re-price from rate card" action on a quoted job (confirm shows old → new total)
   replaces the snapshot with the current card. Never automatic.
5. *UI.* A quoted job shows "Quoted prices · <date>" by the estimate total; a draft shows "Rate card prices".
6. *Undo.* `quote` rides in undo snapshots (deep clone, per the undo-label invariant pattern).
7. *Pricing values* are never altered; only which store a number is read from.

**Tests (red-before).** Replace T-P1/T-P2/T-P5/F1 flag assertions with stricter store assertions: loading any
job leaves `COSTDB_KEY` byte-identical; cost-editor save with a quote open writes the card and leaves the
estimate total unchanged; re-price adopts the card; legacy job files load per the owner's legacy choice;
undo/redo restores `quote`; T10 isolation still holds.

**Owner decisions (AskUserQuestion, 2026-10-30).**
- Freeze point: **on Estimate PDF export.** Drafts price from the company card and follow its changes; the
  export freezes the snapshot (and is where 6c's signature will be stored). Re-exporting a quoted job keeps
  its snapshot.
- Legacy job files (prices, no `quote`): **load as frozen quotes**, snapshot = their embedded prices,
  `frozenAt` = their `savedAt`. Their totals on open are unchanged from today.
- Cost editor with a quoted job open: **edits the company card only.** The job keeps its quoted prices; a
  toast points to Re-price.

**Implementation (6b), with corrections to the proposal above.**
- `index.html`: `S.quote = null | {frozenAt, total, pricing}`. Helpers by the rate-card store:
  `clonePricing`, `useCompanyRateCard` (defaults + saved card into the globals), `useQuotePricing`.
  `_pricingFromLoadedProject` now means "the globals hold the open job's quote"; `saveCostDB()` still refuses
  while it is true.
- File format: `snapshotState()` adds `quote: {frozenAt,total} | null`. The frozen prices stay in the existing
  top-level `costs…postEmbedIn` fields (no duplication); a draft's copies are not read back. `schemaVersion`
  stays 3 (the acceptance suite pins it): `quote` present-but-null vs. absent tells a new draft from a
  pre-split file.
- `applyState()`: always starts from the company card (never from whatever was live), then lays a quote's
  prices over it. Never writes the card.
- Freeze: after a successful `exportEstimatePDF()` with pricing available. Later exports keep `frozenAt` and
  the prices and update `total`.
- Re-price (pricing tab, "Quoted prices · date" note): confirm shows old → new total; the job returns to being
  a **draft** on the company card until its next estimate export. Clear also drops the quote.
- Rate-card writes: the cost editor swaps the card in on open and the quote back on close, so its save, reset,
  reload, CSV import and price-file import act on the card; their five "came from the loaded project" confirms
  are removed. Backup restore swaps the same way.
- Not in undo history (history holds drawings only; a job load clears it), so design point 6 is dropped. No
  "Rate card prices" label for drafts; only quotes are labelled.
- Known gap: the freeze reaches autosave immediately but a Saved Jobs record only on its next Save.
- **Tests:** new `tests/price-snapshot.spec.js` (5). Before (worktree at `36ca3df`): 5 failed. After: 5/5.
  Full suite: 249/249 (4.3 min). Rewritten for the two-store model: T-P1, F1, T-P5 (`persistence-integrity`), MR2 (`market-readiness-repairs`);
  marked as quotes / pre-split files: T-P2, O4, job-state-isolation 2, IB2/IB4 (`input-boundary-validation`).
  `fixture-168lf` "ratified footing parameters": a pre-split file without post sizes now fills them from the
  company card (1.625) instead of unsaved live globals (3); expectation updated, deliberate.
- **PR:** #48 (`20db9bf`), awaiting owner merge. Open question to owner: should the estimate export also write
  the quote into the job's Saved Jobs record?
- **Handoff (REDO r4 → r5):** `handoffs/CLAUDE-NEXT-redo5.md` on `feat/redo6-price-snapshot`. Next: merge #48,
  the Saved Jobs question, then 6c signature pad on `feat/redo6-signature`.

## 2026-10-30 — REDO r5: Saved Jobs quote write, 6c signature-pad design (Claude Code)

- **#48 merged** (`e41db1a`). Branch `feat/redo6-signature` from `main`.
- **Saved Jobs question answered (owner, AskUserQuestion): yes, write it at export.** `97cbdc6`: when the
  estimate export freezes or refreshes the quote, the open job's Saved Jobs record (matched by `S.jobId`) gets
  a deep copy of `S.quote` and is persisted. Only `quote` is written; other unsaved edits still wait for Save,
  and a never-saved job gets no record. A failed write rolls the record back and toasts. Red before (record
  quote `null`), green after; full suite 250/250.

### 6c design — built-in signature pad (owner choice, REDO r3: drawn signature, typed name, date)

1. **Data.** `S.quote.signature = {image, name, signedAt, total}` or absent. `image` is a PNG data URL,
   `name` the typed name, `signedAt` an ISO time set when the signature is accepted, `total` the client total
   the customer signed for. It lives inside the quote, so `snapshotState().quote` carries it, and the r5
   Saved Jobs write copies it. The export freeze block and `applyState` rebuild `S.quote` and must keep it.
2. **Signing needs a current quote.** A **Sign** button sits in the quote note (`#quote-price-note`), so it
   only shows once the first estimate export has frozen the quote. Signing is refused (toast: export the
   estimate again first) when the current client total differs from `S.quote.total`, so the customer never
   signs a number that is not on the last exported estimate.
3. **Pad.** An overlay with a canvas (pointer events: mouse, touch, pen; fixed 600×200 backing), a name
   field, today's date shown, and Clear / Cancel / Accept. Accept stays disabled until there is a stroke and
   a non-blank name. When a quote is already signed, the note shows "Signed by <name>" and **Sign** becomes
   **Remove signature** (confirm).
4. **Invalidation.** Re-price and Clear drop the quote, so they drop the signature with it; nothing extra is
   needed. On a later estimate export, if the client total no longer equals `signature.total` (the job
   changed after signing), the export drops the signature and toasts "Job changed since signing — signature
   removed". The PDF never shows a signature next to a total it was not given for. Cost-editor saves on a
   quoted job edit only the card (6b), so they don't touch it.
5. **Size limit.** Data URL capped at 150,000 characters (`SIGNATURE_MAX_CHARS`). A 600×200 line drawing is
   usually 5–30 KB; the cap keeps Saved Jobs and autosave inside the localStorage budget, the same concern as
   the 6a underlay's `UNDERLAY_MAX_PX`. A larger one is refused at Accept.
6. **Sanitizing (`applyState`).** The signature is kept only if `image` matches
   `^data:image/png;base64,[A-Za-z0-9+/]+=*$` within the cap, `name` is a non-blank string (trimmed, ≤100
   chars), `signedAt` is a string and `total` is finite; otherwise the quote loads unsigned.
7. **PDF.** In the ACCEPTANCE block of `exportEstimatePDF`: the image over the Client Signature line, the
   signed date over the Date line, the name over the Printed Name line, and a small "Signed electronically
   <date time>" line. The page-break threshold grows to make room when signed. Unsigned PDFs are unchanged.
   The block is ~15 lines next to the pad code, so it stays with Claude instead of going to Codex.
8. **Out of scope.** No legal e-sign audit trail (IP, document hash, signer email). History/undo holds
   drawings only, so the signature is not in undo snapshots.
9. **Tests (red before, in `tests/signature.spec.js`, reusing the `price-snapshot` helpers):** Sign hidden on a
   draft; draw + name + Accept stores the signature in the quote, autosave and the Saved Jobs record;
   refused when the total changed since export; Re-price and Clear drop it; a changed job's export drops it;
   `applyState` drops a non-PNG, oversized or nameless signature; the signed export calls `addImage` with the
   PNG.

### 6c implementation notes

- As designed, with one addition: signing and **Remove signature** also write the quote to the job's Saved Jobs
  record. The r5 write moved into `writeQuoteToSavedJob()` (export, sign, remove). A signature is part of the
  quote the owner wanted in the record at once. Re-price and Clear still wait for Save, as in 6b.
- `exportEstimatePDF` checks the signature against `P.clientTotal` before drawing (tolerance $0.005) and
  passes it into the freeze block, so the quote keeps it across exports. With pricing unavailable it is
  neither drawn nor dropped.
- Tests click `#btn-sign` through the DOM: the quote note is in the pricing panel, off screen at the test
  viewport (same as the 6b Re-price tests).
- Red before: all 5 `tests/signature.spec.js` tests fail on the missing `#btn-sign`. Green after; full suite
  255/255. Visual check: rendered the pad and a signed estimate (pdftoppm). The signature, date and name sit
  over their lines, and the "Signed electronically" line comes after Printed Name.
- **Handoff (REDO r5 → r6):** `handoffs/CLAUDE-NEXT-redo6.md`.

## 2026-10-30 — REDO r5 (cont.): import atomicity check, CLAUDE.md correction (Claude Code)

- #49 (6c) merged by the owner (`7cc2ac0`).
- Owner asked to fix "failed portable import is not atomic". Finding: already repaired on 2026-10-15
  (market-readiness repairs, MR5); CLAUDE.md still listed it. No code change, since no test can fail first.
- Owner approved: (1) CLAUDE.md Known defects corrected; (2) MR5 extended with a quoted, signed job open (render
  and storage failures). That is coverage, not a repair: it passes on the current runtime, 17/17 in the spec.
- Next: matrix route 10 / migrated-job pricing.
- **Matrix route 10 (owner: "then route 10").** Unknown legacy types were already repaired (`4813e49`,
  2026-10-15: reported, never FINAL-READY). The gap left was coverage. Route 10 now prices the migrated legacy
  job and requires it to equal the same job in the current schema (total, material lines and unit costs, labor
  lines), every line costed, no unknown/unsupported/unit-mismatch. It also loads a legacy run with an unknown
  type and requires `unsupportedTypes`, `FENCE_TYPE` and not FINAL-READY. Mutation check: switching off
  `unsupportedTypes` fails route 10 with "unknown legacy type priced silently".
- **Matrix had been red since 6b (`20db9bf`).** 6b ran only the Playwright suite; `36ca3df` passes 12/12 and
  `20db9bf` fails route 3. The matrix expectations predated the O-5 split; no runtime defect. Route 3 now
  checks both 6b cases (a draft follows the card edit, a quoted job keeps its price, the card is never written
  by a load). Route 5's "old job" now drops `quote` so it is a true pre-split file. Route 4's result text is
  corrected. Matrix 12/12. Lesson: run `node scripts/cad-persistence-matrix.js` with any pricing or persistence
  change.
- CLAUDE.md now lists no open integrity defect from the 2026-08-01 handoff.

## 2026-10-31 — Handoff to the duo (Claude Code)

- #50 merged (`eddb986`). Owner: hand off to a session that uses both Claude Code and Codex; tethering
  problems slowed this session. Handoff: `handoffs/CLAUDE-NEXT-duo1.md` on `docs/duo-handoff1`. No next track
  authorized yet.

## 2026-10-31 — duo r1: field capture design and priority ranking (Claude Code + Codex)

- Owner (AskUserQuestion): tracks are (1) the field data capture design, then (2) a priority ranking. Answers:
  materials per estimate line; labor "make it an edge"; no annoying pop-ups; entry on the phone on site; the
  product goal is a quote as fast as the job can be drawn.
- Codex (`codex/field-survey1`, read-only): `handoffs/CODEX-RESULT-field-survey1.md`, the estimate-side figures,
  job stores, actuals attachment options, storage budget and the open-work inventory. Claude spot-checked labor
  ($/LF, no hours) and the job id changing on rename + Save; both hold. Committed "Implemented by Codex".
- Launching Codex with the bypass flag from Claude Code is blocked by the auto-mode classifier; the owner runs
  `/tmp/duo/<job>.run`.
- Design: `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` ("the drawing is the timesheet": run taps + day
  log; job-level `S.actuals` beside `quote`, not keyed by job id; no rate-card writes; no pop-ups). Ranking:
  `Docs/planning/PRIORITY_RANKING_2026-10-31.md`. Both await owner decisions; no code changed, no gates run.
- **State refresh.** `npm run session:init` reported DRIFT: `CURRENT_STATE.json` and `Docs/CURRENT_HANDOFF.md`
  still recorded `codex/market-readiness-repairs` @ `25f0cd9` (2026-10-15); REDO sessions used `handoffs/`.
  Gates on `main` `56c5d9f`: `npx playwright test` 257/257, matrix 12/12, `git diff --check` clean. Both files
  now record `main` @ `56c5d9f`; matrix route 10 dropped from known defects (repaired in #50). Note:
  `npm run test:phase-one` runs only the 9 acceptance tests; the full gate is `npx playwright test`.
- Owner product input: owners quote from types, footage, equipment and crew; the drawing comes last, for the
  foreman. Labor is priced per foot, crew × days or multiplier; equipment itemized until rates are familiar.
  Next: quote-without-a-drawing design (Claude) and footage takeoff survey (Codex, `CODEX-NEXT-footage-survey1`).
- Codex footage survey (`handoffs/CODEX-RESULT-footage-survey1.md`, committed "Implemented by Codex"): typed
  totals don't fix the BOM (gate position and side split change posts, rails, pickets). Spot-checked: fence
  elements are `type:'fence'`; line posts are counted from stored auto-post elements.
- Design: `Docs/planning/QUICK_QUOTE_DESIGN_2026-10-31.md` (typed sides build a schematic layout priced by the
  unchanged takeoff; `layout: 'typed'` banner/PDF/warning; equipment and crew × days need owner rulings). Ranking
  #2 now points to it. No code changed.
