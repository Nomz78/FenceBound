# CLAUDE-NEXT — REDO list, round 3

## Current state

Owner, 2026-10-30: all six REDO items authorized (`git show 371850a:HANDOFF.md | sed -n 54,70p`); "merge the
prs too". REDO 1–5 are done and merged to `main`:

| # | Item | Merged as |
|---|---|---|
| 1 | Click-to-chain drawing | #41 |
| 2 | Light theme, 12 px floor, labeled header | #44 (replaces #42, which merged into the REDO 1 branch after a failed retarget) |
| 4 | Plan PDF (Codex) | #43 |
| 5 | Estimate PDF as a customer quote (Codex) | #45 |
| 3 | Phone/tablet layout: bottom sheet, More menu, toolbar strip | #46 |
| 6 | Platform | **not started — owner choices first** |

- Full suite on `main` + REDO 3: 239/239 (`tests/mobile-layout.spec.js` adds 11).
- Codex is idle. Its checkout `../FenceBound-codex` sits on the merged `feat/redo5-estimate-pdf`; start any new
  Codex job from a fresh branch off `main`.
- `gh pr edit --base` can fail silently (Projects-classic GraphQL error): check `baseRefName` afterwards.

## Read first

- This file; `Docs/development/DEVELOPER_LOG.md` from the heading "2026-10-30 — REDO r2" to the end (~25 lines).
- `SESSION_HANDOFF_PROTOCOL.md` if you need the handoff rule in full.

## Remaining steps

1. **REDO 6: platform — ask the owner before any code** (AskUserQuestion). Three choices:
   - Aerial/parcel underlay: image upload with manual two-point scale (no provider, no keys) vs tiled imagery
     (needs a provider and API key). Recommend image upload first: it helps drawing accuracy and needs nothing.
   - Accounts and cloud save backend. This is O-5/v6.0: a project carries a frozen quoted-price snapshot,
     the company rate card is a separate store, loading a project never writes to the rate card (CLAUDE.md).
   - E-signature: built-in signature pad on the estimate vs a vendor.
   Done when the owner's choices are recorded in the developer log.
2. Build what the owner picks, smallest piece first, red-before tests; split PDF/data work to Codex where it
   doesn't touch the same `index.html` regions. Done per piece when the full suite is green and the PR is merged
   (owner asked for merges).
3. Every session: append to the developer log; check the handoff rule at each stopping point.

## Test notes

- Full suite ≈ 5 min, 239 tests. Use a scratchpad Playwright config on a free port (8081+) so Codex's 8080 run
  is not disturbed (template in `git show a45c600:handoffs/CLAUDE-NEXT-redo2.md`, "Test notes").
- A temporary git worktree needs `node_modules` symlinked in before Playwright runs there.
- CSS transitions (the sheet animates height 0.18 s): measure with `expect.poll`, not a single read.
- Hand Codex a job: `~/Eldin-Foundry/punchlist/dual-agent/job.sh codex ../FenceBound-codex handoffs/CODEX-NEXT-<topic>.md <name>`
  as a background command.

## Branches

Start from: `main` (everything is merged). Push REDO 6 work to `feat/redo6-<piece>` and open PRs against `main`.
