# FenceBound estimator deep-audit handoff — 2026-10-15

Read `SOURCE_OF_TRUTH.md` first. This branch adds audit and research evidence only.

## Outcome

- Objective: owner-requested deep analysis of the price estimator, inventory/takeoff and CAD, plus
  research into professional fence estimators, to plan finishing the program.
- Classification/status: research and audit evidence, **not canonical**. Recommendations only.
- Start and end commits: start `82a148f` on `claude/focused-bell-rirwad`; end is this commit.
- Confirmed defects and repairs: ~55 confirmed bugs recorded in
  `Docs/research/2026-10-15_estimator-audit/` (reports 01–03); **none repaired**. Ranked list and
  root causes in `00-SUMMARY.md`. Highest: concrete priced as the wood/gate post through the
  `lookupCost` prefix fallback (verified by hand), which the ratified R15 = 31122 cents embeds.
- Deferred work and owner decisions: the eight Step 0 rulings in `00-SUMMARY.md` (new R15 approval,
  collinear-joint post rule, line-post concrete, stock lengths, truss rods/sleeves/bolts, editable
  site adders, v6.0 engine authorization, NC tax treatment via CPA/NC DOR).
- Scope explicitly not changed: `index.html`, all tests, pricing values, `CURRENT_STATE.json` and
  `Docs/CURRENT_HANDOFF.md` (no implementation boundary moved; the owner sets the next active task).

## Verification

Baseline at `82a148f` in the cloud container (details in report 04):

```bash
npm ci
npm test                              # via scratch config pointing at /opt/pw-browsers/chromium
node scripts/cad-persistence-matrix.js
npm run session:init
```

- `npm test`: 67 passed, 29 failed. All 29 fail only on `window.jspdf` load timeout — the
  environment proxy blocks cdnjs. Not a regression; PDF tests unverified here.
- Persistence matrix: 12/12.
- `session:init`: DRIFT, because this branch/HEAD differ from the recorded `fix/field-hole-depths`
  head; worktree clean before this docs commit; app 5.4.0, schema 3.

## Next session

Start from `claude/focused-bell-rirwad`. Read `Docs/research/2026-10-15_estimator-audit/00-SUMMARY.md`
in full, then report 01 §2 F1–F2 and report 02 §3 F-1/F-2. After the owner approves a new R15,
begin Step 1.1 (exact-key pricing) with a red-before test. Repro scripts in that folder must be
copied outside the working tree before running.

## Addendum — Step 1 repairs completed

The owner approved the new R15, editable add-ons and the fixes the same day. All six Step 1
repairs landed on this branch; final gate 172/172 (PDF tests via scratch jsPDF routing) and
matrix 12/12 at `ea67c4ed9d2b47380032fe7875a724a2084bb6e1`. Current state lives in `Docs/CURRENT_HANDOFF.md`.
