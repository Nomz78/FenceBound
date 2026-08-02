# FenceBound repository session instructions

## Session start

1. Run `npm run session:init` from the repository root.
2. Read the four Tier 1 files in the order listed by `START_HERE.md`.
3. Verify branch, actual HEAD, upstream, worktree, runtime version, schema, and canonical files.
4. Report drift before editing. If initialization reports `DRIFT DETECTED` or `BLOCKED`, perform a zero-drift audit before product work.
5. Read only relevant sections of the Engineering Bible, System Atlas, Development Index, and repository classifications.
6. State the active task and owner decisions, then work within the authorized scope.

Do not reconstruct the project when initialization reports `READY`. `WARNING` permits work only after the warnings are understood and do not affect the task.

## Working rules

- Inspect before editing; repository evidence controls.
- Preserve `index.html` as the canonical CAD runtime. Do not edit archived builds.
- Do not bypass validation, change pricing values, or promote a release without authorization.
- Keep source, tests, doctrine, architecture/status documentation, and handoff claims distinct.
- Record contradictions; do not silently reconcile them.
- Keep generated artifacts outside the working tree unless a tracked artifact is an explicit deliverable.
- Follow `CLAUDE.md`, `SOURCE_OF_TRUTH.md`, and applicable owner rulings.

## Session close

1. Complete only the authorized implementation.
2. Run the authoritative gate appropriate to the changed subsystem and record command, timestamp, tested commit, outcome, artifacts, and final worktree.
3. Update the Engineering Bible only for authorized doctrine/factual changes; update the System Atlas only for architecture changes; update the Development Index for local subsystem status changes.
4. Append `Docs/development/DEVELOPER_LOG.md` and update `CURRENT_STATE.json` and `Docs/CURRENT_HANDOFF.md`.
5. Copy the completed handoff to `Docs/handoffs/YYYY-MM-DD__<slug>.md`. Never edit an archived handoff afterward.
6. Verify `START_HERE.md` and run `npm run session:init`.
7. Use the two-commit convention documented in `START_HERE.md`: verified implementation commit followed by one allowlisted documentation-closeout commit.
8. Report local/remote synchronization and the exact handoff path.

Every proper final response includes:

```text
Next-session handoff:
Repository-relative handoff:
Docs/CURRENT_HANDOFF.md

Initialization command:
npm run session:init

Verified HEAD:
<tested implementation HEAD>

Gate:
<PASS, FAIL, or NOT RUN>
```

## Authoritative commands

- Fast Phase One acceptance: `npm run test:phase-one`
- Complete Playwright suite: `npm test`
- Persistence matrix: `node scripts/cad-persistence-matrix.js`
- Static patch check: `git diff --check`

Playwright starts a temporary local HTTP server and creates output under ignored `test-results/`; individual export tests use temporary browser download locations. The persistence matrix starts a temporary local server and writes browser storage only. Neither is expected to modify tracked files.
