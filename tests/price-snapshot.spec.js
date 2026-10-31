// REDO 6b — O-5 price-snapshot split. A project carries a frozen quoted-price
// snapshot (frozen at its first estimate PDF export); the company rate card is
// a separate store; loading a project never writes the company rate card.
const { test, expect } = require('@playwright/test');

const RATE_KEY = 'chain link fabric';
const K = JSON.stringify(RATE_KEY);

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function setCard(page, cost) {
  await state(page, `(()=>{const c=readSavedCostDB();const d=c.status==='loaded'?c.data:{costs:{},labor:DEFAULT_LABOR,markup:DEFAULT_MARKUP};
    d.costs[${K}]={cost:${cost},unit:'lf'};localStorage.setItem(COSTDB_KEY,JSON.stringify(d));})()`);
}

async function seedRun(page) {
  await state(page, `(()=>{
    S.projectName='Snapshot Job';S.jobCustomer='Snapshot Customer';S.jobAddress='1 Snapshot Way';
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},fenceType:'chainlink',runId:'run_snapshot',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    draw();updatePanel();
  })()`);
}

async function exportEstimate(page) {
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const download = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportEstimatePDF()');
  await download;
  // The seeded job is incomplete, so export also opens the validation report.
  await state(page, `(()=>{const ov=document.getElementById('validation-overlay');if(ov)ov.style.display='none';})()`);
}

const live = page => state(page, `COST_DB[${K}].cost`);
const stored = page => state(page, `JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${K}].cost`);
const total = page => state(page, 'computePricing().clientTotal');

test('first estimate export freezes the job prices; the cost editor then edits only the rate card', async ({ page }) => {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  expect(await state(page, 'S.quote')).toBeNull();
  await exportEstimate(page);
  const quoted = await total(page);
  expect(await state(page, `({cost:S.quote.pricing.costs[${K}].cost,frozen:typeof S.quote.frozenAt,total:S.quote.total})`))
    .toEqual({ cost: 2.22, frozen: 'string', total: quoted });
  expect(await state(page, `document.getElementById('quote-price-note').style.display`)).toBe('flex');

  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  await state(page, 'openCostEditor()');
  await page.locator(`[data-cost="${RATE_KEY}"]`).fill('3.33');
  await page.locator('#ce-mat-markup').fill('55');
  await page.locator('#ce-save').click();
  await expect(page.locator('#app-toast')).toContainText('keeps its quoted prices');
  expect(dialogs).toEqual([]);
  expect(await stored(page)).toBe(3.33);
  expect(await state(page, 'JSON.parse(localStorage.getItem(COSTDB_KEY)).markup.materialPct')).toBe(55);
  expect(await live(page)).toBe(2.22);
  expect(await total(page)).toBe(quoted);
});

test('loading a quoted or legacy job never writes the rate card; a draft prices from the card', async ({ page }) => {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  const card = await state(page, 'localStorage.getItem(COSTDB_KEY)');
  const job = await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));st.costs[${K}].cost=1.11;return st;})()`);

  const legacy = { ...job, savedAt: '1/2/2026, 9:00:00 AM' };
  delete legacy.quote;
  await state(page, `applyState(${JSON.stringify(legacy)})`);
  expect(await live(page)).toBe(1.11);
  expect(await state(page, 'S.quote.frozenAt')).toBe('1/2/2026, 9:00:00 AM');
  expect(await state(page, 'saveCostDB()')).toBe(false);

  await state(page, `applyState(${JSON.stringify({ ...job, quote: { frozenAt: '2026-10-01T00:00:00.000Z', total: 5 } })})`);
  expect(await live(page)).toBe(1.11);
  expect(await state(page, 'S.quote.total')).toBe(5);
  // Opening and cancelling the editor shows the card, then puts the quote back.
  await state(page, 'openCostEditor()');
  await expect(page.locator(`[data-cost="${RATE_KEY}"]`)).toHaveValue('2.22');
  await page.locator('#ce-cancel').click();
  expect(await live(page)).toBe(1.11);

  await state(page, `applyState(${JSON.stringify({ ...job, quote: null })})`);
  expect(await live(page)).toBe(2.22);
  expect(await state(page, 'S.quote')).toBeNull();
  expect(await state(page, 'localStorage.getItem(COSTDB_KEY)')).toBe(card);
});

test('a draft follows rate-card changes across reload; a quote survives them', async ({ page }) => {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  await state(page, 'saveSession()');
  await setCard(page, 3.33);
  await page.reload();
  expect(await live(page)).toBe(3.33);

  await exportEstimate(page);
  const quoted = await total(page);
  await state(page, 'saveSession()');
  await setCard(page, 4.44);
  await page.reload();
  expect(await live(page)).toBe(3.33);
  expect(await total(page)).toBe(quoted);
  expect(await state(page, `updatePricing(),document.getElementById('quote-price-note').style.display`)).toBe('flex');
});

test('Re-price replaces the quote with the company rate card; Clear drops it', async ({ page }) => {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  await exportEstimate(page);
  await setCard(page, 3.33);

  let message = '';
  page.once('dialog', d => { message = d.message(); d.accept(); });
  await state(page, `document.getElementById('btn-reprice').click()`);
  expect(message).toContain('→');
  expect(await state(page, 'S.quote')).toBeNull();
  expect(await live(page)).toBe(3.33);
  expect(await state(page, `document.getElementById('quote-price-note').style.display`)).toBe('none');

  await exportEstimate(page);
  await setCard(page, 4.44);
  page.once('dialog', d => d.accept());
  await state(page, `document.getElementById('btn-clear').click()`);
  expect(await state(page, 'S.quote')).toBeNull();
  expect(await live(page)).toBe(4.44);
});

test('backup restore with a quote open writes the rate card and keeps the quote', async ({ page }) => {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  await exportEstimate(page);
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  await state(page, `openRestoreDialog({format:1,pricing:{costs:{${K}:{cost:5.55,unit:'lf'}}}})`);
  await page.locator('#rs-apply').click();
  expect(dialogs).toEqual([]);
  expect(await stored(page)).toBe(5.55);
  expect(await live(page)).toBe(2.22);
  expect(await state(page, '_pricingFromLoadedProject')).toBe(true);
});
