const { test, expect } = require('@playwright/test');

// REDO 1 (owner authorization 2026-10-30): click points to chain fence runs;
// double-click, Enter or Escape finishes. Drag-per-segment drawing still works.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// World feet -> screen pixels (GRID_FT = 40 px per foot).
async function screen(page, xFt, yFt) {
  const box = await page.locator('#canvas').boundingBox();
  const view = await state(page, '({pan:S.pan,zoom:S.zoom})');
  return {
    x: box.x + view.pan.x + xFt * 40 * view.zoom,
    y: box.y + view.pan.y + yFt * 40 * view.zoom,
  };
}

async function clickAt(page, xFt, yFt) {
  const p = await screen(page, xFt, yFt);
  await page.mouse.move(p.x, p.y, { steps: 4 });
  await page.mouse.click(p.x, p.y);
}

const runs = page => state(page, `S.elements.filter(e=>e.type==='fence').map(e=>({
  sx:e.start.x/40,sy:e.start.y/40,ex:e.end.x/40,ey:e.end.y/40}))`);

test.beforeEach(async ({ page }) => {
  await cleanOpen(page);
  await page.locator('[data-tool="fence"]').click();
});

test('clicking points chains connected fence runs; double-click finishes', async ({ page }) => {
  await clickAt(page, 2, 2);
  await clickAt(page, 12, 2);
  await clickAt(page, 12, 8);
  const p = await screen(page, 4, 8);
  await page.mouse.move(p.x, p.y, { steps: 4 });
  await page.mouse.dblclick(p.x, p.y);

  expect(await runs(page)).toEqual([
    { sx: 2, sy: 2, ex: 12, ey: 2 },
    { sx: 12, sy: 2, ex: 12, ey: 8 },
    { sx: 12, sy: 8, ex: 4, ey: 8 },
  ]);
  expect(await state(page, 'S.drawing')).toBeNull();

  // Chain is finished: another single click starts a new chain, not a run.
  await clickAt(page, 3, 12);
  expect((await runs(page)).length).toBe(3);
});

test('Escape and Enter finish a chain without adding a run', async ({ page }) => {
  await clickAt(page, 2, 2);
  await clickAt(page, 10, 2);
  await page.mouse.move(...Object.values(await screen(page, 10, 9)), { steps: 4 });
  await page.keyboard.press('Escape');
  expect(await runs(page)).toEqual([{ sx: 2, sy: 2, ex: 10, ey: 2 }]);
  expect(await state(page, 'S.drawing')).toBeNull();

  await clickAt(page, 2, 5);
  await clickAt(page, 6, 5);
  await page.keyboard.press('Enter');
  expect((await runs(page)).length).toBe(2);
  expect(await state(page, 'S.drawing')).toBeNull();
});

test('each chained segment is its own undo step', async ({ page }) => {
  await clickAt(page, 2, 2);
  await clickAt(page, 10, 2);
  await clickAt(page, 10, 6);
  await page.keyboard.press('Escape');
  expect((await runs(page)).length).toBe(2);
  await page.keyboard.press('Control+z');
  expect(await runs(page)).toEqual([{ sx: 2, sy: 2, ex: 10, ey: 2 }]);
});

test('switching tools cancels a chain in progress', async ({ page }) => {
  await clickAt(page, 2, 2);
  await page.locator('[data-tool="select"]').click();
  expect(await state(page, 'S.drawing')).toBeNull();
});

test('drag-per-segment drawing still works and the hint explains chaining', async ({ page }) => {
  const a = await screen(page, 2, 2), b = await screen(page, 9, 2);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 6 });
  await page.mouse.up();
  expect(await runs(page)).toEqual([{ sx: 2, sy: 2, ex: 9, ey: 2 }]);
  expect(await state(page, 'S.drawing')).toBeNull();
  await expect(page.locator('#hint')).toContainText('double-click');
});
