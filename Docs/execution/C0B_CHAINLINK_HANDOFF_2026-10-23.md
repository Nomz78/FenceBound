# FenceBound C0b residential chain link handoff

Read `SOURCE_OF_TRUTH.md` first. This branch applies the owner's 2026-10-23 hardware
rulings to residential chain link counts only.

## Outcome

- Objective: HANDOFF.md round 3 step 1 (C0b chain link).
- Classification/status: count changes under owner rulings; PR against the C2 branch.
- Start and end commits: `6eb7e1e` (C2 branch head) → this branch head.
- Repairs: bolts one per band; swedged top rail default with plain 21 ft + sleeves
  option; truss at every terminal; Master Halco tie/hog-ring spacing; post lengths and
  concrete per "Final owner answers" (HARDWARE_SPEC_REFERENCE.md from line 539).
- Deferred: wood, vinyl, ornamental, split rail, cattle (one PR each, branched from this
  one); commercial chain link as its own type; C3, C4. Spec-panel depth fields still show
  generic defaults for chain link.
- Scope not changed: price values, other fence types, footing table, labor, markup.

## Verification

```bash
NODE_OPTIONS="--require <scratchpad>/preload.js" npx playwright test
node scripts/cad-persistence-matrix.js
git diff --check
```

- Baseline/regression suite: 203/203 (197 before + 6 new).
- New tests: C0b-1..6 red 6/6 before, green 6/6 after.
- Other validation: matrix 12/12; Top Rail joint select checked in the UI (plain → 4
  sleeves on 100 ft).
- Worktree status: clean.

## Cold-review package

Review priorities: R15 moved 28692 → 28287 (needs owner acknowledgement, as on
2026-10-15); 168 LF fixture now departs from the v5.4.0 supplement's post stock and
gate concrete; `topRailJoint` absent on older jobs reads as swedged, so reopened jobs
lose their old sleeve line.
