# FenceBound C4 house/wall end markings

## Outcome

The owner's 2026-10-24 correction resolves the former C4/fixture disagreement:
"no its still a post, just set within 3\" of the wall, as thats code."
House ends retain ordinary posts, concrete and terminal hardware. The 168 LF fixture
still has two house terminal posts, two corners, four gate posts and ten fabric ends.
The former proposal for postless wall attachments is superseded.

- Branch: `codex/counting-c4`, based on verified cattle merge `c15954c`.
- Cattle's tree exactly matches C3 documentation closeout `76efacd`; live GitHub showed
  C3 PR #27 merged into cattle. Main integration remains outstanding.
  At the pre-closeout checkpoint, cattle PR #26 was also merged into split rail;
  cattle's remote tip remained `c15954c`. No main integration is implied by either merge.
- Implementation is currently uncommitted, awaiting the human closeout gate. This is
  working-tree evidence; it is not a committed C4 gate or replacement for the current handoff.
- DRAW offers Start (A) / End (B) house/wall post markings for the selected fence run.
  Canvas labels identify marked ends; the panel displays the owner's 3-inch instruction.
- Scalar end fields belong to each run and travel through existing persistence/history
  routes. New runs and old jobs default to ordinary ends. Unknown saved values are
  reported by validation and can be corrected through the controls.
- The markings record installation intent. Wall geometry and measured clearance are
  not modeled. Material/pricing calculations, prices, version 5.4.0 and schema 3 are unchanged.

## Verification

- Red before runtime edits: all five new tests and the modified 168 LF fixture failed on
  the cattle runtime. Log: `/tmp/fencebound-c4-red.log`.
- Initial focused suite: 12/12 passed (five new, seven fixture tests).
  Log: `/tmp/fencebound-c4-focused.log`.
- Independent review found an orphaned documentation table row and an invalid-null
  input repair bug. Both are repaired. The extended invalid-value test failed before
  repair (`/tmp/fencebound-c4-null-red.log`) and all five new tests passed after repair
  (`/tmp/fencebound-c4-review-fix.log`). Independent re-review found no remaining findings.
- First full attempt intentionally stopped for that repair: 51 passed, one interrupted,
  183 not run; no completed-gate claim. Log: `/tmp/fencebound-c4-full.log`.
- Initial persistence matrix: 12/12 passed (`/tmp/fencebound-c4-matrix.log`).
- Final working-tree gate observed complete at `2026-10-24T17:52:27Z`: **235/235 tests
  passed**, **12/12 persistence routes passed**, `git diff --check` passed. Logs:
  `/tmp/fencebound-c4-final.log`, `/tmp/fencebound-c4-final-matrix.log`.
  Normal browser/CDN setup; no dependency or transport changes.
- Runtime SHA-256: `fc4e8a7fd23ccef80878aad5db56d997099e45f7e1f3ff55025066c15abb8a32`.
- Ignored independent scrutiny: `AI/C4_HOUSE_END_REVIEW_2026-10-24.md`.
- Desktop/tablet visual inspection passed. Screenshots:
  `/tmp/fencebound-c4-desktop.png`, `/tmp/fencebound-c4-tablet.png`.

Commands:

```bash
npm test -- --output /tmp/fencebound-c4-final-results
node scripts/cad-persistence-matrix.js
git diff --check
```

The new tests exercise unchanged material/price results, independent endpoint edits,
undo/redo, actual debounced autosave/reload, real job-file download/import, Saved Jobs,
copy isolation, legacy defaults, new-run isolation, canvas labels and invalid-value repair.
The fixture uses both end controls and retains every existing asserted count.

## Closeout

After explicit approval: implementation commit on `codex/counting-c4`, gate on that
commit, then one allowlisted documentation child updating `CURRENT_STATE.json`,
`Docs/CURRENT_HANDOFF.md`, its dated archive and the developer log. Push only to
`origin/codex/counting-c4` and verify synchronization. PR creation requires a separate
high-attention approval naming the exact base after checking the live stack. No merge
or main push is authorized. The current handoff will supply the committed boundary.
