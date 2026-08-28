const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

test('CSV parsing and duplicate resolution remain deterministic', async ({ page }) => {
  await cleanOpen(page);
  const result = await state(page, `(()=>{
    const rows=csvParse('Material,Price,Unit\\n"Line Post 7 ft",$12.00,each\\n"Line Post 8 ft",$15.00,ea\\nBad,(3.20),ea',',');
    return csvBuildPreview(rows,{name:0,cost:1,unit:2},true,'high');
  })()`);
  expect(result.entries).toHaveLength(1);
  expect(result.entries[0]).toMatchObject({ key: 'line post', cost: 15, unit: 'ea' });
  expect(result.collisions).toBe(1);
  expect(result.rejected).toEqual([expect.objectContaining({ why: 'negative price' })]);
});

test('CSV import warns on borrowed pricing and rolls back a failed write', async ({ page }) => {
  await cleanOpen(page);
  const before = await state(page, `JSON.stringify(COST_DB)`);
  await state(page, `(()=>{_pricingFromLoadedProject=true;openCsvImporter([['Material','Price'],['Line Post 8\\'','99.00']]);return null;})()`);
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#cs-apply').click();
  expect(await state(page, `_pricingFromLoadedProject`)).toBe(true);
  expect(await state(page, `JSON.stringify(COST_DB)`)).toBe(before);

  await state(page, `(()=>{window.__originalSaveCostDB=saveCostDB;saveCostDB=()=>false;return null;})()`);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#cs-apply').click();
  await expect(page.locator('#app-toast')).toContainText('Import failed');
  expect(await state(page, `_pricingFromLoadedProject`)).toBe(true);
  expect(await state(page, `JSON.stringify(COST_DB)`)).toBe(before);
  await state(page, `(()=>{saveCostDB=window.__originalSaveCostDB;delete window.__originalSaveCostDB;return null;})()`);
});

test('backup exports the persisted rate card rather than borrowed live pricing', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    COMPANY={...DEFAULT_COMPANY,name:'Backup Test'};
    localStorage.setItem(COSTDB_KEY,JSON.stringify({costs:{'line post':{cost:12,unit:'ea'}},labor:DEFAULT_LABOR,markup:DEFAULT_MARKUP}));
    COST_DB['line post']={cost:999,unit:'ea'};_pricingFromLoadedProject=true;return null;
  })()`);
  const downloadPromise = page.waitForEvent('download');
  await state(page, `exportBackup()`);
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-backup-${Date.now()}.json`);
  await download.saveAs(filePath);
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  expect(payload.pricingIncluded).toBe(true);
  expect(payload.pricing.costs['line post'].cost).toBe(12);
});

test('pricing restore merges onto the persisted card, not borrowed project pricing', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    localStorage.setItem(COSTDB_KEY,JSON.stringify({costs:{'line post':{cost:12,unit:'ea'},'terminal post':{cost:25,unit:'ea'}},labor:DEFAULT_LABOR,markup:DEFAULT_MARKUP}));
    COST_DB['line post']={cost:999,unit:'ea'};COST_DB['terminal post']={cost:888,unit:'ea'};_pricingFromLoadedProject=true;
    openRestoreDialog({format:1,pricing:{costs:{'line post':44}}});return null;
  })()`);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#rs-apply').click();
  const restored = await state(page, `({live:COST_DB,stored:JSON.parse(localStorage.getItem(COSTDB_KEY)),provenance:_pricingFromLoadedProject})`);
  expect(restored.live['line post']).toEqual({ cost: 44, unit: 'ea' });
  expect(restored.live['terminal post']).toEqual({ cost: 25, unit: 'ea' });
  expect(restored.stored.costs['terminal post'].cost).toBe(25);
  expect(restored.provenance).toBe(false);
});

test('failed pricing restore rolls back values and provenance without success', async ({ page }) => {
  await cleanOpen(page);
  const before = await state(page, `(()=>{COST_DB['line post']={cost:777,unit:'ea'};_pricingFromLoadedProject=true;window.__originalSaveCostDB=saveCostDB;saveCostDB=()=>false;openRestoreDialog({format:1,pricing:{costs:{'line post':44}}});return JSON.stringify(COST_DB);})()`);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#rs-apply').click();
  await expect(page.locator('#app-toast')).toContainText('Prices could not be restored');
  expect(await state(page, `JSON.stringify(COST_DB)`)).toBe(before);
  expect(await state(page, `_pricingFromLoadedProject`)).toBe(true);
  await state(page, `(()=>{saveCostDB=window.__originalSaveCostDB;delete window.__originalSaveCostDB;return null;})()`);
});

test('pricing restore tolerates a persisted null rate card', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    localStorage.setItem(COSTDB_KEY,'null');
    COST_DB['line post']={cost:777,unit:'ea'};_pricingFromLoadedProject=true;
    openRestoreDialog({format:1,pricing:{costs:{'line post':44}}});return null;
  })()`);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#rs-apply').click();
  const restored = await state(page, `({live:COST_DB,stored:JSON.parse(localStorage.getItem(COSTDB_KEY)),provenance:_pricingFromLoadedProject})`);
  expect(restored.live['line post']).toEqual({ cost: 44, unit: 'ea' });
  expect(restored.stored.costs['line post']).toEqual({ cost: 44, unit: 'ea' });
  expect(restored.provenance).toBe(false);
});

test('boot reports a persisted null rate card as corrupt', async ({ page }) => {
  await cleanOpen(page);
  await page.evaluate(() => localStorage.setItem('fencebound_costdb_v1', 'null'));
  await page.reload();
  await expect(page.locator('#app-toast')).toHaveClass(/err/);
  await expect(page.locator('#app-toast')).toContainText('Saved rate card is corrupt');
  expect(await state(page, `readSavedCostDB().status`)).toBe('corrupt');
});

test('company branding is local-only validation state', async ({ page }) => {
  await cleanOpen(page);
  const result = await state(page, `validateProject({includePricing:false})`);
  expect(result.errors.map(item => item.code)).toContain('COMPANY_PROFILE');
  expect(await state(page, `'company' in snapshotState()`)).toBe(false);
  expect(await state(page, `projectExportWarning({errors:[{code:'COMPANY_PROFILE'}]}).unverified[0]`)).toBe('The contractor company profile is missing.');
});

test('company terms start empty and guidance is opt-in', async ({ page }) => {
  await cleanOpen(page);
  expect(await state(page, `COMPANY.terms`)).toBe('');
  await state(page, `openCompanyEditor()`);
  const terms = page.locator('#co-terms');
  expect(await terms.inputValue()).toBe('');
  expect(await terms.getAttribute('placeholder')).toContain('Warranty: 1-year workmanship warranty');
  await page.locator('#co-reset').click();
  expect(await terms.inputValue()).toContain('Warranty: 1-year workmanship warranty');
});

test('missing company profile warns but does not block estimate export', async ({ page }) => {
  await cleanOpen(page);
  await page.locator('[data-tab="pricing"]').click();
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#btn-gen-estimate').click();
  await expect(page.locator('#validation-overlay')).toContainText('COMPANY_PROFILE');
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-unverified-${Date.now()}.pdf`);
  await download.saveAs(filePath);
  const pdfStrings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  expect(pdfStrings).toContain('NOT FULLY VERIFIED');
  expect(pdfStrings).not.toContain('TERMS & CONDITIONS');
});

test('a single exceptionally long company term paginates in the estimate PDF', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    COMPANY={...DEFAULT_COMPANY,name:'Long Terms',terms:Array(240).fill('extended warranty condition').join(' ')};
    return null;
  })()`);
  await page.locator('[data-tab="pricing"]').click();
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#btn-gen-estimate').click();
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-long-terms-${Date.now()}.pdf`);
  await download.saveAs(filePath);
  const pdf = fs.readFileSync(filePath, 'latin1');
  expect((pdf.match(/\/Type \/Page\b/g) || []).length).toBeGreaterThan(1);
  const pdfStrings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  expect(pdfStrings).toContain('ACCEPTANCE');
});
