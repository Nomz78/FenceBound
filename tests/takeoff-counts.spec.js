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
  const concrete = async extra => {
    const bom = await bomFor(page, 'chainlink', true, extra);
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
