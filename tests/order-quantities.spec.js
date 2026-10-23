const { test, expect } = require('@playwright/test');

// C1 — order quantities in purchasable units (HANDOFF.md, counting round 2).
// Every rate-card entry may carry a contractor pack size (default 1). Each line
// keeps its needed quantity and gains an order quantity rounded up to whole packs.
//  - O1: with every pack at 1, order equals needed and pricing is unchanged.
//  - O2: a bulk item rounds across the whole job; a per-pack rate prices packs.
//  - O3: LF cut stock rounds per fabric section, never pooled (40/26/18 hog panel).
//  - O4: pack sizes save and reload with the job without touching the company card.
//  - O5: the materials panel shows both needed and order.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// Straight 100 LF runs of `type`, `runs` of them 50 ft apart. When gated, the
// first run gets a 4 ft walk gate at 40-44 ft and a 12 ft double drive at 70-82
// ft (fabric sections of 40, 26 and 18 ft), as in tests/takeoff-counts.spec.js.
const seed = (type, { gated = false, runs = 1 } = {}) => `(()=>{
  S.elements=[];S.materials=[];S.selected=null;
  selectFenceType(${JSON.stringify(type)});
  const made=[];
  for(let i=0;i<${runs};i++){
    const run={type:'fence',start:{x:0,y:i*50*GRID_FT},end:{x:100*GRID_FT,y:i*50*GRID_FT},fenceType:${JSON.stringify(type)},
      runId:'run_order_'+i,specs:cloneRunSpecs(S.specs),postSpacing:S.postSpacing,autoPostSpacing:S.postSpacing};
    S.elements.push(run);made.push(run);
  }
  if(${gated})[['walk',40,44],['doubledrive',70,82]].forEach(([gateType,a,b])=>
    S.elements.push(attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},made[0])));
  made.forEach(rebuildRunAutoPosts);
  draw();updatePanel();
  return null;
})()`;

const line = name => `(()=>{const r=calcAutoMaterials().find(m=>m.name===${JSON.stringify(name)});
  const P=computePricing();const l=P.matLines.find(m=>m.name===${JSON.stringify(name)});
  return {qty:r.qty,order:r.order,pack:r.pack,pricedQty:l.pricedQty,pricedUnit:l.pricedUnit,extC:l.extC,
    matCost:P.cents.matCost,final:P.isFinalReady,invalid:P.invalidInputs,mismatch:P.unitMismatch};})()`;

test('O1 with every pack size at 1, every line orders exactly what it needs', async ({ page }) => {
  await cleanOpen(page);
  for (const type of ['chainlink', 'woodprivacy', 'vinylprivacy6', 'cattlehog', 'temporary']) {
    await state(page, seed(type, { gated: true }));
    const rows = await state(page, `(()=>{const P=computePricing();return {
      auto:calcAutoMaterials().map(m=>[m.name,m.pack,m.order===m.qty]),
      priced:P.matLines.map(m=>[m.name,m.pricedQty===m.qty,m.pricedUnit===m.unit])};})()`);
    for (const [name, pack, same] of rows.auto) expect([type, name, pack, same]).toEqual([type, name, 1, true]);
    for (const [name, q, u] of rows.priced) expect([type, name, q, u]).toEqual([type, name, true, true]);
  }
});

test('O2 a bulk item rounds its order up across the whole job, and a per-pack rate prices packs', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seed('chainlink', { runs: 1 }));
  const one = (await state(page, line('Wire Ties 9ga'))).qty;
  await state(page, seed('chainlink', { runs: 2 }));
  const base = await state(page, line('Wire Ties 9ga'));
  expect(base.qty).toBe(2 * one);

  // 250 ties per bag, rate still per tie: both runs fit one bag. Rounding per run
  // would order two bags.
  expect(2 * one).toBeLessThanOrEqual(250);
  await state(page, `COST_DB['wire ties']={...COST_DB['wire ties'],pack:250}`);
  const pooled = await state(page, line('Wire Ties 9ga'));
  expect(pooled).toMatchObject({ qty: base.qty, pack: 250, order: 250, pricedQty: 250, pricedUnit: 'ea', final: true });
  const tieC = await state(page, `centsOf(COST_DB['wire ties'].cost,1)`);
  expect(pooled.extC).toBe(pooled.order * tieC);
  expect(pooled.matCost - base.matCost).toBe((pooled.order - base.qty) * tieC);

  // The contractor's rate is per bag of 50: price whole bags, never a silent conversion.
  await state(page, `COST_DB['wire ties']={cost:12.5,unit:'bag',pack:50}`);
  const bag = await state(page, line('Wire Ties 9ga'));
  const bags = Math.ceil((2 * one) / 50);
  expect(bag).toMatchObject({ order: bags * 50, pricedQty: bags, pricedUnit: 'bag', extC: bags * 1250, final: true, mismatch: [] });

  // The unit guard stays: a per-bag rate with no pack size is still not priced.
  await state(page, `COST_DB['wire ties']={cost:12.5,unit:'bag'}`);
  const guarded = await state(page, line('Wire Ties 9ga'));
  expect(guarded.final).toBe(false);
  expect(guarded.mismatch.length).toBe(1);
});

test('O3 LF cut stock rounds per fabric section and is never pooled across sections', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seed('cattlehog', { gated: true })); // sections of 40, 26 and 18 ft
  const name = 'Hog Wire Welded Panel (red-top)';
  await state(page, `COST_DB['hog wire welded panel']={...COST_DB['hog wire welded panel'],pack:16}`);
  const lf = await state(page, line(name));
  // 3 + 2 + 2 = 7 sixteen-foot panels, not ceil(84/16) = 6.
  expect(lf).toMatchObject({ qty: 84, pack: 16, order: 112, pricedQty: 112, pricedUnit: 'lf', final: true });

  await state(page, `COST_DB['hog wire welded panel']={cost:59,unit:'panel',pack:16}`);
  const panel = await state(page, line(name));
  expect(panel).toMatchObject({ qty: 84, order: 112, pricedQty: 7, pricedUnit: 'panel', extC: 7 * 5900, final: true });
});

test('O4 pack sizes save and reload with the job without touching the company card', async ({ page }) => {
  await cleanOpen(page);
  // Company card: ties come 50 per bag.
  await state(page, `(()=>{COST_DB['wire ties']={...COST_DB['wire ties'],pack:50};if(!saveCostDB())throw new Error('save');})()`);
  // The company card keeps pack sizes across a reload of the saved card.
  expect(await state(page, `(()=>{reloadSavedCostDB();return COST_DB['wire ties'].pack;})()`)).toBe(50);
  await state(page, seed('chainlink', { runs: 2 }));
  const job = await state(page, `JSON.parse(JSON.stringify(snapshotState()))`);
  const jobOrder = (await state(page, line('Wire Ties 9ga'))).order;

  // The company later switches to bags of 500.
  await state(page, `(()=>{COST_DB['wire ties']={...COST_DB['wire ties'],pack:500};if(!saveCostDB())throw new Error('save');})()`);
  const card = await state(page, `localStorage.getItem(COSTDB_KEY)`);

  await state(page, `(()=>{applyState(${JSON.stringify(job)});draw();updatePanel();})()`);
  const reopened = await state(page, line('Wire Ties 9ga'));
  expect(reopened).toMatchObject({ pack: 50, order: jobOrder, final: true });
  expect(await state(page, `saveCostDB()`)).toBe(false);
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBe(card);

  // applyState coerces pack sizes: a plain decimal string loads as a number,
  // anything else is reported and blocks FINAL-READY instead of pricing silently.
  const withPack = v => JSON.stringify({ ...job, costs: { ...job.costs, 'wire ties': { ...job.costs['wire ties'], pack: v } } });
  await state(page, `applyState(${withPack('25')})`);
  expect(await state(page, `COST_DB['wire ties'].pack`)).toBe(25);
  for (const bad of ['abc', -2, 0]) {
    await state(page, `applyState(${withPack(bad)})`);
    const P = await state(page, line('Wire Ties 9ga'));
    expect(P.final).toBe(false);
    expect(P.invalid).toContain('Pack size of “Wire Ties 9ga”');
    expect(P.pack).toBe(1);
  }
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBe(card);
});

test('O5 the materials panel shows the needed and the order quantity', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `COST_DB['hog wire welded panel']={...COST_DB['hog wire welded panel'],pack:16}`);
  await state(page, seed('cattlehog', { gated: true }));
  const row = page.locator('#auto-mat-list .mat-row', { hasText: 'Hog Wire Welded Panel' });
  await expect(row.locator('.mat-need')).toHaveText('need 84');
  await expect(row.locator('.mat-order')).toHaveText('order 112 lf');
});
