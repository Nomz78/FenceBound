# CLAUDE-NEXT — REDO list, round 6

## Current state

- 6b merged (#48). Owner answered the Saved Jobs question: yes. Done in `97cbdc6` (estimate export writes the
  quote into the job's Saved Jobs record).
- 6c signature pad is done on `feat/redo6-signature`, waiting for the owner to merge its PR. Full suite 255/255.
  Design and notes: `Docs/development/DEVELOPER_LOG.md`, section "REDO r5" (end of file).
- After that merge, all six REDO items are done. No further REDO work is authorized; new features need the
  owner's explicit go-ahead (CLAUDE.md).

## Remaining steps

1. **Owner merges the 6c PR** (`! gh pr merge <n> --merge`; the auto-mode classifier blocks `gh pr merge`).
   Done when `gh pr view <n> --json state` says MERGED.
2. Ask the owner what comes next. Done when they name the next track.

## Branches

Start from `main` after the merge.
