# Hardware spec reference — C0

Research date: **2026-10-15**. Application baseline: `424750b06ef876b826a26329d0fc3f13bd583435`.
Branch: `codex/counting-c0`, based on `claude/focused-bell-rirwad`.
Reference evidence only; this document changes no application counts, prices, or doctrine.

## Read this before applying a count

The application has generic material types, not manufacturer/SKU assemblies. A rule for one
named system is not a rule for every fence made of that material. Product selection, gate
leaf width, connection details, and footing design must be known before turning these
references into changes. Catalog availability is not an installation requirement.

The comparison below covers every line in the 14 existing `GOLDEN` BOMs in
[`tests/takeoff-counts.spec.js`](../../tests/takeoff-counts.spec.js), plus separately identified
commercial/gate/add-on gaps. These goldens describe current output, not independent truth.
Runtime formulas were checked in `calcAutoMaterials`, `FENCE_TYPES`, `DEFAULT_FOOTING`,
`DEFAULT_POST_OD_IN`, and the gate loop in [`index.html`](../../index.html).

Verdicts:

- **matches**: the stated quantity agrees with the cited rule within the stated scope.
  A quantity match does not certify stock length, diameter, grade, kit contents, or purchase rounding.
- **bug (source says X)**: a specified reference assembly requires a different item/count.
  Conditional findings require that assembly to be selected before C0b may apply them.
- **owner choice (sources disagree)**: competing product specifications or an owner rule conflict;
  the alternatives are retained rather than blended.
- **unverified**: the source does not establish the needed rule or the product is unidentified.
  This explicit evidence-gap label is necessary: calling missing evidence a disagreement or a
  match would be false. Consequently the handoff's strict three-label completion criterion is
  **not yet fully satisfied**. Stop here for the listed decisions/evidence; do not re-audit or
  proceed to C0b/C1.

## Sources and applicability

All links were inspected on 2026-10-15. Dates below are document revisions where established;
“undated” means no revision was established, not that the document is current. PDF pages are
one-based unless a printed catalog page is given. Manufacturer-authored PDFs hosted by a
retailer remain attributed to their manufacturer. No reseller calculator or AI answer supplies
an installation rule.

| ID | Literature, revision and locator | Scope |
|---|---|---|
| S1 | Merchants Metals, [DIY Chain Link Fence Planning and Purchasing](https://pdf.lowes.com/productdocuments/6d9d423f-70d8-4e9f-b5c0-6c9012e83974/05392110.pdf), MM 285 LDIYZ, 2/11, p.1 checklist and steps 1–7 | Residential 4/5/6 ft DIY system; manufacturer PDF hosted by Lowe's |
| S2 | Master Halco, [Chain Link Products / Reference Guide](https://campanellafence.com/pdf/master-halco-chain-link.pdf), PDF metadata title updated Jan 2020, p.7 galvanized framework table | Historical manufacturer guide, distributor-hosted; alternative pipe grades, not a universal design |
| S3 | Master Halco, [Galvanized Chain Link Fence Specification](https://www.masterhalco.com/hubfs/MH%20PDF%20Files/Chainlink-Downloads/Galvanized-Chainlink/Specifications/MH-Galvanized-Chain-Link-Fence-Specification.pdf?hsLang=en), undated, §§2.04, 2.07, 3.02–3.05, pp.4–9 | Commercial/industrial editable specification; project blanks are not selected defaults |
| S4 | Merchants Metals, [Secure-Trac Chain Link Cantilever Slide Gate](https://merchantsmetals.com/wp-content/uploads/2014/04/Secure-Trac-Chain-Link-Cantilever-Slide-Gate-spec.pdf), undated (URL directory 2014/04), §2.1 and framework installation, p.2 | Named internal-track cantilever system |
| S5 | Merchants Metals, [EverGuard PVC Fence](https://www.merchantsmetals.com/wp-content/uploads/2023/11/EverGuard-Brochure-2023-11-23-web.pdf), MM 222 EG 11/23, pp.4–5 | Privacy and ranch-rail catalog choices |
| S6 | Homeland Vinyl, [Privacy Panel & Gate Install Instructions](https://homelandvinyl.com/assets/2024/09/2024-PrivacyGateInstall.pdf), 2024-09-24, pp.2–6 | A specific routed privacy installation, not all vinyl |
| S7 | Homeland Vinyl, [Routed Posts / privacy assembly tables](https://app.homelandvinyl.com/products/homeland/fence/privacy-fence/posts/5-x-5-routed/), undated, HVPp-22 and 6×6 Nexus privacy with mid-rail tables | Component-level alternatives; shared posts must be deduplicated |
| S8 | Merchants Metals, [Ornamental Installation Instructions](https://www.merchantsmetals.com/wp-content/uploads/2023/11/Ornamental_Instructions.pdf), undated (URL directory 2023/11), p.1 | Bracket-mounted residential/heavy-duty system |
| S9 | Jerith, [Premier Catalog](https://www.jerith.com/us/en/content-fragments/products/premier/assets/documents/Premier%20Catalog_with%20bookmarks.pdf), effective 01/2024, printed pp.4.31–4.32 (PDF pp.31–32) | Premier punched-post aluminum system |
| S10 | Jerith, [Aluminum Fence Installation](https://www.jerith.com/site-documents/contractor-resources/product-documents/Aluminum%20Fence%20Installation.pdf), undated, pp.1–3 | Earlier installation guide; do not assume every hinge is this model |
| S11 | Merchants Metals, [Pressure Treated Pine](https://www.merchantsmetals.com/wp-content/uploads/2015/07/PressureTreatedPine_Brochure.pdf), MM 335 PTP 07/15, p.4 | Wood styles and hardware availability; no fastening schedule |
| S12 | Master Halco, [PostMaster v3 Traditional Solid Board Fence Installation Guidelines](https://www.masterhalco.com/hubfs/PostMaster%20v3%20Traditional%20Vertical%20Instalation.pdf?hsLang=en), MHAL9054F, ©1/26, pp.1–2 | Wood fence on v3 steel posts |
| S13 | Master Halco, [PostMaster Specifications](https://www.masterhalco.com/hubfs/MH%20PDF%20Files/PostMaster-Downloads/PM-SPECIFICATIONS.pdf?hsLang=en), undated, §§2.03, 3.02, p.3 | Different PostMaster document; version conflict with S12 |
| S14 | Master Halco, [Specialty Wood](https://www.masterhalco.com/wood/specialty), undated, Post & Rail Poplar/Locust | West Virginia split-rail system |
| S15 | Master Halco, [Blue Book 2018](https://www.masterhalco.com/hubfs/MH%20Blue%20Book%202018%20Edition%20-%20012808%20%26%20012809.pdf?hsLang=en), printed WD-56 | Historical cedar split-rail sizes; primary-domain indexed page reviewed, whole PDF not downloaded |
| S16 | Bekaert, [Building a Bekaert High Tensile Fence](https://fencing.bekaert.com/content/dam/sws-b2c/pdf/High_Tensile_Guide_2012_read_low.pdf?la=en), filename 2012, pp.5–11 | High-tensile smooth/barbed system with specified bracing |
| S17 | Master Halco, [Agricultural Fencing Solutions](https://www.masterhalco.com/hubfs/Master%20Halco%202021/Agriculture/MH_Agriculture_Brochure_Fnl_updated5.17.2022.pdf?hsLang=en), filename updated 2022-05-17, printed pp.9, 12–15 | T-post packaging and welded livestock panel sizes |
| S18 | Merchants Metals, [Tuf-Temp Fence](https://www.merchantsmetals.com/wp-content/uploads/2017/02/TufTemp_Brochure.pdf), MM 201 TT 9/08, p.2 | Temporary panel system with conflicting dimensions |
| S19 | QUIKRETE, [Concrete Mix No.1101 data sheet](https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf), revision not established, p.1 Yield | Bag yield only; does not select a footing |
| S20 | Master Halco, [Blue Book — Chain Link](https://www.masterhalco.com/hubfs/MH%20PDF%20Files/Chainlink-Downloads/Overview-Chainlink/Blue-Book-Chain-Link.pdf?hsLang=en), ©2018, printed CL-184 (PDF p.186) | Industrial swing gates, hardware inclusions and post schedule |
| S21 | Jewett Cameron, [Adjustable Gate Frames AG36/AG60 Installation Instructions](https://cdn.shopify.com/s/files/1/0598/3056/6964/files/AAG-Instructions-AG36-AG60-MULTI_-_Sept_2024.pdf?v=1727805324), filename Sept 2024, pp.1–4; linked from [manufacturer instructions](https://jewettcameronfence.com/pages/installation-instructions) | Wood-clad adjustable gate kit; product-page width conflict retained |
| S22 | Barrette Outdoor Living, [Vinyl Post & Rail/Ranch Rail Installation Instructions](https://www.barretteoutdoorliving.com/wp-content/uploads/2021/06/BARRETTE-WEB_PNR.pdf), WEB REV 2.21, pp.3–5 and translated dimension diagrams pp.8/13 | Specific routed ranch-rail system |

Supplier identity: the owner clarified “Capital Fence Supply” as **Statesville, NC, near
Charlotte** during C0. Do not substitute Capital Fence & Rail in Maryland/Virginia.
The [Fencing Supply Group location directory](https://fencingsupplygroup.com/locations-map/)
identifies Merchants Metals at 165 Fanjoy Road, Statesville. That does not establish the
identity of the separately named Capital supplier. Its exact catalog remains unresolved.
Another plausible candidate is [Capitol Wholesale Fence's Charlotte branch](https://capitolwholesale.com/contact),
4709 Rozzelles Ferry Road, Charlotte, NC 28216, 704-399-5664. The official contact page
does not list Statesville. Its [vinyl brochure](https://capitolwholesale.com/wp-content/uploads/2022/08/CapitolVinylProducts20200226.pdf)
is a candidate resource, not silently attributed to the owner's supplier.
No claim is made about the owner's distributor accounts, prices, or endorsements.

Access: the web reader rejected S6's content type and S20's size; direct downloads succeeded.
S6: **377670 bytes**, SHA-256 `04020bed008e4e27b0924ddeeee88c579989614f6b4c48712969652383d4de6d`.
S20: **29019426 bytes**, SHA-256 `458150e55cbbcc879b8c2e99bdf40de8c72f2b8ce9549e9e9a1ba66dc83b253b`.
PDFs and extraction tools stayed under `/tmp/fencebound-c0-*`, outside the repository.
If a required PDF cannot be retrieved, the handoff requires owner delivery to
`~/Developer/_inbox`, followed by byte-count and SHA-256 verification before use.

## Reference rules

### Residential chain link

**CL-R (S1):** 1⅝-in line and 2⅜-in terminal posts; one terminal per end/corner,
two per gate. One bar per end/gate connection, two at a corner; bands per bar = height
in feet minus one. Each bar gets a rail-end band and cup. One appropriate cap per post.
One bolt per tension/rail-end band. Walk/drive assemblies need respectively 2/4 post
hinges, 2/4 frame hinges and 1 latch. Openings: 39/42/48 in walk; 10/12 ft drive.
Ties: approximately 12 in vertically, 24 in along rail. Swedged rail connects directly.
The checklist's rounded footage rule for line posts must not replace its actual layout
diagram at ends/gates. The diagram permits driven line posts and site-dependent footings.

**CL-S (S2):** galvanized residential line OD: 1⅝ in at 3–5 ft, 1⅞ in at 6 ft+;
terminal OD: 1⅞ or 2⅜ in at 3–5 ft, 2⅜ in at 6 ft+. Commercial line choices:
1⅞ or 2⅜ in at 3–5 ft, 2⅜ in at 6 ft+. Commercial terminal choices include
2⅜/4 in at 3–5 ft; heavy gates have additional sizes. Select the table's corresponding
grade/wall, not OD alone. S1 and S2 are different product recommendations.
Neither establishes the app's universal 9/10.5-ft residential stock lengths.

### Commercial chain link and gates

**CL-C (S3):** line spacing alternatives 8 ft or maximum 10 ft; bands maximum 15 in;
line ties 15 in, rail/brace ties and wire hog rings 24 in. Plain top rails 21 ft, joined
with sleeves. At 6 ft+, brace/truss each terminal fabric connection. Footing example:
4× post width, post bottom 36 in below grade, excavation 6 in deeper.
These differ from owner field settings; they are not automatic replacements.

**G-C (S20, CL-184, 1⅝-in frame rows):** gate post OD by **leaf** width:

| Gate height | Leaf width | Post OD |
|---|---|---|
| ≤6 ft | ≤4 / >4–10 / >10–18 ft | 2⅜ / 2⅞ / 4 in |
| >6 ft | ≤6 / >6–12 / >12–18 / >18–24 ft | 2⅞ / 4 / 6⅝ / 8⅝ in |

S20 includes caps with singles; doubles also include the industrial drop-rod assembly.
Other gate hardware and posts are separately specified. Its 1⅞-in frame rows use a
different schedule regardless of height. Do not combine schedules from different frames.
S3 §2.07 adds a latch, inactive-leaf drop rod/receiver, and holdbacks for leaves over 5 ft;
§3.05 also requires holdbacks on all doubles. Its receiver footing is 6×24 in.

**G-S (S4):** Secure-Trac single track: 3 posts (2 supports, 1 latch), 2 trucks;
dual track at 31–40 ft: 5 posts and 4 trucks. Posts are 4-in schedule 40.
Doubles double the supports and omit the latch post. Above 40 ft requires custom details.
Footing diameter multiplier is 4× through 4-in posts, 3× above; depth is left for the project.
The specification title and §1.2 description differ (chain link versus ornamental pickets);
retain that editorial discrepancy and obtain the selected gate drawing.

### Wood privacy, shadowbox and split rail

**W-P:** S11 establishes available styles and hardware categories, not generic 4×4/6×6
post selection, gate-width thresholds, or nine fasteners per picket. Those remain unverified.
S12's **steel PostMaster v3** system uses standard 2×4/2×6 rails, centers = rail length
+1.5 in, 6–10-in holes, 24-in line and 30-in corner/gate depths subject to conditions.
S13 instead says rail length +2 in and 30-in holes. This is a product/version choice,
not permission to transfer either rule to the app's wood 4×4 posts.

**W-G (S21):** AG36/AG60 kits have two post hinges, two frame hinges, latch and truss
cable; illustrations use 4×4 posts and 2×4 rails. Manual opening ranges are 30–60 /
60–96 in respectively. Two kits form a double; drop rods are separate recommendations.
Board attachment may use nails or screws, without a per-picket count.
The [current AG36 product page](https://jewettcameronfence.com/collections/best-sellers/products/adjust-a-gate%C2%AE-original-standard-width-full-frame-gate-kit)
says 36–60 in and separately at least 41 in for fit. Preserve this conflict; confirm the
selected revision. That page identifies an adapter for steel-post installations, so pipe
posts are not inherently impossible for wood gates, but the app identifies no adapter.

**W-S:** S14's poplar/locust system has 2/3/4 rails and typical centers 10 ft 4 in.
S15's cedar products offer 8/10-ft rails; two-rail 3-ft fence uses 5 ft 4 in posts,
three-rail 4-ft uses 6 ft 6 in, four-rail 5-ft uses 7 ft 6 in. Stated post girth is
18 in, **not diameter**. These do not verify the app's 11-ft rail/10-ft center/6-ft
post combination. End/corner/line mortises must suit their connections. No sourced
face-board fastening, gate-post, or concrete schedule was established for that combination.

### Vinyl privacy and ranch rail

**V-P (S5):** EverGuard privacy comes in 6/8-ft panel widths, multiple rail profiles,
and optional reinforced bottom rails. Ranch rail uses 5×5-in posts and 1½×5½-in rails,
with 2/3/4-rail options. This brochure does not specify ranch spacing or bag quantities.

**V-H (S6):** privacy posts at 6/8-ft centers; 7–8-in holes with depth selected for
post length/local conditions; concrete outside posts. Bottom rails require inserts.
Each U-channel is secured with three stainless #8 × ¾-in screws; caps are glued.
A 4-ft opening takes a gate 1½ in narrower. Top and bottom hinges are specified;
latch details come from its instructions. This is an alternative to EverGuard's optional
reinforcement, not an assertion that the two products have identical components.

**V-A (S7):** HVPp-22 has two 94-in rails, eight 11.3-in infill boards, two trim
channels and 5×5×96-in posts. The 6×6 Nexus mid-rail assembly instead lists two
pocket rails, one mid-rail, 22 infill pieces, four channels and two inserts. The
catalog's two posts/caps describe an isolated panel: count shared installed posts once.
Separate rails must not be ordered again if the chosen panel SKU already includes them.
These examples do not establish a universal 8-ft-high privacy assembly or gate stiffener.

**V-R (S22):** diagrams specify 96-in centers for 2/3/4 rails, 94¾ in for crossbuck.
Sixteen-foot rails, if used, have staggered ends; a rail need not equal one bay.
Holes are 10 in wide, depth tied to local frost line plus 6 in gravel. Rails clear the
ground by at least 2 in; caps are glued. No generic two/three-rail fence height is selected.

### Aluminum / steel ornamental

**O-M (S8):** bracket-system centers: 96⅜ in residential, 94⅜ in heavy duty;
bracket sizes 1 / 1½ in respectively. The guide attaches brackets at top and bottom
rail ends. In-ground holes are at least 6 in wide and 18 in deep. Gate opening exceeds
leaf width by 2 in with self-closing hinges or 3½ in with the complete hardware kit.
Do not apply this spacing to the app's anonymous 6-ft panel.

**O-J (S9):** Premier ≤6-ft fence posts: 2½×2½×.075-in aluminum; leaves ≤6 ft
wide and ≤6 ft high: 2½×2½×.125-in gate posts. Punched-post centers are 72½ in
for 6-ft panels, 96 in for 8-ft. Fasten every rail/post intersection; caps accompany
posts. Three rails minimum except 4-ft style #000. Gate drawing selects hinges.
S10's hinge example uses two hinges per leaf, each with three post screws and four
gate screws; doubles add a drop rod with guides/hook. Those supplied screws are not
extra purchases if already in the kit. Routed and bracket systems are distinct choices.

### Farm / wire and temporary systems

**F-B (S16):** Bekaert high-tensile system uses a single H-brace through six strands,
double above six. Single brace: ≥8-ft×6-in end post, 8-ft×5–6-in brace post,
10-ft×4-in crossmember, brace pins, 12½-ga brace wire, staples/crimp sleeves.
Brace embedment 36–42 in; driven or compacted backfill, no concrete around wood posts.
Wood line posts 6½–8 ft long, 3½–4½ in diameter. Spacing depends on terrain/stays;
30-ft maximum heavy-grazing spacing requires stays, with closer posts otherwise.
This is not evidence for a universal three-strand or six-foot T-post design.

**F-P (S17):** hog panel 036131 is 34 in×16 ft, ¼-in rod, 11 horizontal lines;
cattle 036130 is 52 in×16 ft with 13 lines. T-post sizes include six feet. Five clips
supplied per post is a **pack quantity**, not a fastening requirement. Panel length
does not establish support spacing. The app's “red-top” description is not a SKU match.

**T-P (S18):** Tuf-Temp uses thermoplastic bases and couplers, optional anti-lift
brackets. Its nominal dimensions (11½×6½ ft) conflict with its drawing (11 ft 4 in×
6 ft 10 in). Neither verifies a 6×12 panel. No per-joint coupler/base, ballast or
gate schedule was established. Do not declare one coupler per joint a universal rule.

### Concrete per hole — preserve the owner's rule

**C-Y (S19):** a 60-lb No.1101 bag yields approximately 0.45 ft³. For an explicitly
selected cylindrical hole, a derived quantity is
`ceil((π × D²/4 × concrete_depth − displaced_post_volume) / 1728 / 0.45)`
with inches as inputs. Gravel, unfilled top, post interior fill, and waste change the
volume. This is a calculation example, not a footing design or an approved app change.

For illustration only: a 12-in-diameter, 30-in concrete column around a solid 3½-in
square post requires about 1.75 ft³ of concrete after subtracting post displacement,
and therefore 4 bags rounded per hole. Changing
the diameter to 8 in gives about 0.66 ft³ and 2 bags. A depth-only table cannot distinguish them.

**C-O (owner authority):** the runtime's field table is 24/30/36/42 in → 2/3/3/4
60-lb bags. It explicitly is not a volume formula. The
[2026-08-28 supplement](../authoritative/FenceBound_Engineering_Bible_v5.4.0_Port_Authority_2026-08-28.md)
and [2026-10-03 developer-log rulings](../development/DEVELOPER_LOG.md) establish field
depths/fasteners, with open items retained in [HANDOFF.md](../../HANDOFF.md).
Do not replace these with C-Y. For each material, hole dimensions and method come from
the selected system (CL-R/CL-C, W-P, V-H, O-M/O-J, F-B), not from one generic bag rule.
Split-rail and temporary footing quantities remain unverified; no zero-concrete rule is inferred
from a brochure's silence. Beyond-42-in extrapolation and line-post concrete remain owner walls.

## Current BOM comparison

Fixture: one 100-ft run, a 4-ft walk opening at 40–44 ft and a 12-ft double opening at
70–82 ft. Net fence = **84 ft**, in sections **40, 26, 18 ft**. Each default golden
starts from a clean page. Quantities below are needed quantities, not pack-rounded orders.
For maximum bay width `s`, the arithmetic reference is
`B = ceil(40/s) + ceil(26/s) + ceil(18/s)`; six section endpoints plus `B−3`
interior posts gives `B+3` physical posts, of which four are gate posts. This arithmetic
is derived here; choosing `s` requires a cited system. Panels may also require offsets,
cut rules and waste not represented by that idealized formula.

Gate kits are opaque: one “with Hardware” line is not proof that it contains every hinge,
latch, drop rod, insert or fastener. A missing separate row does not prove an item is absent
from a kit. Missing kit contents are therefore unverified, not automatically bugs.

### `chainlink`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Chain Link Fabric (48") | 84 | matches | 84 net LF from fixture; CL-R installation excludes gate openings. Roll rounding is C1. |
| Top Rail 1-5/8" | 84 | matches | 84 needed LF; owner rail selection. CL-R/CL-C differ on stock and connections. |
| Line Post 9' (63" cut) | 6 | matches | Derived nine bays minus three sections = six line posts at selected 10-ft spacing. Stock length unresolved (CL-S). |
| Terminal/Corner Post 10.5' (74" cut) | 2 | matches | Two outer endpoints (CL-R). No corner in fixture; stock length unresolved. |
| Tension Bar | 6 | matches | Six section terminations (CL-R). |
| Tension Band | 18 | matches | 6 × (4−1) = 18 (CL-R). |
| Top Rail Sleeve | 9 | owner choice (sources disagree) | CL-R swedged: 0 separate sleeves; CL-C 21-ft plain rails: derived 2+1+0=3 joints without short-piece reuse, versus app 9. Explicit sleeve wall. |
| Post Cap | 12 | matches | 12 physical posts; CL-R distinguishes six line tops and six terminal caps. Generic line is not a purchasable SKU split. |
| Terminal-size Brace Band | 12 | matches | Owner rule: six fabric ends × (one rail + one wire) = 12; CL-R alone covers only its rail. |
| Rail End (Loop Cap) | 6 | matches | Owner rule: six rail ends; CL-R calls these cups, distinct from line-post loop tops. Name conflation remains. |
| Wire Ties 9ga | 63 | matches | Owner 2026-10-03: 5×9 bays + 6×3 = 63. CL-R/CL-C use spatial intervals; owner rule retained. |
| Hog Rings | 45 | matches | Owner 2026-10-03: 5×9 bays = 45; CL-C spacing is an alternative, not applied. |
| 3/8" Carriage Bolt+Nut | 48 | owner choice (sources disagree) | CL-R one per band implies 18+12=30 for the app band assembly, versus 48. Gate hardware bolts are separate; explicit bolt wall. |
| Post Concrete (60lb bag) | 4 | matches | C-O: two terminal holes × 2 bags; this does not settle line-post concrete. |
| Bottom Tension Wire 9ga | 84 | matches | 84 needed LF per selected continuous wire; owner rule. Gauge/coils are separate choices. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | matches | Four physical swing-gate posts (CL-R); stock lengths remain owner choice, G-C changes commercial OD by leaf width. |
| Gate Post Concrete (60lb bag) | 8 | matches | C-O: four gate holes × 2 bags; owner field quantity only. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `woodprivacy`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Dog-Ear Picket 1x4x6' | 288 | unverified | 288 equals 84×12/3.5; W-P does not verify gap/overlap or cut-rounding policy. |
| Post 4x4x9' | 11 | unverified | 11 non-gate posts in current layout; W-P does not establish 4×4×9-ft stock or span for this fence. |
| 2x4 Top Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| 2x4 Bottom Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| 2x4 Mid Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| Post Cap / Finial | 11 | unverified | Optional finials/caps are not established by W-P; cannot infer one per post as a required purchase. |
| Exterior Screws (rails) | 66 | unverified | App 3 rails × 11 non-gate posts × 2 = 66; no cited joint schedule verifies this or gate-post rail attachments (W-P). |
| Exterior Screws (pickets) | 2592 | unverified | App nine screws per picket; neither W-P nor W-G establishes that rule. |
| Post Concrete (60lb bag) | 33 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (104" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 12 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `woodshadowbox`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Dog-Ear Picket 1x6x6' | 275 | unverified | 275 equals ceil(84×12/5.5×1.5); W-P does not verify gap/overlap or cut-rounding policy. |
| Post 4x4x9' | 11 | unverified | 11 non-gate posts in current layout; W-P does not establish 4×4×9-ft stock or span for this fence. |
| 2x4 Top Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| 2x4 Bottom Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| 2x4 Mid Rail | 84 | unverified | 84 LF for this rail line; W-P steel-post reference does not verify generic wood rail layout, joints or stock. |
| Post Cap / Finial | 11 | unverified | Optional finials/caps are not established by W-P; cannot infer one per post as a required purchase. |
| Exterior Screws (rails) | 66 | unverified | App 3 rails × 11 non-gate posts × 2 = 66; no cited joint schedule verifies this or gate-post rail attachments (W-P). |
| Exterior Screws (pickets) | 2475 | unverified | App nine screws per picket; neither W-P nor W-G establishes that rule. |
| Post Concrete (60lb bag) | 33 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (104" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 12 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `woodsplit2`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Split Rail 11ft Rail | 18 | owner choice (sources disagree) | Current nine 10-ft bays × 2 rails; W-S specifies different product lengths/centers. Exact 11-ft product unverified. |
| Split Rail Post 6' | 8 | owner choice (sources disagree) | Eight non-gate posts; W-S cedar length/height choices differ. Gate compatibility and mortise roles unresolved. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `woodsplit3`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Split Rail 11ft Rail | 27 | owner choice (sources disagree) | Current nine 10-ft bays × 3 rails; W-S specifies different product lengths/centers. Exact 11-ft product unverified. |
| Split Rail Post 6' | 8 | owner choice (sources disagree) | Eight non-gate posts; W-S cedar length/height choices differ. Gate compatibility and mortise roles unresolved. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `woodsplit3fb`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Split Rail 11ft Rail | 27 | owner choice (sources disagree) | Current nine 10-ft bays × 3 rails; W-S specifies different product lengths/centers. Exact 11-ft product unverified. |
| Split Rail Post 6' | 8 | owner choice (sources disagree) | Eight non-gate posts; W-S cedar length/height choices differ. Gate compatibility and mortise roles unresolved. |
| 1x6 Face Board | 84 | unverified | 84 LF follows checkbox, but W-S does not specify this face-board assembly/fasteners. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `vinylprivacy6`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Vinyl Privacy Panel 72" | 12 | matches | Derived 5+4+3=12 at selected 8-ft spacing (V-P/V-H); height-specific SKU and kit contents still unverified. |
| Vinyl Post 9' | 11 | unverified | 11 non-gate posts; V-A offers specific post sizes, not a universal height+embed stock rule. |
| Vinyl Top Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Vinyl Bottom Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Vinyl Mid Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Post Cap Vinyl | 11 | unverified | V-H implies 15 installed caps if the four gate posts are vinyl; app lists 11 separately. Gate-kit contents are unknown, so additional purchases cannot be inferred. |
| Stainless Screws | 12 | bug (source says X) | Conditional on a V-H two-channel panel approved for this height: 12×2×3=72 channel screws versus 12; top-rail screw is not a substitute. Gate hardware excluded. |
| Post Concrete (60lb bag) | 33 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (104" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 12 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `vinylprivacy8`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Vinyl Privacy Panel 96" | 12 | matches | Derived 5+4+3=12 at selected 8-ft spacing (V-P/V-H); height-specific SKU and kit contents still unverified. |
| Vinyl Post 11' | 11 | unverified | 11 non-gate posts; V-A offers specific post sizes, not a universal height+embed stock rule. |
| Vinyl Top Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Vinyl Bottom Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Vinyl Mid Rail | 84 | unverified | 84 LF; V-A changes rail profiles/counts by assembly. If included in panel SKU, additional order quantity is 0; kit contents unknown. |
| Post Cap Vinyl | 11 | unverified | V-H implies 15 installed caps if the four gate posts are vinyl; app lists 11 separately. Gate-kit contents are unknown, so additional purchases cannot be inferred. |
| Stainless Screws | 12 | bug (source says X) | Conditional on a V-H two-channel panel approved for this height: 12×2×3=72 channel screws versus 12; top-rail screw is not a substitute. Gate hardware excluded. |
| Post Concrete (60lb bag) | 33 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 11' (128" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 12 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `vinylsplit2`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Vinyl Split Rail | 18 | unverified | Current nine 10-ft bays × 2; V-P lacks spacing, V-R uses a different layout and may use 16-ft rails spanning posts. |
| Vinyl Split Rail Post 6' | 8 | unverified | Eight non-gate posts; no default height is defined. V-P/V-R need selected post/routing/rail product. |
| Post Cap Vinyl | 8 | unverified | Eight caps cover only non-gate posts; gate system unidentified (V-P/V-R). |
| Post Concrete (60lb bag) | 16 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `vinylsplit3`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Vinyl Split Rail | 27 | unverified | Current nine 10-ft bays × 3; V-P lacks spacing, V-R uses a different layout and may use 16-ft rails spanning posts. |
| Vinyl Split Rail Post 6' | 8 | unverified | Eight non-gate posts; no default height is defined. V-P/V-R need selected post/routing/rail product. |
| Post Cap Vinyl | 8 | unverified | Eight caps cover only non-gate posts; gate system unidentified (V-P/V-R). |
| Post Concrete (60lb bag) | 16 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `ornamental`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Ornamental Panel 60" | 15 | owner choice (sources disagree) | Current 7+5+3=15 at 6 ft; O-M uses different panel centers; O-J 6-ft product uses 72½ in. Choose system. |
| Ornamental Post 7' | 14 | owner choice (sources disagree) | 14 non-gate posts; O-M/O-J differ on spans, post profiles and supplied caps. Seven-foot stock not verified. |
| Post Concrete (60lb bag) | 28 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Panel Bracket Kit | 15 | owner choice (sources disagree) | O-M bracket system versus O-J punched posts; 15 generic kits have unspecified contents. |
| Self-Tapping Screws | 60 | owner choice (sources disagree) | Four per app panel; O-J three-rail example has six post/rail intersections. O-M attachment differs; no universal count. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (86" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `cattlefield`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| T-Post 6ft | 6 | unverified | Six drawn line posts at 12-ft spacing; F-P offers 6-ft stock but does not establish support spacing for this assembly. |
| Wood Corner/Brace Post 6' | 2 | bug (source says X) | Conditional on F-B: two 6-ft end posts do not constitute the required end H-braces; brace post/crossmember/pins absent as identified items. Gate bracing needs its own layout. |
| Brace Wire | 4 | unverified | 4 ea has no defined assembly/length; F-B names brace wire but does not support two undefined each per end. |
| T-Post Clips | 51 | unverified | 51 = ceil(84×0.6); F-P five supplied clips/post is packaging, not an installation rule. Do not infer 30 or 18 required clips. |
| Barbed Wire Strand 1 | 84 | matches | 84 net LF for this selected strand; derived geometry only (F-B). Three-strand design/stays are not certified. |
| Barbed Wire Strand 2 | 84 | matches | 84 net LF for this selected strand; derived geometry only (F-B). Three-strand design/stays are not certified. |
| Barbed Wire Strand 3 | 84 | matches | 84 net LF for this selected strand; derived geometry only (F-B). Three-strand design/stays are not certified. |
| Post Concrete (60lb bag) | 4 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `cattlehog`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| T-Post 6ft | 6 | unverified | Six drawn line posts at 12-ft spacing; F-P offers 6-ft stock but does not establish support spacing for this assembly. |
| Wood Corner/Brace Post 6' | 2 | unverified | F-P does not establish rigid welded-panel support/termination posts. F-B tensioned-wire bracing cannot be transferred to this panel assembly. |
| Brace Wire | 4 | unverified | 4 ea has no defined assembly/length; F-B names brace wire but does not support two undefined each per end. |
| T-Post Clips | 51 | unverified | 51 = ceil(84×0.6); F-P five supplied clips/post is packaging, not an installation rule. Do not infer 30 or 18 required clips. |
| Hog Wire Welded Panel (red-top) | 84 | unverified | 84 LF is needed coverage, not panels. F-P 16-ft product would require 3+2+2=7 panels without offcut reuse, if selected; C1 purchase policy deferred. |
| Post Concrete (60lb bag) | 4 | owner choice (sources disagree) | C-O depth-only field table versus selected-system footing/backfill (W-P, V-H, O-M/O-J, F-B); no geometry replacement authorized. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |

### `temporary`

| App BOM line | Current qty | Verdict | Reference comparison |
|---|---:|---|---|
| Temp Panel 6x12 | 9 | unverified | Nine at 12-ft width; T-P dimensions differ and intended product is unidentified. |
| Temp Panel Coupler | 6 | unverified | Six = 9 panels−3 sections; T-P does not establish couplers per joint. |
| Panel Stand / Base | 12 | unverified | 12 = 9 panels+3 sections; T-P does not establish shared-base/end-base quantities. |
| Walk Gate w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |
| Gate Post 10.5' (74" cut) | 4 | unverified | Four physical endpoints; generic pipe item/length is not a verified material-specific gate assembly. See W-G / V-H / O-J / F-B / T-P. |
| Gate Post Concrete (60lb bag) | 8 | unverified | C-O applied to four generic gate posts; selected system/hole design not established. |
| Dbl Drive w/ Hardware | 1 | unverified | One kit per drawn opening; contents/width rating unidentified. CL-R, G-C, V-H, O-J, W-G are alternatives, not interchangeable kits. |


## Non-default comparisons and owner questions

| Scope | Current behavior | Verdict / required decision |
|---|---|---|
| Chain-link commercial sizes | Same generic type and default OD table as residential | owner choice (sources disagree): CL-S / G-C require a selected height, grade, frame and leaf width; no commercial golden exists |
| Cantilever | Gate loop uses the layout's two opening posts and one opaque kit | bug (source says X), **conditional on G-S**: single-track assembly needs a third support/latch arrangement and corresponding footing; dual-track needs five. Confirm kit contents and selected system before C0b |
| Trusses | When mid-rail/truss enabled, counts corner/gate fabric ends, omits ordinary ends | owner choice (sources disagree): CL-C includes all terminal connections at ≥6 ft; handoff explicitly walls truss decisions |
| Top/mid/bottom rails and wires | LF per active line; fasteners use five per bay | matches owner arithmetic for needed LF; owner choice for mid/bottom tie ruling and CL-C spatial spacing. Do not infer purchasable sticks |
| Sleeves / carriage bolts | `ceil(netFt/10)` / `ends × 2 × ceil(heightFt)` | owner choice (sources disagree): CL-R/CL-C connection counts differ; these are explicit owner walls |
| Barbed add-on | LF per strand; one arm per line post | unverified: terminal support details and selected arm system unresolved; farm field type correctly avoids a second copy of its strands |
| Razor coil / welded-wire add-ons | `ceil(netFt/50)` coils / rounded net LF | unverified: selected coil coverage, overlap, mesh product and attachments absent from the source set |
| Corners and shared joints | Role/connection count from drawing; golden is straight | unverified beyond simple topology: collinear-joint CAD-06 remains an owner wall; do not decide from the straight fixture |
| Footings >42 in | Runtime extrapolates the field table | unverified: no owner-approved extrapolation; stop at the handoff wall |
| Vinyl ranch default height | No `defaultHeightIn`; inherited state can select post length | unverified: explicit owner wall; do not choose a height from marketing images |
| Non-chain-link gates | Pipe stock label and generic gate kit for every type | unverified generically; conditional source mismatches for V-H/O-J/F-B require the actual assembly. Request the gate SKU, allowed leaf widths, post/reinforcement schedule and kit contents |
| Wood fasteners / shadowbox | Nine per picket; 1.5× coverage heuristic | unverified for generic wood: obtain the selected board width, overlap/gap, rail and attachment schedule |
| Temporary | Twelve-foot panels, one coupler per joint, one base per junction/end | unverified: resolve T-P dimensions and obtain the intended panel/gate connection schedule |

The required decisions are product identification and the existing owner walls, not an
invitation to redesign the estimator. C0b may use a conditional mismatch only after its
product premise is accepted. Do not begin another task in this run.

## Validation and session boundary

`npm run session:init` reported existing metadata drift: actual `424750b` is three
documentation-only commits after recorded `ea67c4e`, rather than one allowlisted closeout
child. The audit of `git diff ea67c4e 424750b` found no runtime/test changes. This C0
reference does not repair governance tooling or certify the old metadata as current.

Required gate on the unchanged runtime at `424750b`, 2026-10-15:

- `npm test`: **172/172 passed**, including PDF tests, using the ordinary configuration (9.9 minutes).
- `node scripts/cad-persistence-matrix.js`: **12/12 passed**.
- `git diff --check`: passed; the new reference also receives an explicit untracked-file whitespace check.
- Independent read-only review verified all 142 rows and runtime comparisons. Repaired all
  three findings: hog-panel/high-tensile mismatch, opaque-kit vinyl cap procurement, and
  concrete-volume wording. The reviewer did not certify missing product evidence.
- Documentation coverage check: all 14 types and 142 exact item names/quantities appear once;
  all S1–S22 references resolve; whitespace check passed.

These checks establish regression status, not external validity of the hardware assumptions.
The 142 golden-line verdicts are 20 matches, 21 owner choices, three conditional source
mismatches and 98 unverified. Conditional findings are not authorized generic count changes.
No code or golden values are changed. Commit/push and external PR creation remain subject
to the user's explicit closeout and external-creation rules.

## Owner rulings — 2026-10-23

The owner answered the C0 questions in the Claude session `FenceBound · counting r2`.
Each ruling is quoted verbatim, followed by how C0b applies it. Where an application is
marked **confirm**, C0b asks the owner before changing that count.

| # | Question | Owner's words | How C0b applies it |
|---|---|---|---|
| 1 | Concrete per hole (wood, vinyl, ornamental, farm) | "follow specs" | Footing per the selected system's spec (W-P, V-H, V-R, O-M/O-J, F-B). Where a spec gives hole size and depth, bags come from that volume (C-Y method). Where a spec is silent, the C-O depth table stays. **Confirm:** volume method. |
| 2 | Chain link top-rail sleeves | "both should be an option, default being swedged" | Rail choice per job: swedged (default, 0 sleeves, CL-R) or plain 21 ft with sleeves at joints (CL-C). |
| 3 | Carriage bolts | "one bolt per band is correct. gate hardware is indeed separate." | One bolt per tension/rail-end band (CL-R): 30 on the C0 fixture, was 48. Gate hardware bolts counted separately. |
| 4 | Split-rail rails and posts | "first is my and the companies i worked for's spacing. follow specs though so, 10'4" it is." | Centers 10 ft 4 in (W-S, S14). The app's current 10 ft spacing is the owner's field practice, recorded but not used. |
| 5 | Ornamental system | "there is both 6' and 8' panel sizes, it depends on the job and the choice to change it quickly is important." | Per-job panel width, 6 ft or 8 ft, quick to switch. Jerith Premier (O-J) gives both: 72½ in centers for 6 ft, 96 in for 8 ft. **Confirm:** source and default width. |
| 6 | Commercial chain link | "prefer it is its own type etc." | New fence type; height, grade, frame and leaf width drive post OD (CL-S, G-C). |
| 7 | Trusses / brace rails | "every terminal." | Brace/truss at every terminal fabric connection (CL-C). |
| 8 | Ties and spacing | "master halco specs." | Fabric ties 15 in on posts, rail/brace ties and hog rings 24 in (CL-C). |
| 9 | Cantilever gates | "they are custom made so you got that part right but....go with merchants metals." | Merchants Metals Secure-Trac (G-S): single track 3 posts (2 supports, 1 latch) and 2 trucks; dual track at 31–40 ft, 5 posts and 4 trucks; 4 in schedule 40 posts. |
| W2 | Footing depths past 42 in | "no footing depths below 42." | Read as: depth capped at 42 in, no extrapolation. **Confirm.** |
| W2 | Split / ranch rail default height | "3 ft with two rail, 4 foot for 3 rail and 5 for 4 rail." | 2 rail 3 ft, 3 rail 4 ft, 4 rail 5 ft (matches S15). Post lengths per S15: 5 ft 4 in, 6 ft 6 in, 7 ft 6 in. |
| W3 | Straight joint between runs (CAD-06) | "terminals can exist in a straight line on average when theres a grade change, becasue wire has to be cut to grade, some people add one every 200 feet or so, but its ultimately not required unless its cattle fence." | Default: line post. A contractor may mark a straight joint as a terminal (grade change). Cattle fence: terminal required. **Confirm:** cattle rule is at every straight joint, every ~200 ft, or both. |
| W4 | Line-post concrete | "1 bag of concrete for line posts, follow specs." | 1 bag per line post unless the selected system's spec gives a footing. |
| W4 | Residential post stock lengths | "6' post standard for 4' residential. ratio stands for other heights too." | Post stock = 1.5 × fence height (4 ft → 6 ft, 6 ft → 9 ft). **Confirm:** 1.5× rather than height + 2 ft. |
