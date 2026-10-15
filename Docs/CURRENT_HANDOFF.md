# FenceBound current handoff

<!-- SESSION_METADATA
generatedAt: 2026-10-15
repositoryRoot: ~/Desktop/FenceBound
branch: claude/focused-bell-rirwad
testedHead: ea67c4ed9d2b47380032fe7875a724a2084bb6e1
repositoryHeadAtGeneration: ea67c4ed9d2b47380032fe7875a724a2084bb6e1
upstream: origin/claude/focused-bell-rirwad
worktreeClean: true
canonicalRuntime: index.html
applicationVersion: 5.4.0
schemaVersion: 3
gateStatus: PASS
gateHead: ea67c4ed9d2b47380032fe7875a724a2084bb6e1
-->

Verified 2026-10-15 in a Claude cloud container on `claude/focused-bell-rirwad`
(started from main `82a148f`). Not yet merged to main; no PR opened. The previous
handoff is preserved verbatim in `Docs/handoffs/2026-10-15__field-hole-depths-closeout.md`.

## Completed this session

1. **Deep audit** — `Docs/research/2026-10-15_estimator-audit/` (`00-SUMMARY.md` first):
   pricing, takeoff and CAD audits (~55 confirmed bugs) and research on commercial fence
   estimators, contractor pricing/NC tax, and estimating-engine architecture. Not canonical.
2. **Step 1 defect repairs** (owner: "approve new R15, make add-ons editable, start the fixes"),
   each with a red-before/green-after test:
   - exact-key pricing `efd2b5b`, `144d0a9` — concrete priced as concrete; split shared keys
     keep customised prices; **R15 = 28692 cents** (was 31122, owner-approved);
   - editable site upcharges `5f4241a` — demo, slope, hard dig, urban are rate-card values;
   - input boundary validation `f41b5f0`; gate/run ownership `ee08eae`, `90527a0`;
   - job-state isolation `ef58957`, `3977725`;
   - takeoff counts `d481612`…`4813e49`, golden BOMs for all 14 types `d5a025f`,
     face-board migration `402742d`;
   - customer section prices from own costs, panel = PDF `37cdd86`;
   - R9 hostile-input regression (from `f41b5f0`/`ee08eae`) restored `5b9e99e`.
   Every moved BOM quantity is listed in its commit body and the developer log.

## Verification

- `npm test`: **172/172**, including PDF tests. The cloud proxy blocks cdnjs, so jsPDF 2.5.1
  was served from an npm copy through a scratch-only Playwright wrapper (no repo change);
  re-run on the owner machine to confirm with the real CDN.
- `node scripts/cad-persistence-matrix.js`: **12/12**. `git diff --check` clean.

## Open owner decisions

Gate posts/concrete/kits for non-chain-link types (currently chain-link parts); footing depths
past 42" (extrapolated); vinyl split-rail default height; CAD-06 collinear joint; line-post
concrete; residential stock lengths; truss rods, sleeves, bolts; NC sales tax (CPA/NC DOR);
authorize v6.0 engine (Step 2) and CAD parity (Step 3); earlier open items (rail ties,
under-6 ft depth editability, session:init merge handling, O-6).

## Known limits carried

Undo of Clear restores only the drawing. A gate across a joint between two collinear runs is
an orphan. Saved jobs with a post inside a gate opening are corrected on the next edit of that
run. CSV comma-decimal prices are rejected, not guessed. See `CURRENT_STATE.json`.

## Restart

```bash
npm run session:init
```

<!-- BOOTSTRAP_START -->
FENCEBOUND FRESH SESSION BOOTSTRAP

Repository: ~/Desktop/FenceBound (this work: branch claude/focused-bell-rirwad, not yet on main)
Branch: claude/focused-bell-rirwad
Verified HEAD: ea67c4ed9d2b47380032fe7875a724a2084bb6e1 (docs-only closeout child permitted)
Canonical runtime: index.html (5.4.0)
Schema: 3
Authority: tested source/runtime → frozen Engineering Bible + supplements → System Atlas → Development Index → current handoff/state → history
Last completed: 2026-10-15 audit + Step 1 defect repairs (exact-key pricing, editable upcharges, input validation, gate ownership, job isolation, takeoff counts, section prices). R15 = 28692. Full suite 172/172, matrix 12/12.
Active next task: Counting accuracy per HANDOFF.md (Codex C0-C4: real-job fixtures, pack-size order quantities, waste, material order, house termination). Pricing engine work deprioritized by owner.
Owner decisions required: see "Open owner decisions" above.
Known defects or drift: See CURRENT_STATE.json; branch not merged to main.
Required reading: AGENTS.md, START_HERE.md, Docs/CURRENT_HANDOFF.md, CURRENT_STATE.json, PROJECT-INSTRUCTIONS.md, Docs/research/2026-10-15_estimator-audit/00-SUMMARY.md.
Required gate: npm run session:init; npm test (including PDF tests); node scripts/cad-persistence-matrix.js; git diff --check.
<!-- BOOTSTRAP_END -->
