const { test, expect } = require('@playwright/test');

// C2 — contractor-editable waste/overage per item (HANDOFF.md, counting round 2).
// A rate-card entry may carry a waste percentage (default 0). It is added to the
// needed quantity before pack rounding; LF cut stock adds it per fabric section.
//  - W1: with every waste at 0, order equals needed and pricing is unchanged.
//  - W2: 10% on pickets rounds up to whole pickets, then to whole bundles.
//  - W3: LF cut stock adds waste per section before rounding each section.
//  - W4: waste saves and reloads with the job without touching the company card.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// One straight 100 LF run of `type`; when gated, a 4 ft walk gate at 40-44 ft
// and a 12 ft double drive at 70-82 ft (fabric sections of 40, 26 and 18 ft).
const seed = (type, { gated = false } = {}) => `(()=>{
  S.elements=[];S.materials=[];S.selected=null;
  selectFenceType(${JSON.stringify(type)});
  const run={type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},fenceType:${JSON.stringify(type)},
    runId:'run_waste_0',specs:cloneRunSpecs(S.specs),postSpacing:S.postSpacing,autoPostSpacing:S.postSpacing};
  S.elements.push(run);
  if(${gated})[['walk',40,44],['doubledrive',70,82]].forEach(([gateType,a,b])=>
    S.elements.push(attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},run)));
  rebuildRunAutoPosts(run);
  draw();updatePanel();
  return null;
})()`;

const line = match => `(()=>{const f=m=>m.name.startsWith(${JSON.stringify(match)});const r=calcAutoMaterials().find(f);
  const P=computePricing();const l=P.matLines.find(f);
  return {name:r.name,qty:r.qty,order:r.order,pack:r.pack,waste:r.waste,pricedQty:l.pricedQty,pricedUnit:l.pricedUnit,extC:l.extC,
    matCost:P.cents.matCost,final:P.isFinalReady,invalid:P.invalidInputs};})()`;

test('W1 with every waste at 0, every line orders exactly what it needs', async ({ page }) => {
  await cleanOpen(page);
  for (const type of ['chainlink', 'woodprivacy', 'vinylprivacy6', 'cattlehog', 'temporary']) {
    await state(page, seed(type, { gated: true }));
    const rows = await state(page, `(()=>{const P=computePricing();return {
      auto:calcAutoMaterials().map(m=>[m.name,m.waste,m.order===m.qty]),
      priced:P.matLines.map(m=>[m.name,m.pricedQty===m.qty])};})()`);
    for (const [name, waste, same] of rows.auto) expect([type, name, waste, same]).toEqual([type, name, 0, true]);
    for (const [name, q] of rows.priced) expect([type, name, q]).toEqual([type, name, true]);
  }
});

test('W2 10% waste on pickets rounds up to whole pickets, then to whole bundles', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seed('woodprivacy'));
  const base = await state(page, line('Dog-Ear Picket'));
  const need = base.qty;
  expect(need % 10).not.toBe(0); // 10% of it is fractional, so rounding is exercised

  await state(page, `COST_DB['dog ear picket']={...COST_DB['dog ear picket'],waste:10}`);
  const w = await state(page, line('Dog-Ear Picket'));
  const withWaste = Math.ceil(need * 1.1);
  expect(w).toMatchObject({ qty: need, waste: 10, pack: 1, order: withWaste, pricedQty: withWaste, pricedUnit: 'ea', final: true });
  const picketC = await state(page, `centsOf(COST_DB['dog ear picket'].cost,1)`);
  expect(w.extC).toBe(withWaste * picketC);
  expect(w.matCost - base.matCost).toBe((withWaste - need) * picketC);

  // Waste is applied before pack rounding: bundles of 25.
  await state(page, `COST_DB['dog ear picket']={...COST_DB['dog ear picket'],pack:25}`);
  const b = await state(page, line('Dog-Ear Picket'));
  expect(b).toMatchObject({ qty: need, order: Math.ceil(need * 1.1 / 25) * 25, final: true });
});

test('W3 LF cut stock adds waste per fabric section before rounding each section', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seed('cattlehog', { gated: true })); // sections of 40, 26 and 18 ft
  await state(page, `COST_DB['hog wire welded panel']={...COST_DB['hog wire welded panel'],pack:16,waste:25}`);
  const lf = await state(page, line('Hog Wire Welded Panel'));
  // 50 / 32.5 / 22.5 ft -> 4 + 3 + 2 = 9 sixteen-foot panels = 144 lf.
  expect(lf).toMatchObject({ qty: 84, pack: 16, waste: 25, order: 144, pricedQty: 144, final: true });
});

test('W4 waste saves and reloads with the job without touching the company card', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{COST_DB['dog ear picket']={...COST_DB['dog ear picket'],waste:10};if(!saveCostDB())throw new Error('save');})()`);
  expect(await state(page, `(()=>{reloadSavedCostDB();return COST_DB['dog ear picket'].waste;})()`)).toBe(10);
  await state(page, seed('woodprivacy'));
  const job = await state(page, `JSON.parse(JSON.stringify(snapshotState()))`);
  const jobOrder = (await state(page, line('Dog-Ear Picket'))).order;

  await state(page, `(()=>{COST_DB['dog ear picket']={...COST_DB['dog ear picket'],waste:5};if(!saveCostDB())throw new Error('save');})()`);
  const card = await state(page, `localStorage.getItem(COSTDB_KEY)`);

  await state(page, `(()=>{applyState(${JSON.stringify(job)});draw();updatePanel();})()`);
  expect(await state(page, line('Dog-Ear Picket'))).toMatchObject({ waste: 10, order: jobOrder, final: true });
  expect(await state(page, `saveCostDB()`)).toBe(false);
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBe(card);

  const withWaste = v => JSON.stringify({ ...job, costs: { ...job.costs, 'dog ear picket': { ...job.costs['dog ear picket'], waste: v } } });
  await state(page, `applyState(${withWaste('7.5')})`);
  expect(await state(page, `COST_DB['dog ear picket'].waste`)).toBe(7.5);
  for (const bad of ['abc', -5]) {
    await state(page, `applyState(${withWaste(bad)})`);
    const P = await state(page, line('Dog-Ear Picket'));
    expect(P.final).toBe(false);
    expect(P.invalid.some(s => s.startsWith('Waste % of “Dog-Ear Picket'))).toBe(true);
    expect(P.waste).toBe(0);
  }
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBe(card);
});
