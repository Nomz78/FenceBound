# 06 — How Professional Fence Contractors Estimate and Price Jobs

Research date: 2026-10-15. Prepared as input for FenceboundCAD estimating, BOM, pricing and validation work.
This is generated research and is **not canonical** under the repository authority hierarchy. Every number below
is a candidate default or sanity band. None of it authorizes a change to pricing **values**.

## 0. Method and evidence limits (read first)

- **Retrieval constraint:** The session's egress proxy refused direct page fetches. WebFetch and curl both
  failed on hooverfence.com, ncdor.gov and getjobber.com. Every figure here comes from search-engine result
  extracts of the cited URLs, not from full-page reads. Treat each claim as "the cited page says roughly this".
  Verify against the primary document before encoding a hard rule.
- **Not reachable:** reddit.com (the search API refuses that domain), RSMeans line-item data (paywalled, with no
  extract found), Master Halco, Merchants Metals and Stephens catalogs (no extract found), Fence Post magazine
  estimating articles (none found), and ContractorTalk and LawnSite threads (none surfaced).
- **Confidence tiers used below:**
  - **[A]** A public agency spec, statute or manufacturer installation guide.
  - **[B]** A university or extension source, a published NCDOT bid tab, or a named contractor.
  - **[C]** A software-vendor or consumer cost blog, or an SEO cost page. Use only as a loose band.
  - **[D]** My own arithmetic from the cited rules, labeled as such.

---

## 1. Takeoff rules by fence type

### 1.1 Residential chain link

| Item | Rule | Tier | Source |
|---|---|---|---|
| Line post spacing | Max 10 ft on center. Line posts = (run − gate openings) ÷ 10 − 1 per straight run | A/B | Home Depot/manufacturer takeoff sheet https://images.thdstatic.com/catalog/pdfImages/eb/eb410056-2919-4538-b863-3bb02c539842.pdf ; Corpus Christi spec https://www.corpuschristitx.gov/media/zvfczudq/028340-chain-link-security-fence-2019-11-12.pdf ; FHWA E619 https://highways.dot.gov/federal-lands/std-drawings/E619-09.pdf |
| Terminal posts | 1 per end, 1 per corner, 2 per gate (one each side) | B | thdstatic takeoff sheet (above) |
| Tension bands | 3 per end post for 3–4 ft fabric, 4 for 5 ft, 5 for 6 ft (≈ 1 per ft of height, less 1). Corner posts take 2 sets | B | thdstatic takeoff sheet; WisDOT detail shows bands at 1 ft spacing https://www.wisconsindot.gov/dtsdManuals/strct/manuals/bridge/std3012.pdf |
| Tension bars | 1 per end post, 1 per gate post, 2 per corner post | B | thdstatic takeoff sheet |
| Brace bands, rail ends | 1 rail end per end post, 2 per corner post. 1 brace band per rail end | B | thdstatic takeoff sheet |
| Loop caps / dome caps | 1 loop (eye-top) cap per line post. 1 dome cap per terminal post | B | thdstatic takeoff sheet |
| Carriage bolts | 5/16" × 1-1/4", 1 per tension band plus 1 per brace band | B | thdstatic takeoff sheet |
| Fabric ties | 1 per 12" on line posts, 1 per 24" on top rail (FHWA: 300 mm / 600 mm). Corpus Christi security spec: 15" on posts, 24" on rail | A | FHWA W619 https://highways.fhwa.dot.gov/federal-lands/std-drawings/W619fp14.pdf ; Corpus Christi (above) |
| Top rail | Run ÷ stick length (21 ft is the common stick; confirm per supplier), rounded up. Swedged rail needs no sleeves | B/D | thdstatic takeoff sheet; arithmetic |
| Fabric, bottom tension wire | Equal to run length less gate openings, rounded up to whole rolls (50 ft rolls are the common residential size, not verified here) | B/D | thdstatic takeoff sheet |

**Post sizes and embedment (municipal specs referencing ASTM F567) [A]:**
- Deer Park TX: 4 ft fence uses 1.90" OD line posts and 2.375" OD terminals (30"). 5–6 ft uses 2.375" OD line posts and 2.875" OD terminals (36"). Line embedment is 24". https://www.deerparktx.gov/DocumentCenter/View/13368/Spec-555-Chain-Link-Fencing
- Corpus Christi TX: 4 ft uses 1.90" line (24") and 2.375" corner/end (30"). 6 ft uses 2.375" line (30") and 2.875" corner/end (42"). https://www.corpuschristitx.gov/media/ljslbvry/028320-chain-link-fence.pdf
- Miami-Dade: line holes 12" dia, terminal holes 15" dia × 38" deep, 36" embedment. https://www.miamidade.gov/water/library/Donation/part-3/02822.pdf
- Michigan State: pull post footing 10" dia, terminal 12" dia, both at least 42" deep. https://ipf.msu.edu/documents/chain-link-fences-and-gates-word
- Hoover Fence (residential manual): holes 6" dia × 30" deep for line posts, about 8" wide × 18–30" deep for terminals. Do not fill the hole flush. "Bell" the bottom of an obstructed hole down to 18". https://www.hooverfence.com/mas_assets/theme/hooverfence/pdfs/chain-link-fence-install-manual.pdf ; https://www.hooverfence.com/mas_assets/theme/hooverfence/pdfs/chain-link-installation.pdf
- **Post length [D]:** fence height + embedment + about 2" (fabric sits about 2" above grade, and terminals stand about 2–3" above the fabric). For example, a 6 ft fence with a 30" line embedment needs a line post of about 8.5 ft, so suppliers' 8'6"/9' stock fits.

### 1.2 Commercial and security chain link (barbed or razor wire)
- Barb arms are 45° (±5°) and carry 3 strands. The top strand sits about 12" up and 12" out from the rail. The arm must hold 200–250 lb at the outer strand. 14 ga minimum, galvanized per ASTM A153. Sources: NCDOT SP08 R100 https://connect.ncdot.gov/resources/Specifications/2024StandardProvisions/SP08%20R100.docx ; Memphis 02820 https://engineering.memphistn.gov/download/16/standard-construction-specifications/310/section-02820-chain-link-fence ; Miami-Dade (above). [A]
- Takeoff [D]: 1 arm per post (terminal arms differ), barbed wire LF = run × 3 strands, plus 1 tension band per strand at terminals. Iowa DOT cites ASTM F626 arm types https://ia.iowadot.gov/erl/archiveoct2011/US/content/9060.pdf. No source gave razor-coil diameter or clip spacing, so treat those as a manufacturer-data gap.
- NCDOT pays chain link **fabric per LF**, measured center of end post to center of end post excluding gates, and pays **line, terminal and gate posts per each**. https://connect.ncdot.gov/resources/Specifications/2024StandardProvisions/SP08%20R101.docx [A]. That separation is a useful model for the BOM, because it keeps posts out of the per-foot rate.

### 1.3 Wood privacy
- Post spacing is 8 ft on center max (rails are 8 ft), with 6 ft recommended for maximum strength. Loose or sandy soil calls for closer spacing. https://www.decks.com/how-to/articles/how-far-apart-should-fence-posts-be [C]
- Embedment follows the one-third rule: about 1/3 of post length, or 1/3–1/2 of above-grade height. A 6 ft fence on an 8 ft post needs at least 2 ft, with 2.5–3 ft recommended. Go 6" below frost line. https://www.hgtv.com/gardening/landscaping-and-hardscaping/how-deep-should-dig-fence-posts ; https://extremehowto.com/diy-privacy-fence/ [C]
- Hole diameter is about 3 × post width, which gives 10–12" for a 4×4. https://www.decks.com/how-to/articles/how-far-apart-should-fence-posts-be ; https://woodworkingadvisor.com/best-way-to-install-wood-fence-posts/ [C]
- Rails: 2 rails up to about 4 ft, 3 rails for 6 ft, and more for taller fences. Rails = sections × rails per section; for example, 100 ft at 8 ft o.c. gives 13 sections and 39 rails. https://pro.buildingclub.info/en/timber/fence-calculator-ft-posts-boards-cost/ [C]
- Pickets: count = ceil(run_in ÷ (picket width + gap)). A 5.5" picket with no gap gives about 2.18/LF (218 per 100 ft). With a 0.5" gap it gives 2.0/LF. https://best-calculators.com/construction-diy/fence-picket-calculator/ [C]; arithmetic [D]. Shadowbox and board-on-board need about 2× picket count, less the overlap credit.
- Fasteners: no source gave a per-picket figure. The common trade practice is 2 nails per picket per rail (6 per picket on 3 rails), which is **unverified** here, so leave it as an editable default.

### 1.4 Vinyl (PVC)
- Section width is usually 6 ft or 8 ft, so post spacing equals panel width plus post width, set by the manufacturer's rail-pocket spacing.
- Hole 10" minimum to 12" for a 5×5 post (Illusions: 12" for 5×5, 15" for 8×8). Depth 30–36" (Home Depot privacy minimum 26" on an 8 ft post). Add 6" of gravel under the post. Gate posts go to about 36" and get an aluminum insert. https://images.homedepot-static.com/catalog/pdfImages/10/10a710ce-db07-49cf-a255-d0ad0d84d679.pdf ; https://www.ringsend.com/media/product-files/file/Illusions-Vinyl-Fence-Installation-Instructions.pdf ; https://www.bobvila.com/articles/vinyl-fence-installation/ ; https://www.weatherables.com/blog/vinyl-fencing-installation-made-easy [A/C]

### 1.5 Aluminum and ornamental
- Jerith (Hoover): minimum post depth is 24" for 42", 54" and 72" fence. Footings go below frost line. https://www.hooverfence.com/mas_assets/media/hooverfence/pdfs/jerith-installation.pdf [A]
- Line posts sit about 6 ft o.c. max (panel width). Leave concrete about 2" below grade and backfill with soil. https://www.hooverfence.com/ornamental-fence-installation [A]
- Leon County FL spec: holes about 8" dia, posts about 26" deep. https://cms.leoncountyfl.gov/Portals/0/adam/Documents/ES3iwG82F06k_zg-0FTsNQ/Link/21031610BuckLakeAD7.pdf [A]
- Racking panels on slope and stepping (with an extra-length post) are separate labor and material line items. No numeric source was found.

### 1.6 Split rail
- Embedment is 24–36" (about 1/3 of the post). The bottom rail sits at least 6" above grade. Do not pour concrete under the post butt (it traps water). Use crushed stone or tamped soil. https://www.thisoldhouse.com/curb-appeal/how-to-install-a-split-rail-fence ; https://TractorSupply.com/tsc/cms/life-out-here/garden-home-land/fencing/how-to-install-split-rail-fence [C]
- Culpeper (manufacturer): about 10'3" between posts for 11 ft lapped rails. Do not pre-dig every hole. https://www.culpeperwood.com/wp-content/uploads/2024/05/Split-Rail-Installation-Instructions.pdf [A]. Takeoff [D]: sections = ceil(run ÷ (rail length − lap)), rails = sections × rail count, posts = sections + 1. Corner and end posts are 2-hole, line posts 3-hole or 4-hole as the design requires.

### 1.7 Farm, field, woven wire, barbed and high-tensile
- **Bracing** (NRCS Code 382 standards): an H-brace at every corner where alignment changes ≥ 20°, at ends, and on both sides of gates. Brace posts are at least 8 ft × 5". Set at least 36" or 3.5 ft. In-line braces are at most 1,320 ft apart on straight high-tensile runs. https://efotg.sc.egov.usda.gov/api/CPSFile/6821/382_GA_PS_Fence-High_Tensile_Smooth_2016 ; https://efotg.sc.egov.usda.gov/api/CPSFile/8583/382_MO_PS_Fence-Barbed_Woven_Suspension_Specification_2008 [A]
- **High-tensile line posts:** 50 ft with a stay at 25 ft, or 30 ft without stays. Some standards allow 150 ft with stays every 50 ft. Hi-tensile woven wire takes posts at 20 ft or less. Single-wire fences use no stays. https://efotg.sc.egov.usda.gov/references/Delete/2011-8-27/382fenceCSpermanentElectricHighTensiles.pdf [A]
- **Woven wire with T-posts:** 8–12 ft is common practice. Rolls are 330 ft, so H-braces fall about every 300 ft. https://cpw.state.co.us:443/Documents/LandWater/PrivateLandPrograms/GameDamage/LayoutGardenOrchardNurseryVineyard.pdf [B]. Dug brace holes are at least 2× post width and 3 ft deep. Brace assemblies "frequently take up to half of total construction time", so price them as discrete labor units. https://coosswcd.specialdistrict.org/files/1d52096c3/Preliminary+Project+Technical+Designs.pdf [B]
- **NCDOT woven wire** uses 7.5 ft or 8 ft steel posts per Roadway Standard Drawing 866.03. Line and brace posts are paid per each. https://connect.ncdot.gov/resources/Specifications/2024StandardProvisions/SP08%20R084.docx [A]
- **Welded wire:** no distinct takeoff source was found. Treat it like woven wire (T-posts 8–10 ft, braced terminals) and flag it as unverified.

### 1.8 Concrete per hole
- Volume [D]: V(ft³) = π × (D/2)² × depth − post displacement, with D and depth in ft. Bags = V ÷ bag yield.
- Bag yields: about 0.375 ft³ per 50 lb fast-set bag and about 0.60 ft³ per 80 lb bag. Actual yield runs 0–3% below the label. https://invoicer.ai/tools/fence-post-concrete-calculator [C]
- Chart cross-check: a 12" hole takes 3 × 50 lb bags at 16–22" depth and 4 bags at 24–30". An 18" hole at 28–30" takes about 9 bags. https://gambrick.com/how-many-bags-of-concrete-per-fence-post/ [C]. Quikrete's calculator (official) is at https://quikrete.com/calculator. A worked check [D]: a 10" × 30" hole holds about 1.36 ft³, less about 0.33 ft³ for a 4×4 at 30", leaving about 1.03 ft³, which is about 2.8 × 50 lb fast-set or about 1.7 × 80 lb.
- Common practice is to always set gate and corner posts in concrete. Wood line posts are sometimes gravel-set. https://woodworkingadvisor.com/best-way-to-install-wood-fence-posts/ [C]

### 1.9 Waste factors
- Wood is 10% standard, 5% on a simple straight run, and 10–15% with corners, gates, short pieces or rough stock. https://woodworkingadvisor.com/fence-board-calculator-estimate-lumber/ ; https://best-calculators.com/construction-diy/wood-fence-cost-calculator/ [C]
- No published waste % was found for vinyl, aluminum or chain link. Those are panel and roll goods, so the practical "waste" is rounding up to whole panels, sticks and rolls plus cut-panel drop at section ends [D]. A general bidding guide uses 10–15% on materials. https://fieldcamp.ai/blog/how-to-price-a-fencing-job.md [C]

---

## 2. Labor

### 2.1 Production rates (weak evidence; calibrate from field data)
- Wood privacy: 4–6 crew-hours per 100 LF with a 2-person crew (vendor figure). https://fieldcamp.ai/blog/how-to-price-a-fencing-job.md [C]
- Wood privacy: 40–60 LF/day for a small crew on level ground. 100 ft takes 1–2 days for 2 installers. 200 ft takes 2–3 crew-days. https://new.risingsunartscentre.org/news/wood-fence-installation-labor-cost-guide-2026.html [C, low quality]
- These two disagree by about 3×. Treat both as unvalidated. FenceBound's own field-data capture (the stated priority over FenceScraper public-market evidence) should replace them.
- Chain link: 100 ft at 8–20 hours, i.e. 0.08–0.2 h/LF. https://new.risingsunartscentre.org/news/labor-cost-to-install-chain-link-fence-price-guide-2026.html [C]
- Farm fence: brace assemblies are up to 50% of construction time (NRCS-based guide above). Wire fencing labor runs $1.10–$2.50/LF. https://match.angi.com/cost/fencing/woven-wire-fence [C]
- RSMeans 32 31 13 crew B-80/B-80C daily outputs were **not retrievable**. Buy the RSMeans line items if a citable labor-hour basis is needed.
- **Recommended model shape [D]:** labor = posts × (dig/set hours per post by method and soil) + LF × (hang hours per LF by type) + gates × (hours per gate) + braces × (hours per brace) + mobilization. A per-post plus per-LF split matches how NCDOT pays (posts per each, fabric per LF) and how contractors price rock (per hole).

### 2.2 Crew and burden
- A 2–3 person crew is typical in residential cost models. https://new.risingsunartscentre.org/news/wood-fence-installation-labor-cost-guide-2026.html [C]
- Labor burden of 25–35% of base wage is typical (payroll taxes 10–12%, plus workers' comp, plus benefits). One worked example is 35.0%. On productive hours it reaches about 56%. Workers' comp drives the variance: carpentry runs $8–15 per $100 of payroll. https://projul.com/blog/construction-labor-burden-calculation-guide ; https://constructioncoverage.com/business/labor-burden [C]
- Example anchor: a Greenville SC contractor paid laborers $200/day. https://www.24-7pressrelease.com/press-release/452008/greenville-sc-fence-contractor-details-some-industry-secrets [B, dated]

### 2.3 Difficulty and site adders
- **Hard digging** (rock, roots, crushed stone, old concrete) is billed **per affected hole**, not per job, and the crew shows the customer each one. https://fenceall.com/what-is-considered-hard-digging/ [B]
- **Rock:** charged at time and material with a not-to-exceed cap per post (Strasburg VA bid). https://www.strasburgva.com/media/24721 [A]. Core drilling is charged hourly plus overhead and profit (Greenwich CT). https://www.greenwichct.gov/DocumentCenter/View/44964 [A]. Rock core holes are about 1-5/8–1-7/8" × 6–12" deep, grouted or anchored. https://wambamfence.com/knowledgebase/how-do-i-deal-with-rocks-and-other-underground-obstructions [B]
- **Normal digging** runs about $10–20 per hole, and the wider range seen is $7–180 per hole. https://www.heavyequipmentforums.com/posts/564383/ [C]
- **Slope:** no numeric surcharge source was found. Model it as a multiplier on hang labor plus racking/stepping material and flag it "owner-set".
- **Removal and haul-off:** $3–7/LF (Angi 2025). Typical job $300–750. Concrete-footed posts cost more; post extraction runs $4–12 each. Disposal is often separate at about $0.50–2/LF or a flat haul fee of about $120–250. https://www.angi.com/articles/fence-removal-cost.htm ; https://www.collegehunkshaulingjunk.com/blog/fence-removal-cost/ [C]
- **Minimum job:** a contractor states that jobs under $500 lose money on labor and overhead at $200/day labor. https://www.24-7pressrelease.com/press-release/452008/greenville-sc-fence-contractor-details-some-industry-secrets [B, dated]. Service calls run $75–300. https://selector.kurlon.com/live/fence-repair-cost-guide-2026-24411.html [C]

### 2.4 Utility locate and permits (North Carolina)
- **NC811** must be notified at least **3 full working days** before digging, and fence posts count. The count starts the first working day after notice and excludes weekends and holidays. The service is free (811 or 1-800-632-4949, or online). It covers **member utilities only**; private lines such as irrigation, private gas and low-voltage are the excavator's to locate. Statute: N.C.G.S. Ch. 87 Art. 8A. https://www.h2gonc.gov/187/NC811 ; https://nc811.org/811-day ; https://open-exam-prep.com/study-guides/nc-general-contractor/safety-codes/one-call-utility-safety [A/B]
- Sources conflict on ticket life: 15 working days (call811.com, https://call811.com/state/north-carolina) versus 28 calendar days from the work start date (study guide). Confirm with NC811 before encoding.
- **Estimating implication:** the 3-day lead is a scheduling constraint, not a cost. Private-line locating, if offered, is a separate line item.
- **NC licensing:** an NCLBGC license is required when total project value (labor plus materials) is **≥ $40,000** (raised from $30,000 by S.L. 2023-108, effective Oct 1, 2023). Unlicensed work above that is a Class 2 misdemeanor and the contract may be unenforceable. N.C.G.S. § 87-1. No fence-specific license was found. https://cinderblock.com/blog/north-carolina-general-contractor-license-limits/ ; https://beancount.io/blog/2026/09/27/north-carolina-40000-contractor-license-threshold-job-costing-guide [B]. **Candidate validation warning:** quote total ≥ $40,000.
- Permits are set locally (by municipality and HOA). No statewide figure exists, so carry a pass-through line item.

---

## 3. Pricing math

### 3.1 Cost build-up
The common sequence is:
1. Direct materials (with waste).
2. Direct labor (burdened).
3. Equipment, disposal and permits.
4. Overhead.
5. Profit.

Sources: https://getjobber.com/academy/fencing/how-to-price-a-fencing-job/ ; https://www.jobnimbus.com/blog/how-to-bid-a-fence-job [C]
- Overhead is shown as 20–30% (FieldCamp), or as 35% of direct cost (Jobber's worked example). https://fieldcamp.ai/blog/how-to-price-a-fencing-job.md [C]
- Price gates and corners as separate line items, not as per-foot averages. https://alwaysdobetterllc.com/how-to-bid-fencing-jobs/ [C]
- Several contractor videos warn against flat per-foot pricing because it underprices short, complex jobs. Examples: "Contractors, stop pricing by the foot!!!" https://www.youtube.com/watch?v=PXdd5CmgrrE ; "How Fencers quote their jobs" https://www.youtube.com/watch?v=NkrwuUO3aZY ; "The TRUE Cost Of Building A Fence Explained" https://www.youtube.com/watch?v=LVNHIMyu240 ; K&C Fence (Nashville) "How To Estimate A Fence" https://www.youtube.com/watch?v=Yage8E8r1zM ; Fence Cloud supplier-catalog material templates https://www.youtube.com/watch?v=NPjfKd8rBFA. Only titles and snippets were reachable, with no transcripts. [C]

### 3.2 Markup vs margin
- Price = Cost ÷ (1 − margin). Markup = margin ÷ (1 − margin). Margin = markup ÷ (1 + markup). https://groundplan.com/blog/markup-vs-margin ; https://buildern.com/resources/blog/construction-profit-margin-vs-markup-2/ [C, arithmetic verified]

| Gross margin | Required markup | Cost multiplier |
|---|---|---|
| 20% | 25.0% | 1.250× |
| 25% | 33.3% | 1.333× |
| 30% | 42.9% | 1.429× |
| 33.3% | 50.0% | 1.500× |
| 35% | 53.8% | 1.538× |
| 40% | 66.7% | 1.667× |
| 45% | 81.8% | 1.818× |
| 50% | 100.0% | 2.000× |

- The classic error: Jobber's example applies 20% "profit" as a markup on cost ($5,400 → $6,480), which is only a 16.7% margin. FieldCamp's example divides by (1 − 0.30): $10,618 → $15,169. https://getjobber.com/academy/fencing/how-to-price-a-fencing-job/ ; https://fieldcamp.ai/blog/how-to-price-a-fencing-job.md. **Candidate validation:** label every percentage field explicitly as markup or margin and show the other one alongside it.

### 3.3 Typical margins (fence-specific benchmarks are weak)
- Gross margin is 35–50% and net is 10–25% for "well-run" fence operations (content-marketing blog). https://www.upperinc.com/?p=78885 [C]
- Vendor targets: residential 25–35%, commercial 20–30%, custom 35–45% margin. https://fieldcamp.ai/blog/how-to-price-a-fencing-job.md [C]
- One real broker listing reports a retail-plus-install fence company at 31.9% and 21.6% gross margin across two entities, 2020–2023. https://loopnet.ca/biz/Business-Opportunity/retail-fence-company-with-installation-and-custom-fabrication-services/2208349 [B]
- No AFA or industry benchmark was found. AFA's Certified Fence Contractor (CFC) exam covers "Estimating and bidding", and preparation is the one-week Fence Contractor Business School. https://americanfenceassociation.com/credentialing/certified_fence_contractor/ ; https://www.AmericanFenceAssociation.com/schools/fence_contractor_business_school/ [A]. No public CFP or estimating syllabus was found.
- **Candidate validation bands:** warn if gross margin is below 25% or above 55%. Hard-warn if it is ≤ 0 (price ≤ cost).

### 3.4 Terms: deposit, validity, escalation
- **Deposit:** fence proposals commonly require **50% at signing** to be placed on the schedule. Balance is due on completion, and is delinquent after 30 days. Cancellation carries a 25% restocking fee on materials. https://docs.southbendin.gov/WebLink/0/doc/304714/Page4.aspx ; https://www.scituatema.gov/sites/g/files/vyhlif11836/f/pages/amended_tscg_cpc_application_w_attachments.pdf [B]. No NC statutory deposit cap was found; verify before encoding a limit.
- **Quote validity:** 30 days is common (railing supplier example) https://www.floridabuilding.org/fbc/commission/FBC_0317/Acc_Adv_Council/227/227_1_COST_EST_COMPLI_RailingQuite2.pdf [B]. Fence proposals print a "good thru" date [B, as above].
- **Escalation clause:** name the materials covered, a baseline price, and a trigger (e.g., more than 10% over baseline between signing and purchase). An index or regional average can serve as the baseline. Steel, aluminum and lumber are the 2025 tariff-exposed materials. AIA forms carry no model clause. https://constructionmagazine.news/TXC/article/AA114B2C-stay-ahead-of-potential-impacts-from-proposed-tariffs-with-price-escalation-clauses ; https://www.stinson.com/newsroom-publications-tariff-turbulence-strengthening-construction-contracts-to-weather-the-storm ; https://www.millernash.com/industry-news/dealing-with-the-ups-and-downs-the-importance-of-price-escalation-clauses-in-construction-contracts [B]
- **Change orders:** must be written and signed before any added material or labor is ordered. https://docs.southbendin.gov/WebLink/0/doc/304714/Page4.aspx [B]

### 3.5 Sales tax — North Carolina (important; verify with a CPA or NCDOR)
- **Real property contract (RPC) vs RMI.** NC taxes construction work one of two ways:
  - **(a) Real property contract:** a capital improvement (new construction, reconstruction or remodeling). The **contractor is the consumer** of the materials. It pays sales or use tax when it buys them and **does not charge sales tax to the customer**. The rule is G.S. 105-164.4H, in effect since 1/1/2015 per the NCDOR notice.
  - **(b) Repair, maintenance and installation (RMI) service:** the contractor **charges sales tax on the total sales price, labor included**.

  Sources: https://www.ncdor.gov/documents/important-notices/important-notice-real-property-contracts/open ; https://www.ncbarblog.com/tax-north-carolina-construction-sales-and-use-tax/ ; https://www.ncdor.gov/suplr-2024-0010pdf/open [A/B]
- **Fences are not named** in either list. Any permanently affixed addition **not specifically listed as RMI** is a capital improvement. RMI includes installation of an item "that may replace a similar existing item" (SUPLR 2025-0005 language). https://www.ncdor.gov/suplr-2025-0005pdf/open ; https://canons.sog.unc.edu/2022/12/north-carolina-sales-and-use-taxes-and-purchases-of-repair-maintenance-and-installation-services-what-local-governments-should-know/ [A/B]
- **Inference [D] (not confirmed by NCDOR for fences):**
  - A new fence on unfenced property is likely an RPC. The contractor pays tax on materials, the customer is not charged sales tax, and material tax is built into cost.
  - **Replacing an existing fence, and fence repair, may be RMI**, which is taxable to the customer on the full price.
  - A job with both is a **mixed transaction contract** with its own allocation rules.
  - The **Affidavit of Capital Improvement (E-589CI)** documents the RPC treatment.

  FenceBound should model a per-job tax mode (RPC / RMI / mixed) rather than a single "tax materials" toggle.
- Retail-trade status (NAICS, majority of revenue) **no longer** affects RPC treatment (NCDOR Directive SD-16-3). https://ncdor.gov/documents/directives/sales-use-tax-directive-16-3/open [A]
- **Rates:** state 4.75% plus local up to 2.75%. Common totals are 6.75% (most counties), Wake 7.25%, Durham and Orange 7.5%, and **Mecklenburg 8.25%** (1% transit tax under S.L. 2025-39; per the March 2026 Fiscal Research table). https://sites.ncleg.gov/frd/wp-content/uploads/sites/7/2026/04/Taxes-Local-Sales-Tax-Articles-2026.pdf ; https://news.bloombergtax.com/daily-tax-report/north-carolina-dor-releases-current-sales-use-tax-rates [A]. Rates should be data, not constants.
- Other states differ. Virginia treats a seller-installer of fences as a retailer, for example. https://tax.virginia.gov/laws-rules-decisions/rulings-tax-commissioner/85-122

---

## 4. Installed $/LF sanity bands (2025–2026, national unless noted)

Use these only for **soft validation warnings** (outside the band means "check inputs"), never as prices.

| Fence type | Band (installed $/LF) | Sources |
|---|---|---|
| Chain link, residential 4–6 ft | $9–30 (core $12–25) | HomeAdvisor https://www.homeadvisor.com/article.show.Chain-Link-Fencing.9120.html ; Cool Cat https://coolcatfence.com/chain-link-fence-cost-per-foot/ ; Inch Calc $5–15 https://inchcalculator.com/cost-to-install-fence |
| Chain link, NCDOT bids (48" fabric only, posts paid separately) | $10–39 | NCDOT tabs: Div 10 Jul 2025 $10–11 https://connect.ncdot.gov/letting/Division%2010%20Letting/07-16-2025/Bid_Tabs_Summary_MJ00076.pdf ; Div 7 Apr 2025 $13–15 (48"), $15–49 (72–96") https://connect.ncdot.gov/letting/Division%207%20Letting/04-03-2025/MG00449%20BID%20TABS.pdf ; Div 5 Sep 2024 $35–39 https://connect.ncdot.gov/letting/Division%205%20Letting/09-11-2024/ME00061%20Bid%20Tabs.pdf |
| Commercial chain link 6–8 ft with barbed wire | $25–40 (barbed adds about $3–5/LF) | https://new.risingsunartscentre.org/news/chain-link-fence-with-barbed-wire-cost-guide-2026.html [C, low] |
| Wood privacy 6 ft | $20–50 national. Raleigh $17–27 (2022) | HomeAdvisor https://homeadvisor.com/cost/fences/install-a-fence ; HomeBlue Raleigh https://www.homeblue.com/wood-fence/raleigh-nc-wood-fence-cost.htm ; NC contractor 2026 $20–50 https://fence-works-website-lbay8.kinsta.page/news/wood-fence-cost-graham/ |
| Vinyl privacy 6 ft | $25–65 (national $30–60). Raleigh $27–43 (2022), $36–65 (2025) | HomeAdvisor; https://www.homeblue.com/vinyl-fence/raleigh-nc-vinyl-fence-cost.htm ; https://raleighrealty.com/blog/fence-cost-2024 ; https://www.inchcalculator.com/cost-to-install-fence/ |
| Aluminum ornamental 4–6 ft | $20–75 (core $25–55). Solid privacy aluminum $75–180 | HomeAdvisor; https://www.inchcalculator.com/cost-to-install-fence/ ; https://globusgates.com/?p=54199 |
| Split rail | No reliable 2025 source found. Leave as an owner-set band | — |
| Woven wire / field fence (farm) | $1–10 (contractor). Extension budgets $3–5 | Angi https://match.angi.com/cost/fencing/woven-wire-fence ; Missouri G1193 https://extension.missouri.edu/publications/g1193 ; Iowa State FM1855 (2025 ed.) https://store.extension.iastate.edu/Product/fm1855-pdf |
| Woven wire, NCDOT 47" | $6–45.50 | NCDOT tabs above |
| High-tensile | $1.60–4.50 (Missouri six-wire: $2.86) | https://airport-transportation-services.fixr.com/costs/wire-fence ; Missouri G1193 |
| Barbed (5-strand) | $1–8 (Missouri: $3.55) | Fixr; Missouri G1193 |
| Removal and haul-off | $3–7 (up to $10) | Angi https://www.angi.com/articles/fence-removal-cost.htm |
| Gates (chain link, standard walk) | $150–400 each | https://new.risingsunartscentre.org/news/chain-link-fence-with-barbed-wire-cost-guide-2026.html [C, low] |

Notes: NCDOT bids vary 3–4× between lettings for the same item, so they are evidence of spread, not a center. Consumer bands are wide because they mix regions, heights and job sizes. Short jobs land above the band because mobilization is spread over few feet. The validator should therefore compute $/LF **excluding** fixed mobilization, gates and removal, or widen the band for runs under about 100 LF.

---

## 5. Implications for FenceboundCAD (recommendations only; owner decides)

1. **BOM generation:** split posts (each) from fabric and rails (LF), mirroring NCDOT pay items. Derive terminal hardware from post role (end, corner, gate) per §1.1 counts.
2. **Concrete:** compute per hole from diameter, depth and post displacement ÷ bag yield, rather than a flat bags-per-post. Allow gravel-set line posts for wood and split rail.
3. **Labor:** use per-post plus per-LF plus per-gate plus per-brace components, a burdened rate, and per-hole hard-dig adders (§2.3).
4. **Pricing UI:** state markup vs margin explicitly and show the conversion. Keep the margin and markup inputs separate from rate-card **values** (no value changes are implied by this research).
5. **Tax:** add a per-job NC tax mode (RPC / RMI / mixed) and a county rate table. Under RPC, tax is in material cost and is not a customer line.
6. **Validation warnings (soft):** $/LF outside the §4 band for the type; gross margin < 25% or > 55%; price ≤ cost; total ≥ $40,000 (NC GC license); missing NC811 lead time in the schedule; job total < minimum-job threshold (owner-set, ~$500 anchor).
7. **Data gaps to close with field data:** production rates, split rail and welded wire bands, razor wire specs, nails per picket, and RSMeans labor hours.
