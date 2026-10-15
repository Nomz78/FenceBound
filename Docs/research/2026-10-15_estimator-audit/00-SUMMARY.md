# FenceBound estimator deep audit — 2026-10-15

**Classification:** research and audit evidence. **Not canonical.** Generated AI output; source
and accepted tests win where they disagree. No runtime, test or pricing value was changed by this
audit. Every finding below is a recommendation until the owner rules on it.

Audited runtime: `index.html` at `82a148f` (application 5.4.0, schema 3).

## How this was produced

Seven parallel agents, each writing one report in this folder:

| Report | Scope | Method |
|---|---|---|
| `01-pricing-audit.md` | Pricing engine, rate card, markup, persistence of prices | Code trace + headless-Chromium probes |
| `02-inventory-takeoff-audit.md` | BOM and takeoff for every fence type | Ran the real takeoff on 100 LF + 4 ft walk + 12 ft double drive per type, hand-checked |
| `03-cad-audit.md` | Drawing, gates, posts, undo, save/load, touch | Drove the app with real mouse/touch input, 16 screenshots (not committed) |
| `05-research-software.md` | ~30 commercial fence estimators, 11 demo videos | Web search (vendor pages were proxy-blocked; claims rest on search extracts) |
| `06-research-methodology.md` | How fence contractors take off, labor-rate and price jobs; NC tax | Web search with confidence tiers A–D |
| `07-research-architecture.md` | How reliable estimating/CPQ engines are built | Web search + reference architecture |

Test baseline: see "Verification" in the handoff
`Docs/execution/ESTIMATOR_DEEP_AUDIT_HANDOFF_2026-10-15.md`.

Repro scripts are in `repro/`. They hardcode this cloud container's paths
(`/opt/pw-browsers/...`, port 8765) and the CAD scripts write screenshots next to themselves:
**copy `repro/` and `index.html` outside the working tree before running them.**

## Why it keeps not getting finished

These are the root causes behind most of the ~55 confirmed bugs, not individual defects:

1. **Prices are found by matching display names, not by item IDs.** `lookupCost`
   (`index.html`, symbol search) normalizes the BOM line's text and, when there is no exact key,
   trims words or accepts any rate-card key that is a prefix. "Post Concrete (60lb bag)" resolves to
   `post` ($11) because `post` precedes `post concrete bag` ($6.50). Wood rails and chain-link rails
   share keys. Any renamed line can silently pick up another item's price, and the result depends on
   rate-card insertion order. This one design choice produces F1, F2 and inventory F-1/F-2.
2. **Job state is spread across globals and DOM controls instead of one job object.** Pricing reads
   checkboxes and inputs directly, so upcharges, hours and loaded-job prices are not saved with the job
   and leak into the next one (F5, F6, CAD-12, inventory F-6).
3. **Gates and posts are not attached to the runs they belong to.** A gate binds to the nearest run at
   any distance; moving or deleting a run leaves gates/posts behind; gate end posts double-count with
   run end posts (CAD-02…05, inventory F-11/F-13).
4. **No boundary validation.** Strings, negatives and legacy shapes reach the arithmetic: NaN drops
   lines while the panel says FINAL-READY; a markup stored as `"35"` multiplies the total ~70×.
5. **Test coverage is chain-link only.** The R15 golden total already embeds the concrete
   mis-pricing, so the suite has been certifying a wrong number.
6. **The engine is being grown rule-by-rule** (field rulings on ties, bands, depths) without the
   underlying model a professional estimator has: item catalog with units and pack sizes, versioned
   price book, labor from production rates, overhead/margin/tax policy, and a frozen quote.

## Confirmed bugs, merged across the three audits and ranked

IDs: `F` = pricing report, `I-F` = inventory report, `CAD` = CAD report.

### Tier 1 — wrong money on ordinary jobs (fix first)

| # | Bug | Sources |
|---|---|---|
| 1 | Concrete priced as wood post / gate post; concrete rate-card entry is dead. ~$119–$323 over per job at seed prices. **R15 (31122) embeds it.** | F1, I-F-1 (verified by hand at `index.html` `lookupCost`) |
| 2 | Fuzzy price fallback prices unrelated items; rail and brace-band keys collide across materials | F2, I-F-2 |
| 3 | Gate at a run end (or adjacent gates) buys the post twice and doubles end hardware/concrete | CAD-02, I-F-13 |
| 4 | Gate not on the fence (20 ft away, across, stacked, longer than run) still deducts LF and is priced | CAD-03 |
| 5 | Moving or deleting a run orphans its gates/posts; orphans still priced | CAD-04, CAD-05 |
| 6 | Bare-number legacy costs → NaN, lines vanish from client price, still FINAL-READY | F3 |
| 7 | Markup stored as string → ~70× total, no validation | F4 |
| 8 | Loaded job's prices persist into the next new quote; upcharges/hours not saved and leak | F5, F6 |
| 9 | Escape during Move drag erases the run's add-ons (barbed/bottom wire) | CAD-01 |
| 10 | Undo after loading a job mixes Job B's drawing with Job A's name; Save then overwrites Job A | CAD-12 |
| 11 | Client-facing per-section prices are length-blended; panel and PDF disagree | F7 |

### Tier 2 — wrong quantities in specific cases

- Panel counts rounded per run instead of per section between gates (vinyl 11 vs 12, ornamental 14 vs 15, temporary) — I-F-3/4
- Vinyl split rail: rails per 8 ft, posts per 10 ft (26 rails vs 20) — I-F
- Concrete goes to 0 for any depth not 24/30/36/42" (legacy 28") with no warning — I-F-9
- Line posts not re-spaced around gates (1–2 ft bays; the 168 LF fixture leaves a post in the drive opening) — I-F-11
- Manual (Post tool) posts not counted or priced; auto-posts off → zero line posts, no warning — I-F-14, CAD
- Gate hardware/posts are chain-link pipe for every fence type; temporary panels get gate concrete — I-F
- Cattle fence + barbed add-on doubles strands — I-F
- Switching fence type and back silently turns off top rail/bottom wire for later runs — I-F-6
- Collinear 30+30 vs one 60 ft run prices differently (joint priced as an end post) — CAD-06, needs owner rule
- Footage drift: each run rounded up separately (42 ft shown, 44 ft fabric ordered) — CAD
- Manual-material units ignored (1 roll = 1 LF); quantities stored as strings — I-F, F9

### Tier 3 — input robustness and display

CSV money parsing (`12,50` → $1250, `45¢` → $45), sub-cent costs rounded before multiplying,
negative costs accepted, hours override drops gate labor, footing/OD/embed bypass the provenance guard,
CSV/Save paths write project prices to the rate card, displayed dollars don't sum, mouse-up outside
canvas leaves a stuck rubber band, wheel zoom not cursor-anchored, angle lock can't close a loop,
dragging a corner disconnects runs, second "Untitled Job" overwrites the first, 78 px canvas on phones.
Full list with repro steps in reports 01–03.

## Design gaps against a professional estimator (feature work — owner authorization required)

Every commercial leader surveyed (Fence Cloud, ArcSite, Visual Fence Pro, Jobber, ServiceTitan…)
has: assemblies → itemized BOM → price book → labor rules → markup/margin → tax → proposal with
deposit and expiry → material order. FenceBound has the first two partly, and is missing:

- **Item catalog with stable IDs, units and pack sizes** (50 ft fabric rolls, 21 ft rail sticks,
  boxed ties) and round-up-to-purchasable-unit; waste factors.
- **Versioned price book and a frozen quote snapshot** (the recorded v6.0 requirement). No surveyed
  vendor documents this publicly — it is a real differentiator, and it fixes the F5/F6/D-1 class.
- **Labor from physical drivers** (per post / per hole / per LF / per gate × production rate × loaded
  crew rate) with per-run adjusters (rock, roots, slope, hand-dig, access, removal/haul). Today: flat
  $/LF or typed hours, and hardcoded $3/LF demo, $0.50/LF slope, +30% hard dig, +15% urban — which
  contradict "contractors set prices".
- **Overhead, target margin (price = cost ÷ (1 − margin)), contingency, minimum job charge**,
  margin-floor warning.
- **Sales tax: none in the code.** NC separates capital-improvement work (contractor pays tax on
  materials, customer charged none) from repair/maintenance/installation work (tax on the full price).
  Whether a fence replacement falls in the second class is an inference from report 06 and **must be
  confirmed with a CPA or NC DOR** before any tax logic is built. Design need: a per-job tax mode plus
  county rates as data.
- **Quote lifecycle:** quote number and revisions, fixed issue/expiry date (today recomputed each
  export), deposit schedule, good/better/best options, change orders.
- **Validation sanity bands** (installed $/LF per type, report 06 §5) and "explain this price"
  traceability per line.
- **CAD:** continuous polyline drawing with shared vertices, typed lengths/angles, gate presets that
  snap onto a run, house/wall termination element, slope affecting lengths, equal-bay spacing,
  aerial-image tracing with scale calibration, phone layout.

## Recommended path to finished

### Step 0 — owner rulings (blocking; each is quick)

1. **Approve a new R15.** Fixing concrete pricing will move the ratified 31122-cent baseline.
2. Is a collinear joint between two runs a pull/line post or an end post? (CAD-06)
3. Line-post concrete: authority says 1 bag (2 at 8 ft+); code and log say none. Which?
4. Residential post stock lengths (already the open next task).
5. Truss rods on non-corner end posts; sleeves (1 per 10 ft) and carriage-bolt counts.
6. Should demo, slope, hard-dig and urban adders become contractor-editable rate-card entries?
   (Recommended: yes — consistent with "FenceBound doesn't set prices".)
7. Authorize the engine rebuild below as v6.0 feature work, or keep to defect repairs only.
8. NC tax treatment — get the CPA/DOR answer.

### Step 1 — defect repairs (allowed now under current rules; red-before test each)

Order chosen so each repair is small and the next one builds on it:

1. **Exact-key pricing.** Give every BOM line a stable item key; `lookupCost` matches exactly; an
   unknown item is a validation **error**, never $0 and never a fuzzy match. Fixes Tier 1 #1–2.
2. **Boundary coercion.** Coerce and validate costs, markups, quantities at load/import/edit; reject
   negatives and NaN; FINAL-READY impossible with any unpriced line. Fixes #6, #7 and Tier 3 parsing.
3. **Gate/run ownership.** Gate must lie on its run within tolerance; gate end posts merge with run
   end posts; moving/deleting a run carries/removes its gates and auto posts; respace line posts per
   section. Fixes #3–5 and the related Tier 2 items.
4. **Job-state isolation.** Persist upcharges/hours with the job; reset pricing state on Clear/New;
   undo history cleared on load; Escape restores add-ons via deep clone (respect the undo-label
   invariant in `CLAUDE.md`). Fixes #8–10.
5. **Remaining Tier 2 counts**, one test per fence type, adding the first non-chain-link BOM tests.
6. **Customer documents:** per-section prices from that section's own lines; panel = PDF. Fixes #11.

### Step 2 — "ironclad" engine (v6.0, needs authorization)

Follow `07-research-architecture.md`: pricing becomes a pure function
`price(takeoff, priceBook, policy, engineVersion)` with a fixed pipeline — validate → geometry to
quantities → expand assemblies → waste → round up to packs → exact price lookup → extend → labor →
cost adjusters → markup/margin → tax → output checks → snapshot. One rounding rule (integer cents,
half-up, once per line; sub-cent hardware priced in mills), invariants enforced in tests (total = sum
of lines; no $0 line with qty > 0; more LF or gates never cheaper; same inputs → byte-identical
output; snapshot replay reproduces the quote), plus golden fixtures for every fence type.

### Step 3 — CAD to professional parity (needs authorization)

Polyline model with shared vertices, typed lengths, gate presets on the line, house termination,
then aerial tracing.

## Caveats

- Research reports could not fetch vendor pages, Reddit, RSMeans or supplier catalogs directly;
  claims rest on search-result extracts and are cited per line. Labor production rates found online
  disagree ~3×; calibrate from the owner's own crews.
- jsPDF could not load from cdnjs in the CAD audit environment; PDF output was checked only through
  the pricing code path.
