const { test, expect } = require('@playwright/test');

// Regression suite for the remaining Tier 2 takeoff counts (2026-10-15 estimator
// audit, inventory report 02 §3, Step 1.5 of 00-SUMMARY.md). Each test failed
// before its repair and passes after it.
//  - T1: panel and section counts round per fabric section, not per run (F-4).
//  - T2: vinyl split-rail rails follow the run's post spacing (F-3).
//  - T3: concrete is never silently 0 for a hole depth off the footing table (F-9).
//  - T4: field cattle fence with the Barbed Wire add-on does not double strands (F-8).

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
