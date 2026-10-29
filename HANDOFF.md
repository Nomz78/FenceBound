# HANDOFF — audit-repairs r2

Start branch: `audit/v540-launch-review`. Each fix goes on its own `fix/…` branch with its own PR into
`audit/v540-launch-review`.

## Current state

- **r1 done (2026-10-29, Claude Code).** Each fix has a red-before test and its own PR, all into `audit/v540-launch-review`:
  - #29 `fix/f2-labor-hint-literal` F2 labor hint `$${''}` → `$`; adds `tests/audit-repairs.spec.js`.
  - #30 `fix/f1-null-start-redraw` F1: the R9 flake was `ResizeObserver → resizeCanvas → draw → drawFenceRun`
    reading `el.start.x`. `isPoint()` guard in `draw()`/`buildCornerSet()`; import unchanged. R9 file ×20: 1000/1000.
  - #31 `fix/f3-final-ready-badge` (stacked on #29): FINAL-READY needs `P.isFinalReady && !usingSeedPrices() &&
    validateProject().ok`, otherwise "Pricing complete · not verified".
  - #32 `fix/f4-placeholder-estimate-stamp` (stacked on #31): defect recorded first (`2651335`); the estimate PDF
    gets the NOT FULLY VERIFIED stamp on placeholder pricing.
  - #33 `fix/f7-cosmetics` (stacked on #32): F7a PDF thousands separators, F7b single `0'` origin label, F7c plan
    legend shows used types only.
- **Merge order:** #29 → #31 → #32 → #33; #30 any time. Every branch appends to
  `Docs/development/DEVELOPER_LOG.md`, so #30 and this branch will conflict there. Keep both entries.
- **Owner rulings (2026-10-29):**
  - **F5 coincident gate post:** a gate post that lands on a run end/terminal post **replaces** it (counts once,
    as a gate post).
  - **F5 plan PDF:** the post summary **shows gate posts** and includes them in Total Posts, matching the
    materials list.
- **r2 owner rulings (2026-10-29, in the developer log):** F6 yes, snap + refuse (a hand-placed post under a gate
  post also counts once, under F5). F7d keep codes visible for debugging; hide before release, beta undecided.
- **Former open owner questions** (answered in r2, kept for context):
  1. **F6 off-line gate:** the owner asked "why would there be an off-line gate post?" Answer: it's a drawing
     mistake (a near-miss click); the app attaches the gate to the nearest run and still deducts 3 ft of fabric.
     Recommendation: snap the gate onto its run when drawn, and refuse it if it's too far from any run. Get a yes
     or no.
  2. **F7d validation modal codes:** the owner asked "why can't you hide the codes?" Answer: it's a one-line
     change, but accepted tests `phase-one-acceptance.spec.js:215` (test 5, "expose issue codes") and
     `v5.4-port.spec.js:135` require the codes to appear. Hiding them changes accepted behavior and needs explicit
     owner OK. If yes: render the message only, keep `data-code` on the `<li>`, and amend those two assertions to
     check the message. The r1 attempt (reverted) is in the F7 log entry.

## Read first

- `CLAUDE.md` working rules (red-before tests, no pricing **value** changes, defect record before a pricing
  **behavior** change, developer log every session).
- `index.html:752-775` `attachGateToRun` (F6 snap).
- `index.html:1487-1515` `getStats` post and gate accounting (F5 de-duplication).
- `index.html:1700-1712` gate materials-list lines.
- `index.html:2740-2750` plan PDF post summary (`Total Posts`).
- `tests/audit-repairs.spec.js` on `fix/f7-cosmetics` for the test helpers (`seedPlainRun`, `seedVerifiedJob`,
  `estimateStrings`).

## Remaining steps

1. ~~Ask the two open questions above.~~ Done in r2; rulings in the developer log.
2. **F5 gate-post de-duplication.** F5 changes post counts, which is pricing **behavior**, so record a defect in
   `CURRENT_STATE.json` `knownDefects` first. Then add a red-before test: a gate whose post coincides with a run
   end counts that post once. Done when the test passes and the full suite is green.
3. **F5 plan PDF gate posts.** Red-before test: the plan PDF strings show a gate-post line and a Total Posts value
   equal to the materials list. Done when green.
4. **F6** per the ruling in step 1 (snap: a red-before test that an off-line gate ends up on its run and the
   fabric deduction equals the gate width). Done when green.
5. ~~F7d~~ Deferred by owner ruling: keep codes now, hide before release (pre-release checklist item).
6. **REDO list** (in r1's `HANDOFF.md` in git history, commit `371850a`): don't start without explicit owner
   feature authorization.

Test notes: `npm test` takes about 3 minutes; run it in the background and log to the scratchpad. Another agent
(Codex, worktree `../FenceBound-codex`) may use port 8080. A full-suite "address in use" failure is that
collision, not a regression.
