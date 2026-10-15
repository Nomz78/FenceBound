# 02 — Inventory, materials and BOM takeoff audit

- Repository: `/home/user/FenceBound`, HEAD `82a148f` (main, after PR #13). Runtime `index.html` (5.4.0, schema 3, 4429 lines at audit time).
- Method: read-only. I copied `index.html` to the scratch directory, served it on `127.0.0.1:8765`, and drove the production functions (`selectFenceType`, `autoPostsForRun`, `attachGateToRun`, `rebuildRunAutoPosts`, `getStats`, `calcAutoMaterials`, `lookupCost`, `computePricing`, `validateProject`) in headless Chromium (`/opt/pw-browsers/chromium-1194`). The gate path matches the UI's `handleUp`: attach the gate, then call `rebuildRunAutoPosts`.
- Harness, scenarios and raw output: `/tmp/claude-0/-home-user-FenceBound/8c8b9b51-0d3a-5c83-b950-2a78c38f27f7/scratchpad/inventory-audit/` (`harness.js`, `s1.json`–`s3.json`, `out1.json`–`out3.json`).
- Authority used for the expected values: `Docs/authoritative/FenceBound_Engineering_Bible_v5.4.0_Port_Authority_2026-08-28.md` §"Post lengths, holes, and concrete", §"Fabric termination model" and §"6 plus 1", plus the owner rules in `Docs/CURRENT_HANDOFF.md` (#9, #11, hole depths) and `tests/fixture-168lf.spec.js`. Where no owner rule exists, I used ordinary industry takeoff practice and label it as such.

---

## 1. Map of the BOM and material code (`index.html`)

| Construct | Lines | Notes |
|---|---|---|
| `DEFAULT_FOOTING` (bags by depth 24/30/36/42 → 2/3/3/4, 60 lb) | 648–656 | Footing schedule. The comment says it is not a volume formula. |
| `DEFAULT_POST_OD_IN`, `DEFAULT_POST_EMBED_IN`, `SHORT_FENCE_EMBED_IN`, `embedDefaultFor` | 659–667 | Hole depths by role and height (below 72" vs 72"+). |
| `FENCE_TYPES` (14 types) | 907–1012 | `autoEmbedIn` is defined on every type and never read. |
| `MATERIAL_ORDER/LABEL/COLOR`, `stylesForMaterial`, `materialOf` | 1017–1021 | |
| `GATE_TYPES` (walk 4 ft, doubledrive 16 ft, cantilever 16 ft) | 1024–1028 | |
| `ADDON_DEFS`, `ADDON_MAP` | 1034–1059 | Chain link gets six add-ons; cattle field gets `barbed-wire`. |
| `COMPONENT_MAP`, `COMPONENT_FLAG` | 1064–1081 | Hidden component flags are forced false (see F-6). |
| `S.specs` defaults (48", top rail, bottom wire, …) | 1086–1131 | |
| `embedForHeight` | 1136–1142 | Dead code: no caller. |
| `bagsForHole` | 1145–1151 | Depth lookup only. Diameter is validated but unused. Returns `undefined` for any depth not in the table. |
| `midRailForHeight`, `midRailMandatory`, `bottomWireForHeight`, `applyHeightDrivenSpecs` | 1154–1192 | |
| `normalizeMatKey` | 1200–1213 | Turns a BOM name into a cost key. |
| `DEFAULT_COST_DB` (units informational only) | 1217–1290 | |
| `DEFAULT_LABOR`, `DEFAULT_MARKUP` | 1293–1304 | |
| `lookupCost` (exact match, then trim fallback A, then prefix fallback B) | 1390–1402 | Source of F-1 and F-2. |
| `buildCornerSet` (angle > 0.15 rad within 18 px) | 1418–1431 | |
| `autoPostsForRun` (posts at i·spacing from the start; count = ceil(L/s) − 1) | 1433–1440 | |
| `rebuildRunAutoPosts` (drops posts on a gate segment, no re-spacing) | 1444–1459 | |
| `getStats` (per run: gross/net ft, line/term/corner counts, gate posts, termination ends) | 1487–1524 | Counts only `auto` posts. |
| `chainLinkPostCutIn`, `chainLinkPurchaseFt`, `postLengthLabel` | 1526–1538 | 9 ft line and 10.5 ft terminal purchase lengths. |
| `concreteBagsForPosts` (line role → 0) | 1539–1542 | |
| `calcAutoMaterials` | 1545–1716 | |
| ↳ chain link branch | 1567–1608 | Fabric, rails, posts, bars, bands, caps, cups, ties, hog rings, bolts, truss, concrete. |
| ↳ wood privacy / shadowbox | 1609–1635 | |
| ↳ vinyl privacy 6/8 | 1636–1646 | |
| ↳ vinyl split 2/3 | 1647–1653 | |
| ↳ ornamental | 1654–1662 | |
| ↳ wood split 2/3/+FB | 1663–1669 | |
| ↳ cattle field / hog | 1670–1682 | |
| ↳ temporary | 1683–1687 | |
| ↳ common add-ons (top/bottom/tension wire, barbed, razor, welded) | 1689–1698 | |
| ↳ gates (kit, 2 gate posts, cap, concrete) | 1701–1711 | |
| ↳ merge by `name\|unit` | 1713–1715 | |
| Manual material add (`S.materials.push`, qty stays a string) | 3129–3137 | Unit `<select>` at line 544: ea/ft/lf/roll/bag/box/pr/lb/coil/bundle. |
| `updateMatList` | 2378–2390 | |
| `computePricing` (auto + manual BOM → cents) | 3350–3440 | Manual `Number(qty)` coercion at 3352–3357. The unit is ignored. |
| `validateProject` | 3975–4049 | No takeoff-completeness checks. |
| Cost editor (bag weight, footing, OD/embed, costs) | 3790–3900 | |
| PDF BOM (`exportPDF` 2758; `exportEstimatePDF` 4142) | | Both consume `calcAutoMaterials()`. |
| Inventory or on-hand tracking | — | None exists. There is no stock, on-hand, reorder or supplier concept. |

---

## 2. Per-fence-type coverage and hand checks

Test case: a 100 LF straight run at the type's default spacing. The "gated" case adds a 4 ft walk gate at 40–44 ft and a 12 ft double drive at 70–82 ft, which leaves sections of 40, 26 and 18 ft and 84 LF net. "Expected" means the owner rule where one exists and industry practice otherwise.

| Type (key) | Supported | Completeness | Hand check vs code | Verdict |
|---|---|---|---|---|
| Chain link (`chainlink`) 4 ft | Yes | Best covered type. Gaps: no roll/stick rounding, no dome vs loop caps, post OD/gauge not on BOM lines | Plain: 9 line + 2 terminal ✓; bars 2 ✓; bands 6 ✓; terminal brace bands 4 ✓; cups 2 ✓; ties 77 ✓ (owner rule); hog rings 50 ✓; concrete 4 bags ✓ (2/terminal at 24"). Off-rule items: sleeves 10 (≈4 needed for 21 ft sticks); bolts 16 (bands per end = 5, so 10 needed). Gated: 6 line ✓, 4 gate posts ✓, ends 6 ✓, 84 LF fabric/rail ✓ (gate openings deducted) | Quantities OK. Concrete **priced wrong** (F-1). Line-post concrete conflicts with the authority (F-9) |
| Chain link 6 ft (+mid) | Yes | As above | Bands 5/end ✓; terminal brace bands 3/end ✓; line band 1/end ✓; cups 3/end ✓; 3 bags/terminal ✓; gate concrete 12 ✓ | Same as above |
| Chain link 8–10 ft | Yes | 30" terminal hole at every height ≥ 6 ft. A 10 ft fence gets 13 ft posts in 30" holes | Owner depth table stops at "6 ft and taller" | Design gap (G-3) |
| Wood privacy (`woodprivacy`) 6 ft | Yes | Partial | 14 posts ✓ (8 ft OC); 343 pickets ✓ (1x4 tight); 3 rails ✓ as LF. Concrete 42 bags = 3 for **every** post at the terminal depth: the 24" line depth is ignored, so 2 bags each for line posts (expected 34). Rails priced from the chain-link `top rail`/`mid rail` keys plus a wood `bottom rail` (F-2). Gate posts come out as "Gate Post 10.5' (104" cut)" galvanized pipe (F-5). Post length "4x4x9'" is not a stock length | Several bugs |
| Wood shadowbox | Yes | Partial | 328 1x6 pickets (5.5" × 1.5 factor) is plausible; same issues as privacy | As privacy |
| Vinyl privacy 6'/8' | Yes | Partial | Plain: 13 panels ✓, 14 posts ✓. Gated: **11 panels, 12 needed** (sections 5+4+3) (F-4). Also lists top/bottom/mid rail LF on top of complete panels, a probable double count (G-6). Gate posts are chain-link pipe (F-5). No post stiffeners or gate inserts | Bug + gaps |
| Vinyl split rail 2/3 | Yes | Partial | Posts at 10 ft (`defaultSpacing:10`), but rails computed per 8 ft: **26 rails vs 20 physical** (10 bays × 2) (F-3). No default height, so the post length follows whatever height was last used ("Vinyl Split Rail Post 11'" after an 8 ft vinyl job) | Bug |
| Ornamental (`ornamental`) 4–5 ft | Yes | Partial | Plain 100 ft at 6 ft: 17 panels ✓, 18 posts ✓. Gated: **14 panels, 15 needed by section** and 16 drawn bays (F-4, F-7). Gate posts are chain-link pipe (F-5). Panel count is not tied to bays | Bug |
| Wood split rail 2/3 | Yes | Basic | 20 rails / 11 posts ✓ for 100 ft at 10 ft. No end/corner/line mortise distinction. No concrete (acceptable; split rail is usually tamped) | OK, gaps |
| Wood split + face board | Yes | Basic | Face board always added; the **`hasFaceBoard` checkbox is ignored** (F-12) | Minor bug |
| Cattle field (barbed) | Yes | Minimal | 8 T-posts ✓, 2 wood end posts, 3 × 100 LF barbed ✓ (default 3; the `||4` fallback is dead code). Missing: H-brace (second post, brace rail, ~20 ft brace wire per brace). "Brace Wire 4 ea" is the wrong unit. Clips 60 = 0.6/ft, not posts × strands (24). Enabling the Barbed Wire add-on **doubles every strand and adds barb arms to T-posts** (F-8) | Bug + gaps |
| Cattle hog wire | Yes | Minimal | Hog panel as LF (sold as 16 ft panels or 330 ft rolls); no staples; same brace gaps | Gaps |
| Temporary panels | Yes | Minimal | Gated (4 ft gate): **8 panels vs 9 needed** (sections 4+5); stands = panels (should be panels + 1 per section, so 11); couplers = panels (should be about 7). A gate adds **chain-link 10.5' gate posts and 6 bags of concrete** to temporary fence (F-5) | Bugs |
| Aluminum vs steel ornamental, picket/aluminum pool code, welded-wire farm, high-tensile, pipe rail, board-on-board, horizontal wood, composite, masonry, guard rail | **No** | — | — | Gap (G-1) |
| Legacy `barbedwire` and unknown types | Load only | — | `barbedwire` run, 100 LF: BOM is only "Bottom Tension Wire 100 lf". Labor still priced at $5/LF (total $796.60, materials $16). Validation reports `FENCE_TYPE`. Unknown type `privacy`: total $21.60 | Known defect reproduced (F-11) |

---

## 3. Findings

Severity: **High** = wrong money or wrong order quantities on normal jobs. **Medium** = wrong for a common configuration or silently incomplete. **Low** = cosmetic, rare, or overbuy only.

### Confirmed bugs

**F-1 (High). Every concrete line is priced from the wrong cost entry.**
- `lookupCost('Post Concrete (60lb bag)')` normalizes the name to `post concrete`. The exact and trim fallbacks miss, so prefix fallback B iterates `COST_DB` in insertion order.
- The first hit is `k.startsWith('post ')` against the wood key `post` ($11.00), which comes before `post concrete bag` ($6.50).
- `Gate Post Concrete (60lb bag)` resolves the same way to `gate post` ($24.00 per bag).
- Evidence (`out2.json` "keys"): `["Post Concrete (60lb bag)","post concrete","post",11]` and `["Gate Post Concrete (60lb bag)","gate post concrete","gate post",24]`.
- `concrete_price_edit`: setting `post concrete bag` to $1 leaves the concrete price at $11. Setting the wood `post` price to $99 makes concrete $99 per bag. The "post concrete bag" row in the cost editor is dead.
- This is baked into R15: the comment in `tests/persistence-integrity.spec.js:476–478` attributes a 2970-cent drop to 2 fewer bags, which is 2 × $11 × 1.35. At $6.50 it would be 1755 cents.
- Impact: a 6 ft, 100 ft chain-link job with 2 gates has 6 terminal bags at $11 instead of $6.50 and 12 gate bags at $24 instead of $6.50, about +$237 of cost before markup. Wood and vinyl jobs bill 42 bags at $11.
- This also breaks the authority's rule that "the cost database concrete entry must represent a 60-pound bag."
- Repro: `lookupCost('Gate Post Concrete (60lb bag)') === 24`.
- Fixing it changes R15. It is a pricing-behavior defect, not a pricing-value change, so it needs the defect process and an owner note.

**F-2 (High). Cost-key collisions between materials.**
- `normalizeMatKey` strips dimension chains, so wood `2x4 Top Rail` and `2x4 Mid Rail` price from the chain-link `top rail`/`mid rail` keys ($1.85/lf).
- `2x4 Bottom Rail` prices from the wood `bottom rail` key ($4.20/lf).
- Chain-link `Bottom Rail 1-5/8"` also prices at the wood $4.20/lf.
- Editing the chain-link top-rail cost changes wood privacy quotes, and the reverse.
- The authority requires terminal-size and line-size brace bands to be "distinct SKUs with … separate cost-database entries". `lookupCost` explicitly collapses both into `brace band`, and there is no separate DB entry.
- `Barb Arm vertical` and `Barb Arm angled` share one price.
- Repro: the `keys` scenario.

**F-3 (Medium). Vinyl split-rail rails don't match posts.**
- Rails use `Math.ceil(ft/8)*rails` (line 1649), but the type's `defaultSpacing` is 10 ft, so posts are drawn at 10 ft.
- 100 ft, 2-rail: 26 rails ordered for 10 bays (20 needed), a 30% overbuy.
- Either the rail divisor or the default spacing is wrong. Rails should be derived from bays (`lineCt + sections`).

**F-4 (Medium). Panel and section counts round on the run total, not per fabric section.**
- Vinyl `ceil(ft/8)`, ornamental `ceil(ft/6)`, temporary `ceil(ft/12)`, the vinyl/wood split-rail spans, and fabric/rail LF all use the run's net feet.
- Each gate splits the run into separate sections, and each section needs its own partial panel.
- Gated 100 ft case: vinyl 11 vs 12, ornamental 14 vs 15, temporary 8 vs 9.
- Each extra gate typically undercounts by one panel.
- Temporary also mis-derives stands (= panels; should be panels + 1 per section) and couplers (= panels; should be panels − 1 per section).

**F-5 (Medium). Gate posts, caps and concrete are chain-link only but are emitted for every fence type.**
- The gate block (1701–1711) always emits `postLengthLabel('gate', …)`, which gives "Gate Post 10.5' (104" cut)" (galvanized pipe purchase lengths), priced at the chain-link `gate post` key.
- It also emits chain-link-schedule concrete, whatever the owning type.
- Affected: wood privacy, vinyl, ornamental and split-rail gates get pipe posts. Temporary-panel gates get 2 pipe posts and 6 bags of concrete. Cattle gates get pipe posts instead of wood or brace posts.
- Gate kits are one flat price per gate type, regardless of fence material or drawn width.

**F-6 (Medium). Switching fence type silently strips chain-link spec flags.**
- `updateSpecsForFenceType` forces hidden component flags false and deletes disallowed add-ons on the active spec. Selecting chain link again never restores them.
- Fresh page: select Ornamental, then Chain Link. `hasTopRail` goes true→false and `bottom-wire` true→false (`toprail_loss` scenario).
- Every chain-link run drawn afterwards omits top rail, sleeves, rail-end cups, top-rail ties and bottom wire. The checkbox does show unchecked, so this is visible but easy to miss.
- A Wood round trip also leaves height at 72".
- The same happens to a selected run whose type is changed and changed back.

**F-7 (Medium). Line posts are not re-laid out between gates.**
- `rebuildRunAutoPosts` only deletes posts that fall on a gate segment. Posts stay on the run-start grid, so bays of 1–2 ft appear beside gate posts.
- Short sections can get an unnecessary post. For example, ornamental with gates at 41–45 and 49–61 leaves a post at 48 inside a 4 ft section, where 0 are needed.
- The 168 LF fixture never calls `rebuildRunAutoPosts`, so a line post remains inside its 15–27 ft drive opening. Its `linePosts` value is logged, not asserted, so the test cannot catch this.
- `autoPostsForRun` also leaves the remainder as one short last bay (45 ft → bays of 10/10/10/10/5) instead of equal spacing.
- The drawing preview label uses `floor(len/sp)-1` (line 1892) while the actual count uses `ceil(len/sp)-1`, so the "N posts" preview is one low on non-multiple lengths.

**F-8 (Medium). Cattle field plus the Barbed Wire add-on double-counts.**
- The `cattle` branch always emits barbed strands, and the common add-on block emits them again plus `Barb Arm` per T-post.
- 100 ft field fence with the add-on chip on: 200 LF per strand instead of 100, plus 8 barb arms that are not used on farm fence (`cattlefield_barbaddon`).

**F-9 (Medium). Concrete silently drops to zero for any depth outside the footing table.**
- `bagsForHole` returns `undefined` for depths other than 24/30/36/42. `concreteBagsForPosts` turns that into 0, and the chain-link branch then omits the concrete row entirely (`if(concrete)`).
- A per-run terminal override of 20" produced no concrete row and no validation error (`embed_override_20`).
- A legacy job with `embedDepthIn:28` (migrated by `hydrateSavedRunSpecs` to 28 for every role, the path the fixture test exercises) produced 0 terminal and 0 gate bags with no errors or warnings (`legacy_embed28`).
- `validateProject` has no check for missing concrete.

**F-10 (Medium). Manual material units are ignored, and quantities are coerced loosely.**
- `computePricing` prices manual rows by name only. "Chain Link Fabric", qty 1, unit `roll` is priced as 1 LF at $3.20.
- The unit list offers ft/roll/box/pr/lb/bundle, none of which convert. `CSV_UNITS` accepts a different set (lf/ea/bag/coil/hr/job).
- Quantity is saved as a string (known defect). Coercion accepts `'1e2'` → 100, `'3 '` → 3, and turns `''` into a silent 0 line.
- This reproduces the known defect "S.materials.qty persists as a string" and extends it with the unit confusion.

**F-11 (Medium; known defect reproduced). Legacy and unknown fence types.**
- `barbedwire` (still keyed in `DEFAULT_LABOR.perLF`): 100 LF yields only the bottom-wire add-on row, while labor still prices.
- Unknown type: near-zero total.
- Validation does flag `FENCE_TYPE`, but there is no migration to a supported type.

**F-12 (Low). `hasFaceBoard` is ignored.**
- `woodsplit3fb` always adds `1x6 Face Board`, even with the checkbox off (`woodsplit_facecheck`).

**F-13 (Medium). Gate placement double-counts posts and termination hardware.**
- A gate ending at a run endpoint (96–100 ft) keeps the terminal post and adds 2 gate posts. That is 3 posts where 2 exist.
- The same case adds an extra fabric end (bar, 3 bands, brace band, cup, 2 bags of concrete) and one extra bay of ties and hog rings.
- Adjacent gates (40–44 and 44–56) count 4 gate posts where 3 exist, plus 2 phantom fabric ends.
- `getStats` adds `gatePosts += 2` and 2 ends per gate unconditionally.

**F-14 (Medium). Posts that don't come from the auto-post grid are invisible to the BOM.**
- `getStats` counts only `el.auto` posts. Posts placed with the Post tool (line 2584) are never counted (`manual_post`: 0 line posts).
- With Auto-posts off, a 100 ft run orders 0 line posts, 0 ties and 1 bay of hog rings, and validation does not warn (`autopost_off`).

**F-15 (Low). Barbed-wire arms: line posts only.**
- `Barb Arm` qty is `lineCt` (line 1694), and `Post Cap` is 0 for every post when barbed is on. Terminal, corner and gate posts therefore get neither an arm nor a cap.
- The authority (6-plus-1) says "an arm on every post". The 168 LF fixture logs `barbArms` without asserting it.
- Related to deferred D7, but the count itself contradicts the record.

**F-16 (Low). Overbuy rules with no recorded owner basis.**
- `Top Rail Sleeve = ceil(ft/10)` (line 1578): one per 10 ft. With 21 ft sticks that is about 2× the need, and swaged rail needs none.
- `3/8" Carriage Bolt+Nut = ends × ceil(h/12) × 2`. That doesn't track bands per end: at 4 ft it gives 8 bolts per end for 5 bands.
- Wood picket screws are 9 per picket. Typical practice is 2 per rail crossing, so 6 for 3 rails.
- `T-Post Clips = 0.6/ft`, independent of strand count.

**F-17 (Low). Changing concrete bag weight renames the line but does not convert quantity or price.**
- Setting the weight to 80 lb produces "Post Concrete (80lb bag)" with the same 4 bags, still priced via `post` (F-1).
- The authority says derivation is three-dimensional (role, height, bag size). Bag size never enters the quantity.

**F-18 (Low). Truss rods skip plain terminal ends.**
- `trussAssemblies = cornerEndCt + gatePostCt`, so end posts that are not corners never get a truss rod.
- This may be intentional for house-terminated ends, but there is no recorded rule. Owner question.

### Recorded conflicts (not adjudicated here)

- **C-1. Line-post concrete.**
  - Authority supplement (2026-08-28): line posts below 8 ft get one 60 lb bag, two at 8 ft and above.
  - `DEVELOPER_LOG.md:198`: "Line posts use driven 18-inch embed with no concrete." The runtime gives 0 bags (line 1540).
  - The 2026-10-03 owner depths (line holes 18"/24") imply dug holes, but there is still no line concrete.
  - Unreconciled. For a 100 ft, 4 ft job the difference is 9 bags.
- **C-2. Post purchase lengths.** The authority states 10.5 ft terminal and 9 ft line. The code switches to `ceil(cut/6)/2` above the limits (8 ft fence: 10 ft line, 11 ft terminal posts). The residential stock-length ruling is still pending (current handoff, item 1).
- **C-3. Post section by classification** (2.5" residential, 3" commercial or barbed, 4" at 8 ft+). Not implemented: `POST_OD_IN` is fixed at 2.375/1.625, and OD appears neither in BOM names nor in pricing. Every post size prices the same.

---

## 4. Gaps against a professional takeoff (design, not defects)

- **G-1. Fence-type coverage.** Missing: aluminum (distinct from steel) ornamental, pool-code, horizontal or board-on-board wood, composite, pipe/ranch rail, woven or welded farm wire, high-tensile, privacy slats for chain link, windscreen, vinyl-coated chain link (fabric/framework colors and gauges), and commercial 9 ga vs residential 11.5 ga fabric.
- **G-2. Purchase units and rounding.**
  - Fabric is ordered as exact LF; there are no 50 ft rolls or splicing.
  - Top, mid and bottom rail are exact LF; there are no 21 ft sticks.
  - Barbed wire is LF; there are no 1320 ft spools.
  - Tension wire is LF; there are no coils.
  - Wood rails are LF; there are no 2x4x8 sticks.
  - Hog panels are LF; there are no 16 ft panels.
  - Screws, ties and hog rings are each; there are no boxes or bags.
  - The authority itself requires "whole bags and whole sticks". `DEFAULT_COST_DB.unit` is informational only and never checked against the BOM unit.
- **G-3. Hole and footing model.**
  - Non-chain-link posts reuse the chain-link terminal footing for every post: 4x4, 6x6 and 5x5 vinyl holes are wider.
  - Diameter is ignored, and the depth table stops at 6 ft and taller (a 10–12 ft fence gets 30" holes).
  - There is no gravel base, no 6x6 drive-gate posts, and no frost-depth or soil input.
  - `embedForHeight` and `FENCE_TYPES.autoEmbedIn` are dead.
- **G-4. Waste and overage.** No waste factor anywhere: pickets, fabric, wood. That is industry-standard 5–10% on wood and pickets.
- **G-5. Slope and grade.** `grade` and `slopePercent` only feed a flat $0.50/LF labor upcharge. Takeoff ignores the extra fabric height or stepping, longer posts on the downhill side, and racked panels.
- **G-6. Vinyl and ornamental systems.** Vinyl panels plus separate rail LF is a likely double count. There are no aluminum stiffeners or gate-post inserts, no vinyl gate hardware, and the vinyl mid rail is auto-on at 6 ft. Ornamental has no post caps, no rackable-panel or slope handling, and no gate posts by type.
- **G-7. Chain-link hardware detail.**
  - No dome vs loop (eye-top) cap split: a single "Post Cap" covers all posts.
  - There is no gate frame breakdown: hinges, latches, drop rod, center stop and gate fabric are all bundled in a flat kit.
  - Gate price does not scale with width.
  - Cantilever gets 2 posts and the standard post size. Practice is 4" posts, 3 posts and rollers.
  - No terminal barb arms for 6-plus-1 (D7).
- **G-8. Corner and junction topology.**
  - Collinear joints between two runs count as a terminal post with 2 fabric ends (4 bars instead of 2 for 100 ft drawn as 2 × 50 ft, `collinear_two_runs`). A pull post is defensible, but it isn't a deliberate rule.
  - T-junctions are not detected.
  - In a mixed-material corner, the first run claims the post.
- **G-9. Inventory.** There is no on-hand stock, reservation, supplier SKU, pack size or reorder concept. "Inventory" exists only as the job BOM.
- **G-10. Validation coverage.**
  - `validateProject` checks only names and costs.
  - Missing: line-post count vs run length, zero-concrete runs, gate overlapping a terminal or another gate, manual posts, panel count vs bays, and unit mismatch between a manual row and its cost unit.
- **G-11. Test coverage.**
  - The 168 LF fixture asserts no line posts, ties, hog rings, truss or concrete for line posts, and it bypasses gate rebuild.
  - There are no BOM tests for any non-chain-link type.
  - R15 locks in the F-1 price.

---

## Priority summary

1. F-1 concrete mis-pricing: all types, every job.
2. F-2 cost-key collisions: wood rails, chain-link bottom rail, brace-band SKUs.
3. F-6 type-switch spec loss.
4. F-13 gate double counts.
5. F-9 silent zero concrete.
6. F-4 and F-3 panel and rail counts.
7. F-5 chain-link gate posts on every material.
8. F-8 cattle barbed double count.
9. F-14 manual or no-auto posts uncounted.
10. F-10 manual units.

Owner decisions needed: C-1 line-post concrete, C-2 stock lengths, C-3 post sections, F-18 truss rods on end posts, F-16 sleeves and bolts. Changing any priced quantity will move R15 and will need the red-before test discipline in CLAUDE.md.
