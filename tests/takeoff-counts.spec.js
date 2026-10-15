const { test, expect } = require('@playwright/test');

// Regression suite for the remaining Tier 2 takeoff counts (2026-10-15 estimator
// audit, inventory report 02 §3, Step 1.5 of 00-SUMMARY.md). Each test failed
// before its repair and passes after it.
//  - T1: panel and section counts round per fabric section, not per run (F-4).
//  - T2: vinyl split-rail rails follow the run's post spacing (F-3).

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
