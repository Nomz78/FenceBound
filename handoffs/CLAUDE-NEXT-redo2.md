# CLAUDE-NEXT — REDO list, round 2

## Current state

Owner, 2026-10-30: *"all need to be done, push in the order of debugging necessary"*. All six REDO items
(`git show 371850a:HANDOFF.md | sed -n 54,70p`) are authorized feature work. Order: 1 drawing, 2 visual system,
3 mobile layout, 4 plan PDF, 5 estimate PDF, 6 platform.

| # | Item | State |
|---|---|---|
| 1 | Click-to-chain drawing | PR #41 `feat/redo1-click-chain-drawing` (`main` base), 217/217 |
| 2 | Light theme, 12 px floor, labeled header | PR #42 `feat/redo2-visual-system`, stacked on #41, 221/221 |
| 4 | Plan PDF (Codex) | PR #43 `feat/redo4-plan-pdf` (`main` base), 216/216 |
| 5 | Estimate PDF (Codex) | **job running** in Codex's pane (`../FenceBound-codex`, branch `feat/redo5-estimate-pdf`, stacked on #43) |
| 3 | Mobile/tablet layout | not started — **next** |
| 6 | Platform | not started — needs owner choices first |

- No PR is merged yet. Merge order: #41 → retarget #42 to `main` → #42 → #43 → REDO 5. Each conflicts only in
  `Docs/development/DEVELOPER_LOG.md` (keep both sides). #42 and #43 both touch `index.html` but in different
  regions (#42: CSS, header, canvas `draw()`; #43: `exportPDF()`); re-run the suite after each merge.
- The Codex REDO 5 job reports to the *old* session. Check it yourself: `tail -20 /tmp/duo/estimate-pdf1.log`
  and `handoffs/CODEX-RESULT-estimate-pdf1.md` in `../FenceBound-codex`. Codex leaves work **uncommitted**; the
  coordinator reviews, commits (note "Implemented by Codex"), pushes `feat/redo5-estimate-pdf` and opens a PR to
  `feat/redo4-plan-pdf`.

## Read first

- This file, then `Docs/development/DEVELOPER_LOG.md` from the heading "2026-10-30 — REDO 1" to the end
  (about 30 lines).
- `handoffs/CODEX-NEXT-estimate-pdf1.md` (what Codex was asked for REDO 5).
- For REDO 3 in `index.html` (search symbols; line numbers drift): `#header` CSS and `#header-right` rules
  (near the top of the first `<style>`), `#panel` markup, the panel drag handle (`S.isDraggingPanel`), the
  existing `@media` rules (`rg -n "@media" index.html`), and the touch handlers after `handleUp`.

## Remaining steps

1. **REDO 5 intake.** Review Codex's diff (any change to existing tests must keep the assertion's meaning),
   commit, push, open the PR. Done when the PR exists with Codex's before/after test counts.
2. **REDO 3: mobile and tablet layout** (Claude, on `feat/redo3-mobile-layout` from `feat/redo2-visual-system`).
   Audit evidence: at 390 px the canvas is about 85 px wide and the panel covers two-thirds of the screen.
   Build a bottom sheet for the panel below about 768 px (collapsed / half / full, draggable), a compact header
   (hide `.btn-lbl` text but keep `title`/`aria-label`; overflow menu for Clear/Job/Jobs/theme/PNG), and a
   toolbar that fits. Red-before tests at 390×844 and 768×1024: canvas width ≥ 90% of viewport and height ≥ 50%
   with the sheet collapsed; every header action reachable; drawing by touch still works (CDP
   `Input.dispatchTouchEvent`, as in `Docs/research/2026-10-15_estimator-audit/03-cad-audit.md`). Done when those
   pass and the full suite is green, plus 390 px screenshots of both themes.
3. **REDO 6: platform.** Ask the owner before any code (AskUserQuestion): aerial/parcel underlay source (image
   upload with manual scale needs no provider; tiled imagery needs one and an API key), accounts and cloud save
   backend (this is O-5/v6.0: frozen quote snapshot separate from the company rate card), e-signature (built-in
   signature pad on the estimate vs a vendor). Recommend the image-upload underlay first: no provider, no keys,
   and it helps drawing accuracy. Done when the owner's choices are recorded in the developer log.
4. Every session: append to the developer log; check the handoff rule at each stopping point.

## Test notes

- `npm test` runs all 221+ tests (about 5 min); `npm run test:phase-one` runs only 9. Log to the scratchpad.
- Codex's tests use port 8080 (`reuseExistingServer: false`). Run yours on 8081 with a scratchpad config:
  `const base=require('<repo>/playwright.config.js'); module.exports={...base,testDir:'<repo>/tests',
  use:{...base.use,baseURL:'http://127.0.0.1:8081'},webServer:{...base.webServer,command:'python3 -m http.server
  8081 --bind 127.0.0.1',cwd:'<repo>',url:'http://127.0.0.1:8081/index.html'}};` then `npx playwright test -c <it>`.
- Don't `pkill -f` a pattern that also appears in your own command line (it killed the shell, exit 144).
- Hand Codex a job: `~/Eldin-Foundry/punchlist/dual-agent/job.sh codex ../FenceBound-codex handoffs/CODEX-NEXT-<topic>.md <name>`
  as a background command.

## Branches

Start from: `feat/redo2-visual-system` (this handoff is committed there). Push REDO 3 to
`feat/redo3-mobile-layout` and open its PR against `feat/redo2-visual-system`.
