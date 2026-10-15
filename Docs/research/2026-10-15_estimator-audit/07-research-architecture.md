# 07 — Research: Architecture of Reliable Estimating / CPQ Engines, and a Reference Architecture for FenceboundCAD

Date: 2026-10-15. Status: research output (generated AI output, **non-canonical** per CLAUDE.md). Nothing here authorizes
feature work or pricing-value changes. Any adoption needs owner authorization and, for behavior changes, a recorded defect.

Method note: web search was available; direct page fetches to several vendor hosts (martinfowler.com, sage help,
stackct, nebulaconsulting) failed DNS from this sandbox, so some claims rest on search-result extracts of those pages.
Where a claim is my inference rather than a source's, it is marked **(inference)**.

---

## Part A — What the field does

### A1. Construction estimating engines

**RSMeans unit-cost model.** Each line item carries a crew, a *daily output* (units per 8-hour crew-day), *labor-hours
per unit*, a unit of measure, and *bare* material / labor / equipment costs; total bare cost = M + L + E, and O&P is
layered on afterwards. Daily output already absorbs non-installation time (breaks, clean-up). Crew-days = quantity /
daily output; labor-hours = crew-days x crew size x 8. Equipment excludes operator and mob/demob. RSMeans makes no
allowance for overtime. A worked line: crew C-14H, output 45/day, 1.067 LH/unit, $66.50 M + $58.50 L + $0.62 E =
$125.62 bare.
Sources: [MTU CE4333 lab handout](https://pages.mtu.edu/~amlan/ce4333/fall_05/lab1.pdf),
[DOE/Gordian presentation](https://fims.doe.gov/caisinfo/Meetings/2023/Presentations/Gordian.pdf),
[RSMeans: what is construction estimating](https://www.rsmeans.com/resources/what-is-construction-estimating),
[KAIS 2024 poster (worked line)](https://www.kais99.org/jkais/springNfall/spring2024/poster/2024_spring_221.pdf),
[Wiley RSMeans excerpt](https://catalogimages.wiley.com/images/db/pdf/9781118025284.excerpt.pdf).

Lesson for FenceBound: labor should be derived from **production rates** (LF/crew-day by fence type and height,
gates/day, posts/day by soil) times a **crew rate**, not only a flat $/LF. A flat $/LF is a valid *collapsed* production
rate, but it hides the driver that site adjusters (rock, slope) actually modify.

**Sage Estimating (Timberline) assemblies.** The estimator enters *variables* (e.g. length, height, spacing) for an
assembly; the assembly formula computes the assembly quantity and each item's formula or factor computes that item's
quantity. *Item tables* select the concrete item from variable values (e.g. post size by height); "select-at-takeoff"
items prompt the user. Edits are recorded as **passes**: replacing a pass creates a *reversing pass* (qty -1) plus a
replacing pass — an append-only audit of takeoff changes.
Sources: [Sage Estimating help: formulas in assembly takeoff (25.2)](https://help-sageestimating.na.sage.com/en-us/25_2/Content/assembly/UsingFormulasToCalculateItemTakeoffQuantitiesAssemblyTakeoff.htm),
[Cleverence: takeoff templates](https://www.cleverence.com/articles/sage-documentation/creating-a-takeoff-template-sage-4827/),
[Cleverence: building models](https://www.cleverence.com/articles/sage-documentation/building-a-model-sage-estimating-help-5728/),
[Sage community: assemblies course thread](https://communityhub.sage.com/us/sage_construction_and_real_estate/f/sage-estimating/145989/how-to-create-and-maintain-assemblies-in-sage-estimating/384624).

**STACK.** An item's *Item Formula* converts the takeoff variable into the item's **purchase unit**; default is the
coverage rate, and formulas carry waste, e.g. `[MeasuredArea]/5000*(1+([WastePercentage0to100]/100))` to get 500-ft
rolls. Assemblies are bundles of items each with its own formula; estimate-level waste and unit cost are separate.
Sources: [STACK: item formulas in assemblies](https://support.stackct.com/hc/en-us/articles/47345514412307),
[STACK: what is an item](https://support.stackct.com/hc/en-us/articles/47345394808851),
[STACK blog: items & assemblies tips](https://www.stackct.com/blog/mastering-stack-takeoff-estimating-expert-tips-for-using-items-and-assemblies-to-streamline-bids/).

**PlanSwift / Bluebeam.** PlanSwift attaches material and labor assemblies to the takeoff so cost and labor hours
compute as you measure; Bluebeam has no pricing engine and pushes measured totals to Excel via Quantity Link or CSV.
The architectural split is **geometry -> quantities -> priced estimate**, with a clean hand-off object between them.
Sources: [PlanSwift vs Bluebeam](https://www.planswift.com/?p=21618),
[Bluebeam takeoffs](https://www.bluebeam.com/solutions/takeoffs),
[Bluebeam community: export markups to Excel](https://community.bluebeam.com/discussion/4840/how-to-export-markup-values-into-corresponding-ms-excel-cells).

**ProEst / Clear Estimates.** ProEst ships a cost database (own, Costbook, or RSMeans) plus custom assemblies with
formulas; reviewers repeatedly report assemblies as the hardest part to set up — a warning to keep the formula
language tiny. Clear Estimates is a parts library (each part = material cost + labor cost + description) with
templates, refreshed quarterly, localized by area — i.e. a **versioned price book with regional effectivity**.
Sources: [erpresearch: ProEst](https://erpresearch.com/erp-add-ons/construction/proest),
[Capterra: ProEst](https://capterra.com/p/8684/ProEst/),
[IMAGINiT ProEst tutorial](https://resources.imaginit.com/autodesk-forma-formerly-autodesk-construction-cloud/enhance-estimating-precision-with-proest),
[Clear Estimates](https://www.clearestimates.com), [Builder: 12,000 parts](https://www.builderonline.com/?p=27334).

### A2. CPQ engines

**Salesforce CPQ calculation sequence.** Pricing runs on fixed *evaluation events* (On Initialize, Before Calculate,
On Calculate, After Calculate). Within an event, **all conditions are evaluated before any action fires**; ordering
precedence is event > rule Evaluation Order > action order. Internal steps (quantities, prices, proration) sit at
defined points between the rule buckets.
Sources: [Trailhead: sequence price rules](https://trailhead.salesforce.com/content/learn/modules/price-rules-in-salesforce-cpq/sequence-price-rules-for-correct-calculations),
[Scribd CPQ training deck](https://www.scribd.com/document/755603818/CPQ-Level2) (non-official).

**Price waterfall.** Each stage is stored in its own quote-line field: Original/List -> Special (cost-plus, contracted,
option discount) -> Regular (volume) -> Customer (manual discount) -> Partner -> Net. Order is configurable but
explicit. Because every intermediate price is persisted on the line, the final price is self-explaining.
Sources: [Trailhead: partner & distributor discounts](https://trailhead.salesforce.com/content/learn/modules/discounting-tools-in-salesforce-cpq/configure-partner-and-distributor-discounts),
[Nebula: the price waterfall](https://nebulaconsulting.co.uk/insights/salesforce-cpq-the-price-waterfall/),
[Apex Hours: Price Waterfall session](https://www.apexhours.com/price-waterfall/) (video: youtu.be/jpwWp5h-CsM),
[PandaDoc: CPQ price waterfall](https://www.pandadoc.com/blog/cpq-price-waterfall/).

**Price rules / lookup tables / summary variables.** Rules = conditions + actions targeting a named field; lookup
queries price from a table; summary variables aggregate across lines (e.g. total LF) to drive tiering.
Sources: [Apex Hours: price rules & lookup queries](https://www.apexhours.com/price-rules-lookup-queries/),
[Trailhead: summary variables](https://trailhead.salesforce.com/content/learn/modules/price-rules-in-salesforce-cpq/summarize-data-with-summary-variables),
[Grazitti: price rules 101](https://www.grazitti.com/the-101-of-salesforce-cpq-price-rules-key-concepts-explained/).

**Configurator constraints.** Tacton uses a constraint solver; rule-based configurators (e.g. Odoo CPQ modules) check
require / exclude / auto-select rules and **refuse to write an invalid line**.
Sources: [Tacton: constraint solver](https://tacton.com/cpq-blog/supercharge-cpq-constraint-solver),
[ECOSIRE Odoo CPQ](https://ecosire.com/es/apps/odoo/cpq-configure-price-quote-sales).

**Frozen quotes.** Zilliant freezes quote price at configured statuses. Community threads in IFS and QuickBase
document the failure mode of *not* freezing: price-book edits silently re-price old quotes; Salesforce users ask for
notify-and-refresh instead. This is precisely FenceBound's D-1 class and the recorded v6.0 requirement.
Sources: [Zilliant: freeze quote price](https://docs.zilliant.com/docs/freeze-quote-price),
[IFS community: quoted prices change](https://community.ifs.com/alliance-265/quoted-prices-get-changed-if-list-price-is-changed-before-invoicing-22209),
[QuickBase: snapshot field overwritten](https://community.quickbase.com:443/discussions/quickbase-discussions/updating-quotes-being-pulled-from-a-snapshot-field/25197),
[Trailblazer: notify on price book change](https://trailhead.salesforce.com/trailblazer-community/feed/0D54S00000A8DOFSA3).

### A3. Money handling

- **Money pattern (Fowler, PoEAA):** amount + currency as a value object; `allocate(ratios)` splits without losing a
  cent, remainder pennies to the first parts (100.00 / 3 -> 33.34, 33.33, 33.33).
  [Fowler catalog](https://martinfowler.com/eaaCatalog/money.html),
  [dev.to summary](https://dev.to/lepsistemas/what-financial-softwares-martin-fowler-uncle-bob-and-alexander-hamilton-have-in-common-2o21),
  [bigint-money readme](https://cdn.jsdelivr.net/npm/bigint-money@2.0.1/readme.md).
- **Dinero.js:** integer minor units, constructor rejects floats, default rounding half-to-even, explicit
  `roundingMode` on multiply/divide, and a warning that chained rounding loses accuracy; use `allocate` not division.
  [Dinero module docs](https://dinerojs.com/module-dinero), [dinerojs.com](https://dinerojs.com/).
- **Banker's vs half-up; per-line vs total.** Vendors split: Zenoti/Square/Simplicate default half-even; Wafeq
  half-up. Some round per line then sum (Wafeq, TeamConnect); Zenoti rounds once per tax rate at invoice level to avoid
  drift; Simplicate pushes the rounding difference onto the first line. Mitratech documents a real mismatch from
  per-line rounding. The consistent advice: **pick one rule and one level deliberately and test half-cent edges.**
  [Zenoti](https://help.zenoti.com/en/point-of-sale/check-out/rounding-methods-for-accurate-reconciliation-and-regional-compliance.html),
  [Wafeq](https://developer.wafeq.com/reference/calculations-and-rounding),
  [Mitratech](https://success.mitratech.com/TeamConnect/Enterprise_User_Guide/Finance/03_Invoices/Non-US_Tax_Calculations_and_Rounding_in_Invoice_Total_for_TeamConnect_and_Collaborati),
  [Simplicate](https://support.simplicate.nl/en/articles/8036831-rounding-on-invoices),
  [Party Center](https://support.partycentersoftware.com/hc/en-us/articles/235972068).
- Talks: freeCodeCamp "Why computers can't count money" (YouTube, ~6 min, 0.1+0.2 problem)
  ([article](https://www.freecodecamp.org/news/why-computers-can-t-count-money/)); RubyConf 2015 "Mo Money Mo Problems"
  (integers, half-even) ([RubyEvents](https://www.rubyevents.org/talks/mo-money-mo-problems-with-ruby)); RailsConf 2025
  "Precision Pays Off" ([RubyEvents](https://www.rubyevents.org/talks/precision-pays-off-handling-money-in-rails-apps));
  "Death by a Thousand Rounds: PHP Meets Money" (2026) ([phpconference.nl](https://phpconference.nl/death-by-a-thousand-rounds-php-meets-money/));
  "Elixir and Money" ([InfoQ](https://www.infoq.com/presentations/elixir-finance)); blog
  [cs-syd: how to deal with money](https://cs-syd.eu/posts/2020-07-28-how-to-deal-with-money-in-software).

### A4. Versioning, effectivity, audit

- **Effectivity / Temporal Property / Bitemporal history (Fowler):** give price entries an effective date range
  (use a Range object, not loose date pairs) and expose `priceAt(date)`. Bitemporal = "when it was true" plus "when we
  knew it" — needed only for retroactive corrections.
  [Effectivity](https://martinfowler.com/eaaDev/Effectivity.html),
  [Temporal patterns](https://martinfowler.com/eaaDev/timeNarrative.html),
  [Bitemporal history](https://www.martinfowler.com/articles/bitemporal-history.html).
- **Reproducibility:** pin engine version, config version, rounding convention, and source-data hash per artifact;
  derived views must be rebuildable from inputs; re-running *today's* calculator over an old record answers a
  different question.
  [Terra Insight: deterministic reconciliation](https://www.terra-insight.com/insights/deterministic-reconciliation-audit-reproducibility-india/),
  [Gravitee: event sourcing for auditability](https://gravitee.io/corpus/gen-1081/event-computing/event-sourcing-patterns-for-auditability-and-replay-in-distributed-systems.html).

### A5. BOM explosion, UoM, waste

- BOM explosion = parent qty x qty-per, applied level by level; **phantom** assemblies are never stocked and explode
  straight into their children; scrap/waste is set per parent-child link (SAS PROC BOM example: 20% on one link, 10%
  on another).
  [SAS BOM explosion example](https://support.sas.com/documentation/cdl/en/orbomug/63350/HTML/default/orbomug_bom_sect026.htm),
  [Iptor phantom/MRP-break flags](https://r8help.iptor.com/help/mfg/bas202id),
  [Sage 100 bill structure](https://www.cleverence.com/amp/articles/sage-documentation/understanding-a-bills-structure-sage-100-help-4827/).
- **Purchase-pack rounding failure:** Odoo thread — sale UoM "Units", purchase UoM "Pack of 25", order 5 units -> PO
  for **0 packs**, then 0.25 packs after a precision tweak. Lesson: convert to purchase units with an explicit
  `ceil` step, never via generic rounding precision.
  [Odoo forum: UoM conversion issue](https://www.odoo.com/forum/help-1/uom-conversion-bug-224633).
- Fence-specific takeoff: line posts from net run length / spacing, plus corner, end, and gate posts; subtract gate
  widths before fabric; price gates on their own lines.
  [Angi fence calculator](https://www.angi.com/articles/fence-calculator.htm),
  [OnePlan fencing calculator](https://www.oneplan.io/articles/?p=279),
  [Projul fencing templates](https://projul.com/blog/free-fencing-estimate-templates/).

### A6. Testing

- **Characterization / golden master / approval tests** (Feathers): record actual output, approve, fail on drift;
  mask non-deterministic fields. Good for whole-quote outputs (BOM + price + PDF text).
  [Wikipedia](https://en.wikipedia.org/wiki/Characterization_test),
  [understandlegacycode](https://understandlegacycode.com/blog/characterization-tests-or-approval-tests/),
  [golden-master harness](https://github.com/maxbechtold/golden-master).
- **Property-based testing** (fast-check for JS): generate inputs, assert invariants, shrink counterexamples; pricing
  is a named sweet spot. Golden masters pin *what is*; properties pin *what must always be*.
  [fast-check intro](https://fast-check.dev/docs/introduction/),
  [fast-check workshop (price-catalog kata)](https://github.com/intelliware-coe-web/fast-check-workshop),
  [FOSDEM 2025 PBT talk](https://ftp.fau.de/fosdem/2025/ud6215/fosdem-2025-6232-unlocking-the-power-of-property-based-testing.vtt).

Video gap: no strong public YouTube talk on *estimating-engine architecture* turned up; the useful video material is
CPQ waterfall explainers (Apex Hours), money-handling talks above, and vendor training (Sage University
"Database Fundamentals", 16 videos; PlanSwift "parts and assemblies" tutorials).

---

## Part B — What the current FenceboundCAD pricing path looks like (observed, 2026-10-15)

Located by symbol search in `/home/user/FenceBound/index.html` (line numbers are as of this read and will drift):

- `computePricing()` (~L3350): manual + `calcAutoMaterials()` BOM -> per-line material cents -> labor ($/LF by type,
  or crew-hours override) -> site upcharges on cost -> separate material/labor markup -> urban premium -> total.
  It already rounds per line and sums lines ("totals are sums of rounded lines").
- Money helpers (~L3345): `toCents=v=>Math.round(Number(v)*100)`, `centsOf=(unit,qty)=>Math.round(toCents(unit)*qty)`,
  `applyPctC=(c,pct)=>Math.round(c*(100+pct)/100)`.
- Risks observed (not confirmed defects; recorded as observations, not findings):
  1. **Float entry to cents.** In Node, `Math.round(1.005*100)` = 100 (expected 101 half-up); `Math.round(-2.5)` = -2
     (JS rounds half toward +infinity, so negative credits round asymmetrically). Catalog prices stored as dollar
     floats inherit this at the boundary.
  2. **Fuzzy item resolution.** `lookupCost(name)` normalizes the display name and falls back by trimming trailing
     words. A renamed BOM label can silently bind to a different (cheaper/dearer) catalog row.
  3. **Unknown items price at 0** with an `unknown[]` list — consistent with the known "incomplete/zero pricing" open
     integrity defect in CLAUDE.md.
  4. **DOM reads inside pricing.** `computePricing` reads checkboxes (`uc-demo`, `uc-slope`, `uc-urban`, `uc-harddig`,
     `labor-hours`) directly, so the function is not a pure function of a document — hard to golden-test and to
     re-run from a snapshot.
  5. **No purchase-unit stage.** Fabric/top-rail are emitted in LF (`Math.ceil(ft)`), not rolls/sticks; pack rounding
     (if any) lives in names/prices rather than an explicit UoM step.

---

## Part C — Opinionated reference architecture (vanilla JS, single file, no build, localStorage, integer cents)

Guiding stance: **the estimator is a pure, deterministic, versioned function**
`quote = price(takeoff, priceBook, policy, engineVersion)`, and every number on the quote carries the trail that
produced it. Everything below fits in one `<script>` as plain objects plus ~10 pure functions.

### C1. Data model

```js
// Identity: every catalog thing has a stable id; display names are never keys.
Item = {
  id: 'CL-FAB-9GA-72',           // stable SKU-like id, never derived from name
  name: 'Chain Link Fabric 72" 9ga',
  baseUom: 'lf',                 // unit the BOM is computed in
  purchase: { uom: 'roll', size: 50, rounding: 'ceil' },   // pack conversion
  category: 'fabric',            // for sanity bands and reporting
  wastePct: 0                    // default waste, integer basis points preferred (e.g. 300 = 3%)
};

Assembly = {                     // a phantom kit: never priced itself, explodes to items
  id: 'ASM-CL-RUN', version: 3,
  inputs: ['netFt','heightIn','lineCt','termCt','cornerCt','ends','gatePostCt', ...],
  lines: [
    { itemId: 'CL-FAB-9GA-72', qty: v => v.netFt, wasteBp: 300, when: v => true,
      rule: 'fabric = net LF + 3% waste' },
    { itemId: itemTable('LINE-POST', v => v.heightIn), qty: v => v.lineCt, rule: 'one per line post' },
    ...
  ]
};                                // `rule` string is mandatory: it feeds "explain this price"

PriceBook = {                     // the company rate card; immutable once published
  id: 'pb-2026-10-01', version: 7, effectiveFrom: '2026-10-01', supersedes: 6,
  currency: 'USD', status: 'published' | 'draft',
  prices: { 'CL-FAB-9GA-72': { costMills: 1850, per: 'lf' }, ... },  // see C3: mills for sub-cent units
  hash: 'sha256-…'                // of canonical JSON, computed on publish
};

LaborRate     = { crewId: 'C2', hourlyC: 9500, members: 2 };
ProductionRate= { activity: 'install-chainlink', uom: 'lf', perCrewDay: 220,
                  byHeight: {48:260, 72:220, 96:160} };     // RSMeans-style daily output
Adjuster = {                      // site factors and markups, ordered and typed
  id: 'hard-dig', stage: 'cost-labor', kind: 'pct', bp: 3000,   // +30.00% labor cost
  appliesTo: { category: 'labor' }, rule: 'rocky terrain +30% labor' };

PricingPolicy = { version: 2, rounding: 'half-even', roundAt: 'line',
                  markups: { materialBp: 3500, laborBp: 4000 }, minLineC: 1, bands: {...} };

QuoteSnapshot = {                 // frozen, self-contained, never re-priced
  id, createdAt, engineVersion: '5.4.x', policy: {...copy}, priceBookRef: { id, version, hash },
  pricesUsed: { itemId: costMills, ... },      // copy of only the rows used: snapshot survives book deletion
  inputs: { takeoff: {...}, adjusters: [...] }, // everything needed to recompute
  lines: [ QuoteLine ], totals: {...}, inputHash, outputHash, status: 'draft'|'sent'|'accepted'
};

QuoteLine = { lineId, itemId, assemblyId, qtyBase, uomBase, qtyPurchase, uomPurchase,
              unitCostMills, extCostC, markupBp, extPriceC,
              trace: [ {stage:'explode', rule:'one per line post', in:{lineCt:14}, out:14},
                       {stage:'pack', rule:'ceil to 50-ft roll', in:212, out:5}, ... ] };
```

Rules: the **PriceBook store and QuoteSnapshot store are separate localStorage keys**; loading a snapshot never writes
the price book (the recorded v6.0 requirement). Snapshots copy the price rows they used, so they remain reproducible
even if the book is edited or deleted.

### C2. Pricing pipeline (fixed stage order, each stage pure)

| # | Stage | Input -> Output | Notes |
|---|---|---|---|
| 0 | **Gather** | DOM/UI -> `PricingInput` plain object | Only stage allowed to touch the DOM or `S`. Freeze with `structuredClone` + `Object.freeze`. |
| 1 | **Validate input** | `PricingInput` -> errors[] | Finite, non-negative LF; known fence types; gate widths < run; spacing in band. Errors block, not zero. |
| 2 | **Geometry -> takeoff variables** | runs -> `{netFt, lineCt, termCt, ...}` per run | The Bluebeam/PlanSwift hand-off object. Golden-testable on its own. |
| 3 | **Explode assemblies** | variables -> base-UoM item lines | Sage/STACK style item formulas; item tables choose SKU; every line gets a `rule`. |
| 4 | **Waste** | qtyBase -> qtyBase x (1 + wasteBp/10000) | Per assembly-line, like BOM scrap per link. Keep unrounded. |
| 5 | **Aggregate** | merge same `itemId` across runs | Before pack rounding, so two 30-ft runs buy 60 ft, not 2 rolls each **(inference; make it a policy flag if field practice differs)**. |
| 6 | **Purchase-unit conversion** | qtyBase -> qtyPurchase via `ceil(q / size)` | Explicit ceil; the Odoo 0-pack bug is the counterexample. Quantities stay exact rationals until here. |
| 7 | **Resolve price** | itemId -> unit cost from PriceBook(as-of date) | By **id only**. Missing price = hard error listing ids; never 0, never fuzzy fallback. |
| 8 | **Extend cost** | qty x unit -> `extCostC` | Integer math, one rounding (C3). |
| 9 | **Labor** | production rates x crew rate (or $/LF) -> labor lines | Crew-days = qty / perCrewDay; hours override is an explicit adjuster with its own trace. |
| 10 | **Cost adjusters** | ordered list (demo/haul, slope, hard dig) | Typed, ordered by `stage` then `order`, conditions evaluated before actions (CPQ rule semantics). |
| 11 | **Markup / price waterfall** | cost -> list -> discount -> net | Store each intermediate on the line (Salesforce waterfall), so the price explains itself. |
| 12 | **Price adjusters** | urban premium, manual discount, minimum job charge | Applied after markup, ordered. |
| 13 | **Tax (if any)** | per rate at quote level | Round once per rate (Zenoti) to avoid line drift. |
| 14 | **Validate output** | invariants + sanity bands (C4) | Failing invariant = cannot snapshot/send. Bands = warning. |
| 15 | **Snapshot** | freeze to `QuoteSnapshot` with hashes | Only on user action (Save/Send). |

`price()` = `compose(stages 1..14)`; stage 0 and 15 are the only impure edges.

### C3. Rounding policy (opinionated)

1. **Storage:** money as integers. Totals and extensions in **cents**. Catalog *unit* costs in **mills (1/1000 $)** or
   hundredths of a cent, because fence hardware is often sub-cent per unit (wire ties, hog rings) and cent-rounding
   the unit before multiplying by thousands of ties distorts the line. **(inference, but standard in unit-priced
   catalogs)**
2. **Never parse money through a float multiply.** Convert entered strings with a decimal-string parser
   (`"1.005"` -> split on `.` -> integer), not `Math.round(x*100)`; `Math.round(1.005*100)` is 100.
3. **Rounding mode:** one named function, `roundDiv(numer, denom, mode)` on integers (BigInt if a product can exceed
   2^53, which a few thousand units x mills x basis points cannot, but assert it). Default **half-up away from zero**
   for customer-facing quotes (it matches what a contractor checks with a calculator and what accountants expect, per
   the Square complaints); keep **half-even** available as a policy value. Do not use bare `Math.round` (rounds -2.5 to
   -2).
4. **When to round:** exactly once per line extension (`qty x unitMills x (10000+markupBp) / (1000 x 10000 / 100)`
   computed in one integer expression, then rounded to cents). Header totals are **sums of rounded lines** — never
   re-derived from unrounded totals. This is what the app already does for material lines; extend it to everything.
5. **Percentages applied to subtotals** (urban premium, discount) produce *one* rounded amount, and if it must be shown
   per line, distribute with `allocate()` (largest-remainder) so the line amounts sum exactly to it.
6. **Quantities:** exact until stage 6; purchase quantities are integers; labor hours rounded only for display.
7. The policy (mode, level, units) is recorded in every snapshot.

### C4. Invariants (enforced at stage 14 and in tests)

Structural:
- I1 `total === Σ line.extPriceC + Σ adjuster amounts` (exact integer equality).
- I2 Every money field is `Number.isSafeInteger`; every quantity is finite and `>= 0`.
- I3 No line with `qtyPurchase > 0` and `extCostC === 0` unless the item is flagged `free:true`. (No silent $0 lines.)
- I4 No unresolved item ids; no line without a `trace` whose last step names its price-book row.
- I5 `qtyPurchase x packSize >= qtyBase x (1+waste)` and `< that + packSize` (ceil is tight).
- I6 `clientPrice >= cost` per category unless an explicit discount adjuster says otherwise (margin floor).
- I7 Determinism: `price(x)` twice gives byte-identical JSON; `price(snapshot.inputs, snapshot.pricesUsed)` reproduces
  `snapshot.outputHash`.
- I8 Purity: pricing never mutates its input or the price book (freeze inputs in dev/test; deep-equal before/after).

Behavioral (metamorphic):
- M1 **Monotonicity:** adding LF to any run never lowers total; adding a gate never lowers total; raising height never
  lowers material cost.
- M2 **Additivity bound:** two disjoint runs priced together <= priced separately (pack sharing) and >= sum of costs
  without pack rounding.
- M3 **Order independence:** permuting runs or BOM line order does not change totals.
- M4 **Scaling:** doubling every unit price doubles material cost within rounding (± number of lines cents).
- M5 **Markup identity:** markup 0 => price === cost per line.
- M6 **Snapshot isolation:** editing the price book after snapshotting changes neither the snapshot nor its
  recomputed hash; loading a snapshot leaves the price-book key byte-identical.

Sanity bands (warnings, owner-set): $/LF installed per fence type within [p5, p95] of historical jobs; posts per 100 LF
within spacing-implied range; labor share of total within band; any single line > 40% of total flagged.

### C5. Test strategy

1. **Golden fixtures (characterization first).** Before any refactor, record current outputs for a fixture set
   (e.g. 20–40 jobs: each fence type, with/without gates, corners, slope/rock/urban, manual items, legacy-migrated
   jobs, unknown item). Store `{input, bom, lines, totals}` as JSON next to the Playwright tests; diff on every change;
   updates require an explicit approval step and a developer-log note. Mask timestamps/ids.
2. **Hand-computed oracles.** For ~5 fixtures, compute the expected BOM and price by hand (spreadsheet) independent of
   the code — this catches errors a golden master would bless.
3. **Property tests** with fast-check (load the browser bundle from jsDelivr with a pinned version, or vendor it into
   the test harness only, never the app) for I1–I8 and M1–M6 over generated layouts.
4. **Rounding edge table.** Explicit cases: x.xx5 values, 1.005, 0.035, negatives, 0 qty, 1 qty, very large qty,
   0% and 100% markup, pack boundary exact (50.000 ft) and +1e-9.
5. **Red-before-green** per project rules: every new invariant test must first fail on a deliberately broken build or
   a real defect, then pass.
6. **Snapshot replay test:** save, mutate price book, reload, assert snapshot totals and price-book bytes unchanged
   (M6) — the v6.0 requirement as an executable test.
7. **Explain-this-price test:** for every line, rendering the trace reproduces the line amount from its listed inputs
   (the trace is itself checked arithmetic, not prose).

### C6. "Explain this price"

Each `QuoteLine.trace` is an ordered list of `{stage, rule, in, out}`. The UI renders it as e.g.
`Line posts 6' 2-3/8": 14 posts (one per line post, 212 LF / 10 ft spacing - 1 + run ends) x $18.40 (price book v7,
2026-10-01) = $257.60; +35% material markup = $347.76`. Header adjusters show their base and percentage. This is the
CPQ-waterfall idea (persist every intermediate) applied per line, and it doubles as the audit record inside the
snapshot.

### C7. Migration order (smallest justified steps; each needs owner authorization / a defect)

1. Characterization goldens over current `computePricing()` (no behavior change).
2. Extract stage 0 (DOM gather) so pricing is a pure function of a plain object (no behavior change; goldens must not
   move).
3. Replace name-based `lookupCost` with id resolution behind the same outputs (a mapping table name->id first).
4. Turn unknown-item $0 into a blocking validation (behavior change -> needs the existing open defect).
5. Introduce PriceBook versioning + QuoteSnapshot (v6.0 scope; O-5).
6. Purchase-unit stage and production-rate labor (feature work -> owner authorization; must not alter pricing values
   without a decision).
