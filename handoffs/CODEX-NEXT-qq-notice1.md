# CODEX-NEXT — quick quote "Drawing changed the price" notice, round 1

Coordinator: Claude Code. **Authorized by the owner 2026-10-31 (duo r4, AskUserQuestion):** the Q1 leftover
"Drawing changed the price $X → $Y" notice. Not authorized: per-side type in the form, any re-pricing,
change orders. No pricing **values** or pricing behavior change: this is a display of figures the app already
computes.

## Read first

- `Docs/planning/QUICK_QUOTE_DESIGN_2026-10-31.md` §3 (lines 58-70).
- `index.html` by symbol: `jobLayout`, `markLayoutDrawn` (and its callers), `snapshotState` (the `quote:` line),
  `applyState` (the `S.quote={frozenAt:...` sanitizer), the estimate-export site that sets
  `S.quote={frozenAt:...,total:P.clientTotal,...}`, the `btn-sign` handler (existing total comparison),
  `updatePricing` (quote panel).
- Style reference: `tests/quick-quote*.spec.js` (Q1/Q1t).

## Task

1. **At estimate export**, record in `S.quote` the layout at that moment (`layout: 'typed'|'drawn'`) and a small
   quantity summary for the delta text (posts count, rails LF, pickets/panels count: whatever `computePricing`
   already exposes; pick the fewest keys that make the design's example readable). Carry both through
   `snapshotState` and sanitize them in `applyState` (unknown/bad values dropped; an old quote without them still
   loads and simply shows no notice). Never written to the company rate card.
2. **Notice:** in the quote panel, when `S.quote` exists, `S.quote.layout==='typed'`, `jobLayout()==='drawn'`, and
   the current `computePricing().clientTotal` differs from `S.quote.total` by more than half a cent: show
   "Drawing changed the price: $X → $Y" plus the quantity deltas that changed, e.g. "(posts +1, rails +21 LF)".
   Inline text, no pop-up, no toast. It goes away when totals match again or a new estimate is exported.
   Nothing re-prices; a frozen quote keeps its rates.
3. Red first: new `tests/quick-quote-notice.spec.js`: build a typed layout, export the estimate (or set the quote
   the way existing tests do), make a geometry edit that changes the price, assert the notice and its $X/$Y; plus
   no notice on a job exported as drawn, and an old-format quote (no `layout`) loads without a notice. Show red.
4. Green, then the full gate: `npx playwright test` and `node scripts/cad-persistence-matrix.js`, each to a log
   file under `/tmp/duo/`; report counts.

## Done when

Red then green shown; full gate counts reported; `git diff --check` clean; developer log appended;
`handoffs/CODEX-RESULT-qq-notice1.md` written. Leave the work uncommitted; the coordinator commits
("Implemented by Codex"). Note any design question you had to decide.

## Branches

Start: `codex/qq-notice1` (fresh off `main` `98659ed`). Push (coordinator): `feat/qq-price-notice`.
Claude Code is building field capture P2 in parallel (`S.actuals.materials`, Field tab); avoid those symbols.
