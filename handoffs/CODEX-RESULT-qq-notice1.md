# Quick quote drawing-price notice — round 1 result

Current state: implemented on `codex/qq-notice1` over `98659ed0f2f332957fadd68ee6eb02ca89918672`; uncommitted for coordinator review/commit (“Implemented by Codex”) and PR on `feat/qq-price-notice`. Topic/round follows the supplied NEXT handoff. No PR, push or commit performed.

## Changes

- `index.html`: exported quotes now retain `layout` and `quantities` alongside their existing frozen rates/total/signature. Snapshot preserves them; load accepts only typed/drawn and whitelisted finite, nonnegative numeric quantity fields. Bad/unknown fields drop; old quotes load without comparison metadata and show no notice.
- Inline `#quote-drawing-notice` in Pricing compares a last-exported typed quote with a now-drawn job when total differs by >$0.005. Text: “Drawing changed the price: $X → $Y”, followed only by changed summary quantities. No toast, automatic re-price or change-order logic.
- Geometry-panel updates refresh the comparison even when Pricing is closed; Pricing updates reuse their already computed result. Unpriceable geometry hides the comparison and retains the existing validation path. Matching totals, typed-layout undo, quote removal and new estimate exports clear the notice.
- `tests/quick-quote-notice.spec.js`: actual estimate export (real jsPDF, save stub only), Move-completion geometry edit, old/current totals, post delta, unchanged frozen prices/company card, re-export dismissal, equal-total/undo dismissal, drawn/legacy exclusion, snapshot/load and malformed metadata.
- `Docs/development/DEVELOPER_LOG.md`: session evidence and choices. No field-capture symbols changed.

## Design choices

Four summary keys: posts (all known automatic post keys), rails (automatic LF rail lines), pickets and panels (automatic each-unit lines). These sum **needed** BOM quantities already exposed by `computePricing().matLines`, not order/pack quantities; manual extras and hardware are excluded. Panel systems expressed as LF coverage are not mislabeled panel counts. The four-field summary explains supported material families without persisting the full BOM. Quantity deltas display at up to three decimal places; prices use two decimals, consistent with the existing half-cent comparison/signature guard.

Only whitelisted finite nonnegative numeric summary values survive load; partial valid summaries retain their known fields. Quotes without a usable summary stay quiet. Later exports replace comparison metadata with the current layout/quantities while retaining the existing frozen rate snapshot and signature rules.

## Validation

- Initial focused red: 3 failed / 1 passed, missing layout metadata/notice; drawn/legacy control passed. Log `/tmp/duo/qq-notice1-red.log`.
- Focused green: 4/4 passed. Log `/tmp/duo/qq-notice1-green.log`. During implementation the visibility fixture was corrected to open Pricing; geometry-summary refresh was also added so a real Move immediately updates the notice.
- Full `npx playwright test`: **282/282 passed**, exit 0, 5.2 minutes. Log `/tmp/duo/qq-notice1-playwright.log`.
- `node scripts/cad-persistence-matrix.js`: **12/12 passed**, exit 0. Log `/tmp/duo/qq-notice1-matrix.log`.
- `node --check tests/quick-quote-notice.spec.js` and `git diff --check`: PASS.
- Gate completed on the uncommitted working tree over the HEAD above; recorded 2026-11-01T00:36:58+00:00.
- Pricing function/rate values/dependencies/schema/release state unchanged. Gate runs use live CDN jsPDF, no transport substitution.

## Startup / cleanup

- `npm run session:init` reports stale recorded main/head (`56c5d9f`) against the supplied branch/base (`98659ed`). Requested base, upstream and canonical runtime verified; initial worktree contained only NEXT handoff. Newer owner handoff authorizes this implementation despite stale state prose. Global initiate-repo skill unavailable in this session; repository workflow used. Normal multi-file closeout is left to coordinator under explicit uncommitted instructions.
- Per owner's direct cleanup authorization, dropped `stash@{1}` (`db71cf46da2293c1afe91235acbc8f09eabd11ae`, qq-parity1 copy) then `stash@{0}` (`bbadf5b6fbe4151afaf346d9412cf89640050d8e`, F13 leftovers). Stash list now empty. Owner stated their contents already exist on main; no stash applied or working changes discarded.
- The `/tmp/duo/qq-notice1.run` wrapper was read; task executed directly in this session, avoiding a nested Codex process and its interactive-terminal tail.

Coordinator next: review implementation and gate evidence, commit/push to `feat/qq-price-notice`, open PR; no further implementation choice is blocked on owner input.
