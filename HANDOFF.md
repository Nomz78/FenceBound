# HANDOFF — audit-repairs r3

Start branch: `audit/v540-launch-review`. Each fix goes on its own `fix/…` branch with its own PR into
`audit/v540-launch-review`.

## Current state

- **r1 (2026-10-29):** #29 F2, #30 F1, #31 F3 (on #29), #32 F4 (on #31), #33 F7a–c (on #32).
- **r2 (2026-10-29):** owner rulings logged (`9f32bd8`). Each fix has a red-before test and full suite green:
  - #34 `fix/f5-gate-post-dedup` (on #33): defect recorded first (`321b68b`). A gate post on a run end replaces
    the end post, and the gate's own run takes no fabric-end hardware, truss or bay there. Other runs ending
    at that post (corners) keep theirs. Suite 107/107.
  - #35 `fix/f5-plan-pdf-gate-posts` (on #34): plan PDF shows `Gate: N`, and Total Posts includes gate posts.
    Suite 108/108.
  - #36 `fix/f6-gate-snap` (on #35): a new gate snaps onto its run, and is refused if it's more than 2 ft off
    (26 px on screen when zoomed out). Suite 110/110.
  - **F7d deferred by owner:** keep the validation codes visible for debugging. Hide them before release; the
    beta is undecided.
- **Merge order:** #29 → #31 → #32 → #33 → #34 → #35 → #36; #30 any time. Every branch appends to
  `Docs/development/DEVELOPER_LOG.md`; on conflict keep both entries.
- **r3 owner rulings (2026-10-29, in the developer log):** Q1 yes, Q2 keep 2 ft, Q3 yes.
- **Former open owner questions** (answered in r3):
  1. Should the side panel's post summary also show gate posts in Total posts, matching the plan PDF?
  2. Is the 2 ft F6 snap tolerance right?
  3. Should moving an existing gate with the Move tool also snap it to its run? Not covered by F6.

## Read first

- `CLAUDE.md` working rules.
- `index.html`, by symbol: `getStats` (F5), `handleUp` gate branch (F6), `exportPDF` `Total Posts`.
- `tests/audit-repairs.spec.js` on `fix/f6-gate-snap` for the helpers (`seedPlainRun`, `seedGateJob`,
  `drawGate`).

## Remaining steps

1. Owner answers the open questions above. Each change is a new `fix/…` branch with a red-before test. Done when
   green, or closed in the log.
2. Merge the PRs in the order above, but only once the owner says to.
3. **REDO list** (commit `371850a`, `HANDOFF.md:54-70`): drawing interaction, mobile layout, visual system,
   plan PDF rebuild, estimate PDF rebuild, platform. Don't start without explicit owner feature authorization.

Test notes: `npm test` takes about 2.5 minutes; run it in the background and log to the scratchpad. Port 8080 may
collide with a Codex worktree (`../FenceBound-codex`).
