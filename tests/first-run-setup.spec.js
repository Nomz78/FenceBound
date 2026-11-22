const { test, expect } = require('@playwright/test');

// Ship item 2 (owner ship-mode directive, 2026-11-22): a first-time contractor is
// walked through their company profile, then their own prices, and the next
// estimate PDF carries no NOT FULLY VERIFIED stamp.

async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test('S2 a new user sees the two setup steps on first open', async ({ page }) => {
  await boot(page);
  const card = page.locator('#setup-steps');
  await expect(card).toBeVisible();
  await expect(page.locator('#setup-company')).toBeVisible();
  await expect(page.locator('#setup-prices')).toBeVisible();
});

test('S2 company profile then own prices leads to an unstamped estimate PDF', async ({ page }) => {
  await boot(page);
  await page.click('#setup-company');
  await page.fill('#co-name', 'Test Fence Co');
  await page.fill('#co-phone', '555-0100');
  await page.click('#co-save');
  // Saving the profile goes straight on to step 2: the price list.
  await expect(page.locator('#cost-editor')).toBeVisible();
  await expect(page.locator('#setup-company-done')).toBeVisible();
  await page.click('#ce-save');
  await expect(page.locator('#setup-steps')).toBeHidden();

  await page.click('#btn-jobinfo');
  await page.fill('#qq-sides', '60, 80, 60');
  await page.fill('#qq-height', '72');
  await page.click('#qq-build');
  await page.fill('#field-customer', 'Pat Customer');
  await page.fill('#field-address', '1 Main St');
  const strings = await page.evaluate(() => window.eval(`(()=>{
    S.projectName='Smith backyard';
    const seen=[],Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){const doc=new Real(...args),t=doc.text;
      doc.text=function(x,...a){seen.push(...[].concat(x).map(String));return t.apply(this,[x,...a]);};
      doc.save=()=>{};return doc;};
    try{exportEstimatePDF();}finally{window.jspdf.jsPDF=Real;}
    return seen;
  })()`));
  expect(strings).toContain('TEST FENCE CO');
  expect(strings).not.toContain('NOT FULLY VERIFIED');
});
