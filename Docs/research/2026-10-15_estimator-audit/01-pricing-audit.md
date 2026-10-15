# FenceBound pricing estimator audit

- **Date:** 2026-10-15
- **Subject:** `/home/user/FenceBound/index.html` at HEAD `82a148f` (274,181 bytes, 4,429 lines). Line numbers refer to this revision.
- **Mode:** Read-only. No repository files were edited. The probes ran against a scratch copy served from `.../scratchpad/pricing-audit/` in headless Chromium 1194 with Playwright. Each probe started with an empty `localStorage`. The probe scripts are `p1.js`–`p5.js` and `run.js` in that directory, and the raw output is in `p1.out.json` and the console logs.
- **Context read:** `CLAUDE.md`, `Docs/CURRENT_HANDOFF.md`, `CURRENT_STATE.json` (knownDefects), `Docs/execution/INTEGER_CENTS_PRICING_HANDOFF_2026-10-01.md`, `Docs/planning/FenceboundCAD_v5.4.0_deferred_defects.md`.

The report labels each item as **CONFIRMED BUG** (reproduced by running the code, or certain from the code alone, with evidence given), **DESIGN GAP** (behavior works as coded but is missing or inadequate for professional estimating), or **RISK** (plausible but not reproduced).

---

## 1. Architecture map

### 1.1 Data stores (globals)

| Construct | Line | Notes |
|---|---|---|
| `normalizeMatKey(name)` | 1200 | Collapses a BOM name into a cost key. It strips `(...)`, dimensions, sizes and numbers. **Every price lookup depends on it.** |
| `DEFAULT_COST_DB` | 1217 | Seed buy costs `{cost, unit}` keyed by normalized name. `unit` is informational only. |
| `DEFAULT_LABOR` | 1293 | `perLF` by fence type, flat `gate` labor by gate type, and `crewHourlyRate: 55`. |
| `DEFAULT_MARKUP` | 1304 | `{materialPct:35, laborPct:55}`. Markup on cost; margin is derived. |
| `COST_DB / LABOR / MARKUP` | 1307–1309 | Live working copies. |
| `_pricingFromLoadedProject` | 1310 | Provenance guard: blocks `saveCostDB()` while project prices are displayed. |
| `normalizeImportedCosts` | 1337 | Accepts bare-number or `{cost,unit}` costs. Used for the rate card and JSON import, **not** for job load. |
| `readSavedCostDB / mergeSavedCostDB / loadCostDB / reloadSavedCostDB / saveCostDB` | 1345–1388 | Company rate card in `localStorage['fencebound_costdb_v1']`. |
| `lookupCost(name)` | 1390 | Exact key match, then a brace-band alias, then **fallback A** (trims trailing words, minimum 2 words), then **fallback B** (the first key in insertion order where either key is a prefix of the other). |
| `COMPANY` (`DEFAULT_COMPANY`) | 3527 | `depositPct:50`, `validityDays:7`, terms. Device-local and never in job files. |

### 1.2 Quantity side

| Construct | Line | Notes |
|---|---|---|
| `getStats()` | 1487 | Gross LF by type (`fence`, `totalFt`), net LF after gate openings (`netFence`), gate counts, corner and terminal sets. |
| `calcAutoMaterials()` | 1545 | Per-run BOM. Gate items are added at 1700–1711. Lines are merged by `name|unit`. Concrete line names: `Post Concrete (${bagWeightLb}lb bag)` at 1608/1621/1635/1646/1653/1658/1682 and `Gate Post Concrete (...)` at 1710. |
| `S.materials` | — | Manual rows. Quantity is coerced and clamped to ≥0 in `computePricing`. |

### 1.3 Money side

| Stage | Construct and line | What it does |
|---|---|---|
| Money helpers | 3345–3348 | `toCents`, `centsOf(unit,qty)=round(toCents(unit)*qty)`, `applyPctC`, `dollars`. |
| 1. Material cost | `computePricing` 3350, 3367–3375 | Each BOM line is priced as `lookupCost(name)` × qty in cents. If the lookup returns `null`, the line is marked `unknown` with ext 0. |
| 2. Labor cost | 3378–3393 | Either crew hours × `crewHourlyRate` (replaces **all** labor, gates included) or `LABOR.perLF[type]` × net LF plus `LABOR.gate[type]` × count. |
| 3. Site upcharges | 3395–3401 | Demo at **300¢/LF** of gross LF (hardcoded) is added to material cost. Slope at **50¢/LF** (hardcoded) and Hard Dig at **+30% of labor** (hardcoded) are added to labor cost. The flags come from DOM checkboxes `uc-*`. |
| 4. Client price | 3403–3418 | Material lines get per-line `round(unitC·qty·(1+m))`. Demo is marked up at the material rate. Labor gets `applyPctC(laborC, laborPct)`. Urban adds **+15% of client subtotal** (hardcoded). |
| 5. Margin | 3421–3423 | `profit/clientTotal`. If `clientTotal ≤ 0`, the margin reads 0. |
| Readiness | 3434–3436 | `isFinalReady = no unknown && every unitCost !== 0`. |
| Panel renderer | `updatePricing` 3442 | Has a cost view and a client view. The client view allocates **`clientTotal` × (type LF / total LF)** (3469). The deposit is computed as a float (3504). |
| Validation | `validateProject` 3975, pricing at 4036–4045 | Errors: `MISSING_COST`, `ZERO_COST`, `TOTAL_INVALID`, `NO_BOM`, `PRICING_RUNTIME`. Warning: `LOW_MARGIN` below 15%. Validation never blocks export; the PDF gets a "NOT FULLY VERIFIED" banner instead. |
| Estimate PDF | `exportEstimatePDF` 4142 | One line per fence type at a blended `clientPerLF = (clientSubtotal − manual)/totalFt` (4162). Manual lines are listed separately. Gates appear as "Included", urban as its own line. Total and deposit are rounded to whole dollars (`toFixed(0)`) (4283, 4288). Validity is `Date.now() + validityDays`. |
| CAD PDF | `exportPDF` 2692 | Quantities only, no money. |

### 1.4 Persistence and import of prices

| Path | Line | Behavior |
|---|---|---|
| `snapshotState()` (jobs, autosave, export) | 815 | Embeds the full `COST_DB`, `LABOR`, `MARKUP`, `FOOTING`, post OD and embed values. It does **not** save the upcharge flags, labor-hours override, computed totals, quote date or validity. |
| `applyState()` (job load, job import, boot restore) | 824, 853–858 | `COST_DB={...COST_DB,...st.costs}` with **no normalization or type checks**. Sets the provenance flag only if costs, labor or markup exist. `FOOTING`, post OD and embed are merged globally without the flag. |
| Cost editor Save | 3885 | Accepts any finite number: negative costs, negative labor, any markup. |
| JSON price import | 3947 | Merges and writes the rate card with no provenance confirm (already a known defect). Markup and labor are not type-checked. |
| CSV import | 3692–3776 | Auto-guesses columns. `csvParseMoney` 3713. Rows are keyed by `normalizeMatKey`. Duplicates resolve to "keep highest". |
| Backup restore | 3640–3670 | Uses `mergeSavedCostDB` for prices. |

### 1.5 Full flow

```
drawing (S.elements)
  → getStats() LF/gates
  → calcAutoMaterials() names+qty (+ S.materials)
  → lookupCost(normalizeMatKey(name))   ← fuzzy, unit-blind, size-blind
  → line ext cents (unit rounded to ¢ first)
  → Σ matCost + demo$3/LF
  → labor $/LF×netLF + gate flat  |  hours×rate
  → +slope $0.50/LF, +30% hard dig
  → client: per-line ×(1+mat%) + demo×(1+mat%) + labor×(1+lab%)
  → +15% urban
  → clientTotal (NO tax, NO discount, NO minimum, NO contingency/overhead)
  → panel (proportional by LF) / PDF (blended $/LF by LF, whole dollars) / deposit float
```

There is only one pricing engine (`computePricing`). No price-first (per-LF sell price) path exists in the runtime, which is the D6 gap. There are, however, **two client-facing allocation renderers that disagree** (finding F7).

---

## 2. Findings

### F1 — CONFIRMED BUG, **Critical**: every concrete bag is priced as a post. The concrete rate-card entry is dead.

- **Mechanism.** `normalizeMatKey('Post Concrete (60lb bag)')` returns `'post concrete'`. No exact key exists, because the seed key is `'post concrete bag'`. Fallback A tries `'post concrete'` and stops at 2 words. Fallback B then iterates keys in insertion order and tests `k.startsWith(dbk+' ')`. Since `'post'` (the wood 4x4 post, $11.00) is inserted before `'post concrete bag'`, it matches first.
- `'Gate Post Concrete (60lb bag)'` becomes `'gate post concrete'`. Fallback A then matches **`'gate post'` at $24.00/bag**.
- **Repro** (probe `concrete_edit_ignored`):
  - With seed prices, `Post Concrete` is $11 and `Gate Post Concrete` is $24.
  - Setting `COST_DB['post concrete bag'].cost=99` changes nothing.
  - Setting `COST_DB['post'].cost=1` and `COST_DB['gate post'].cost=2` changes the concrete prices to $1 and $2.
- **Impact** (probe `concrete_impact`, seed prices, overstatement of client price):

  | Job | Overstated by |
  |---|---|
  | 150 LF 6 ft chain link, 1 walk gate | +$118.80 |
  | 150 LF wood privacy | +$276.75 |
  | 150 LF vinyl privacy | +$276.75 |
  | 120 LF ornamental, 2 gates | +$322.65 |

  - A contractor who enters a supplier price for concrete sees no effect.
  - Editing the wood post price silently re-prices concrete on chain-link, vinyl and ornamental jobs.
  - Editing the gate post price re-prices gate concrete.
- **Baseline consequence.** The R15 regression baseline already embeds this misresolution. `tests/persistence-integrity.spec.js:477` records 34092 → 31122 cents for −2 bags, which is 1485¢ per bag = $11 × 1.35. So the owner-ratified R15 = 31122 includes concrete at the wood-post price. A fix moves R15, and the owner should be told why.
- **History.** The defect predates `e2f11e2`. The old name `'Post Concrete (80lb bag)'` normalized the same way.

### F2 — CONFIRMED BUG, **High**: fuzzy `lookupCost` fallbacks silently price unrelated items, and the job still reports FINAL-READY

- **Manual rows** (probe `unknown_material_manual`):
  - `"Line Post Cap Special"` resolves to `line post` at $9.50.
  - `"Post Hole Digger Rental"` resolves to `post` at $11.00.
  - Neither is flagged. Only names with no prefix overlap at all (for example `"Privacy Slats"`) become `MISSING_COST`.
- **Auto-BOM rows that borrow another item's price:**
  - `Truss Rod` → `truss rod w tightener` (already known).
  - `Rail End (Loop Cap)` → `rail end loop cap` (benign).
  - The concrete rows in F1.
- **Cross-material collisions from key collapse (also confirmed):**
  - Wood `2x4 Top Rail` and `2x4 Mid Rail` resolve to chain-link `top rail` / `mid rail` at $1.85/lf.
  - Chain-link `Bottom Rail 1-5/8"` resolves to `bottom rail` at **$4.20**, which is the wood 2x4 seed.
  - Each pair shares one key, so a contractor cannot set a chain-link rail price and a wood rail price independently.
- **Why it matters.** Nothing in the UI, validation or PDF says which rate-card entry priced a line. The cost view shows only the unit price, not the matched key.

### F3 — CONFIRMED BUG, **High**: legacy or bare-number job costs give `NaN` material cost, the lines drop out of the client price, and the job still validates and shows FINAL-READY

- **Mechanism.** `applyState` (855) merges `st.costs` without `normalizeImportedCosts`. A value like `{'chain link fabric': 3.2}` makes `COST_DB[k]` a number, so `COST_DB[k].cost` is `undefined`. `toCents(undefined)` is `NaN`, so `matCost` becomes `NaN`. The client extension `NaN||0` becomes 0, so those lines vanish from the client price.
- `isFinalReady` checks `unitCost!==0`, and `NaN!==0`, so the job passes.
- **Repro** (probes `legacy_bare_number_job`, `nan_display`):
  - Validation errors: `[]`.
  - Panel shows: `Internal cost $NaN … Profit $NaN … CLIENT PRICE $1,629 … MARGIN NaN% … FINAL-READY`.
  - The fabric (≈$432 client) is missing from the total.
- **Scope.** Reachable through job-file import (2959: only `app` and `elements` are checked), saved jobs, and autosave. `normalizeImportedCosts` exists precisely because the legacy Rate Card used bare numbers. This is a concrete instance of the known "unknown legacy types may produce incomplete or zero pricing" defect, with a validation hole: there is no `Number.isFinite` check on `unitCost` or `matCost`.

### F4 — CONFIRMED BUG, **High**: a markup stored as a string multiplies prices about 70×

- **Mechanism.** `applyPctC(c,pct)` computes `c*(100+pct)/100`. With `pct='35'` the result is `c*"10035"/100`, a factor of 100.35.
- **Repro** (`markup_string`): `mergeSavedCostDB({markup:{materialPct:'35',laborPct:'55'}})` turns a $2,492.25 client total into **$174,520.59**, with margin 99.0%.
- **Reachable through:**
  - JSON price import (3954, no coercion).
  - Backup restore (`mergeSavedCostDB`).
  - Job load (`applyState` 857).
  - Saved rate card.
- The cost editor itself always stores numbers. String labor values are harmless because `Number()` coerces them in `centsOf`.
- No validation catches this. A huge total with a 99% margin passes every check.

### F5 — CONFIRMED BUG, **High**: viewing an old job leaves its prices live for the next quote, with no indicator

- **Mechanism.** Loading a job merges that job's costs, labor and markup into the globals. "Clear" (2983) only empties elements, and there is no "new job" action that restores the company rate card.
- **Repro** (`load_old_job_then_clear`): load a job carrying 50% costs and 10% markups, then clear and draw a fresh 100 LF chain link run. The fresh quote prices at **$1,168.72 instead of $2,061.06**.
- `_pricingFromLoadedProject` is true, but the only visible effect is a `confirm()` inside the cost editor. The Pricing tab shows no badge, and `seed-price-note` stays hidden.
- This also contradicts the spirit of the v6.0 requirement: the company rate card should be what new work is priced from.

### F6 — CONFIRMED BUG, **High**: site upcharges and the labor-hours override are not saved with the job and leak between jobs

- `uc-demo`, `uc-slope`, `uc-urban`, `uc-harddig` and `labor-hours` are DOM-only state. They are referenced only at 2941, 3075 and 3359–3363 (and the PDF at 4154).
- `snapshotState()` contains none of them (probe `upcharges_not_persisted`).
- **Consequences:**
  1. A saved or exported job reopens at a different price than the one quoted. For example, a 100 LF chain-link job with a walk gate and all four upcharges on is quoted at $3,812.40 and reopens at $2,492.25.
  2. `applyState` never resets the checkboxes, so job B inherits job A's demo, urban or hours flags.
  3. Changing a spec's grade (3075) auto-checks the global slope box.

### F7 — CONFIRMED BUG, **High**: client-facing per-section prices are blended by length, and the panel and PDF disagree with each other

- **PDF** (4162, 4229–4245): every fence type is shown at the same `$/LF`, which is the whole job's subtotal divided by gross LF.
- **Panel client view** (3469): allocates `clientTotal`, which includes the urban premium and manual materials, by length.
- **Repro** (`client_view_breakdown_mix`): 100 LF chain link plus 50 LF ornamental.
  - Each section shown separately: chain link alone $2,061, ornamental alone $2,120.
  - The blended display shows chain link $2,787 and ornamental $1,394.
  - The ornamental section is understated by about 34% on the customer document.
- **Repro** (`panel_vs_pdf`, with urban and manual rows): the panel shows Chain Link $4,036 while the PDF shows $3,319 for the same job and the same section.
- **Why it matters.** Customers routinely say "drop the ornamental section". The document then implies a reduction of $1,394 when the true reduction is about $2,120, so the contractor either loses money or has to argue. Demo cost is also folded invisibly into every section's $/LF.

### F8 — CONFIRMED BUG, **Medium**: CSV money parsing mangles comma decimals and cent notation

`csvParseMoney` (3713) strips commas unconditionally, even though `csvDetectDelimiter` deliberately supports `;` files, which are common with comma-decimal locales.

| Input | Parsed as |
|---|---|
| `"12,50"` | **1250** |
| `"0,85"` | 85 |
| `"€3,20"` | 320 |
| `"1.234,56"` | 1.23456 |
| `"45¢"` | 45 |
| `"3.20 per 100"` | 3.201 |

The preview does show the values, but nothing flags implausible ones, and the 1,000,000 ceiling is far too loose to catch them.

### F9 — CONFIRMED BUG, **Medium**: pricing is unit-blind, so a pack or box price becomes a per-each price

- `lookupCost` returns only `cost`. The BOM unit and the rate-card unit are never compared, and CSV maps `pack → ea`.
- **Repro** (`unit_mismatch`): CSV row `Wire Ties 9ga (bag of 100), 9.00, PACK` gives 77 ties at **$9.00 each = $693**. Validation reports no errors and no warnings.
- The same import's `Chain Link Fabric 4' x 50' Roll, 160, ROLL` became a **new orphan key** (`chain link fabric roll`), so the BOM kept the $3.20 seed. The contractor believes fabric was imported, but it was not, and nothing says so.

### F10 — CONFIRMED BUG, **Medium**: sub-cent unit costs are rounded before multiplying

- `centsOf` rounds the unit to cents, then multiplies by quantity (3346).
- Wire ties at $0.014 × 74 compute to $0.74; the true cost is $1.04 (−29%).
- At $0.004, the line goes to $0.00 and is reported as `ZERO_COST`, which blocks FINAL-READY even though the cost is real.
- The "Add a material" row also rounds to cents.
- Fasteners are routinely priced at $0.01–$0.05 per piece, or per 100/1000, so this error compounds on large jobs.

### F11 — CONFIRMED BUG, **Medium**: no lower-bound validation on rate inputs

- Cost editor Save (3885–3893) accepts a negative material cost, negative labor $/LF and any markup. Repro `markup_input_validation`: −5, −7 and −90% were all stored.
- A negative fabric cost (`neg_cost`) gives `isFinalReady:true` and **zero validation errors**.
- A markup of −150% is caught only by `TOTAL_INVALID`.
- A markup that pushes the price below cost raises only the `LOW_MARGIN` warning, and the margin readout clamps negative totals to "0.0%".

### F12 — CONFIRMED BUG, **Medium**: hardcoded upcharge rates contradict the "contractors set prices" ruling

- Demo is $3.00/LF of cost (3397). Slope is $0.50/LF (3398). Hard dig is +30% of labor (3399). Urban is +15% (3417).
- None of these appear in the rate card or cost editor.
- Demo and slope are charged on **gross LF across all runs**, including gate openings and level runs. Repro `slope_per_run`: one 10 ft steep run charges slope on all 110 ft.
- On the PDF, hard dig appears as "Included", and demo and grade appear only as a suffix on the section label.

### F13 — CONFIRMED BUG, **Medium**: hours override replaces gate labor as well

- When `labor-hours` is set, the per-gate install labor disappears (`hours_override_drops_gate_labor`: $732 of labor becomes $27.50 at 0.5 h).
- The UI text says hours replace "per-type $/LF labor", which does not suggest that gate labor goes too.
- With an empty drawing and hours set, `hasData` is true and the total is $852.50. The PDF would show the total with **no line items** because `clientPerLF=0` when `totalFt=0`.

### F14 — CONFIRMED BUG, **Medium**: project FOOTING, post OD and embed values bypass the provenance guard

- `applyState` merges `st.footing`, `st.postODIn` and `st.postEmbedIn` into the globals but sets the flag only for costs, labor or markup.
- Repro `footing_bypass_guard`: a job with only footing loads, `saveCostDB()` succeeds, and the stored rate-card `bagsByDepthIn` is overwritten (all 9s).
- Loading any job therefore also changes concrete quantities on later jobs.

### F15 — CONFIRMED BUG, **Medium**: the CSV import and cost-editor Save paths write project prices into the rate card

- After a project load, confirming either dialog writes the whole merged `COST_DB`, including the project's values for keys that were not in the CSV, to the company rate card.
- The dialog wording ("Importing will replace your company rate card") understates this. It is guarded by a `confirm()`, but it still violates the v6.0 store separation. The JSON-import case is already a known defect.

### F16 — CONFIRMED, **Low**: the displayed rounding does not reconcile

- PDF section lines, the total and the deposit are each `toFixed(0)`'d independently. Repro `pdf_lines_sum`: lines sum to $7,833.47 against a displayed total of $7,834.
- The deposit is a float (`1246.125`) rounded at display.
- Manual-line `clientUnitCost × qty ≠ clientExt` by a few cents, because the extension is computed from the unrounded unit (`clientUnit_vs_ext`).
- The PDF total has no thousands separator.

### F17 — DESIGN GAP, **High**: prices ignore size, height and gauge

- `normalizeMatKey` strips every dimension, so the price is the same for:
  - chain-link fabric at 48", 72" and 96";
  - line posts of any length or OD (`height_ignored`: identical $9.50 at 9′ and 9.5′);
  - 1x4 and 1x6 pickets at any height;
  - vinyl panels at 48" and 72".
- Gates cost the same at any width and in any fence material (`gate_size_agnostic`: a 4 ft and a 6 ft walk gate, chain link, ornamental or vinyl, are all $145; double drive is $420 at 12 ft or 20 ft).
- CSV import collapses supplier SKUs to one key and keeps the highest price (`csv_collapse`: 1-5/8" and 2-3/8" line posts both become `line post` at $18).
- Labor is also height-independent: 48", 72" and 96" chain link all give $700 labor.
- The quantity engine distinguishes these items carefully. The price engine then discards the distinction.

### F18 — DESIGN GAP, **High**: there is no frozen quote snapshot

- The job stores raw rate inputs, not the quoted result. It does not store line prices, totals, upcharge flags, hours, tax, quote number, issue date or expiry.
- PDF validity is computed from `Date.now()` at each export, so regenerating a PDF silently extends the quote.
- This is the core of the v6.0 requirement and is not yet met.

### F19 — DESIGN GAP, **Medium**: the labor model is not derived from anything physical

- Labor is a flat $/LF by type plus a flat amount per gate, or a manually typed hours figure.
- No term depends on post count, hole depth or diameter, concrete volume, height, terrain, crew size or production rates.
- `LABOR.perLF.barbedwire` is unused because there is no such fence type.
- A labor rate of 0 is not flagged.

---

## 3. Missing compared with a professional fence estimator

| Capability | Status in runtime |
|---|---|
| Labor model (crew size × production rate × hours, per-post or per-hole drivers) | **Missing.** Flat $/LF or a manual hours figure (F19). |
| Overhead recovery (burden %, truck/fuel, insurance) | **Missing.** No line or percentage. |
| Margin targets (enter target margin and solve for price, per category) | **Missing.** Markup only. The margin readout is derived. The 15% low-margin threshold and the 40/25 color bands are hardcoded. No price-first, D6-style method. |
| Contingency | **Missing.** |
| Minimum job charge or mobilization | **Missing.** Small jobs can price below cost of mobilization. |
| Terrain, soil and slope adjusters | **Partial.** Global hardcoded booleans: slope $0.50/LF, hard dig +30%. Not per run, not editable, not graded by percent slope even though `slopePercent` exists in specs (F12). |
| Removal and haul | **Partial.** Hardcoded $3/LF, applied to all LF. No per-type removal, disposal or dump fees, partial-run demo, or concrete-footing removal. |
| Permits and surveys | **Missing.** Terms text puts permits on the client. No permit fee line. |
| Equipment rental (auger, skid steer, core drill) | **Missing.** A manual row would also be fuzzy-matched to something else (F2). |
| Delivery or freight | **Missing.** |
| Sales tax rules (materials-only vs. all, per-jurisdiction rate, tax-exempt customer, use tax on contractor-purchased materials) | **Missing entirely.** No tax anywhere in the code. |
| Discounts (percent or fixed, line or job level) | **Missing.** |
| Deposit schedule (milestones, progress payments, retainage) | **Partial.** A single deposit percent, float math, display only. |
| Good/better/best options and alternates | **Missing.** One price per job. Per-section client prices are not truthful (F7). |
| Quote expiry and versioning (quote number, revisions, frozen issue date) | **Partial.** The validity date is recomputed at every export (F18). |
| Price snapshot (frozen quoted price separate from the rate card) | **Missing.** The v6.0 requirement is not implemented (F5, F6, F18). |
| Size- and grade-aware material pricing (height, gauge, OD, length, gate width) | **Missing** (F17). |
| Unit-of-measure conversion (box, roll, bundle to each or LF) | **Missing** (F9). |
| Price source transparency (which rate-card key priced a line; stale-price age; supplier and date) | **Missing** (F2). Prices carry no date or supplier. |
| Waste and overage factors | **Not found.** No waste multiplier on fabric, rails or pickets. `Math.ceil` per run is the only rounding-up. |
| Change orders | **Missing.** Terms text only. |

---

## 4. Confirmed bugs vs. design gaps

**Confirmed bugs (reproduced or certain from code):**

| ID | Severity | Summary |
|---|---|---|
| F1 | Critical | Concrete priced as wood post or gate post; concrete key dead; R15 baseline embeds it. |
| F2 | High | Fuzzy fallback misprices unrelated items silently; rail keys collide across materials. |
| F3 | High | Bare-number job costs give NaN, lines vanish, FINAL-READY with zero errors. |
| F4 | High | String markup gives a ~70× total with no validation catch. |
| F5 | High | Loaded-job prices persist into the next new quote with no visible indicator. |
| F6 | High | Upcharges and hours are not persisted and leak across jobs. |
| F7 | High | Blended per-section client prices; panel and PDF disagree. |
| F8 | Medium | CSV comma-decimal and ¢ misparse. |
| F9 | Medium | Unit-blind pricing; orphan keys from CSV are silent. |
| F10 | Medium | Sub-cent unit rounding. |
| F11 | Medium | Negative or absurd rates accepted; negative cost passes validation. |
| F12 | Medium | Hardcoded upcharge rates applied to gross LF of all runs. |
| F13 | Medium | Hours override drops gate labor; labor-only total with no PDF lines. |
| F14 | Medium | Footing, OD and embed bypass the provenance guard. |
| F15 | Medium | CSV and Save confirm paths write project prices into the rate card. |
| F16 | Low | Display rounding does not reconcile. |

**Design gaps (behavior as coded, inadequate for professional estimating):** F17 (size and height-blind prices), F18 (no quote snapshot), F19 (non-physical labor), and everything in section 3.

**Risks, not reproduced:** fallback B depends on `COST_DB` insertion order. Saved rate cards and CSV additions change that order, so the same BOM name could resolve to different keys on different devices.

**Checked and correct:**
- Markup and margin arithmetic: margin = profit / client total, and the editor's explanation ("50% markup = 33% margin") is right.
- Demo is now marked up and included in the client price (the integer-cents repair holds).
- Per-line cents are deterministic.
- Manual quantities are clamped to ≥0.
- Unknown fence or gate types raise validation errors.
- Pricing is recomputed live from the drawing, so there are no stale cached prices.
