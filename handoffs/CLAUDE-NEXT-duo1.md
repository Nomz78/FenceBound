# CLAUDE-NEXT — duo setup, round 1

## Current state

- REDO list complete. Merged on 2026-10-30: #48 (6b quote/rate-card split), #49 (Saved Jobs quote write + 6c
  signature pad), #50 (MR5 quoted-job coverage, matrix route 10 pricing, matrix green again). `main` = `eddb986`.
- CLAUDE.md lists no open integrity defect. **No next track is authorized.** Ask the owner first.
- Gates at `eddb986`: Playwright 255/255 (+2 MR5 cases), `node scripts/cad-persistence-matrix.js` 12/12. Run
  **both** for any pricing or persistence change; 6b ran only Playwright and left the matrix red unnoticed.
- Owner intent: work as the duo again. Claude Code coordinates; Codex implements bounded pieces.
- The last session lost time to tethering (connection) problems. Keep turns small and commit often.

## Duo setup (verify, don't assume)

- Codex checkout: `../FenceBound-codex` (path from `FenceBound`). It is still on the merged
  `feat/redo5-estimate-pdf` with a clean tree. Before a job: `git -C ../FenceBound-codex fetch -q &&
  git -C ../FenceBound-codex checkout -q -B <codex-branch> origin/main`.
- Launch pattern used for earlier jobs: `/tmp/duo/estimate-pdf1.run` (lines 1–6). It calls
  `~/Eldin-Foundry/punchlist/dual-agent/codex-run.sh <codex bin> --dangerously-bypass-approvals-and-sandbox
  /tmp/duo/<job>.last /tmp/duo/<job>.prompt <job>`, tees `/tmp/duo/<job>.log` and writes `/tmp/duo/<job>.rc`.
  `/tmp` may have been cleared; if so, ask the owner how they start Codex jobs instead of guessing.
- Brief format: `handoffs/CODEX-NEXT-<topic><round>.md` (example: `handoffs/CODEX-NEXT-estimate-pdf1.md`).
  Codex writes `handoffs/CODEX-RESULT-<topic><round>.md` and leaves work **uncommitted**. The coordinator
  reviews it, runs the gates, commits with "Implemented by Codex", pushes and opens the PR.
- Split work by `index.html` region (for example Codex in `drawPdf*` / export functions, Claude in UI/state)
  so the two tracks don't conflict. Two active tracks at most (CLAUDE.md).
- The auto-mode classifier blocks `gh pr merge`. Ask the owner to run `! gh pr merge <n> --merge`. `gh pr edit`
  fails on a GraphQL deprecation; use `gh api -X PATCH repos/Nomz78/FenceBound/pulls/<n> -f title=… -f body=…`.

## Read first

- This file; `CLAUDE.md` "Working rules"; `SESSION_HANDOFF_PROTOCOL.md`.
- `Docs/development/DEVELOPER_LOG.md` from "2026-10-30 — REDO r5" to the end (about 70 lines).
- Only if a track touches pricing: `Docs/development/DEVELOPER_LOG.md` section "REDO r4" (6b design).

## Remaining steps

1. **Get the next track(s) from the owner** (AskUserQuestion). Done when the owner names one or two tracks.
2. **Prepare the Codex side.** Reset `../FenceBound-codex` to `origin/main` on a fresh branch, write its
   `CODEX-NEXT` brief and confirm the launch method. Done when the Codex job is running.
3. **Coordinate.** Claude takes the other region; red-before tests; both gates; PRs to `main`; the owner
   merges. Done when both PRs are merged.
4. Every session: append to the developer log; check the handoff rule at each stopping point.

## Test notes

- Scratchpad Playwright config on port 8081+ (spread `playwright.config.js`; override `testDir`, `baseURL`,
  `webServer.command/url/cwd`) so Codex's 8080 is free. The matrix uses 8091.
- Read Playwright's own exit code (`… > log 2>&1; echo "exit $?"`), never a piped `tail`'s exit.

## Branches

Start from `docs/duo-handoff1` (this file, one commit on `main` `eddb986`). Merge it with your first PR, or
fold it into your first branch. New work goes on fresh branches off `main`.
