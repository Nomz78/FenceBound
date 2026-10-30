const { test, expect } = require('@playwright/test');

// REDO 3 (owner authorization 2026-10-30): phone and tablet layout. Below 768 px the panel is a
// bottom sheet, the header is compact with an overflow menu, and the toolbar fits the screen.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

const state = (page, src) => page.evaluate(s => window.eval(s), src);
const box = (page, sel) => page.locator(sel).boundingBox();
const HEADER_ACTIONS = ['btn-fit', 'btn-reset-zoom', 'btn-clear', 'btn-undo', 'btn-redo',
  'btn-jobinfo', 'btn-jobs', 'btn-theme', 'btn-png', 'btn-pdf'];

for (const vp of [{ width: 390, height: 844 }, { width: 768, height: 1024 }]) {
  test.describe(`${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp, hasTouch: true });
    test.beforeEach(async ({ page }) => { await cleanOpen(page); });

    test('canvas gets at least 90% width and 50% height with the sheet collapsed', async ({ page }) => {
      await expect(page.locator('#panel')).toHaveClass(/sheet-collapsed/);
      const c = await box(page, '#canvas');
      expect(c.width).toBeGreaterThanOrEqual(vp.width * 0.9);
      expect(c.height).toBeGreaterThanOrEqual(vp.height * 0.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
    });

    test('bottom sheet opens to half and full and collapses again', async ({ page }) => {
      const grip = page.locator('#sheet-grip');
      await expect(grip).toBeVisible();
      await grip.click();
      await expect(page.locator('#panel')).toHaveClass(/sheet-half/);
      // The sheet animates its height; wait for it to settle before measuring.
      await expect.poll(async () => (await box(page, '#panel')).height).toBeGreaterThan(vp.height * 0.35);
      let p = await box(page, '#panel');
      expect(p.width).toBeGreaterThanOrEqual(vp.width - 1);
      expect(p.y + p.height).toBeLessThanOrEqual(vp.height + 1);
      await grip.click();
      await expect(page.locator('#panel')).toHaveClass(/sheet-full/);
      await expect.poll(async () => (await box(page, '#panel')).height).toBeGreaterThan(vp.height * 0.6);
      await grip.click();
      await expect(page.locator('#panel')).toHaveClass(/sheet-collapsed/);
      // A panel tab opens a collapsed sheet to its content.
      await page.locator('.ptab[data-tab="specs"]').click();
      await expect(page.locator('#panel')).toHaveClass(/sheet-half/);
      await expect(page.locator('#tab-specs')).toBeVisible();
    });

    test('every header action is reachable and the header fits', async ({ page }) => {
      for (const id of HEADER_ACTIONS) {
        const b = page.locator('#' + id);
        if (await b.isVisible()) {
          const r = await b.boundingBox();
          expect(r.x + r.width, id).toBeLessThanOrEqual(vp.width);
          expect(await b.getAttribute('aria-label'), id).toBeTruthy();
        } else {
          await page.locator('#btn-more').click();
          const item = page.locator(`#more-menu [data-proxy="${id}"]`);
          await expect(item, id).toBeVisible();
          const r = await item.boundingBox();
          expect(r.x + r.width, id).toBeLessThanOrEqual(vp.width);
          await page.keyboard.press('Escape');
          await expect(page.locator('#more-menu')).toBeHidden();
        }
      }
      // Menu items act on the real buttons.
      await page.locator('#btn-more').click();
      await page.locator('#more-menu [data-proxy="btn-jobs"]').click();
      const d = await box(page, '#jobs-drawer');
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x + d.width).toBeLessThanOrEqual(vp.width);
    });

    test('every drawing tool fits on screen', async ({ page }) => {
      const tools = page.locator('#toolbar .tbtn[data-tool]');
      expect(await tools.count()).toBe(8);
      for (const t of await tools.all()) {
        const r = await t.boundingBox();
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width).toBeLessThanOrEqual(vp.width);
        expect(r.y + r.height).toBeLessThanOrEqual(vp.height);
      }
    });

    test('drawing a fence run by touch still works', async ({ page }) => {
      const c = await box(page, '#canvas');
      const cdp = await page.context().newCDPSession(page);
      const at = (x, y) => [{ x: c.x + x, y: c.y + y }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(60, 80) });
      for (let i = 1; i <= 8; i++)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(60 + i * 30, 80) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      expect(await state(page, `S.elements.filter(e=>e.type==='fence').length`)).toBe(1);
    });
  });
}

test('desktop layout keeps the side panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await cleanOpen(page);
  await expect(page.locator('#sheet-grip')).toBeHidden();
  await expect(page.locator('#btn-more')).toBeHidden();
  const p = await box(page, '#panel');
  expect(p.width).toBe(288);
  await expect(page.locator('#btn-jobs .btn-lbl')).toBeVisible();
});
