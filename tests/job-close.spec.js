// Field capture P3 (owner answer, duo r5): a "Close job" mark sets
// S.actuals.closedAt, so closed jobs accumulate before P4 ("≥3 closed jobs").
// Reopen clears it. It rides with the job snapshot like the rest of actuals.
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

async function seedLoggedJob(page) {
  await state(page, `(()=>{
    S.projectName='Close Job';
    S.elements=[{type:'fence',start:{x:0,y:100},end:{x:250,y:100},fenceType:'chainlink',runId:'run_a',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    S.actuals.days=[{date:'2026-10-20',crew:2,start:'07:00',end:'15:00',breakMin:30,tags:[],note:'',
      done:[{runId:'run_a',stage:'finished'}],gatesDone:[]}];
    saveSession();draw();updatePanel();
  })()`);
}

async function openField(page) {
  await page.locator('.ptab[data-tab="field"]').tap();
  await expect(page.locator('#tab-field')).toBeVisible();
}

const closedAt = page => state(page, 'S.actuals.closedAt');

test.describe('field capture P3: close job', () => {
  test.beforeEach(async ({ page }) => { await cleanOpen(page); });

  test('Close job sets closedAt, survives reload, and Reopen clears it', async ({ page }) => {
    await seedLoggedJob(page);
    expect(await closedAt(page)).toBeNull();
    await openField(page);
    await page.locator('#field-close').tap();
    const iso = await closedAt(page);
    expect(Number.isFinite(Date.parse(iso))).toBe(true);
    await expect(page.locator('#field-report')).toContainText('Closed');
    await page.reload();
    expect(await closedAt(page)).toBe(iso);
    await openField(page);
    await page.locator('#field-reopen').tap();
    expect(await closedAt(page)).toBeNull();
    await page.reload();
    expect(await closedAt(page)).toBeNull();
  });

  test('closedAt survives Save and loading the saved job; a bad one loads as open', async ({ page }) => {
    await seedLoggedJob(page);
    await openField(page);
    await page.locator('#field-close').tap();
    const iso = await closedAt(page);
    const snap = await state(page, 'JSON.stringify(snapshotState())');
    expect(JSON.parse(snap).actuals.closedAt).toBe(iso);
    for (const bad of [12345, 'not a date', '', { at: iso }, true]) {
      const s = JSON.parse(snap); s.actuals.closedAt = bad;
      await state(page, `applyState(${JSON.stringify(s)})`);
      expect(await closedAt(page)).toBeNull();
      expect(await state(page, 'S.actuals.days.length')).toBe(1);
    }
    await state(page, `applyState(${snap})`);
    expect(await closedAt(page)).toBe(iso);
  });

  test('closing a job never writes the company rate card', async ({ page }) => {
    await seedLoggedJob(page);
    const before = await page.evaluate(() => localStorage.getItem('fencebound_costdb_v1'));
    await openField(page);
    await page.locator('#field-close').tap();
    expect(await page.evaluate(() => localStorage.getItem('fencebound_costdb_v1'))).toBe(before);
  });
});
