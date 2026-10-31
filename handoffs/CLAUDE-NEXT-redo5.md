# CLAUDE-NEXT — REDO list, round 5

## Current state

Owner, 2026-10-30: all six REDO items authorized; "merge the prs too". REDO 1–5 and 6a merged (#41, #44, #43,
#45, #46, #47).

| Piece | Status |
|---|---|
| 6b O-5 price-snapshot split | **PR #48 open** (`20db9bf` + this handoff), 249/249. Waiting for the owner to merge. |
| 6c E-signature pad | **Next**, after #48 merges |

- 6b design, owner decisions and implementation notes: `Docs/development/DEVELOPER_LOG.md` lines 1107–1176
  ("REDO r4"). Short form: `S.quote = null | {frozenAt,total,pricing}` freezes at the first estimate PDF
  export; drafts price from the company card; pre-split job files load as quotes; the cost editor and backup
  restore always act on the card; Re-price returns a job to draft.
- **Open owner question (asked at end of r4, unanswered):** should the estimate export also write the quote
  into the job's Saved Jobs record? Today the freeze reaches autosave at once but a Saved Jobs record only on
  its next Save. Ask again with AskUserQuestion before 6c; if yes, do it as a small separate commit with a
  red-before test.
- The auto-mode classifier blocks `gh pr merge`. Open the PR, then ask the owner to merge it
  (`! gh pr merge <n> --merge`). Do not work around the block.
- Codex is idle in `../FenceBound-codex`; start any Codex job from a fresh branch off `main`.

## Read first

- This file; `CLAUDE.md` ("Working rules").
- `Docs/development/DEVELOPER_LOG.md` 1107–1176 (6b).
- `index.html` (line numbers as of `20db9bf`; locate by symbol): quote store helpers `clonePricing` /
  `useCompanyRateCard` / `useQuotePricing` 1615–1645; `snapshotState`/`applyState` ~1013–1080;
  quote note markup 694; Re-price handler 3724; `exportEstimatePDF` 5205, freeze block 5438;
  `drawPdf*` helpers (e.g. 3392, 5192).
- `tests/price-snapshot.spec.js` (helpers `setCard`, `seedRun`, `exportEstimate` — reuse for 6c).

## Remaining steps

1. **Merge #48.** Confirm with the owner it merged (`gh pr view 48 --json state`). Done when state is MERGED.
2. **Saved Jobs question** (above). Done when answered and, if yes, implemented with a red-before test.
3. **6c — signature pad.** Owner choice (REDO r3): built-in pad — drawn signature (canvas), typed name, date —
   on the estimate, stored with the frozen quote (`S.quote.signature`, carried in `snapshotState().quote`),
   drawn into the estimate PDF. Design points to settle in the log first: signing requires/creates a quote
   (sign after freeze); Re-price or Clear drops the signature with the quote; signature data URL size limit
   (localStorage budget, like the 6a underlay); `applyState` sanitizes it (png data URL only). The PDF drawing
   can go to Codex (`drawPdf*` region) if it doesn't touch the pad UI regions. Red-before tests. Done when the
   PR is green on the full suite and the owner has merged it.
4. Every session: append to the developer log; check the handoff rule at each stopping point.

## Test notes

- Full suite ≈ 4.3 min, 249 tests. Scratchpad Playwright config on 8081+ (spread `playwright.config.js`,
  override `testDir`, `baseURL`, `webServer.command/url/cwd`) so Codex's 8080 is free.
- **Read Playwright's own exit code**: `npx playwright test … > log 2>&1; echo "exit $?"` — a trailing pipe
  (`| tail`) reports the pipe's exit, which hid 6 failures once in r4.
- Red-before proof: a `git worktree` of the pre-fix commit in the scratchpad, copy the new spec in, symlink
  `node_modules`, run on another port.
- The estimate export opens the validation overlay for incomplete jobs; hide `#validation-overlay` before
  further clicks (see `exportEstimate` in `tests/price-snapshot.spec.js`).

## Branches

6b: `feat/redo6-price-snapshot` (PR #48, holds this handoff). After it merges, start from `main` and push 6c to
`feat/redo6-signature`; PR against `main`.
