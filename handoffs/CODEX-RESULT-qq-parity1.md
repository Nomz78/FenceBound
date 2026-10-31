# Quick quote parity tests (Q1t), round 1 — result

Current state: tests written; expected red demonstrated at `f4ece25be17ea5e9ba951212246b9735158222b1`
(the requested main baseline), branch `codex/qq-parity1`. Everything remains uncommitted for the
coordinator. Q1t means the quick-quote test phase named in the design; parity means comparing the
same job through drawn and typed inputs. No runtime, pricing values, dependencies, or existing specs edited.

## Deliverables

- `tests/quick-quote-parity.spec.js`: five parity tests and one atomic-rejection guard.
- `Docs/development/DEVELOPER_LOG.md`: appended session record.
- This result handoff, using the topic/round from `CODEX-NEXT-qq-parity1.md`.
- Input handoff `handoffs/CODEX-NEXT-qq-parity1.md` was already untracked on entry; preserved.

## Fixtures and oracle

| Fixture | Drawn geometry in feet | Gate |
| --- | --- | --- |
| Survey U, woodprivacy 72 in. | (0,0)→(50,0)→(50,50)→(0,50) | side 1, walk, 4 ft, offset 20 |
| L, chainlink 48 in. | (0,0)→(60,0)→(60,30) | none |
| Closed loop, chainlink 72 in. | (0,0)→(40,0)→(40,30)→(0,30)→(0,0) | side 2, double, 12 ft, centered (offset 14) |
| End gate, woodprivacy 72 in. | (0,0)→(50,0)→(50,30) | side 1, walk, 4 ft, offset 26 |
| Two types | (0,0)→(50,0), woodprivacy 72 in.; →(50,30), chainlink 48 in. | none |

Drawn geometry is explicit, independent of the typed generator. Specs follow the drawing UI path:
`selectFenceType` → set `S.specs.heightIn` → `applyHeightDrivenSpecs` → `updateSpecsForFenceType`.
Run creation mirrors `commitDrawnSegment`: `cloneRunSpecs(S.specs)`, default `S.postSpacing`, auto posts on.
Gates use `attachGateToRun`, followed by `rebuildRunAutoPosts` for every run. No synthetic takeoff model.
Each path starts with cleared storage/reloaded defaults; site adders off, hours override empty, no manual
materials. Rates, packs, markup and footing configuration remain shipped defaults, without writes to values.

Assertions compare sorted `calcAutoMaterials` name/unit/qty rows; sorted priced material rows including
name/unit/qty/pricedQty/pricedUnit and every `*C` field; full labor rows; every `pricing.cents` field; and
`sectionCents`. Sorting ignores row order, preserving quantities and cent values. The typed layout flag
is also checked. The rejection guard starts with a populated U job, submits a 12-ft gate on a 10-ft side,
and requires `ok:false`, nonempty errors, and byte-identical JSON of `S.elements`.

## Validation

- `npx playwright test tests/quick-quote-parity.spec.js > /tmp/fencebound-qq-parity1.log 2>&1`
  on 2026-10-31: exit 1; **6 failed, 0 passed**. Every failure is at the generator call, after drawn setup
  and (for parity tests) nonempty BOM/labor and positive-total checks.
- First error: `Error: page.evaluate: ReferenceError: buildTypedLayout is not defined`.
- `node --check tests/quick-quote-parity.spec.js`: PASS.
- `git diff --check`: PASS. `git diff --exit-code -- index.html`: PASS (unchanged).
- Existing suite and persistence matrix deliberately NOT RUN per owner instruction; green awaits Q1.
- Full output is an external temporary artifact at `/tmp/fencebound-qq-parity1.log`.

## Contract choices and drift

- Closed-loop auto-completion is underspecified (how many missing sides/how to reject impossible loops).
  The fixture supplies all four closing sides, testing only the explicit contract.
- Survey §4 used explicitly fixed post/rail specs. The new contract accepts type/height, not arbitrary
  specs, and explicitly requires drawing defaults. The U test preserves survey geometry, gate placement
  and height, but derives specs via the UI path rather than hardcoding the survey's illustrative spec.
- The mixed fixture exercises both per-side type and height overrides; other fixtures exercise job defaults.
- `npm run session:init` reports stale recorded branch/head (`main`/`56c5d9f`) versus the requested
  `codex/qq-parity1`/`f4ece25`. Audit: intervening changes are documentation only; `index.html` is identical
  to recorded `56c5d9f`; only the input handoff was untracked initially. No product drift.
- Design/current-state prose still says implementation awaits authorization; the task handoff and current
  owner request explicitly authorize this test work. `SOURCE_OF_TRUTH.md` also lists a different authority
  order than `START_HERE.md`; no doctrine decision is needed for this test-only scope.
- Global `initiate-repo` skill is unavailable in this environment; repository session-init/read checks used.
- Owner's scoped, uncommitted handoff overrides routine state-refresh/two-commit closeout instructions.

## Open / coordinator next

Implement Q1 in `index.html`, then rerun this spec; done when all six tests pass. No green claim yet.
Coordinator owns full-suite/matrix validation, state closeout and commits ("Implemented by Codex"),
and the requested push branch `test/quick-quote-parity1`. Start from `codex/qq-parity1`.
