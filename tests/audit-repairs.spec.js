const { test, expect } = require('@playwright/test');

// Regression suite for the 2026-10-29 v5.4.0 launch-audit FIX list (HANDOFF.md).

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

// F2: the labor-hours hint was static HTML carrying a template-literal
// fragment, so it rendered "$${''}55/hr" instead of "$55/hr".
test('F2 labor-hours hint renders the crew rate as $55/hr', async ({ page }) => {
  await cleanOpen(page);
  const hint = await page.locator('#crew-rate-lbl').evaluate(el => el.parentElement.textContent);
  expect(hint).toContain('$55/hr');
  expect(hint).not.toContain('${');
});

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function seedPlainRun(page) {
  await state(page, `(()=>{
    const run={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},fenceType:'chainlink',
      runId:'run_f3',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10};
    S.elements=[run];draw();updatePanel();updatePricing();
  })()`);
}

const badgeText = page => state(page, "document.getElementById('price-totals').textContent");

// F3: the totals badge read FINAL-READY whenever every BOM line had a cost,
// even with validation errors open and the shipped placeholder rate card.
test('F3 badge is not FINAL-READY with validation errors and placeholder pricing', async ({ page }) => {
  await cleanOpen(page);
  await seedPlainRun(page);
  expect(await state(page, 'computePricing().isFinalReady')).toBe(true);
  expect(await state(page, 'validateProject().ok')).toBe(false);
  expect(await state(page, 'usingSeedPrices()')).toBe(true);
  const badge = await badgeText(page);
  expect(badge).not.toContain('FINAL-READY');
  expect(badge).toContain('Pricing complete · not verified');
});

test('F3 badge is FINAL-READY once validation passes on a saved rate card', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{COMPANY={...DEFAULT_COMPANY,name:'FenceBound Test Company'};saveCompany();saveCostDB();
    S.projectName='F3 Job';S.jobCustomer='F3 Customer';S.jobAddress='1 Test Lane';})()`);
  await seedPlainRun(page);
  expect(await state(page, 'usingSeedPrices()')).toBe(false);
  expect(await state(page, 'validateProject().ok')).toBe(true);
  expect(await badgeText(page)).toContain('FINAL-READY');
});
