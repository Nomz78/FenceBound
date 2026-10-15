# FenceBound CAD Drawing Subsystem Audit (read-only)

- **Date:** 2026-10-15
- **Subject:** `/home/user/FenceBound/index.html` (v5.4.0, 4,429 lines). It was copied unmodified to the scratch directory `/tmp/claude-0/-home-user-FenceBound/8c8b9b51-0d3a-5c83-b950-2a78c38f27f7/scratchpad/cad-audit/index.html`.
- **Method:**
  - Served the copy with `python3 -m http.server 8765`.
  - Drove it with Playwright-core 1.40.1 against Chromium 1194.
  - Real mouse input and real touch input (CDP `Input.dispatchTouchEvent`) were used for drawing, moving, selection, gestures, the jobs drawer and undo/redo.
  - Some geometry fixtures went through the production `handleUp()` path with exact coordinates, the same way `tests/auto-post-integrity.spec.js` builds them.
- **Scripts:** `.../scratchpad/cad-audit/t1.js` … `t9.js`, with the harness in `lib.js`.
- **Screenshots:** `.../scratchpad/cad-audit/shots/`.
- **Repository:** no repository files were edited.
- **Console:** apart from the expected jsPDF CDN failure (cdnjs is blocked in this sandbox), no console errors or page errors occurred in any scenario.

Scale: `GRID_FT=40` world px per foot (line 647). Lengths are displayed as `(px/40).toFixed(1)'`. The only unit is feet.

---

## 1. Architecture map

| Area | Symbol | Line |
|---|---|---|
| Scale/constants | `GRID_FT=40`, `CORNER_THRESH=18` (px, = 0.45 ft) | 647 |
| Run ownership | `makeRunId`, `fenceRunById`, `selectedFenceRun`, `nearestFenceRunForGate`, `attachGateToRun` | 724–758 |
| Per-run spacing | `activePostSpacing`, `setActivePostSpacing`, `syncSelectedRunToPanel` | 769–797 |
| Legacy migration | `migrateRunOwnership` | 798 |
| Persistence | `snapshotState`, `applyState`, `saveSession`/`scheduleAutosave` (1 s debounce + 20 s interval + pagehide) | 815–874 |
| Snap options / state | `SNAP_OPTIONS=[0.1,0.5,1,6,8,10]`, `const S={...}` | 1083–1110 |
| Geometry helpers | `dist`, `ftLbl`, `ptKey` (rounded px string), `snap`, `ptSegDist` | 1406–1416 |
| Corner detection | `buildCornerSet`: endpoint pairs < 18 px apart and angle diff > 0.15 rad (~8.6°) | 1418 |
| Auto posts | `autoPostsForRun`: `ceil(len/sp)-1` posts at fixed `sp` from start; remainder bay at the end | 1433 |
| Post rebuild | `rebuildRunAutoPosts`: owner `runId`; drops posts lying on the run's gate segments | 1444 |
| Delete/copy/paste | `deleteSelectedElement`, `copySelectedElement`, `pasteClipboardElement` | 1461–1485 |
| LF/post statistics | `getStats`: gross/net ft per run, terminal/corner sets, gate deduction | 1487 |
| BOM | `calcAutoMaterials` (per-run, `Math.ceil(netFt)` per run) | 1545 |
| Screen→world | `toWorld` (grid-snaps every input point) | 1718 |
| Angle lock | `applyAngleLock` (45° steps, re-snaps to grid) | 1729 |
| Endpoint snap | `snapToEndpoint` (26 screen-px radius; snaps to fence/gate/boundary endpoints **and any post**) | 1741 |
| Undo history | `snapshotDoc` (elements + labels only), `hydrateDocElements`, `pushHistory` (cap 50), `doUndo`, `doRedo` | 1761–1803 |
| Render | `draw` (grid, elements, rubber-band preview + label), `drawBoundary`, `drawFenceRun`, `drawPost`, `drawGate` | 1805–2111 |
| View | `zoomToFit` | 2113 |
| Panel | `updatePanel` (summary LF/posts, auto-materials list) | 2131 |
| Type change | `selectFenceType` (history-captured, rebuilds posts) | 2340 |
| Gate editor | `updateGateEditor` (hinge/swing only; no width) | 2392 |
| Jobs drawer | save (`do-save` ~2500, overwrites by name), load (`data-ji` ~2510) | 2429–2525 |
| Pointer input | `handleDown` / `handleMove` / `handleUp` | 2526 / 2591 / 2629 |
| Labels | `showLabelOverlay` (create only) | 2675 |
| Plan PDF | `exportPDF` | 2692 |
| Event wiring | `init`: touch guards, two-finger tap = undo, pinch zoom, mouse, wheel (2904), toolbar | 2792–2960 |
| Spec inputs | height/embed/rails handlers (no history capture) | 3057–3110 |
| Keyboard | Ctrl+Z/Y, Esc, Delete, Ctrl+C/V, tool letters | 3184 |
| Pricing | `computePricing`: labor uses unrounded `netFence`; materials use the BOM | 3350 |
| Validation | `validateProject`: run IDs, orphan gate, orphan auto post, gate nominal width; **no geometric checks** | 3975 |

**Data model.** Every fence "run" is a single straight segment `{type:'fence', start, end, runId, specs, postSpacing, autoPostSpacing}`.

- There is no polyline, node or vertex graph.
- Connectivity is inferred only by coincident endpoints (`ptKey`) or endpoints within 18 px (corner test).
- Gates are free segments tied to a run only by `runId`.
- Auto posts are free points tagged `auto:true, runId`.
- Manual posts carry no `runId`.
- Labels are `{text,x,y,size,color}`.

---

## 2. Findings

Severity scale: **High** = wrong quantities or price, or silent data loss. **Medium** = wrong output in plausible field use, or a misleading UI. **Low** = cosmetic or edge-case.

### 2A. Confirmed bugs (reproduced in the running app)

#### CAD-01: Escape during a Move drag silently erases the run's add-ons (High, data integrity)

**Cause.** `handleDown` stores `S.moveOrigEl=JSON.parse(JSON.stringify(el))` (2576). A `Set` serializes to `{}`. The Esc handler (~3189) assigns that raw object back: `S.elements[S.moving.idx]=S.moveOrigEl`. `cloneRunSpecs` then turns the non-Set, non-Array `{}` into an empty Set.

**Repro.**
1. Run with add-ons `bottom-wire` and `barbed-wire`. The default chain-link spec already carries `bottom-wire`.
2. Choose the Move tool and drag the run body.
3. Press Esc, then release.

**Evidence (t5.js "I").**
- Add-ons go from `['bottom-wire','barbed-wire']` to `[]`.
- The BOM loses all three Barbed Wire Strand lines, the Barb Arm line and Bottom Tension Wire, and Hog Rings disappear.
- The price falls with no warning.
- `validateProject` reports nothing, because the Set is valid but empty.
- It is recoverable only through Undo, if the user notices.

**Fix shape.** Revert from `snapshotDoc()`-style serialization plus `hydrateDocElements`, or capture `start`/`end`/`pos` only.

#### CAD-02: A gate at a run end double-counts the post and the termination hardware (High)

**Cause.** `getStats` always counts both run endpoints as terminal/corner, and also adds `gatePosts+=2` per gate (1499–1515). `calcAutoMaterials` adds two gate posts per gate (1693). When a gate endpoint coincides with a run endpoint, one physical post is bought twice. `terminationEnds` also counts fabric ends that do not exist, because the gate opening is on that side.

**Repro.** Draw a 40 ft run from (2,10) to (42,10), then a walk gate from (2,10) to (6,10).

**Evidence (t4.js "C").** 2 terminal posts and 2 gate posts are counted where 3 exist. Compared with no gate:

| Item | No gate | Gate at end | Physically correct |
|---|---|---|---|
| Tension bars | 2 | 4 | 2 |
| Tension bands | 6 | 12 | — |
| Terminal-size brace bands | 4 | 8 | — |
| Carriage bolts | 16 | 32 | — |
| Rail ends | 2 | 4 | — |

- An extra terminal post, cap and concrete are also counted.
- Screenshot: `shots/06-gate-at-run-end.png`.
- This is the common "gate next to the house/corner" layout.

#### CAD-03: Gate deduction does not check that the gate is on the fence (High)

**Cause.** `nearestFenceRunForGate` (736) attaches a gate to the nearest run at any distance and any angle. `getStats` subtracts the gate's full length from that run (1513).

**Evidence (t4.js "D", "D2", "E", "E2").** `validateProject` returned **no** errors or warnings in every case below.

| Case | Result |
|---|---|
| Gate drawn 20 ft away from a 40 ft run | Net 36 LF; gate priced |
| Gate drawn perpendicular across the run | Net 36 LF; the line post under it is not removed |
| Two identical gates stacked | Net 32 LF; 4 gate posts; 2 gates priced |
| 20 ft double-drive gate on a 10 ft run | Net 0 LF, yet 2 terminals + 2 gate posts + 4 tension bars, etc. |

- Screenshot: `shots/07-gate-off-fence-still-deducted.png`.
- **Fix shape.** Project the gate onto the run, require it to be collinear and within the run's span, reject or merge overlaps, and add validation codes.

#### CAD-04: Moving or stretching a fence run leaves its gates behind (High)

**Cause.** `handleMove` body/endpoint moves only the fence element. `handleUp` (2634–2640) rebuilds posts but never moves or re-projects the gates that own that `runId`.

**Repro.**
1. 40 ft run with a gate from 20 to 24.
2. Move tool: drag the run body down 15 ft.

**Evidence (t5.js "F").**
- The gate stays at y=10 while the run sits at y=25.
- Net LF is still 36. The 4 ft deduction applies to a gate that is no longer on the fence.
- A line post is regenerated at x=22, which is where the gate opening was before the move. Post exclusion now tests the stale gate position.
- Validation is silent.
- Screenshot: `shots/08-move-run-leaves-gate-behind.png`.

The 2026-09-18 handoff lists "gate ownership reassignment after movement" as unassessed. This is that defect, now confirmed.

#### CAD-05: Deleting a fence run orphans its auto posts and gates (Medium-High)

**Cause.** `deleteSelectedElement` (1461) splices only the selected element. It rebuilds posts only when a *gate* is deleted.

**Repro.** Run with a gate → Select the run → Delete.

**Evidence (t5.js "H").**
- Elements left: `['gate','post','post']`, all still drawn.
- `getStats.gateTotal=1`.
- If another run exists, the orphan gate is still priced: gate, 2 gate posts and concrete.
- `snapToEndpoint` keeps snapping new runs to the invisible-to-BOM orphan posts.
- Validation does flag `ORPHAN_GATE` and `ORPHAN_AUTO_POST`, but only when someone runs it.
- Screenshot: `shots/10-deleted-run-leaves-orphan-posts-gate.png`.

#### CAD-06: Splitting a straight line into two segments changes the BOM and price (High)

**Cause.** A collinear joint is "not a corner" (`buildCornerSet` angle test), so it is counted as a **terminal** on both runs (`terminalEndCt` per run). The model has no polyline, and the Move tool cannot extend a run while preserving it, so contractors routinely draw long lines in pieces.

**Repro.** One 60 ft run versus 30 ft + 30 ft drawn end to end. The total is 60 LF in both cases.

**Evidence (t4.js "B").**

| Item | One run | Two runs |
|---|---|---|
| Terminal posts | 2 | 3 |
| Line posts | 5 | 4 |
| Tension bars | 2 | 4 |
| Tension bands | 6 | 12 |
| Terminal brace bands | 4 | 8 |
| Carriage bolts | 16 | 32 |
| Concrete bags | 4 | 6 |
| **Client total** | **$1,283.35** | **$1,350.37** (+$67.02) |

- Screenshot: `shots/05-collinear-two-segments-terminal-at-joint.png`.
- Whether a mid-line pull post is wanted is an owner rule. The app does not ask; it is a side effect of how the user drew the line.

#### CAD-07: A T-junction or start on a line post duplicates the post (Medium)

**Cause.** `snapToEndpoint` snaps to post centers (1752). The new run's start becomes a terminal, but the existing line post of the other run is kept, and corner detection only compares run endpoints. A tee in mid-span (not on a post) is not recognized as a junction either.

**Repro.** 40 ft run, then a fence drawn by mouse from its line post at x=22.

**Evidence (t6.js "J").** A line post at (22,2) plus a terminal at (22,2): two posts are bought for one hole. Screenshot: `shots/11-T-junction-line-post-plus-terminal.png`.

#### CAD-08: The live preview label shows the wrong post count (Medium, displayed vs committed drift)

**Cause.** The preview label uses `floor(len/sp)-1` (1892). The drawn dots and the committed posts use `ceil(len/sp)-1` (1436).

**Evidence (t2.js).** A 42 ft drag reads "42.0' · 3 posts" while 4 dots are drawn and 4 posts are committed. The label is wrong for every length that is not an exact multiple of the spacing.

#### CAD-09: Floating-point drift creates a line post on top of the end post (Medium)

**Cause.** `ceil(total/sp)` with `total = Math.hypot(...)` slightly above an exact multiple.

**Evidence (t7.js "R"; brute force over grid-snapped endpoints).**
- A 14×48 ft diagonal is exactly 50 ft, but `hypot` gives 50.00000000000001.
- It therefore gets 5 line posts, and the last one sits exactly on the end at (14,48), duplicating the terminal post.
- Brute force found 4 of 146 exact-multiple grid cases that misfire. Others include 39.6×67.2 at 6 ft spacing.
- Programmatic angles such as 30° misfire often.

**Fix.** Use `Math.ceil(total/sp - 1e-6) - 1`.

#### CAD-10: Angle lock prevents closing a loop (Medium)

**Cause.** In `handleMove`, endpoint snap is applied **before** `applyAngleLock` (2621–2623). The lock then rotates the point away from the snap target, while the green snap ring is still shown.

**Repro.** Angle lock on; draw two sides of a rectangle; drag from the far corner back to the start.

**Evidence (t6.js "O").** The committed end is (9,−8) instead of (2,2). The loop is open and the BOM gains 2 terminals instead of corners. Screenshot: `shots/12-angle-lock-cannot-close-loop.png`.

#### CAD-11: Dragging a shared corner disconnects the runs (Medium)

**Cause.** The Move tool picks the first endpoint found and moves only that run (2551–2558). There are no shared vertices.

**Evidence (t6/t5 "G").** Moving a corner to (34,6) leaves the other run at (30,2). The corner becomes 2 terminals (`corner 0, term 4`). Screenshot: `shots/09-drag-corner-disconnects-runs.png`.

#### CAD-12: Undoing a job load produces a mixed job (Medium-High, data-loss chain)

**Cause.** Loading a saved job calls `pushHistory()`, but `snapshotDoc` holds only elements and labels. The name, customer, address, specs and pricing loaded by `applyState` are not restored.

**Repro.**
1. Save "Job A" (1 run) and "Job B" (2 runs).
2. With B open, load A, then press Undo.

**Evidence (t7.js "S").**
- The result is B's 2-run drawing labeled "Job A / Alice".
- Pressing Save then overwrites the stored Job A with B's drawing, because save de-duplicates by name (~2503).
- The same applies to Import .json (2969) and Clear.

#### CAD-13: Saving with the same name silently overwrites a job (Medium)

**Cause.** `S.savedJobs=[snap,...filter(j=>j.name!==S.projectName)]`.

**Evidence (t7.js "T").** Two different "Untitled Job" drawings leave 1 saved job. There is no confirmation. Deleting a saved job also has no confirmation.

#### CAD-14: Releasing the mouse outside the canvas leaves a draw stuck (Medium, desktop)

**Cause.** `mouseup` and `mousemove` are bound only to the canvas (2901–2903). There is no `mouseleave` or window-level `mouseup` handler, and no Pointer Events or pointer capture.

**Repro.** Start a fence drag and release over the side panel.

**Evidence (t1/t2).** `S.drawing` stays live. The rubber band follows the cursor, and the next click commits a run from the old start point; in the test that added an unintended 14.3 ft run. Screenshot: `shots/03-stuck-rubberband-after-release-outside.png`. Move drags have the same problem.

#### CAD-15: Wheel zoom does not keep the point under the cursor (Low-Medium)

**Cause.** The wheel handler (2904) changes only `S.zoom`; the pan is untouched, so it zooms about the canvas origin. "Reset zoom" (2954) behaves the same way.

**Evidence (t7.js "P").** The world point under the cursor moved from (15.5, 10.5) ft to (14.1, 9.5) ft after one notch. Pinch zoom *is* anchored correctly.

#### CAD-16: A two-finger tap in the Move tool does not undo (Low-Medium, tablet)

**Cause.** The first finger's `touchstart` reaches `handleDown`, which calls `pushHistory()` on hit (2571). The second finger cancels the move, and the undo gesture pops that no-op snapshot.

**Evidence (t8.js).** History was 1 before and 1 after, and the drawing was unchanged. In other words, the gesture "does nothing" whenever the first finger lands on an element in Move mode.

#### CAD-17: Manual posts are drawn but never counted or priced (Medium)

**Cause.** `getStats` counts only `post.auto` posts with a valid `runId`.

**Evidence (t6.js "K").** Adding a post with the Post tool leaves the BOM byte-identical.

- The Post tool is the only way to add a pull post or a post at a house/wall, and it has no effect on the quote.
- Validation does not mention manual posts.

#### CAD-18: Auto-posts off produces a run with zero line posts and no warning (Medium)

**Evidence (t6.js "L").** A 100 ft chain-link run has 0 line posts, only 2 terminals, and `validateProject` returns nothing. The quote will be issued without posts.

#### CAD-19: A near-miss joint creates a phantom corner plus terminal (Low)

**Cause.** `buildCornerSet` adds only `ptKey(p1)` when the endpoints are within 18 px but not identical, so p2 is counted as a separate terminal.

**Evidence (t6.js "M").** At 0.1 ft snap, endpoints 0.3 ft apart produce `corner 1 + term 3` for a 2-run L, where 1 corner and 2 terminals is correct.

- This is reachable at high zoom: the snap radius of 26 screen px is only 0.16 ft at 400%.
- The joint is also drawn as a corner and a terminal side by side.

#### CAD-20: Rounding drift between displayed LF and BOM LF (Low-Medium)

**Cause.** The BOM rounds each run up separately (`Math.ceil(ft)`) for fabric, rails and wires. The canvas and summary show `toFixed(1)`. Labor uses unrounded feet, but its label shows `toFixed(0)`.

**Evidence (t9.js).** A loop of 4 × 10.5 ft shows 42.0 LF on canvas and labor at "42 LF", but fabric, top rail and bottom wire are each 44 LF. A 45° 10×10 run shows "14.1'" and buys 15 LF. The error grows by up to 1 LF per segment.

#### CAD-21: Spec edits are not undoable (Low-Medium)

**Evidence (t7.js "W").** Changing a selected run's height (`#spec-height`), and also rails, embed, post diameter and gate hinge/swing, leaves `S.history.length` at 0. Ctrl+Z after a height change instead undoes the previous geometry edit.

#### CAD-22: Phone layout is unusable (Medium for field use)

**Evidence (t8.js).** At 390×844 the canvas is **78 px wide**: the panel does not collapse or overlay by default. Screenshot: `shots/13-phone-after-touch-draw.png`.

iPad portrait leaves a 470 px canvas (`shots/13-ipad-portrait-after-touch-draw.png`). One-finger touch drawing and two-finger tap undo work on iPad (t8.js).

### 2B. Verified working

- Closed 40×30 rectangle drawn by real mouse with endpoint snap: 140 LF, 4 corners, 0 terminals, 10 line posts at correct positions (`shots/04-closed-rectangle-140lf.png`).
- Auto-post regeneration on spacing change and no-op moves, as covered by the existing spec.
- Gate mid-run removes the covered line post.
- Undo/redo chain of fence, fence and gate round-trips exactly (t7.js "V").
- Autosave survives a reload with the gate and its net LF intact.
- Two-finger pinch zoom is anchored.
- No NaN values or console errors in any scenario.

---

## 3. UX friction list (contractor on a tablet in the field)

1. **No continuous polyline drawing.** Each side is a separate press-drag-release. Tracing a 12-sided yard means 12 precise drags, each relying on a 26 px endpoint snap, and every collinear piece adds terminal hardware (CAD-06).
2. **No typed length or angle entry.** The user cannot enter "82' 6"" or a bearing. Length precision depends on grid snap (0.1–10 ft) and zoom. At 100% zoom only ~24 ft fits across a laptop canvas, so long runs force zooming out, which makes snapping coarse (default 1 ft).
3. **No numeric edit of an existing segment's length.** The only option is to drag an endpoint.
4. **No vertex model.** Dragging a corner splits the runs (CAD-11). There is no "split run", "insert node" or "delete node with healing"; deleting a run leaves a gap plus orphans.
5. **Gates are drawn freehand.** There are no width presets snapped onto the fence line and no numeric width field; the gate editor offers only hinge and swing. Getting a 4 ft walk gate exactly 4 ft and exactly on the line is fiddly on glass, and errors are not caught (CAD-03).
6. **Labels cannot be selected, moved, edited or deleted.** Only Undo or Clear All removes them. Font size is fixed at 14 screen px.
7. **Hit targets are 14 screen px** (select) and 18 px (move). That is below the ~44 px touch guideline, and posts and runs overlap in the hit test (the last element wins, so a click near a post selects the post instead of the run).
8. **Context-dependent gesture.** The two-finger tap means undo, but it does nothing in Move mode (CAD-16). There is no visible undo feedback.
9. **Grid labels appear only for positive coordinates.** Panning left or up shows unlabeled grid.
10. **Desktop wheel zoom drifts away from the cursor** (CAD-15). "Reset zoom" does not re-center.
11. **Auto-post toggle and spacing control.** The toggle is global for future runs, with no per-run indicator. The spacing slider affects the selected run *or* future runs depending on the selection, which is easy to misread.
12. **Silent overwrite on save** by job name; no confirmation when deleting a job (CAD-13).
13. **Validation runs only on demand or at PDF export.** Geometry problems (off-line gates, overlaps, zero-post runs) are never surfaced live.
14. **Phone layout is unusable**; the iPad portrait canvas is cramped (CAD-22).

---

## 4. Gaps vs professional fence drawing tools

Compared tools: SmartDraw fence templates, FenceCloud / Fence Estimator Pro-style tools, Google Maps / Earth measure, and aerial-takeoff tools.

| Capability | Pro tools | FenceBound |
|---|---|---|
| Aerial or satellite imagery tracing, scale from a geocoded address | Standard (FenceCloud and Google-based tools) | **Absent.** No background image, no imagery, no address geocode, no scale calibration |
| Import a survey or plat image and calibrate scale with a known dimension | Common | **Absent** |
| Continuous polyline with double-click/tap to finish and a close-loop affordance | Standard | Absent (segment-at-a-time) |
| Typed lengths, angles, bearings, feet-inches | Standard | Absent; grid-snap only, decimal feet only |
| Metric or feet-inches units | Common | Feet only |
| Shared vertices, drag a node and both sides follow, insert/split | Standard | Absent (CAD-11) |
| Gates snapped onto the fence line with width presets | Standard | Freehand, unvalidated (CAD-03/04) |
| Even post distribution ("equal bays") vs fixed-spacing-from-start | Usually selectable | Fixed spacing only; remainder bay at the end (e.g. 42 ft gives bays of 10, 10, 10, 10, 2) |
| Pull posts every N ft or at angle changes; T-junction detection | Common | Absent (CAD-07) |
| House, wall or structure termination (wall mount, no post or concrete) | Common | **Absent.** No structure element, so a house-attached end is priced as a terminal post with concrete. The authoritative 168 LF house-terminated fixture cannot be drawn as such. |
| Slope or grade per segment (stepped vs racked, true sloped length) | Fence-specific tools offer it | Grade and slope % are stored but **cosmetic**: they appear in summary and PDF text only. The only effect is a flat 0.50 $/ft "Grade/Slope" checkbox; segment length and panel or post counts ignore slope. |
| Panel-based layout (vinyl/ornamental/wood panel widths aligned to posts and gates) | Common | Panels = `ceil(ft/8)` or `ceil(ft/6)`, independent of post spacing and gate splits |
| Area and perimeter summary, per-side dimension table | Common | Per-run LF only |
| Multi-select, rotate, mirror, layers | Common | Single selection; copy/paste only |
| Satellite/plan PDF with dimensioned sides | Common | Plan PDF and PNG exist; not reviewed in depth (jsPDF CDN blocked in this sandbox) |
| Offline-first mobile (phone) capture | Common | iPad works; phone does not (CAD-22) |

---

## 5. Recommended triage (owner decision; no work performed)

- **Defect-class (pricing behavior is wrong):**
  - CAD-01, CAD-02, CAD-03, CAD-04, CAD-05, CAD-06 (owner rule needed: is a collinear joint a pull post?), CAD-09, CAD-12.
  - Each repair needs a red-before test per CLAUDE.md.
- **Display or consistency:** CAD-08, CAD-20.
- **Input robustness:** CAD-10, CAD-14, CAD-15, CAD-16, CAD-19, CAD-21.
- **Feature work (requires owner authorization):**
  - Polyline/vertex model, typed lengths, gate-on-line snapping and presets.
  - House-termination element, manual/pull post pricing (CAD-17), slope geometry.
  - Imagery and background tracing, phone layout.
