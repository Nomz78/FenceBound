# 05 — Professional Fence Estimating Software: How the Commercial Leaders Build Price Estimators

Research date: 2026-10-15. Prepared for FenceBound (non-canonical research input; generated AI output is never canonical per CLAUDE.md).

## Method and evidence limits (read first)

- **Direct page fetches were blocked.** The session egress proxy rejected connections to vendor hosts (fence.cloud, arcsite.com, merchantsmetals.com, capterra.com, hooverfence.com all returned `connect_rejected` / 403). Every claim below therefore comes from **web-search result summaries** of the cited URLs, not from reading the pages in full. Treat specifics (especially prices) as "reported by the cited page," and confirm before relying on them.
- Many "best fence software" rankings are written by competing vendors (QuoteIQ ranks itself #1; Gitnux states its rankings are "AI persona simulations"). These are cited only for third-party price signals and flagged.
- **Not found / no reliable data:** DrawFence, Fence Wizard, FenceQuote, Fence Bid, FenceWorks (as software), Builder's Fence estimator, Fenceonline, Kickserv fence specifics, Lowe's official calculator logic, Home Depot official calculator logic, calculator.net fence formula, SalesRabbit fence-specific quoting. Where nothing was found this is stated rather than guessed.

---

## 1. Product-by-product findings

### 1.1 Fence Cloud (formerly CFS / Computer Fencing System — Software Design Associates)
The incumbent fence-only estimator; the reference architecture for supplier-catalog-driven BOMs.

| Dimension | Finding | Source |
|---|---|---|
| Lineage | Formerly "CFS"; Merchants Metals partnered with Software Design Associates to offer electronic pricing through Fence Cloud | [Merchants Metals CFS ePricing](https://www.merchantsmetals.com/cfs-epricing/) |
| Drawing | "Job sketches," "shop drawings," "multiple site plan options for breaking down material and labor"; GeoDraw (a homeowner-facing map-drawing lead tool, ~$99/mo, now feeding the Fence Cloud leads board); a "Fence 3D – CFS" video exists | [fencesoftware.com](https://www.fencesoftware.com/), [fence.cloud](https://fence.cloud/), [saasbrowser GeoDraw](https://saasbrowser.com/ta/saas/538793/geodraw), [YouTube: How To Use Fence 3D – CFS](https://www.youtube.com/watch?v=Xed60Uvq6t4) |
| Pricing structure | Itemized BOM from "basic fence specifications": "calculates a complete and accurate fence material breakdown"; "custom material templates based on supplier catalogs to calculate materials in less than a minute" | [CFS page](https://fencesoftware.wpengine.com/fence-estimation-software/computer-fencing-system/), [YouTube: One-Minute Fence Estimating](https://www.youtube.com/watch?v=8Vgh84C9pd4) |
| Price books / supplier sync | 100+ supplier material catalogs (one review counts 117). Live supplier price feed: Merchants Metals credentials entered in Admin → System Settings → **API Manager**; "pricing can be updated at any time, day or night" | [fence.cloud](https://fence.cloud/), [fervorstudio review](https://fervorstudio.ca/news/fence-cloud-review-pricing-alternatives/), [Merchants Metals CFS ePricing](https://www.merchantsmetals.com/cfs-epricing/) |
| Labor / markup | Reviewers cite setup effort for "labor formulas, supplier markups, and crew roles" — i.e., labor is formula-driven and markup can be per supplier | [exayard](https://exayard.com/blog/best-fencing-estimating-software), [mowingmagic](https://mowingmagic.com/4-best-fence-estimating-software-for-contractors-cost-takeoff-quote-tools/) |
| Outputs | Packing lists, **labor worksheets**, **itemized estimates**, **fabricated gate cut sheets**, work orders; contracts, e-signature, automated documents | [CFS page](https://fencesoftware.wpengine.com/fence-estimation-software/computer-fencing-system/), [fencesoftware.com](https://www.fencesoftware.com/) |
| Change orders / ops | Converts sold job to work orders, shared crew calendar, tracks change orders; channel lists lead tracking, PM, scheduling, e-signature, photo markup | [exayard](https://exayard.com/blog/best-fencing-estimating-software), [YouTube channel](https://www.youtube.com/@FenceCloud) |
| Tax | Not documented in any source found | — |
| Software price | Official tiers reported: Essential $220/mo, Professional $345/mo, Ultimate $545/mo (identical features; limits by users/company profiles); older third-party figures $99–$175/mo | [fence.cloud/pricing](https://fence.cloud/pricing), [SourceForge](https://sourceforge.net/software/product/Fence-Cloud/) |

Interop note: TRUE's CFS integration ingests CFS GeoDraw PDF exports — separate drop zones for the **Itemized Estimate** and the **Labor Worksheet** — and maps CFS part numbers to TRUE catalog items, auto-creating missing products ([TRUE help: CFS](https://true.helpjuice.com/en_US/estimating-takeoff/cfs)). This confirms CFS's model: material lines and labor hours are separate documents, both keyed by supplier part number.

### 1.2 Merchants Metals Fe-Fence Estimator (supplier quoting tool)
- Customers-only, account-specific pricing. Three modules: **Qwik-Draw** (draw fence line, add gates, then specs), **Qwik-Bid** (from total footage + post and gate counts), **Qwik-Order** (by part number). Quotes are "sent as orders to the customer's specific service center for verification and processing." Built on CFS. ([Merchants Metals Fe-Fence Estimator](https://www.merchantsmetals.com/fence-estimator/))
- Takeaway: suppliers expose three entry modes — drawing, quantities-only, and SKU-direct — and close the loop from quote to material order.

### 1.3 Master Halco
- Only evidence is a trademark "MASTER-HALCO QUICK QUOTE" for software estimating and quoting fencing materials; current status unknown. ([Justia trademarks](https://trademark.justia.com/owners/master-halco-inc-155422))

### 1.4 ArcSite (general field CAD with strong fence vertical)
| Dimension | Finding | Source |
|---|---|---|
| Drawing | Tablet CAD; start from satellite imagery with automatic scale calibration; compiles panel lengths, post locations, gate details as you draw | [ArcSite fence design](https://www.arcsite.com/feature-details/fence-design-software) |
| Pricing structure | **Assemblies ("bundles")**: a bundle holds all parts of a fence type; software counts parts per drawn layout. Labor and material pricing attach to each assembly; pricing rules such as "cost per hole dug" or "labor hours per post installed"; price = labor rates + material costs + markup | [ArcSite chain-link blog](https://www.arcsite.com/blog/chain-link-fence-estimate-calculator), [ArcSite fence estimating](https://www.arcsite.com/feature-details/fence-estimating-software), [ArcSite fencing](https://arcsite.com/industries/fencing) |
| Price books / supplier | Bulk import of contractor products/costs/SKUs from spreadsheets; manufacturer libraries — Bekaert ("hundreds of fencing bundles"), Elite Fence Products, National Metal Industries | [ArcSite chain-link blog](https://www.arcsite.com/blog/chain-link-fence-estimate-calculator), [Bekaert contractors](https://fencing.bekaert.com/en/for-contractors), [Bekaert one-sheet](https://fencing.bekaert.com/content/dam/sws-b2c/pdf/Bekaert-ArcSite-OneSheeter.pdf), [Elite](https://www.arcsite.com/partners/elite-fence-products), [NMI](https://www.arcsite.com/partners/national-metal-industries) |
| Gates/corners/ends | User places gates and terminal posts on drawing, then selects bundle | [ArcSite chain-link blog](https://www.arcsite.com/blog/chain-link-fence-estimate-calculator) |
| Proposal | Branded PDF with line items, photos, drawings, payment terms; Estimate tier adds digital approvals, payments, invoicing | [ArcSite estimates & proposals](https://arcsite.com/features/estimates-proposals), [FitGap](https://us.fitgap.com/products/008778/arcsite) |
| Software price | Official: Draw Basic $10, Draw Pro $30, Takeoff $99, Estimates $129 /mo, Enterprise custom (Capterra says per user) | [ArcSite pricing](https://www.arcsite.com/pricing?hsLang=en), [Capterra](https://www.capterra.com/p/156735/ArcSite/pricing/) |

### 1.5 Visual Fence Pro
- Draw fence lines on satellite maps (US + parts of Canada), loads property boundaries from address; BOM for wood, vinyl, chain link, ornamental, composite; automatic material **and labor**; starter plan includes gates, **returns to house**, **tear-out pricing**; online payment; QuickBooks sync. Price: Capterra $150 flat-rate with free trial; competitor guide "free to $299/mo." ([G2](https://www.g2.com/products/visual-fence-pro/discuss), [Capterra](https://www.capterra.com/p/10038635/Visual-Fence-Pro/), [Capterra AE](https://www.capterra.ae/software/1089160/Visual-Fence-Pro), [QuoteIQ guide](https://myquoteiq.com/best-satellite-measuring-software-fencing-businesses-2026/))

### 1.6 FenceTracer (Canada)
- Sketch-based: computes lengths, **angles, and slopes** as corners, gates, obstacles are added; takeoff priced from a catalogue; quote pipeline, crew scheduling, worker app. CA$180/mo flat, free trial. ([Capterra](https://www.capterra.com/p/10045959/FenceTracer/), [Slashdot](https://slashdot.org/software/p/FenceTracer/))

### 1.7 Fence Forger
- Fence CRM with satellite/aerial measurement, proposals, job management, Stripe card/ACH payments; flat $160/mo, unlimited seats. ([Capterra](https://www.capterra.com/p/10040512/Fence-Forger/), [Capterra IE](https://www.capterra.ie/software/1095148/Fence-Forger), [Capterra AU](https://www.capterra.com.au/software/1095148/Fence-Forger))

### 1.8 TRUE Fence / TRUE Contractor
- TRUE Draw V2 (scaled, auto-measured) and V3 (unscaled, manual measurements + Google satellite); site layout → product assignment → material list → digital proposal with **eSign and ePay**. Parent platform: inventory (reserved stock, pick tickets, job staging), job costing, change orders, WIP. ~$99/mo first user + $39/additional, $999 setup. ([TRUE Fence help](https://true.helpjuice.com/en_US/true-fence-category/true-fence), [Capterra TRUE](https://www.capterra.com/p/171198/TRUE-Contractor/), [softwarefinder](https://softwarefinder.com/construction/true-contractor))

### 1.9 QuoteIQ (MapMeasure)
- Satellite tracing of fence runs; "Options Estimates" Good/Better/Best on one estimate (sample $28/$42/$58 per LF for PT pine / cedar / composite-vinyl). $29.99/mo start; Pro $149.99. Vendor marketing. ([QuoteIQ CRM for fence](https://myquoteiq.com/crm-for-fence-contractors/), [QuoteIQ](https://myquoteiq.com/?p=17628))

### 1.10 JobNimbus
- Mobile **Fence Measurements tool**: draw lines on overview map, live length, export to PDF. Estimates convert to **Material Orders** once Approved/Signed; suppliers must be contacts; reusable material-order templates. ~$350–550/mo per a competitor blog. ([JobNimbus support: fence measurements](https://support.jobnimbus.com/what-is-the-fence-measurements-tool-and-how-do-i-use-it), [JobNimbus material orders](https://support.jobnimbus.com/material-order), [YouTube: Fence Measurement Tool](https://www.youtube.com/watch?v=9C6ckI_QN0A))

### 1.11 Projul
- AI-built fence estimates from footage, gate count, post spacing, tear-out, rates → sections Tear-out / Posts / Fence / Gates. Template post rule: footage ÷ spacing + 1, plus corners and gates. Template terrain adders: moderate slope +15% labor, steep +25%, rocky soil +$15/hole, roots +$25/hole. ([Projul help](https://help.projul.com/hc/en-us/articles/43239324649111), [Projul templates](https://projul.com/blog/free-fencing-estimate-templates/))

### 1.12 Generic field-service platforms (Jobber, Housecall Pro, ServiceTitan)
- **Jobber:** optional line items (client toggles in Client Hub, total recalculates; Grow plan); **required deposit** as % recalculates with selections; "Approve & Pay"; unselected options drop on conversion to job; quotes do not expire unless archived. $39/mo start. ([Jobber optional items](https://help.getjobber.com/en/articles/optional-line-items-on-quotes/), [Jobber deposits](https://help.getjobber.com/hc/en-us/articles/115009379007-Deposits-on-Quotes), [Jobber client hub](https://help.getjobber.com/hc/en-us/articles/1500011237822-What-Do-Your-Clients-See-in-Client-Hub), [QuoteIQ price list](https://myquoteiq.com/top-10-best-quoting-software-for-fencing-companies-in-2026/))
- **Housecall Pro:** price book; Sales Proposal Tool builds multi-tier G/B/B from templates on web/mobile, Wisetack financing ("as low as"); MAX plan. Basic $79/mo ($59 annual). Competitor notes it lacks fence-specific material logic. ([HCP Sales Proposal Tool](https://help.housecallpro.com/en/articles/7216553-sales-proposal-tool-2-0), [HCP Wisetack](https://help.housecallpro.com/en/articles/5815953-wisetack-and-sales-proposal-integration), [HCP pricing](https://housecallpro.com/?p=388))
- **ServiceTitan:** Pricebook → estimate templates → Proposal Templates (G/B/B); item groups sell a package as one line; markup tiers by cost range (gross margin, % markup, $ markup, multiplier); supplier catalog sync via Pricebook Connect (30–60 min lag); **Sales Margin Enforcement** — real-time on-device margin check vs global/role limits, soft-block modal before sharing non-compliant estimates; offline mode does not use dynamic prices. ~$245/tech/mo (third-party). ([ST proposal templates](https://help.servicetitan.com/docs/proposal-templates), [ST Pricebook Pro guide](https://help.servicetitan.com/docs/pricebook-pro-optimization-guide-in-servicetitan-max.md), [ST margin enforcement](https://help.servicetitan.com/release-hub/docs/protect-your-pricing-with-sales-margin-enforcement-to-stop-low-margin), [ST supplier price validation](https://help.servicetitan.com/v1/docs/validating-catalog-item-prices-as-a-supplier))

### 1.13 Construction platforms (Buildertrend, Contractor Foreman, Estimate Rocket, Joist, STACK, Builder Prime)
- **Buildertrend:** cost catalog (title, description, unit cost, markup), cost groups; estimate → proposal grouped by custom groups or cost codes; disclaimers; allowances; change orders auto-invoiced on approval with client-accepted disclaimer; Job Running Total = contract + approved COs + allowances + selections. ~$339–1,099/mo. ([Buildertrend estimating](https://buildertrend.com/financial-tools/construction-estimating-software/), [BT glossary](https://buildertrend.com/help-article/buildertrend-glossary/), [BT settings](https://buildertrend.com/help-article/financial-management-settings/), [Projul BT pricing](https://projul.com/blog/buildertrend-pricing-analysis-2026/))
- **Contractor Foreman:** line items, material/labor rates, markups, bid management, estimate→project, job costing; $49/mo start; reviewers call cost database shallow. ([dupple review](https://dupple.com/reviews/contractor-foreman), [ERPResearch](https://erpresearch.com/erp-add-ons/construction/contractor-foreman/pricing))
- **Estimate Rocket:** cost database, proposal generation, signing and payments, change orders; all plans same core features; $59–139/user/mo. ([Capterra](https://www.capterra.com/p/158263/Estimate-Rocket), [Estimate Rocket pricing](https://www.estimaterocket.com/pricing))
- **Joist:** line items, markups, taxes, discounts, change orders, e-approval, deposits/milestones; ~$10–32/mo. ([Joist GC page](https://www.joist.com/estimating-invoicing-software/general-contractor/), [GetApp](https://www.getapp.co.uk/software/2047614/joist))
- **STACK:** cloud takeoff, 100+ pre-built customizable assemblies with material/labor/equipment costs; fence page claims counts of every post/panel/gate. ([STACK fence](https://www.stackct.com/fence-takeoff-estimating-construction-software/), [softwareconnect](https://softwareconnect.com/roundups/construction-takeoff-software/))
- **Builder Prime:** fence estimating + CRM + production + payments; e-signature proposals; custom pricing. ([Builder Prime fencing](https://www.builderprime.com/estimating-software/fencing))
- **Sage 100 Contractor** (reference model of assembly estimating): insert assemblies → adjust parts/quantities → verify cost codes/types/vendors → enter overhead and profit rates. ([Sage help](https://help-sage100contractor.na.sage.com/Sage100Contractor/US/21_2/Content/Modules/9-Estimating__Parts_and_Assemblies_/Creating_takeoffs.htm))

### 1.14 Consumer / supplier calculators
- **Hoover Fence:** free calculators for chain link, aluminum, vinyl, wood, split rail; rounds to purchasable units (chain-link fabric to next 50' roll); "Add to Cart"; disclaims accuracy. ([Hoover calculators](https://www.hooverfence.com/calculators), [Hoover chain-link notes](https://www.hooverfence.com/calculator/chain-link-fence-notes)) Hoover also publishes an estimating guide PDF ([Hoover estimating guide](https://www.hooverfence.com/mas_assets/theme/hooverfence/pdfs/estimating-guide-montage.pdf)).
- **Omni-style calculators** (calculator.net not surfaced): posts = length ÷ spacing + 1 rounded up; sections = posts − 1; post length 1.5 × height; rails = rails/section × sections; pickets = length ÷ (width + gap); concrete = hole volume − post volume ÷ bag yield. ([Omni fence](https://www.omnicalculator.com/construction/fence-material))
- **Lowe's / Home Depot:** official logic not found; third-party describe Lowe's tool filling a cart with Lowe's-only SKUs. ([JourneymanHQ](https://www.journeymanhq.com/?p=391747))
- **Homeowner map-draw quote widgets:** GeoDraw; WamBam Quick Quote (Google Maps API, draw lines + gates, instant price); Mapscaping calculator. ([WamBam](https://wambamfence.com/knowledgebase/get-your-instant-fence-quote-with-our-easy-to-use-online-tool), [Mapscaping](https://mapscaping.com/fence-calculator/))
- **Mobile apps:** Fence Calc Build (local supplier pricing paid add-on), FenceLine (GPS walk-measure), FenceMint (branded PDF, labor + markup), Fence Calculator Pro, Ag Fence Pro (iPad satellite), Fence Mapster (GPS). ([Fence Calc Build](https://appgoblin.info/apps/6767279032), [FenceLine](https://apps.apple.com/us/app/-/id6760915653), [FenceMint](https://apps.apple.com/us/app/fencemint/id6749565390), [Fence Calculator Pro](https://apps.apple.com/us/app/-/id6757090602), [Ag Fence Pro](https://apps.apple.com/us/app/-/id6450721415))
- **SmartDraw:** diagram templates for post/panel/gate layouts; no pricing engine found. ([gitnux](https://gitnux.org/best/fence-planning-software/))
- **SalesRabbit:** door-to-door territory/lead tracking; no fence-specific quoting found. ([Capterra](https://www.capterra.com/p/157329/Sales-Rabbit))
- **Prior art:** US patent application 20150363950 "Fence Estimator with Intelligent Fence Drawing Module" (priority 2014) — draw interactively, auto-estimate; background names CFS and "Fence Space." ([Justia](https://patents.justia.com/patent/20150363950))

---

## 2. Demo videos (from titles/descriptions; transcripts not accessible)

| Video | What it shows | URL |
|---|---|---|
| Fence Cloud — One-Minute Fence Estimating | Supplier-catalog material templates producing a BOM in under a minute | https://www.youtube.com/watch?v=8Vgh84C9pd4 |
| What is Fence Cloud? | Product intro (estimating + job management) | https://www.youtube.com/watch?v=XUMjKQ10L7U |
| Fence Cloud Helpful Resources | Learning resources | https://www.youtube.com/watch?v=YF_g8VytON8 |
| How To Use Fence 3D – CFS | 3D fence visualization in CFS | https://www.youtube.com/watch?v=Xed60Uvq6t4 |
| ArcSite: Software for Fencing Companies | Demo (Jared Menzel) of material calcs and client proposals | https://www.youtube.com/watch?v=lJP18yMeIDQ |
| ArcSite For Fencing – Drawing Training (~30 min) | Drawing/planning workflow for fence businesses | https://www.youtube.com/watch?v=5_Kd6x_D7Zc |
| Professional fencing estimates and material lists from anywhere | ArcSite estimate + material list flow | https://www.youtube.com/watch?v=NPjfKd8rBFA |
| Bekaert + ArcSite | Manufacturer bundle library in ArcSite | https://www.youtube.com/watch?v=jvV9oZuNTC0 |
| JobNimbus Fence Measurement Tool | Mapping fence lines in mobile app | https://www.youtube.com/watch?v=9C6ckI_QN0A |
| Introducing Kencove FenceBuilder | Ag fence design over aerial map + materials | https://www.youtube.com/watch?v=wMHSyrTq8tE |
| Simpson Strong-Tie Fence Planner tutorial | Homeowner/contractor wood-fence design tool | https://www.youtube.com/watch?v=N5kmXCuNmaE |

Search listings showed the Fence Cloud videos as ~3–4 years old ([search context](https://www.youtube.com/@FenceCloud)); UI may be dated.

---

## 3. Synthesis

### 3.1 Common feature baseline (every serious pro estimator)
1. **Map/aerial or scaled sketch takeoff** producing LF per run, with gates and terminals placed on the drawing (ArcSite, Visual Fence Pro, Fence Forger, QuoteIQ, JobNimbus, TRUE, Fe-Fence Qwik-Draw).
2. **Fence-type assemblies/bundles/templates** that explode LF + post/gate counts into an itemized BOM (Fence Cloud templates, ArcSite bundles, STACK assemblies, ServiceTitan item groups).
3. **Price book** of items with cost + markup, importable from spreadsheet or supplier catalog (ArcSite, Buildertrend catalog, Fence Cloud catalogs).
4. **Labor separate from material**, driven by rules (per hole, per post, per LF, hours per post) — ArcSite pricing rules; CFS labor worksheet.
5. **Markup/overhead** applied to produce sell price; tax line (Joist explicitly).
6. **Branded proposal** with drawing, line items, terms; **e-signature**; **deposit/online payment** (ArcSite Estimate tier, TRUE, Fence Cloud, Jobber, Joist, Fence Forger).
7. **Estimate → job/work order → material order** conversion (Fe-Fence Qwik-Order, JobNimbus Material Orders, Fence Cloud work orders).
8. **Mobile/tablet field use.**

### 3.2 Differentiators
- **Live supplier price sync** via API (Fence Cloud ↔ Merchants Metals; ServiceTitan Pricebook Connect). Most others rely on manual spreadsheet updates.
- **Manufacturer-maintained assembly libraries** (ArcSite + Bekaert/Elite/NMI; Fence Cloud's 100+ catalogs).
- **Fabrication outputs**: gate cut sheets, packing lists, labor worksheets (CFS/Fence Cloud).
- **Slope/angle-aware sketching** (FenceTracer) and returns-to-house / tear-out lines (Visual Fence Pro).
- **Good/Better/Best** proposals (ServiceTitan, Housecall Pro, QuoteIQ, Contractor+) and **client-selectable optional items with deposit recalculation** (Jobber).
- **Margin enforcement** at quote time (ServiceTitan).
- **Homeowner self-quote widgets** feeding the lead board (GeoDraw, WamBam).
- **Inventory with reservation/pick tickets** (TRUE).
- **Financing in-proposal** (Housecall Pro + Wisetack).

### 3.3 Best-practice pricing architecture

```
Drawing/takeoff (runs, LF, angle/slope, terrain tags, gates, terminals, returns, tear-out)
  → Assembly per fence type (rules: posts = LF/spacing+1, terminals at corners/ends/gates,
     rails per section by height, fabric rounded to roll, concrete per hole)
  → Itemized BOM (SKU, qty, rounded to purchasable unit, waste %)
  → Price book (versioned; supplier-synced cost; per-supplier or per-category markup)
  → Labor (per LF base + per post/hole + per gate; difficulty adders: slope %, rock per hole,
     roots per hole, removal per LF; burdened crew rate)
  → Overhead (rate derived from annual overhead / direct cost)
  → Margin (price = cost / (1 − target margin), not cost × (1 + markup))
  → Tax (material-only vs whole-job per jurisdiction)
  → Options (G/B/B tiers, optional add-ons)
  → Proposal (terms, expiry, deposit %, e-sign) → job / work order / material order
```

Supporting evidence: assemblies with attached labor and material pricing ([ArcSite](https://www.arcsite.com/blog/chain-link-fence-estimate-calculator)); Sage's assembly → cost code → overhead and profit sequence ([Sage](https://help-sage100contractor.na.sage.com/Sage100Contractor/US/21_2/Content/Modules/9-Estimating__Parts_and_Assemblies_/Creating_takeoffs.htm)); margin-vs-markup formula and overhead rate method ([Jobber Academy](https://getjobber.com/academy/fencing/how-to-price-a-fencing-job/), [Zuper](https://www.zuper.co/blog/how-to-price-your-fencing-services-for-maximized-profitability), [JobNimbus bidding guide](https://wf.jobnimbus.com/blog/how-to-bid-a-fence-job)); gates and corners as separate lines plus slope/rock/roots/removal checks ([alwaysdobetter](https://alwaysdobetterllc.com/how-to-bid-fencing-jobs/)); terrain adders ([Projul](https://projul.com/blog/free-fencing-estimate-templates/), [Harvest](https://www.getharvest.com/calculators/fence-cost-calculator)); markup tiers by cost range ([ServiceTitan](https://help.servicetitan.com/docs/pricebook-pro-optimization-guide-in-servicetitan-max.md)); rounding to purchasable units ([Hoover](https://www.hooverfence.com/calculator/chain-link-fence-notes)).

How gates/corners/ends are priced: every source that describes it treats gates as **discrete assemblies** (gate frame + hardware + two gate/terminal posts) and corners and ends as **terminal posts** distinct from line posts. Takeoff checklists flag missed gate posts as a costly common error ([dev.to takeoff checklist](https://dev.to/designestimation/fence-material-takeoff-checklist-pro-guide-2026-2lb3); [Fe-Fence Qwik-Bid](https://www.merchantsmetals.com/fence-estimator/) takes post and gate counts as primary inputs).

### 3.4 What makes a quote "ironclad"
| Feature | Evidence in market | Source |
|---|---|---|
| **Price-book snapshot at send time** (the frozen quoted price) | No vendor documentation found describing versioned price books or frozen estimate prices; it is a gap in public docs. Live sync (Fence Cloud, ServiceTitan) makes the snapshot more important, not less. ServiceTitan's offline mode not using dynamic prices shows that price source varies with context | [ST margin enforcement](https://help.servicetitan.com/release-hub/docs/protect-your-pricing-with-sales-margin-enforcement-to-stop-low-margin) |
| **Quote expiry** | 30 days is the common recommendation; contract clause reserves the right to revise after expiry; Moraware expires all quotes and kills links; Jobber quotes do *not* expire by default | [Cinderblock](https://cinderblock.com/blog/how-long-should-an-estimate-be-valid/), [Joist](https://www.joist.com/blog/estimate-expiration-dates-for-contractors/), [Law Insider](https://lawinsider.com/clause/quote-expiration), [Moraware](https://www.moraware.com/?p=4190), [Jobber](https://help.getjobber.com/hc/en-us/articles/1500011237822-What-Do-Your-Clients-See-in-Client-Hub) |
| **Margin floor / approval** | ServiceTitan Sales Margin Enforcement: real-time margin vs role limits, soft-block before sharing | [ST](https://help.servicetitan.com/release-hub/docs/protect-your-pricing-with-sales-margin-enforcement-to-stop-low-margin) |
| **Validation warnings** | Margin gap shown in dollars (ST); missed gate posts as a common error | [ST](https://help.servicetitan.com/release-hub/docs/protect-your-pricing-with-sales-margin-enforcement-to-stop-low-margin), [dev.to](https://dev.to/designestimation/fence-material-takeoff-checklist-pro-guide-2026-2lb3) |
| **Contingency / difficulty adders** | Slope/rock/roots adders; "overestimate labor time" | [Projul](https://projul.com/blog/free-fencing-estimate-templates/), [JobNimbus guide](https://wf.jobnimbus.com/blog/how-to-bid-a-fence-job) |
| **Minimum charge** | No vendor documentation found; recommended as a design addition | — |
| **Change-order discipline** | Buildertrend: approved COs flow to the running total and are auto-invoiced, with a client-accepted disclaimer | [Buildertrend glossary](https://buildertrend.com/help-article/buildertrend-glossary/), [BT settings](https://buildertrend.com/help-article/financial-management-settings/) |
| **Signed approval + deposit gate** | Jobber "Approve & Pay"; JobNimbus material order only after Approved/Signed | [Jobber deposits](https://help.getjobber.com/hc/en-us/articles/115009379007-Deposits-on-Quotes), [JobNimbus](https://support.jobnimbus.com/material-order) |
| **Rounding to purchasable units** | Hoover rounds fabric to 50' rolls | [Hoover](https://www.hooverfence.com/calculator/chain-link-fence-notes) |
| **Audit of rule changes** | ServiceTitan advises one variable at a time and recording the reason in the rule description | [ST guide](https://help.servicetitan.com/docs/pricebook-pro-optimization-guide-in-servicetitan-max.md) |
| **Estimate vs actual feedback** | Job costing (TRUE, Contractor Foreman, Projul); compare actuals to bids | [TRUE Capterra](https://www.capterra.com/p/171198/TRUE-Contractor/), [JobNimbus guide](https://wf.jobnimbus.com/blog/how-to-bid-a-fence-job) |

**Relevance to FenceBound:** The market has no public documentation of a frozen quoted-price snapshot, which is FenceBound's own stated v6.0 requirement ("A project carries a frozen quoted-price snapshot. The company rate card is a separate store."). This supports treating it as a differentiator. It is a recommendation only; owner authorization is required for any feature work.

### 3.5 Software price landscape (reported, unverified)
Fence-specific: Fence Cloud $220–545/mo; ArcSite $99–129/mo for takeoff/estimate; Visual Fence Pro ~$150–299; Fence Forger $160 flat; FenceTracer CA$180; TRUE $99 + $39/user + $999 setup; QuoteIQ $29.99–149.99. General: Jobber $39+, Housecall Pro $59–189+, ServiceTitan ~$245/tech, Buildertrend ~$339–1,099, Contractor Foreman $49+, Estimate Rocket $59–139/user, Joist $10–32. (Sources in sections above.)
