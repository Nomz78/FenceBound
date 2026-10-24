const { test, expect } = require('@playwright/test');

// Regression suite for the remaining Tier 2 takeoff counts (2026-10-15 estimator
// audit, inventory report 02 §3, Step 1.5 of 00-SUMMARY.md). Each test failed
// before its repair and passes after it.
//  - T1: panel and section counts round per fabric section, not per run (F-4).
//  - T2: vinyl split-rail rails follow the run's post spacing (F-3).
//  - T3: concrete is never silently 0 for a hole depth off the footing table (F-9).
//  - T4: field cattle fence with the Barbed Wire add-on does not double strands (F-8).
//  - T5: Post-tool posts are counted and priced; a run with no line posts warns (F-14).
//  - T6: a manual material is priced per its entered unit or not at all (F-10).
//  - T7: the Face Board checkbox controls the face board line (F-12).
//  - T8: a legacy or unknown fence type blocks FINAL-READY (F-11).
//  - T9: a Split + Face Board run saved before the checkbox worked keeps its face board.
//  - G-<type>: golden BOM for every fence type, 100 LF with a 4 ft walk gate and
//    a 12 ft double drive. The first BOM coverage for any non-chain-link type.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// The audit case: one 100 LF straight run of `type` at the type's own defaults,
// optionally with a 4 ft walk gate at 40-44 ft and a 12 ft double drive at
// 70-82 ft (sections of 40, 26 and 18 ft). Gates attach and posts rebuild the
// way the UI's pointer-up path does.
const seedRunSource = (type, gated, extra = '') => `(()=>{
  S.elements=[];S.materials=[];S.selected=null;
  selectFenceType(${JSON.stringify(type)});
  const specs=cloneRunSpecs(S.specs);
  ${extra}
  const run={type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},fenceType:${JSON.stringify(type)},
    runId:'run_takeoff',specs,postSpacing:S.postSpacing,autoPostSpacing:S.postSpacing};
  S.elements=[run];
  if(${gated})[['walk',40,44],['doubledrive',70,82]].forEach(([gateType,a,b])=>
    S.elements.push(attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},run)));
  rebuildRunAutoPosts(run);
  draw();updatePanel();
  return null;
})()`;

const bomSource = `(()=>{const out={};calcAutoMaterials().forEach(r=>{out[r.name]=r.qty;});return out;})()`;

async function bomFor(page, type, gated, extra) {
  await state(page, seedRunSource(type, gated, extra));
  return state(page, bomSource);
}

test('T1 panels, rail spans, stands and couplers round per fabric section between gates', async ({ page }) => {
  await cleanOpen(page);
  // Gated case: sections of 40, 26 and 18 ft.
  const vinyl = await bomFor(page, 'vinylprivacy6', true);
  expect(vinyl['Vinyl Privacy Panel 72"']).toBe(5 + 4 + 3);
  expect(vinyl['Stainless Screws']).toBe(12);
  const orn = await bomFor(page, 'ornamental', true);
  expect(orn['Ornamental Panel 60"']).toBe(7 + 5 + 3);
  expect(orn['Panel Bracket Kit']).toBe(15);
  expect(orn['Self-Tapping Screws']).toBe(60);
  const temp = await bomFor(page, 'temporary', true);
  expect(temp['Temp Panel 6x12']).toBe(4 + 3 + 2);
  expect(temp['Temp Panel Coupler']).toBe(9 - 3);
  expect(temp['Panel Stand / Base']).toBe(9 + 3);
  const wood = await bomFor(page, 'woodsplit2', true);
  expect(wood['Split Rail 11ft Rail']).toBe((4 + 3 + 2) * 2);
  // Ungated temporary: one section of 9 panels joined by 8 couplers on 10 stands.
  const tempPlain = await bomFor(page, 'temporary', false);
  expect([tempPlain['Temp Panel 6x12'], tempPlain['Temp Panel Coupler'], tempPlain['Panel Stand / Base']]).toEqual([9, 8, 10]);
});

test('T2 vinyl split-rail rails equal bays at the run post spacing times rails per bay', async ({ page }) => {
  await cleanOpen(page);
  // Default 10 ft spacing: 10 bays x 2 rails, not ceil(100/8) x 2 = 26.
  expect((await bomFor(page, 'vinylsplit2', false))['Vinyl Split Rail']).toBe(20);
  // Gated: sections 40, 26, 18 at 10 ft = 4 + 3 + 2 bays x 3 rails.
  expect((await bomFor(page, 'vinylsplit3', true))['Vinyl Split Rail']).toBe(27);
  // The rails track the run's own spacing, as the drawn posts do.
  const at8 = await bomFor(page, 'vinylsplit2', false, 'S.postSpacing=8;');
  expect(at8['Vinyl Split Rail']).toBe(13 * 2);
  expect(await state(page, `getStats().linePosts`)).toBe(12);
});

test('T3 concrete for an off-table hole depth rounds up to the next table depth and warns', async ({ page }) => {
  await cleanOpen(page);
  // Hog-wire cattle fence still uses the footing table; chain link follows the
  // owner's per-post bag rule since C0b (see C0b-6).
  const concrete = async extra => {
    const bom = await bomFor(page, 'cattlehog', true, extra);
    const codes = await state(page, `validateProject({includePricing:false,requireClient:false}).warnings.filter(w=>w.code==='CONCRETE_DEPTH_OFF_TABLE').length`);
    return [bom['Post Concrete (60lb bag)'] || 0, bom['Gate Post Concrete (60lb bag)'] || 0, codes];
  };
  // Table depths (4 ft default: 24" terminal and gate holes, 2 bags each; 2 terminals, 4 gate posts).
  expect(await concrete('')).toEqual([4, 8, 0]);
  // Legacy 28" on every role (hydrateSavedRunSpecs migration): next table depth 30" = 3 bags.
  expect(await concrete(`Object.assign(specs,hydrateSavedRunSpecs({...serializeRunSpecs(specs),postEmbedIn:undefined,embedDepthIn:28}));`))
    .toEqual([6, 12, 3]);
  // Per-run 20" terminal override: next table depth 24" = 2 bags.
  expect(await concrete(`specs.postEmbedIn.terminal=20;`)).toEqual([4, 8, 1]);
  // Deeper than the deepest entry: 4 bags at 42" scaled to 48" and rounded up = 5.
  expect(await concrete(`specs.postEmbedIn.gate=48;`)).toEqual([4, 20, 1]);
});

test('T4 cattle field fence with the Barbed Wire add-on keeps one set of strands and no barb arms', async ({ page }) => {
  await cleanOpen(page);
  const strands = bom => Object.entries(bom).filter(([n]) => /^Barbed Wire Strand/.test(n)).map(([, q]) => q);
  const off = await bomFor(page, 'cattlefield', false, `specs.addons.delete('barbed-wire');specs.barbStrands=4;`);
  const on = await bomFor(page, 'cattlefield', false, `specs.addons.add('barbed-wire');specs.barbStrands=4;`);
  expect(strands(off)).toEqual([100, 100, 100, 100]);
  expect(strands(on)).toEqual([100, 100, 100, 100]);
  expect(Object.keys(on).filter(n => /^Barb Arm/.test(n))).toEqual([]);
  expect(on['T-Post 6ft']).toBe(8);
  // Chain link still takes its barbed add-on strands and arms.
  const cl = await bomFor(page, 'chainlink', false, `specs.addons.add('barbed-wire');specs.barbStrands=3;`);
  expect(strands(cl)).toEqual([100, 100, 100]);
  expect(cl['Barb Arm vertical']).toBe(9);
});

test('T5 Post-tool posts count as line posts and a run without line posts warns', async ({ page }) => {
  await cleanOpen(page);
  const warnings = () => state(page, `validateProject({includePricing:false,requireClient:false}).warnings.map(w=>w.code)`);
  // Auto-posts off: the run carries no line posts, which validation now reports.
  await state(page, seedRunSource('chainlink', false));
  await state(page, `(()=>{S.elements=S.elements.filter(el=>!(el.type==='post'&&el.auto));S.elements[0].autoPostSpacing=null;return null;})()`);
  expect(await state(page, `getStats().linePosts`)).toBe(0);
  expect(await warnings()).toContain('NO_LINE_POSTS');
  // Three posts placed with the Post tool along the run (as handleDown pushes them),
  // one on the run end (already the terminal post) and one off the fence.
  await state(page, `(()=>{[25,50,75,100].forEach(ft=>S.elements.push({type:'post',pos:{x:ft*GRID_FT,y:0},fenceType:'chainlink'}));
    S.elements.push({type:'post',pos:{x:50*GRID_FT,y:30*GRID_FT},fenceType:'chainlink'});return null;})()`);
  expect(await state(page, `getStats().linePosts`)).toBe(3);
  const priced = await state(page, `(()=>{const l=computePricing().matLines.find(x=>/^Line Post/.test(x.name));return [l.qty,l.extC];})()`);
  expect(priced[0]).toBe(3);
  expect(priced[1]).toBeGreaterThan(0);
  const codes = await warnings();
  expect(codes).not.toContain('NO_LINE_POSTS');
  expect(codes.filter(c => c === 'POST_NOT_ON_FENCE').length).toBe(1);
  // A Post-tool post on top of an auto post is that post, not a second one.
  await state(page, seedRunSource('chainlink', false));
  await state(page, `(()=>{S.elements.push({type:'post',pos:{x:10*GRID_FT,y:0},fenceType:'chainlink'});return null;})()`);
  expect(await state(page, `getStats().linePosts`)).toBe(9);
});

test('T6 a manual material in a unit other than its rate-card unit is a validation error, not a wrong price', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedRunSource('chainlink', false));
  const manual = rows => state(page, `(()=>{S.materials=${JSON.stringify(rows)};const P=computePricing();
    const l=P.matLines.find(x=>x.source==='manual');
    return {unitCost:l.unitCost,extC:l.extC,rateUnit:l.rateUnit,final:P.isFinalReady,
      errors:validateProject({requireClient:false}).errors.map(e=>e.code)};})()`);
  // 1 roll of chain link fabric (rate card: per lf) was priced as 1 lf at $3.20.
  const roll = await manual([{ name: 'Chain Link Fabric', qty: 1, unit: 'roll', id: 1 }]);
  expect(roll).toMatchObject({ unitCost: null, extC: 0, rateUnit: 'lf', final: false });
  expect(roll.errors).toContain('UNIT_MISMATCH');
  // The same item in its own unit (or an alias of it) prices as before.
  const ft = await manual([{ name: 'Chain Link Fabric', qty: 50, unit: 'ft', id: 2 }]);
  expect(ft).toMatchObject({ unitCost: 3.2, extC: 16000, rateUnit: 'lf', final: true });
  expect(ft.errors).not.toContain('UNIT_MISMATCH');
  const coil = await manual([{ name: 'Razor Ribbon Coil', qty: 1, unit: 'roll', id: 3 }]);
  expect(coil).toMatchObject({ unitCost: 38, final: true });
});

test('T7 the Face Board checkbox adds and removes the split-rail face board line', async ({ page }) => {
  await cleanOpen(page);
  // Selecting Split + Face Board starts with the face board on and the box checked.
  await state(page, `(()=>{S.elements=[];S.selected=null;selectFenceType('woodsplit3fb');return null;})()`);
  await expect(page.locator('#has-face-board')).toBeChecked();
  expect((await bomFor(page, 'woodsplit3fb', false))['1x6 Face Board']).toBe(100);
  // Unchecking the box (its change handler writes the active spec) removes the line.
  await state(page, `(()=>{S.elements=[];S.selected=null;selectFenceType('woodsplit3fb');
    const cb=document.getElementById('has-face-board');cb.checked=false;cb.dispatchEvent(new Event('change'));return null;})()`);
  const off = await state(page, `(()=>{const specs=cloneRunSpecs(S.specs);
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},fenceType:'woodsplit3fb',runId:'run_fb',specs,postSpacing:10,autoPostSpacing:10}];
    rebuildRunAutoPosts(S.elements[0]);return ${bomSource};})()`);
  expect(off['1x6 Face Board']).toBeUndefined();
  expect(off['Split Rail 11ft Rail']).toBe(30);
});

test('T8 a legacy or unknown fence type is a validation error and never FINAL-READY', async ({ page }) => {
  await cleanOpen(page);
  for (const legacy of ['barbedwire', 'privacy']) {
    await state(page, seedRunSource('chainlink', false));
    const r = await state(page, `(()=>{S.elements.forEach(el=>{if(el.type==='fence'||el.type==='post')el.fenceType=${JSON.stringify(legacy)};});
      const P=computePricing();return {final:P.isFinalReady,unsupported:P.unsupportedTypes,
      errors:validateProject({requireClient:false}).errors.map(e=>e.code)};})()`);
    expect(r.final).toBe(false);
    expect(r.unsupported).toEqual([legacy]);
    expect(r.errors).toContain('FENCE_TYPE');
  }
  // A supported type stays FINAL-READY.
  await state(page, seedRunSource('chainlink', false));
  expect(await state(page, `computePricing().isFinalReady`)).toBe(true);
});

// C0b residential chain link (Docs/reference/HARDWARE_SPEC_REFERENCE.md). Each count
// cites its reference line. Fixture: 100 LF, 4 ft, sections 40/26/18 ft, six line
// posts, two end terminals, four gate posts, six fabric ends.
const REF = 'Docs/reference/HARDWARE_SPEC_REFERENCE.md';
test('C0b-1 carriage bolts: one per band (owner ruling 3, CL-R)', async ({ page }) => {
  await cleanOpen(page);
  const bom = await bomFor(page, 'chainlink', true);
  // 18 tension bands + 12 terminal brace bands = 30 bolts, not 6 ends x 8 = 48.
  expect(bom['3/8" Carriage Bolt+Nut'], `${REF} ruling 3`).toBe(bom['Tension Band'] + bom['Terminal-size Brace Band']);
  expect(bom['3/8" Carriage Bolt+Nut']).toBe(30);
  // A mid rail adds its terminal and line-size bands, one bolt each.
  const mid = await bomFor(page, 'chainlink', true, 'specs.hasMidRail=true;specs.midRailUserSet=true;');
  expect(mid['3/8" Carriage Bolt+Nut']).toBe(mid['Tension Band'] + mid['Terminal-size Brace Band'] + mid['Line-size Brace Band']);
});

test('C0b-2 top rail: swedged by default (no sleeves), plain 21 ft sticks sleeved per joint (ruling 2)', async ({ page }) => {
  await cleanOpen(page);
  const swedged = await bomFor(page, 'chainlink', true);
  expect(await state(page, 'S.specs.topRailJoint')).toBe('swedged');
  expect(swedged['Top Rail Sleeve'], `${REF} ruling 2`).toBeUndefined();
  // Plain: sections 40/26/18 ft take 2/2/1 sticks of 21 ft, so 1 + 1 + 0 sleeves.
  const plain = await bomFor(page, 'chainlink', true, `specs.topRailJoint='plain';`);
  expect(plain['Top Rail Sleeve']).toBe(2);
  const plainOpen = await bomFor(page, 'chainlink', false, `specs.topRailJoint='plain';`);
  expect(plainOpen['Top Rail Sleeve']).toBe(4); // 100 ft = 5 sticks, 4 joints
});

test('C0b-3 truss rods at every terminal fabric connection (ruling 7)', async ({ page }) => {
  await cleanOpen(page);
  const bom = await bomFor(page, 'chainlink', true, 'specs.hasMidRail=true;specs.midRailUserSet=true;specs.hasTrussRod=true;');
  // Two end terminals + four gate-post ends = 6, not corners and gates only (4).
  expect(bom['Truss Rod'], `${REF} ruling 7`).toBe(6);
  expect(bom['Truss Rod Connector (turnbuckle-style, threaded)']).toBe(6);
});

test('C0b-4 ties and hog rings at Master Halco spacing: 15 in on posts, 24 in on rails and wires (ruling 8)', async ({ page }) => {
  await cleanOpen(page);
  const bom = await bomFor(page, 'chainlink', true);
  // Rail: ceil(40/2)+ceil(26/2)+ceil(18/2) = 42; line posts: 6 x ceil(48/15) = 24.
  expect(bom['Wire Ties 9ga'], `${REF} ruling 8 / CL-C`).toBe(42 + 24);
  expect(bom['Hog Rings']).toBe(42);
});

test('C0b-5 post lengths: line = height + 2 ft; terminals 1.5 x height from 8 ft, hole capped at 48 in', async ({ page }) => {
  await cleanOpen(page);
  const at4 = await bomFor(page, 'chainlink', true);
  expect(at4["Line Post 6'"], `${REF} Final owner answers`).toBe(6);
  expect(at4["Terminal/Corner Post 6'"]).toBe(2);
  expect(at4["Gate Post 6'"]).toBe(4);
  const at8 = await bomFor(page, 'chainlink', true, 'specs.heightIn=96;applyHeightDrivenSpecs({specs});');
  expect([at8["Line Post 10'"], at8["Terminal/Corner Post 12'"], at8["Gate Post 12'"]]).toEqual([6, 2, 4]);
  // 10 ft: 1.5 x 10 = 15 ft would bury 60 in; capped at 48 in -> 14 ft.
  const at10 = await bomFor(page, 'chainlink', true, 'specs.heightIn=120;applyHeightDrivenSpecs({specs});');
  expect([at10["Line Post 12'"], at10["Terminal/Corner Post 14'"], at10["Gate Post 14'"]]).toEqual([6, 2, 4]);
});

test('C0b-6 concrete: line posts 1 bag (2 from 8 ft), terminals 2 bags (3 from 7 ft), other depths by ratio', async ({ page }) => {
  await cleanOpen(page);
  const bags = async extra => {
    const bom = await bomFor(page, 'chainlink', true, extra);
    return [bom['Post Concrete (60lb bag)'], bom['Gate Post Concrete (60lb bag)']];
  };
  // 4 ft: 6 line x 1 + 2 terminals x 2 = 10; 4 gate posts x 2 = 8.
  expect(await bags(''), `${REF} Final owner answers`).toEqual([10, 8]);
  expect(await bags('specs.heightIn=84;applyHeightDrivenSpecs({specs});')).toEqual([6 + 6, 12]);
  expect(await bags('specs.heightIn=96;applyHeightDrivenSpecs({specs});')).toEqual([12 + 6, 12]);
  // Edited depths keep the hole diameter: bags scale with depth, rounded up.
  // Line 36 in: ceil(1 x 36/24) = 2; gate 30 in: ceil(2 x 30/24) = 3.
  expect(await bags('specs.postEmbedIn.line=36;specs.postEmbedDirty.line=true;specs.postEmbedIn.gate=30;specs.postEmbedDirty.gate=true;'))
    .toEqual([12 + 4, 12]);
  expect(await state(page, `validateProject({includePricing:false,requireClient:false}).warnings.filter(w=>w.code==='CONCRETE_DEPTH_OFF_TABLE').length`)).toBe(0);
});

// Golden BOMs at seed prices and default specs. Every non-chain-link type still
// gets chain-link pipe gate posts, gate concrete and one flat kit per gate type
// (audit F-5): recorded as an owner question, deliberately locked here so any
// change to it is visible.
const GOLDEN = {
  // C0b (owner rulings 2026-10-23): posts 9'/10.5' -> 6', sleeves 9 -> none (swedged),
  // ties 63 -> 66, hog rings 45 -> 42, bolts 48 -> 30, post concrete 4 -> 10.
  chainlink: { matCost: 137852, clientTotal: 314441, bom: { "Chain Link Fabric (48\")": 84, "Top Rail 1-5/8\"": 84, "Line Post 6'": 6, "Terminal/Corner Post 6'": 2, "Tension Bar": 6, "Tension Band": 18, "Post Cap": 12, "Terminal-size Brace Band": 12, "Rail End (Loop Cap)": 6, "Wire Ties 9ga": 66, "Hog Rings": 42, "3/8\" Carriage Bolt+Nut": 30, "Post Concrete (60lb bag)": 10, "Bottom Tension Wire 9ga": 84, "Walk Gate w/ Hardware": 1, "Gate Post 6'": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  woodprivacy: { matCost: 271435, clientTotal: 520818, bom: { "Dog-Ear Picket 1x4x6'": 288, "Post 4x4x9'": 11, "2x4 Top Rail": 84, "2x4 Bottom Rail": 84, "2x4 Mid Rail": 84, "Post Cap / Finial": 11, "Exterior Screws (rails)": 66, "Exterior Screws (pickets)": 2592, "Post Concrete (60lb bag)": 33, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (104\" cut)": 4, "Gate Post Concrete (60lb bag)": 12, "Dbl Drive w/ Hardware": 1 } },
  woodshadowbox: { matCost: 267145, clientTotal: 528047, bom: { "Dog-Ear Picket 1x6x6'": 275, "Post 4x4x9'": 11, "2x4 Top Rail": 84, "2x4 Bottom Rail": 84, "2x4 Mid Rail": 84, "Post Cap / Finial": 11, "Exterior Screws (rails)": 66, "Exterior Screws (pickets)": 2475, "Post Concrete (60lb bag)": 33, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (104\" cut)": 4, "Gate Post Concrete (60lb bag)": 12, "Dbl Drive w/ Hardware": 1 } },
  woodsplit2: { matCost: 98700, clientTotal: 235545, bom: { "Split Rail 11ft Rail": 18, "Split Rail Post 6'": 8, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  woodsplit3: { matCost: 106800, clientTotal: 259500, bom: { "Split Rail 11ft Rail": 27, "Split Rail Post 6'": 8, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  woodsplit3fb: { matCost: 118560, clientTotal: 288396, bom: { "Split Rail 11ft Rail": 27, "Split Rail Post 6'": 8, "1x6 Face Board": 84, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  vinylprivacy6: { matCost: 338244, clientTotal: 624030, bom: { "Vinyl Privacy Panel 72\"": 12, "Vinyl Post 9'": 11, "Vinyl Top Rail": 84, "Vinyl Bottom Rail": 84, "Vinyl Mid Rail": 84, "Post Cap Vinyl": 11, "Stainless Screws": 12, "Post Concrete (60lb bag)": 33, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (104\" cut)": 4, "Gate Post Concrete (60lb bag)": 12, "Dbl Drive w/ Hardware": 1 } },
  vinylprivacy8: { matCost: 338244, clientTotal: 650070, bom: { "Vinyl Privacy Panel 96\"": 12, "Vinyl Post 11'": 11, "Vinyl Top Rail": 84, "Vinyl Bottom Rail": 84, "Vinyl Mid Rail": 84, "Post Cap Vinyl": 11, "Stainless Screws": 12, "Post Concrete (60lb bag)": 33, "Walk Gate w/ Hardware": 1, "Gate Post 11' (128\" cut)": 4, "Gate Post Concrete (60lb bag)": 12, "Dbl Drive w/ Hardware": 1 } },
  vinylsplit2: { matCost: 129700, clientTotal: 290415, bom: { "Vinyl Split Rail": 18, "Vinyl Split Rail Post 6'": 8, "Post Cap Vinyl": 8, "Post Concrete (60lb bag)": 16, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  vinylsplit3: { matCost: 142300, clientTotal: 320445, bom: { "Vinyl Split Rail": 27, "Vinyl Split Rail Post 6'": 8, "Post Cap Vinyl": 8, "Post Concrete (60lb bag)": 16, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  ornamental: { matCost: 233850, clientTotal: 496118, bom: { "Ornamental Panel 60\"": 15, "Ornamental Post 7'": 14, "Post Concrete (60lb bag)": 28, "Panel Bracket Kit": 15, "Self-Tapping Screws": 60, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (86\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  cattlefield: { matCost: 86264, clientTotal: 205736, bom: { "T-Post 6ft": 6, "Wood Corner/Brace Post 6'": 2, "Brace Wire": 4, "T-Post Clips": 51, "Barbed Wire Strand 1": 84, "Barbed Wire Strand 2": 84, "Barbed Wire Strand 3": 84, "Post Concrete (60lb bag)": 4, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  cattlehog: { matCost: 113648, clientTotal: 255725, bom: { "T-Post 6ft": 6, "Wood Corner/Brace Post 6'": 2, "Brace Wire": 4, "T-Post Clips": 51, "Hog Wire Welded Panel (red-top)": 84, "Post Concrete (60lb bag)": 4, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
  temporary: { matCost: 172400, clientTotal: 309000, bom: { "Temp Panel 6x12": 9, "Temp Panel Coupler": 6, "Panel Stand / Base": 12, "Walk Gate w/ Hardware": 1, "Gate Post 10.5' (74\" cut)": 4, "Gate Post Concrete (60lb bag)": 8, "Dbl Drive w/ Hardware": 1 } },
};

for (const [type, golden] of Object.entries(GOLDEN)) {
  test(`G-${type} golden BOM: 100 LF, 4 ft walk gate, 12 ft double drive`, async ({ page }) => {
    await cleanOpen(page);
    expect(await bomFor(page, type, true)).toEqual(golden.bom);
    const P = await state(page, `(()=>{const P=computePricing();return {final:P.isFinalReady,matCost:P.cents.matCost,clientTotal:P.cents.clientTotal};})()`);
    expect(P).toEqual({ final: true, matCost: golden.matCost, clientTotal: golden.clientTotal });
    expect(await state(page, `validateProject({requireClient:false}).errors.map(e=>e.code)`)).toEqual([]);
  });
}

test('T9 a Split + Face Board job saved before the checkbox worked reopens with its face board and total', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedRunSource('woodsplit3fb', true));
  const reopen = mutate => state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));
    st.elements.filter(el=>el.type==='fence').forEach(el=>{${mutate}});
    applyState(st);const bom=${bomSource};return {face:bom['1x6 Face Board'],total:computePricing().cents.clientTotal};})()`);
  // Saved before 5f1116d: the flag was always serialized false (never user-set).
  expect(await reopen(`el.specs.hasFaceBoard=false;delete el.specs.faceBoardChosen;`))
    .toEqual({ face: 84, total: GOLDEN.woodsplit3fb.clientTotal });
  // Flag absent altogether.
  expect(await reopen(`delete el.specs.hasFaceBoard;delete el.specs.faceBoardChosen;`))
    .toEqual({ face: 84, total: GOLDEN.woodsplit3fb.clientTotal });
  // Unchecked by the user after the repair: stays off across save and reopen.
  const off = await reopen(`el.specs.hasFaceBoard=false;el.specs.faceBoardChosen=true;`);
  expect(off.face).toBeUndefined();
});
