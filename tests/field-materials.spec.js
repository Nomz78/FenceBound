// Field capture P2 (FIELD_CAPTURE_DESIGN_2026-10-31 §2, §4): materials actuals
// per estimate line. The list pre-fills from the estimate's material lines
// (the frozen quote's prices when quoted), edits persist with the job, and the
// company rate card is never written.
const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function seedJob(page) {
  await state(page, `(()=>{
    S.projectName='Materials Job';S.pan={x:80,y:80};S.zoom=1;
    S.elements=[
      {type:'fence',start:{x:0,y:100},end:{x:250,y:100},fenceType:'chainlink',runId:'run_a',
        specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10},
      {type:'gate',start:{x:150,y:100},end:{x:190,y:100},gateType:'walk',runId:'run_a'}];
    draw();updatePanel();
  })()`);
}

async function openField(page) {
  await page.locator('.ptab[data-tab="field"]').tap();
  await expect(page.locator('#tab-field')).toBeVisible();
}

const mats = page => state(page, 'JSON.parse(JSON.stringify(S.actuals.materials))');
// The estimate's material lines as the list should show them: priced quantity
// and unit when the rate is per pack, otherwise the line's own.
const estLines = page => state(page, `computePricing().matLines.map(l=>({name:l.name,
  unit:l.pricedUnit??l.unit,estQty:l.pricedQty??l.qty,estUnitCost:l.unitCost}))`);

test('Load estimate lines pre-fills one actuals line per estimate material line', async ({ page }) => {
  await cleanOpen(page);
  await seedJob(page);
  await openField(page);
  await page.locator('#field-mat-load').tap();
  const est = await estLines(page);
  expect(est.length).toBeGreaterThan(2);
  const m = await mats(page);
  expect(m.map(({ name, unit, estQty, estUnitCost }) => ({ name, unit, estQty, estUnitCost }))).toEqual(est);
  expect(m.every(l => l.qty === null && l.unitCost === null && l.extra === false)).toBe(true);
  await expect(page.locator('[data-mat-row]')).toHaveCount(est.length);
});

test('a quoted job pre-fills from the frozen quote prices, not the company card', async ({ page }) => {
  await cleanOpen(page);
  await seedJob(page);
  const card = await state(page, 'JSON.stringify(readSavedCostDB())');
  const key = await state(page, `(()=>{
    const line=computePricing().matLines.find(l=>l.costKey&&l.unitCost>0);
    S.quote={frozenAt:new Date().toISOString(),total:1,pricing:clonePricing()};
    const c=S.quote.pricing.costs;
    if(c[line.costKey]&&typeof c[line.costKey]==='object')c[line.costKey].cost=123.45;else c[line.costKey]=123.45;
    useQuotePricing();return line.name;
  })()`);
  await openField(page);
  await page.locator('#field-mat-load').tap();
  const line = (await mats(page)).find(l => l.name === key);
  expect(line.estUnitCost).toBe(123.45);
  expect(await state(page, 'JSON.stringify(readSavedCostDB())')).toBe(card);
});

test('same as estimate, typed actuals and an extra return line persist through reload', async ({ page }) => {
  await cleanOpen(page);
  await seedJob(page);
  await openField(page);
  await page.locator('#field-mat-load').tap();
  await page.locator('[data-mat-same="0"]').tap();
  await page.locator('[data-mat-row="1"] [data-mat-field="qty"]').fill('7');
  await page.locator('[data-mat-row="1"] [data-mat-field="unitCost"]').fill('2.5');
  await page.locator('[data-mat-row="1"] [data-mat-field="supplier"]').fill('Yard A');
  await page.locator('[data-mat-row="1"] [data-mat-field="supplier"]').blur();
  await page.locator('#field-mat-add').tap();
  const extra = page.locator('[data-mat-row]').last();
  await extra.locator('[data-mat-field="name"]').fill('Returned rail');
  await extra.locator('[data-mat-field="qty"]').fill('-2');
  await extra.locator('[data-mat-field="unitCost"]').fill('10');
  await extra.locator('[data-mat-field="unitCost"]').blur();
  const before = await mats(page);
  const est = await estLines(page);
  expect(before[0].qty).toBe(est[0].estQty);
  expect(before[0].unitCost).toBe(est[0].estUnitCost);
  expect(before[1]).toMatchObject({ qty: 7, unitCost: 2.5, supplier: 'Yard A' });
  expect(before.at(-1)).toMatchObject({ name: 'Returned rail', qty: -2, unitCost: 10, extra: true });
  await expect(page.locator('#field-mat-total')).toContainText('Actual');

  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  expect(await mats(page)).toEqual(before);
  // A job snapshot (Save, export, backup) carries the list too.
  expect(await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));
    S.actuals=emptyActuals();applyState(st);return JSON.parse(JSON.stringify(S.actuals.materials));})()`)).toEqual(before);
});

test('loading estimate lines again adds only missing lines and keeps entered actuals', async ({ page }) => {
  await cleanOpen(page);
  await seedJob(page);
  await openField(page);
  await page.locator('#field-mat-load').tap();
  const n = (await mats(page)).length;
  await page.locator('[data-mat-same="0"]').tap();
  await page.locator('[data-mat-del="1"]').tap();
  await page.locator('#field-mat-load').tap();
  const m = await mats(page);
  expect(m).toHaveLength(n);
  expect(m[0].qty).not.toBeNull();
});

test('a materials-only session is restored at boot', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{S.actuals.materials.push({key:null,name:'Concrete',unit:'bag',estQty:null,estUnitCost:null,
    qty:10,unitCost:6,supplier:'',extra:true});saveSession();})()`);
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  expect((await mats(page)).map(l => l.name)).toEqual(['Concrete']);
});

test('bad material lines are dropped one by one and the job still loads', async ({ page }) => {
  await cleanOpen(page);
  await seedJob(page);
  const m = await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));
    st.actuals.materials=[
      {key:'k1',name:'Post',unit:'ea',estQty:10,estUnitCost:20,qty:11,unitCost:19.5,supplier:'Yard',extra:false},
      {name:'',qty:1},                       // no name: dropped
      'junk',                                 // not an object: dropped
      {name:'Rail',unit:'lf',estQty:-3,estUnitCost:'x',qty:'7',unitCost:-1,supplier:42,extra:'yes'},
      {name:'x'.repeat(500),qty:Infinity}];
    applyState(st);return JSON.parse(JSON.stringify(S.actuals.materials));})()`);
  expect(m).toEqual([
    { key: 'k1', name: 'Post', unit: 'ea', estQty: 10, estUnitCost: 20, qty: 11, unitCost: 19.5, supplier: 'Yard', extra: false },
    { key: null, name: 'Rail', unit: 'lf', estQty: null, estUnitCost: null, qty: null, unitCost: null, supplier: '', extra: false },
    { key: null, name: 'x'.repeat(200), unit: '', estQty: null, estUnitCost: null, qty: null, unitCost: null, supplier: '', extra: false }]);
  expect(await state(page, 'S.elements.length')).toBe(2);
});
