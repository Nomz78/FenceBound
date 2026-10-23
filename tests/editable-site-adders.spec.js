const { test, expect } = require('@playwright/test');

// Owner ruling 2026-10-15 ("make add-ons editable", audit F12): FenceBound does
// not set prices. The site upcharge rates (demo/removal $/LF, grade/slope $/LF,
// hard-dig % of labor, urban % of client subtotal) are contractor-editable
// rate-card values. Seeds equal the former hardcoded constants exactly, so a
// default job prices identically.

const SEEDS = { demoPerLF: 3, slopePerLF: 0.5, hardDigPct: 30, urbanPct: 15 };
const UC_IDS = ['uc-demo', 'uc-slope', 'uc-urban', 'uc-harddig'];

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
    S.projectName='Site Adder Job';
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},
      fenceType:'chainlink',runId:'run_site_adder_test',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    draw();updatePanel();
  })()`);
}

// Price the job with exactly the named upcharges checked; restore all to unchecked.
const priceWith = on => `((on)=>{
  ${JSON.stringify(UC_IDS)}.forEach(id=>{document.getElementById(id).checked=on.includes(id);});
  const P=computePricing();
  ${JSON.stringify(UC_IDS)}.forEach(id=>{document.getElementById(id).checked=false;});
  return{cents:P.cents,ft:getStats().totalFt};
})(${JSON.stringify(on)})`;

async function upchargeDeltas(page) {
  return state(page, `(()=>{
    const base=${priceWith([])};
    const demo=${priceWith(['uc-demo'])};
    const slope=${priceWith(['uc-slope'])};
    const hard=${priceWith(['uc-harddig'])};
    const urban=${priceWith(['uc-urban'])};
    return{ft:base.ft,baseLaborC:base.cents.laborCost,baseSubC:base.cents.clientSubtotal,
      demoC:demo.cents.matCost-base.cents.matCost,
      slopeC:slope.cents.laborCost-base.cents.laborCost,
      hardC:hard.cents.laborCost-base.cents.laborCost,
      urbanC:urban.cents.urbanAdd,
      allFinite:[base,demo,slope,hard,urban].every(r=>Object.values(r.cents).every(Number.isInteger))};
  })()`);
}

async function openEditor(page) {
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-cost-editor').click();
  await expect(page.locator('#ce-save')).toBeVisible();
}

test('SA1 seeds equal the former hardcoded rates and the default job prices identically (R15)', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  const seeds = await state(page, `({demoPerLF:LABOR.demoPerLF,slopePerLF:LABOR.slopePerLF,hardDigPct:LABOR.hardDigPct,urbanPct:MARKUP.urbanPct})`);
  expect(seeds).toEqual(SEEDS);
  const total = await state(page, `(()=>{S.materials=[];return computePricing().cents.clientTotal;})()`);
  expect(total).toBe(28287); // C0b chain link: was 28692 (persistence-integrity R15)
  const d = await upchargeDeltas(page);
  expect(d.ft).toBeGreaterThan(0);
  expect(d.demoC).toBe(Math.round(d.ft * 300));
  expect(d.slopeC).toBe(Math.round(d.ft * 50));
  expect(d.hardC).toBe(Math.round(d.baseLaborC * 30 / 100));
  expect(d.urbanC).toBe(Math.round(d.baseSubC * 15 / 100));
});

test('SA2 editing each rate in the cost editor changes its priced upcharge and the quoted labels', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  await openEditor(page);
  await page.locator('#ce-demo-rate').fill('5');
  await page.locator('#ce-slope-rate').fill('1.25');
  await page.locator('#ce-harddig-pct').fill('40');
  await page.locator('#ce-urban-pct').fill('20');
  await page.locator('#ce-save').click();
  await expect(page.locator('#ce-save')).toBeHidden();
  const d = await upchargeDeltas(page);
  expect(d.allFinite).toBe(true);
  expect(d.demoC).toBe(Math.round(d.ft * 500));
  expect(d.slopeC).toBe(Math.round(d.ft * 125));
  expect(d.hardC).toBe(Math.round(d.baseLaborC * 40 / 100));
  expect(d.urbanC).toBe(Math.round(d.baseSubC * 20 / 100));
  // Customer-facing rate text reflects the edited values, not the old constants.
  await expect(page.locator('#uc-urban-lbl')).toHaveText('+20%');
  await expect(page.locator('#uc-harddig-lbl')).toHaveText('+40% labor');
  await page.locator('#uc-urban').check();
  await expect(page.getByText('Urban premium (+20%)')).toBeVisible();
});

test('SA3 edited rates persist across reload through saveCostDB', async ({ page }) => {
  await cleanOpen(page);
  await openEditor(page);
  await page.locator('#ce-demo-rate').fill('4.257');
  await page.locator('#ce-slope-rate').fill('0.75');
  await page.locator('#ce-harddig-pct').fill('25');
  await page.locator('#ce-urban-pct').fill('12.5');
  await page.locator('#ce-save').click();
  await expect(page.locator('#ce-save')).toBeHidden();
  const stored = await state(page, `(()=>{const o=JSON.parse(localStorage.getItem(COSTDB_KEY));return{demoPerLF:o.labor.demoPerLF,slopePerLF:o.labor.slopePerLF,hardDigPct:o.labor.hardDigPct,urbanPct:o.markup.urbanPct};})()`);
  // Dollar amounts are stored to whole cents.
  expect(stored).toEqual({ demoPerLF: 4.26, slopePerLF: 0.75, hardDigPct: 25, urbanPct: 12.5 });
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  const live = await state(page, `({demoPerLF:LABOR.demoPerLF,slopePerLF:LABOR.slopePerLF,hardDigPct:LABOR.hardDigPct,urbanPct:MARKUP.urbanPct})`);
  expect(live).toEqual(stored);
  await openEditor(page);
  await expect(page.locator('#ce-urban-pct')).toHaveValue('12.5');
});

test('SA4 an old saved rate card without the fields falls back to the seed rates', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `localStorage.setItem(COSTDB_KEY,JSON.stringify({labor:{crewHourlyRate:60,perLF:{chainlink:7}},markup:{materialPct:35,laborPct:55}}))`);
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  const live = await state(page, `({demoPerLF:LABOR.demoPerLF,slopePerLF:LABOR.slopePerLF,hardDigPct:LABOR.hardDigPct,urbanPct:MARKUP.urbanPct,crew:LABOR.crewHourlyRate})`);
  expect(live).toEqual({ ...SEEDS, crew: 60 });
  await seedRun(page);
  const d = await upchargeDeltas(page);
  expect(d.demoC).toBe(Math.round(d.ft * 300));
  expect(d.urbanC).toBe(Math.round(d.baseSubC * 15 / 100));
});

test('SA5 corrupt stored adder values fall back to seeds; valid ones apply; no NaN reaches pricing', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `localStorage.setItem(COSTDB_KEY,JSON.stringify({labor:{demoPerLF:'abc',slopePerLF:-2,hardDigPct:null},markup:{urbanPct:20}}))`);
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  await seedRun(page);
  const d = await upchargeDeltas(page);
  expect(d.allFinite).toBe(true);
  expect(d.demoC).toBe(Math.round(d.ft * 300));
  expect(d.slopeC).toBe(Math.round(d.ft * 50));
  expect(d.hardC).toBe(Math.round(d.baseLaborC * 30 / 100));
  // The one valid stored value still applies.
  expect(d.urbanC).toBe(Math.round(d.baseSubC * 20 / 100));
});

for (const bad of [
  { label: 'negative', id: '#ce-demo-rate', value: '-1' },
  { label: 'negative percent', id: '#ce-urban-pct', value: '-5' },
  { label: 'non-numeric', id: '#ce-harddig-pct', value: 'abc' },
  { label: 'blank', id: '#ce-slope-rate', value: '' },
]) {
  test(`SA6 ${bad.label} adder input is rejected and nothing is saved`, async ({ page }) => {
    await cleanOpen(page);
    await openEditor(page);
    // Edit a valid field too: a rejected save must not partially apply it.
    await page.locator('#ce-slope-rate').fill('2');
    await page.locator(bad.id).evaluate((el, v) => { el.value = v; }, bad.value);
    await page.locator('#ce-save').click();
    await expect(page.locator('#app-toast')).toContainText(/upcharge/i);
    await expect(page.locator('#ce-save')).toBeVisible();
    const after = await state(page, `({demoPerLF:LABOR.demoPerLF,slopePerLF:LABOR.slopePerLF,hardDigPct:LABOR.hardDigPct,urbanPct:MARKUP.urbanPct,saved:localStorage.getItem(COSTDB_KEY)})`);
    expect(after).toEqual({ ...SEEDS, saved: null });
  });
}

test('SA7 JSON price import carries the adder rates into the rate card', async ({ page }) => {
  await cleanOpen(page);
  await openEditor(page);
  const payload = JSON.stringify({ app: 'FenceboundCAD', kind: 'prices', labor: { demoPerLF: 6, slopePerLF: 1, hardDigPct: 35 }, markup: { urbanPct: 18 } });
  await page.locator('#ce-import-file').setInputFiles({ name: 'p.fbprices.json', mimeType: 'application/json', buffer: Buffer.from(payload) });
  await expect(page.locator('#ce-urban-pct')).toHaveValue('18');
  const stored = await state(page, `(()=>{const o=JSON.parse(localStorage.getItem(COSTDB_KEY));return{demoPerLF:o.labor.demoPerLF,slopePerLF:o.labor.slopePerLF,hardDigPct:o.labor.hardDigPct,urbanPct:o.markup.urbanPct};})()`);
  expect(stored).toEqual({ demoPerLF: 6, slopePerLF: 1, hardDigPct: 35, urbanPct: 18 });
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#ce-export').click()]);
  const fs = require('fs');
  const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(exported.labor.demoPerLF).toBe(6);
  expect(exported.markup.urbanPct).toBe(18);
});
