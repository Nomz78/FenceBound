# CLAUDE-NEXT — REDO list, round 4

## Current state

Owner, 2026-10-30: all six REDO items authorized; "merge the prs too". REDO 1–5 merged (#41, #44, #43, #45, #46).
REDO 6 platform choices (owner, AskUserQuestion, 2026-10-30; recorded in `Docs/development/DEVELOPER_LOG.md`,
heading "2026-10-30 — REDO r3"):

| Piece | Owner choice | Status |
|---|---|---|
| 6a Underlay | Image upload, manual two-point scale; no tile provider or key | **Merged #47** (`6a6ba82`) |
| 6b Accounts/cloud save | Local-first O-5 split: localStorage + file export/import, no accounts/server | **Next** |
| 6c E-signature | Built-in pad (drawn signature, typed name, date) in the estimate PDF, stored with the frozen quote | After 6b |

- Full suite on `main` (`aa889b9`): 244/244.
- The auto-mode classifier blocks `gh pr merge` ("Merge Without Review"). Open the PR, then ask the owner to
  merge it (`! gh pr merge <n> --merge`). Do not work around the block.
- Codex is idle in `../FenceBound-codex` on an old merged branch; start any Codex job from a fresh branch off `main`.

## Read first

- This file; `CLAUDE.md` ("v6.0 pricing requirement", "Known defects", "Working rules").
- `index.html` (locate by symbol; line numbers as of `aa889b9`): `readJobPricingInputs`/`applyJobPricingInputs`
  988–1012, `snapshotState`/`applyState` 1013–1078, pricing provenance and rate-card store
  (`_pricingFromLoadedProject`, `COSTDB_KEY`, `sanitizePricingInputs`, `readSavedCostDB`…`saveCostDB`) 1600–1770,
  the deliberate pricing write near 4614.
- `tests/persistence-integrity.spec.js` (D-1 provenance guard tests) — the split must keep these green or
  replace them with stricter ones.
- `Docs/execution/CAD_PERSISTENCE_REMEDIATION_HANDOFF_2026-08-01.md`, open defects section only (non-atomic
  import, matrix route 10).

## Remaining steps

1. **6b — O-5 split.** Requirement (CLAUDE.md): "A project carries a frozen quoted-price snapshot. The company
   rate card is a separate store. Loading a project never writes to the company rate card." Today `applyState`
   merges a job's `costs/labor/markup` into the live `COST_DB/LABOR/MARKUP` and marks provenance (the D-1 guard).
   Design first, in the developer log, before code: where the snapshot lives in the project, when it is frozen
   (on Generate Estimate? on Save?), what pricing a loaded project shows, and how the user deliberately re-prices
   from the current rate card. Never alter pricing **values**. If the design needs an owner decision, ask with
   AskUserQuestion. Red-before tests. Done when the PR is green on the full suite and the owner has merged it.
2. **6c — signature pad.** Canvas pad + typed name + date on the estimate, stored in the frozen snapshot and drawn
   into the estimate PDF. The estimate PDF work can go to Codex (`drawPdf*` regions) if it doesn't touch the
   same `index.html` regions as the pad UI. Done when merged.
3. Every session: append to the developer log; check the handoff rule at each stopping point.

## Test notes

- Full suite ≈ 4.5 min, 244 tests. Use a scratchpad Playwright config on 8081+ (spread `playwright.config.js`,
  override `testDir`, `baseURL`, `webServer.command/url/cwd`) so Codex's 8080 is free.
- Red-before proof: a `git worktree` of the pre-fix commit in the scratchpad, copy the new spec in, symlink
  `node_modules`, run on another port. Never run red while editing the live tree (the server serves edits live).
- The line reporter prints test names containing "failed"; read the final "N passed" line, not a grep for "failed".

## Branches

Start from and push to `feat/redo6-price-snapshot` (holds only this handoff, off `main` `aa889b9`). PR against `main`.
6c goes on `feat/redo6-signature` off `main` after 6b merges.
