# CLAUDE-NEXT — duo, round 4

## Current state

- `main` `8009553`: #54 quick quote Q1 + Q1t and #55 **field capture P1** (`cb226a7`) merged.
- Open: **#56** F13 on `fix/f13-hours-gate-labor` (Implemented by Codex, reviewed by Claude Code): hours-based
  labor keeps the per-gate install fee and its owning-section allocation (`computePricing`, gate block moved
  out of the per-LF branch, no rate values changed). Red on `main` (no "Walk Gate install" line) → green;
  gate figures in the PR body. Owner merges: `! gh pr merge 56 --merge`.
- Authorizations used up: field capture P1 and F13 are done. **Nothing further is authorized.** Candidates for
  the owner: field capture **P2** (materials actuals per estimate line, design §4/§6), the Q1 leftovers below,
  F13 bullet 3 (hours-only total on an empty drawing, no PDF lines; Codex result "Open").
- P1 facts a P2 builder needs: `S.actuals = {crewDefault, days[]}`; `sanitizeActuals` (after
  `migrateRunOwnership` in `applyState`) drops unknown keys, so P2 must add `materials` to both it and
  `emptyActuals`. Gates get `gateId` on first field tap (deviation, developer log "Field capture P1").
- Q1 leftovers (not authorized): "Drawing changed the price $X → $Y" notice (quick quote design §3), per-side
  type in the form. `CURRENT_STATE.json` head is stale: refresh at the next PR closeout.
- Codex worktree `../FenceBound-codex` on `codex/f13-gate1` still holds the F13 edits uncommitted (now copied
  into the PR) and an old `git stash` (qq-parity1, already merged): both can be discarded after the F13 PR
  merges. Its launcher needs a real terminal (`stdin is not a terminal` otherwise).

## Read first

- `Docs/development/DEVELOPER_LOG.md`: the last three entries (search "Field capture P1").
- For P2 only: `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` §2 and §4 (lines 36-63, 76-83);
  in `index.html` by symbol: `sanitizeActuals`, `updateFieldTab`, `computePricing` (`matLines`).

## Remaining steps

1. Confirm the F13 PR merged (or ask the owner). Done when `main` contains it.
2. Ask the owner which authorized track comes next (P2, Q1 leftovers, F13 bullet 3); two tracks maximum.
   Done when an authorization is recorded in the developer log.
3. Build it with red-before tests and both gates (`npx playwright test`, `node scripts/cad-persistence-matrix.js`).

## Branches

Start from `main` after the F13 PR merges (else `fix/f13-hours-gate-labor`). New work on fresh branches off `main`.
