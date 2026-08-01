# FenceBound FenceScraper public-market evidence handoff

Read `SOURCE_OF_TRUTH.md` first. This handoff records the owner-ratified
deferral of the FenceScraper public-market evidence track and preserves the
minimum accepted context needed to resume it without repeating reconnaissance.

## Outcome

- **Objective:** Determine whether NCDOT bid data can produce useful local
  fence-market evidence and define a defensible acquisition scope.
- **Classification/status:** Reconnaissance accepted; track **deferred, not
  cancelled**. Its slot moves to field data capture, which can immediately
  produce owner-controlled verified material costs and labor hours.
- **Start and end commits:** `4d49d0676574d0ea799fe98cdc9a34a92ffe89b1`;
  documentation-only closeout commit containing this handoff.
- **Confirmed defects and repairs:** None; this was report-only work.
- **Deferred work and owner decisions:** Source acquisition and benchmark output
  are deferred. The statewide-with-regional-subset design is accepted.
- **Scope explicitly not changed:** No adapter, acquisition, pipeline, schema,
  scraper, CAD integration, pricing store, runtime source, merge, or tag.

## Deferral basis

The threshold is **20 bidder observations across at least 3 independent
contracts**.

| Frequency for the exact item code | Approximate time to threshold |
| --- | --- |
| 3 qualifying contracts/year | 3 years |
| 2 qualifying contracts/year | 4–5 years |
| 1 qualifying contract/year | 7–10 years |
| 1 qualifying contract every 2 years | 14–20 years |

Common permanent-fence items in Divisions 8/9/10 need about **5–10 years**.
Less common items need **10–20+ years or may never reach the threshold**. NCDOT
therefore cannot produce a Charlotte-area rate on a useful timeline.

Observed coverage supports the decision:

- **2024 Division averages:** four permanent-fence groupings statewide—woven
  wire, barbed-wire reset, chain-link reset, and chain-link removal. Division
  10 had two; Divisions 8 and 9 had none.
- **2025 Central:** Division 8 had none, Division 9 had six, and Division 10
  had one.

Annual Bid Averages cannot supply bidder spread, contract identity, letting
identity, sample count, contract diversity, or award status. Per-project bid
tabs preserve these facts and must be the primary source if work resumes;
annual averages are reconciliation evidence only.

## Accepted design if resumed

Acquire per-project Division bid tabs statewide, with a mandatory Divisions
8/9/10 subset. Publish statewide statistics only when their threshold is met.
Show the regional subset separately and label insufficient evidence
**insufficient**. Never invent a geographic or public-contract burden
conversion.

FenceScraper v3.0's deterministic core is already proven:

- bid-tab parser: 18/18;
- market benchmark: 6/6;
- ObservedMarket: 8/8;
- division connector: 11/11;
- fixture: 2,700 rows → 1,215 pay items → 6,851 observations.

Parsing is solved. **Source acquisition** remains.

## Section 866/867 permanent-fence join keys

| Item code | Description | Unit | Section |
| --- | --- | --- | --- |
| `3500000000-E` | Woven wire fence, variable fabric | LF | 866 |
| `3503000000-E` | Woven wire fence, 47-inch fabric | LF | 866 |
| `3506000000-E` | 4-inch timber fence posts, variable length | EA | 866 |
| `3509000000-E` | 4-inch timber fence posts, 7'-6\" | EA | 866 |
| `3512000000-E` | 5-inch timber fence posts, variable length | EA | 866 |
| `3515000000-E` | 5-inch timber fence posts, 8'-0\" | EA | 866 |
| `3524000000-E` | Vinyl-coated chain-link fence, variable height | LF | SP |
| `3533000000-E` | Chain-link fence, variable fabric | LF | 866 |
| `3536000000-E` | Chain-link fence, 48-inch fabric | LF | 866 |
| `3539000000-E` | Chain-link metal line posts, variable height | EA | 866 |
| `3542000000-E` | Metal line posts for 48-inch chain link | EA | 866 |
| `3545000000-E` | Chain-link terminal posts, variable height | EA | 866 |
| `3548000000-E` | Terminal posts for 48-inch chain link | EA | 866 |
| `3551000000-E` | Metal gate posts, single chain-link gate | EA | 866 |
| `3554000000-E` | Metal gate posts, double chain-link gate | EA | 866 |
| `3557000000-E` | Additional barbed wire | LF | 866 |
| `3559000000-E` | Variable-strand barbed-wire fence with posts | LF | 866 |
| `3564000000-E` | Single gate, variable dimensions | EA | 866 |
| `3565000000-E` | Double gate, variable dimensions | EA | 866 |
| `3566000000-E` | Woven-wire fence reset | LF | 867 |
| `3569000000-E` | Barbed-wire fence reset | LF | 867 |
| `3572000000-E` | Chain-link fence reset | LF | 867 |

Temporary woven-wire fence, silt fence, safety fence, and guardrail are outside
the permanent-fence benchmark. Fence removal may use contract-specific special
provision items and cannot safely be joined by item code alone.

## Corrected premises

- No FenceScraper v2.5 artifact exists; the repository artifact is
  `archive/FenceScraper v2 4.html`.
- The 2024 Division Bid Averages file is `.xlsx`, not `.xlsm`.
- Sourcewell and OMNIA publish no usable fencing award price lists identified
  by this reconnaissance.

## Owner rulings carried forward verbatim

> **O-8** This track produces MARKET OBSERVATIONS only. It may never write to
> COST_DB, LABOR, MARKUP, or the company rate card. No path, no flag, no
> "deliberate action" escape. Advisory comparison only.
>
> **O-9** No invented burden adjustment. There is no defensible "subtract N%
> for DOT overhead." If a comparison needs one, the comparison is not yet
> supportable — say so instead.
>
> **O-10** Missing evidence stays UNKNOWN. It never becomes zero. This is the
> failure mode the CAD track spent twelve commits eliminating.
>
> **O-11** Market Benchmark Book v1.1 schema stands. Extend only if the source
> requires it; justify any addition.

## Resumption conditions

Reopen only when at least one condition exists:

- a field-capture dataset exists to validate observations against;
- a municipal source with better fence frequency becomes accessible without
  registration; or
- enough calendar time passes for statewide accumulation.

## Carried-forward work

- Non-atomic portable import.
- Matrix route 10 does not price migrated jobs.
- Dead `ADDON_STATE` validation code.
- FenceScraper public-market evidence, deferred under this handoff.
- `S.materials.qty` is persisted as a string; every consumer must coerce it
  explicitly.

## Verification

The documentation-only close was gated with:

```bash
git status --porcelain
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git diff --check
```

- Baseline/regression suite: not run; runtime source did not change.
- New defect tests: none; no implementation was authorized.
- Other validation: Markdown/content inspection and `git diff --check`.
- Worktree status: clean after the documentation commit; `main` synchronized
  with `origin/main` after push.

## Cold-review package

Provide this handoff, `SOURCE_OF_TRUTH.md`, `CLAUDE.md`, and the developer log.
Review priorities are faithful retention of the ratified counts, explicit
market-versus-cost separation, and the absence of runtime/acquisition changes.

## Archive contract

No archive was produced. If later required, use `git archive`; include committed
source only and exclude `.git`, dependencies, caches, secrets, browser profiles,
raw captures, and generated clutter.
