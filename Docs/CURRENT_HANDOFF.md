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
