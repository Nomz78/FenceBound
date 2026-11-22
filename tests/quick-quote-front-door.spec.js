const { test, expect } = require('@playwright/test');

// Ship item 3 (owner ship-mode directive, 2026-11-22): after setup, a new user
// gets from opening the app to an estimate PDF without touching the canvas or
// the panel tabs. The "Get set up" card stays visible on that path.

async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function captureNextPdf(page) {
  await page.evaluate(() => window.eval(`(()=>{
    window.__pdfText=null;const Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){const doc=new Real(...args),t=doc.text;window.__pdfText=[];
      doc.text=function(x,...a){window.__pdfText.push(...[].concat(x).map(String));return t.apply(this,[x,...a]);};
      doc.save=()=>{window.jspdf.jsPDF=Real;};return doc;};
  })()`));
}

test('S3 a new user opens on the quote form, next to the setup card', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#front-door')).toBeVisible();
  await page.click('#fd-start');
  await expect(page.locator('#fd-sides')).toBeVisible();
  await expect(page.locator('#fd-customer')).toBeVisible();
  await expect(page.locator('#setup-steps')).toBeVisible();
});

test('S3 setup, then typed job and customer, then estimate PDF with no canvas or tabs', async ({ page }) => {
  await boot(page);
  await page.click('#setup-company');
  await page.fill('#co-name', 'Test Fence Co');
  await page.fill('#co-phone', '555-0100');
  await page.click('#co-save');
  await page.click('#ce-save');

  await page.click('#fd-start');
  await page.fill('#fd-customer', 'Pat Customer');
  await page.fill('#fd-address', '1 Main St');
  await page.fill('#fd-height', '72');
  await page.fill('#fd-sides', '60, 80, 60');
  await page.fill('#fd-gates', '2, walk, 4');
  await page.click('#fd-build');
  await expect(page.locator('#fd-pdf')).toBeVisible();

  await captureNextPdf(page);
  await page.click('#fd-pdf');
  await expect.poll(() => page.evaluate(() => window.__pdfText && window.__pdfText.length)).toBeGreaterThan(0);
  const strings = await page.evaluate(() => window.__pdfText);
  const all = strings.join(' ');
  expect(strings).toContain('TEST FENCE CO');
  expect(all).toContain('Pat Customer');
  expect(all).toContain('1 Main St');
  expect(strings).not.toContain('NOT FULLY VERIFIED');
});

test('S3 bad footage shows an error and builds nothing', async ({ page }) => {
  await boot(page);
  await page.click('#fd-start');
  await page.fill('#fd-sides', '');
  await page.click('#fd-build');
  await expect(page.locator('#fd-errors')).not.toBeEmpty();
  expect(await page.evaluate(() => window.eval('S.elements.length'))).toBe(0);
  await expect(page.locator('#fd-pdf')).toHaveCount(0);
});

test('S3 "Draw it instead" hides the form and leaves the canvas', async ({ page }) => {
  await boot(page);
  await page.click('#fd-start');
  await page.click('#fd-draw');
  await expect(page.locator('#front-door')).toBeHidden();
});
