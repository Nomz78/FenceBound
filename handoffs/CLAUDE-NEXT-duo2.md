# CLAUDE-NEXT — duo, round 2

## Current state

- Merged: #51 (field capture design, priority ranking, Codex field survey), #52 (CURRENT_STATE/CURRENT_HANDOFF
  refreshed to `56c5d9f`; `session:init` on `main` = WARNING, no drift). Open: **#53** (quick quote design +
  Codex footage survey, docs only, branch `docs/quick-quote1`, this file included). Owner merges:
  `! gh pr merge 53 --merge`. After #53, `CURRENT_STATE.json` head is stale again: refresh it at the next PR
  closeout (Docs/CURRENT_HANDOFF.md "Restart").
- Gate at `56c5d9f`: `npx playwright test` **257/257**, matrix 12/12. `npm run test:phase-one` is only the 9
  acceptance tests; the full gate is `npx playwright test` + `node scripts/cad-persistence-matrix.js`.
- Owner product input (2026-10-31): target user = owner-operator. Owners quote from types, footage, equipment and
  crew; **the drawing comes last, for the foreman**. Labor is priced per foot, crew × days or multiplier;
  equipment itemized until rates are familiar. Footage is gathered many ways. Don't re-ask broad answers.
- **No implementation authorized.** Ranking: #1 field capture P1–P2, #2 quick quote (joint first).

## Read first

- `Docs/planning/QUICK_QUOTE_DESIGN_2026-10-31.md` (all, ~110 lines), especially "Owner questions".
- `Docs/planning/FIELD_CAPTURE_DESIGN_2026-10-31.md` "Owner questions" (end of file).
- `Docs/planning/PRIORITY_RANKING_2026-10-31.md` table (lines 14-32).
- Only when implementing: `handoffs/CODEX-RESULT-footage-survey1.md` §1-2 and §4 (fixture);
  `handoffs/CODEX-RESULT-field-survey1.md` §2-3.

## Remaining steps

1. **Owner rulings** (AskUserQuestion, one call): quick quote Q1-Q4 and field capture Q1-Q3 from the two
   designs. Done when answered and recorded in the developer log.
2. **Authorization** for the first two tracks (suggested: Claude Q1 schematic generator; Codex Q1t parity tests,
   or field capture P1). Done when the owner names them.
3. **Codex job:** reset `../FenceBound-codex` (`git fetch -q && git checkout -q -B codex/<topic>1 origin/main`;
   remove untracked handoff copies only after `cmp` against main), write `handoffs/CODEX-NEXT-<topic>1.md`,
   `/tmp/duo/<topic>1.prompt` (brief + summary footer) and `.run` (`sed s/estimate-pdf1/<topic>1/g` of
   `/tmp/duo/estimate-pdf1.run`). **Claude can't launch it** (auto-mode blocks the bypass flag): the owner runs
   `bash /tmp/duo/<topic>1.run` or types "Read and do handoffs/CODEX-NEXT-<topic>1.md" into the open Codex tab.
   Codex's tab may still show an older job's summary; check for the RESULT file, not the message.
4. **Coordinate:** red-before tests, both gates, PRs to `main`, owner merges. Commit Codex work with
   "Implemented by Codex". Append to the developer log; check the handoff rule at each stopping point.

## Branches

Start from `docs/quick-quote1` until #53 merges, then `main`. New work on fresh branches off `main`.
