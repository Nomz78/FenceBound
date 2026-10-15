const { test, expect } = require('@playwright/test');

// Estimator audit 2026-10-15, Step 1.2 "Boundary coercion" (owner directive
// "start the fixes"): pricing F3 (bare-number legacy costs -> NaN, still
// FINAL-READY), F4 (string markup ~70x), F8 (CSV money parsing), F11 (negative
// rates accepted), and the S.materials.qty string-persistence known defect.
// One coercion rule applies at every boundary: finite numbers >= 0 pass, plain
// decimal strings coerce to numbers, anything else is rejected and reported.

const R15_CENTS = 28692;

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// Same 10 ft default chain-link run the R15 baseline uses.
async function seedRun(page) {
  await state(page, `(()=>{
    S.projectName='Boundary Job';S.materials=[];
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},
      fenceType:'chainlink',runId:'run_boundary_test',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    draw();updatePanel();
  })()`);
}

// Load a job built from the current state with the given overrides via applyState.
const loadJobWith = overrides => `(()=>{
  const st=JSON.parse(JSON.stringify(snapshotState()));
  Object.assign(st,${overrides});
  applyState(st);
  const P=computePricing(),v=validateProject({requireClient:false});
  return{total:P.cents.clientTotal,final:P.isFinalReady,
    finite:Object.values(P.cents).every(Number.isFinite),
    codes:v.errors.map(e=>e.code)};
})()`;

async function openEditor(page) {
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-cost-editor').click();
  await expect(page.locator('#ce-save')).toBeVisible();
}

test('IB1 legacy job with a bare-number cost entry is read as {cost:number} and prices exactly', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  const key = await state(page, `computePricing().matLines.find(l=>l.unitCostC>0).costKey`);
  const seed = await state(page, `({...COST_DB[${JSON.stringify(key)}]})`);
  const r = await state(page, loadJobWith(`{costs:{${JSON.stringify(key)}:${seed.cost}}}`));
  expect(await state(page, `COST_DB[${JSON.stringify(key)}]`)).toEqual({ cost: seed.cost, unit: seed.unit });
  expect(r.finite).toBe(true);
  expect(r.total).toBe(R15_CENTS);
  expect(r.final).toBe(true);
  expect(r.codes).not.toContain('INVALID_PRICING_INPUT');
});

for (const bad of [{ label: 'negative', v: '-2' }, { label: 'non-numeric', v: '"abc"' }, { label: 'exponent string', v: '"1e2"' }]) {
  test(`IB2 legacy job with a ${bad.label} bare cost is rejected with a validation error`, async ({ page }) => {
    await cleanOpen(page);
    await seedRun(page);
    const key = await state(page, `computePricing().matLines.find(l=>l.unitCostC>0).costKey`);
    const r = await state(page, loadJobWith(`{costs:{${JSON.stringify(key)}:${bad.v}}}`));
    expect(r.finite).toBe(true);
    expect(r.final).toBe(false);
    expect(r.codes).toContain('INVALID_PRICING_INPUT');
  });
}

test('IB3 markup stored as a string coerces on job load, saved rate card, and JSON price import', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  const r = await state(page, loadJobWith(`{markup:{materialPct:'35',laborPct:'55'}}`));
  expect(r.total).toBe(R15_CENTS);
  expect(await state(page, `[MARKUP.materialPct,MARKUP.laborPct]`)).toEqual([35, 55]);

  await cleanOpen(page);
  await seedRun(page);
  const merged = await state(page, `(()=>{mergeSavedCostDB({markup:{materialPct:'35',laborPct:'55'},costs:{'chain link fabric':{cost:'3.20',unit:'lf'}}});
    return{total:computePricing().cents.clientTotal,m:[MARKUP.materialPct,MARKUP.laborPct],fabric:COST_DB['chain link fabric'].cost};})()`);
  expect(merged).toEqual({ total: R15_CENTS, m: [35, 55], fabric: 3.2 });

  await cleanOpen(page);
  await openEditor(page);
  const payload = JSON.stringify({ app: 'FenceboundCAD', kind: 'prices', markup: { materialPct: '40', laborPct: '50' } });
  await page.locator('#ce-import-file').setInputFiles({ name: 'p.fbprices.json', mimeType: 'application/json', buffer: Buffer.from(payload) });
  await expect(page.locator('#app-toast')).toContainText('Prices imported');
  expect(await state(page, `[MARKUP.materialPct,MARKUP.laborPct,JSON.parse(localStorage.getItem(COSTDB_KEY)).markup.materialPct]`)).toEqual([40, 50, 40]);
});

for (const bad of [{ label: 'non-numeric', v: `'abc'` }, { label: 'negative', v: '-150' }]) {
  test(`IB4 ${bad.label} markup in a loaded job blocks FINAL-READY and is reported`, async ({ page }) => {
    await cleanOpen(page);
    await seedRun(page);
    const r = await state(page, loadJobWith(`{markup:{materialPct:${bad.v},laborPct:55}}`));
    expect(r.finite).toBe(true);
    expect(r.final).toBe(false);
    expect(r.codes).toContain('INVALID_PRICING_INPUT');
  });
}

test('IB5 CSV money accepts $1,234.50, 12.50, 45¢ and 45c; rejects comma decimals and junk with row errors', async ({ page }) => {
  await cleanOpen(page);
  const parsed = await state(page, `['$1,234.50','12.50','45¢','45c','$12.00'].map(csvParseMoney)`);
  expect(parsed).toEqual([1234.5, 12.5, 0.45, 0.45, 12]);
  const preview = await state(page, `(()=>{
    const rows=[['Material','Price'],['Item A','12,50'],['Item B','0,85'],['Item C','1.234,56'],['Item D','3.20 per 100'],['Item E','(3.20)'],['Item F','$1,234.50'],['Item G','45¢']];
    return csvBuildPreview(rows,{name:0,cost:1,unit:-1},true,'last');
  })()`);
  expect(preview.entries.map(e => [e.key, e.cost])).toEqual([['item f', 1234.5], ['item g', 0.45]]);
  const why = Object.fromEntries(preview.rejected.map(r => [r.name, r.why]));
  expect(why['Item A']).toMatch(/comma/);
  expect(why['Item B']).toMatch(/comma/);
  expect(why['Item C']).toMatch(/comma/);
  expect(why['Item D']).toBe('price not a number');
  expect(why['Item E']).toBe('negative price');
});

for (const bad of [
  { label: 'negative material cost', sel: '[data-cost="chain link fabric"]', value: '-5' },
  { label: 'negative labor $/LF', sel: '[data-labor="chainlink"]', value: '-7' },
  { label: 'negative material markup', sel: '#ce-mat-markup', value: '-90' },
  { label: 'blank labor markup', sel: '#ce-lab-markup', value: '' },
]) {
  test(`IB6 cost editor rejects a ${bad.label} and saves nothing`, async ({ page }) => {
    await cleanOpen(page);
    const before = await state(page, `JSON.stringify({c:COST_DB,l:LABOR,m:MARKUP})`);
    await openEditor(page);
    await page.locator(bad.sel).evaluate((el, v) => { el.value = v; }, bad.value);
    await page.locator('#ce-save').click();
    await expect(page.locator('#app-toast')).toContainText(/0 or more/);
    await expect(page.locator('#ce-save')).toBeVisible();
    expect(await state(page, `JSON.stringify({c:COST_DB,l:LABOR,m:MARKUP})`)).toBe(before);
    expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBeNull();
  });
}

test('IB7 JSON price import and backup restore reject a negative cost atomically', async ({ page }) => {
  await cleanOpen(page);
  const before = await state(page, `JSON.stringify({c:COST_DB,l:LABOR,m:MARKUP})`);
  await openEditor(page);
  const payload = JSON.stringify({ app: 'FenceboundCAD', kind: 'prices', costs: { 'chain link fabric': { cost: -5, unit: 'lf' } }, markup: { materialPct: 50 } });
  await page.locator('#ce-import-file').setInputFiles({ name: 'p.fbprices.json', mimeType: 'application/json', buffer: Buffer.from(payload) });
  await expect(page.locator('#app-toast')).toContainText('Import failed');
  expect(await state(page, `JSON.stringify({c:COST_DB,l:LABOR,m:MARKUP})`)).toBe(before);
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBeNull();

  await cleanOpen(page);
  await state(page, `(()=>{openRestoreDialog({format:1,pricing:{costs:{'chain link fabric':{cost:-5,unit:'lf'}},labor:{perLF:{chainlink:'-1'}},markup:{materialPct:'35'}}});return null;})()`);
  await page.locator('#rs-apply').click();
  await expect(page.locator('#app-toast')).toContainText('Restore failed');
  expect(await state(page, `JSON.stringify({c:COST_DB,l:LABOR,m:MARKUP})`)).toBe(before);
  expect(await state(page, `localStorage.getItem(COSTDB_KEY)`)).toBeNull();
});

test('IB8 manual material qty: plain decimals stored as numbers; 1e2, blank and negative rejected at entry', async ({ page }) => {
  await cleanOpen(page);
  await page.locator('[data-tab="materials"]').click();
  const add = async qty => {
    await page.locator('#mat-name').fill('Post Cap');
    await page.locator('#mat-qty').evaluate((el, v) => { el.value = v; }, qty);
    await page.locator('#btn-add-mat').click();
  };
  await add('3');
  await add('2.5');
  expect(await state(page, `S.materials.map(m=>m.qty)`)).toEqual([3, 2.5]);
  for (const bad of ['1e2', '']) {
    await add(bad);
    await expect(page.locator('#app-toast')).toContainText(/Quantity/);
    expect(await state(page, `S.materials.length`)).toBe(2);
  }
});

test('IB9 loaded string qty values coerce to numbers; non-plain forms are rejected, not priced', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  const r = await state(page, `(()=>{
    COST_DB['post cap special']={cost:2,unit:'ea'};
    const st=JSON.parse(JSON.stringify(snapshotState()));
    st.materials=[{name:'Post Cap Special',qty:'3',unit:'ea',id:1},{name:'Post Cap Special',qty:'1e2',unit:'ea',id:2}];
    applyState(st);
    const P=computePricing(),v=validateProject({requireClient:false});
    return{stored:S.materials.map(m=>m.qty),priced:P.matLines.filter(l=>l.source==='manual').map(l=>l.qty),
      final:P.isFinalReady,codes:v.errors.map(e=>e.code)};
  })()`);
  expect(r.stored[0]).toBe(3);
  expect(r.priced).toEqual([3, 0]);
  expect(r.final).toBe(false);
  expect(r.codes).toContain('INVALID_PRICING_INPUT');
});

for (const c of [
  { label: 'negative material cost', setup: `COST_DB['chain link fabric'].cost=-3.2` },
  { label: 'string markup that is not a plain number', setup: `MARKUP.laborPct='55%'` },
  { label: 'negative labor $/LF', setup: `LABOR.perLF.chainlink=-5` },
  { label: 'NaN gate rate', setup: `LABOR.gate.walk=NaN;S.elements.push({type:'gate',start:{x:0,y:0},end:{x:160,y:0},gateType:'walk',runId:'run_boundary_test'})` },
]) {
  test(`IB10 FINAL-READY is impossible with a ${c.label}`, async ({ page }) => {
    await cleanOpen(page);
    await seedRun(page);
    expect(await state(page, `computePricing().isFinalReady`)).toBe(true);
    const r = await state(page, `(()=>{${c.setup};updatePanel();
      const P=computePricing(),v=validateProject({requireClient:false});
      return{final:P.isFinalReady,finite:Object.values(P.cents).every(Number.isFinite),codes:v.errors.map(e=>e.code)};})()`);
    expect(r.final).toBe(false);
    expect(r.finite).toBe(true);
    expect(r.codes).toContain('INVALID_PRICING_INPUT');
  });
}
