const { test, expect } = require('@playwright/test');

// Ship item 4 (owner ship-mode directive, 2026-11-22): a contractor never loses a
// job by clearing, opening another job, or a full browser store.

async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function drawJob(page) {
  await page.click('#btn-jobinfo');
  await page.fill('#qq-sides', '60, 80, 60');
  await page.fill('#qq-height', '72');
  await page.click('#qq-build');
  await page.click('#btn-jobinfo');
}

function elementCount(page) {
  return page.evaluate(() => window.eval('S.elements.length'));
}

test('S4 Clear on unsaved work says so, and Cancel keeps the drawing', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  const before = await elementCount(page);
  expect(before).toBeGreaterThan(0);
  let msg = '';
  page.once('dialog', d => { msg = d.message(); d.dismiss(); });
  await page.click('#btn-clear');
  expect(msg).toMatch(/not saved/i);
  expect(await elementCount(page)).toBe(before);
});

test('S4 Clear after Save does not warn about unsaved work', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  await page.click('#btn-jobs');
  await page.click('#do-save');
  let msg = '';
  page.once('dialog', d => { msg = d.message(); d.accept(); });
  await page.click('#btn-clear');
  expect(msg).not.toMatch(/not saved/i);
  expect(await elementCount(page)).toBe(0);
});

test('S4 opening a saved job over unsaved work asks first', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  await page.click('#btn-jobs');
  await page.click('#do-save');
  // New unsaved work on top of the saved job's drawing.
  await page.evaluate(() => window.eval(`S.jobId=null;S.projectName='Other job';`));
  let msg = '';
  page.once('dialog', d => { msg = d.message(); d.dismiss(); });
  await page.locator('[data-ji]').first().click();
  expect(msg).toMatch(/not saved/i);
  expect(await page.evaluate(() => window.eval('S.projectName'))).toBe('Other job');
});

test('S4 a failed autosave is shown, not silent', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); };
  });
  await drawJob(page);
  await expect(page.locator('#app-toast')).toContainText(/not saved/i, { timeout: 4000 });
});

test('S4 a failed Save is shown and points to a file copy', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); };
  });
  await page.click('#btn-jobs');
  await page.click('#do-save');
  await expect(page.locator('#app-toast')).toContainText(/Export \.json/);
});

test('S4 after a Save, a never-backed-up device is offered a backup file', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  await page.click('#btn-jobs');
  await page.click('#do-save');
  await expect(page.locator('#jobs-drawer')).toContainText(/never backed up/);
  await expect(page.locator('#do-backup')).toBeVisible();
});

test('S4 a job just opened from Saved Jobs does not count as unsaved', async ({ page }) => {
  await boot(page);
  await drawJob(page);
  await page.click('#btn-jobs');
  await page.click('#do-save');
  await page.locator('[data-ji]').first().click();
  expect(await page.evaluate(() => window.eval('hasUnsavedWork()'))).toBe(false);
});
