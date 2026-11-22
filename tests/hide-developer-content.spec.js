// Ship item 5: a contractor never sees developer tools.
// The DEV INDEX button and overlay stay hidden in the normal app, cannot be
// switched on by a stray keyboard shortcut, and remain reachable for the owner
// through the ?dev=1 URL flag (?dev=0 turns it back off).
const { test, expect } = require('@playwright/test');

async function open(page, query = '') {
  page.on('dialog', d => d.dismiss());
  await page.goto('/index.html' + query);
  await page.waitForFunction(() => typeof fbApplyDevVisibility === 'function');
}

test('normal app does not show the DEV INDEX button or overlay', async ({ page }) => {
  await open(page);
  await expect(page.locator('#fb-dev-btn')).toBeHidden();
  await expect(page.locator('#fb-dev-index')).toBeHidden();
  await expect(page.getByText('DEV INDEX', { exact: true })).toBeHidden();
});

test('Ctrl+Shift+D does not reveal developer tools, now or after reload', async ({ page }) => {
  await open(page);
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('Control+Shift+D');
  await expect(page.locator('#fb-dev-btn')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('fencebound_dev'))).toBeNull();
  await page.reload();
  await page.waitForFunction(() => typeof fbApplyDevVisibility === 'function');
  await expect(page.locator('#fb-dev-btn')).toBeHidden();
});

test('owner can still reach the DEV INDEX with ?dev=1 and turn it off with ?dev=0', async ({ page }) => {
  await open(page, '?dev=1');
  const btn = page.locator('#fb-dev-btn');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.locator('#fb-dev-index')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#fb-dev-index')).toBeHidden();
  await page.goto('/index.html?dev=0');
  await page.waitForFunction(() => typeof fbApplyDevVisibility === 'function');
  await expect(btn).toBeHidden();
  await page.goto('/index.html');
  await page.waitForFunction(() => typeof fbApplyDevVisibility === 'function');
  await expect(btn).toBeHidden();
});
