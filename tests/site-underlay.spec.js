const { test, expect } = require('@playwright/test');

// REDO 6 (owner choice 2026-10-30): site-image underlay. An uploaded aerial photo or plat sits
// under the drawing; two clicks on a known distance set its scale. No tile provider, no keys.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

const state = (page, src) => page.evaluate(s => window.eval(s), src);

// A solid red 400x200 PNG, made in the page so the test needs no fixture file.
async function redPng(page) {
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 400; c.height = 200;
    const x = c.getContext('2d'); x.fillStyle = '#ff0000'; x.fillRect(0, 0, 400, 200);
    return c.toDataURL('image/png').split(',')[1];
  });
  return { name: 'aerial.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

async function addUnderlay(page) {
  await page.locator('#btn-jobinfo').click();
  await page.locator('#underlay-file').setInputFiles(await redPng(page));
  await expect.poll(() => state(page, '!!(S.underlay&&S.underlay.src)')).toBe(true);
}

// Screen point (canvas-relative) of a world point.
async function screenOf(page, wx, wy) {
  const c = await page.locator('#canvas').boundingBox();
  const v = await state(page, '({px:S.pan.x,py:S.pan.y,z:S.zoom})');
  return { x: c.x + v.px + wx * v.z, y: c.y + v.py + wy * v.z };
}

test.describe('site image underlay', () => {
  test.beforeEach(async ({ page }) => { await cleanOpen(page); });

  test('an uploaded image is drawn under the grid, centred in view', async ({ page }) => {
    await addUnderlay(page);
    const u = await state(page, 'S.underlay');
    expect(u.src).toMatch(/^data:image\//);
    expect(u.scale).toBeGreaterThan(0);
    // Sample the canvas at the image centre: red dominates.
    const px = await page.evaluate(() => {
      const u = S.underlay, c = document.getElementById('canvas'), dpr = window.devicePixelRatio || 1;
      const img = new Image(); img.src = u.src;
      const wx = u.x + img.naturalWidth * u.scale / 2, wy = u.y + img.naturalHeight * u.scale / 2;
      const sx = (S.pan.x + wx * S.zoom) * dpr, sy = (S.pan.y + wy * S.zoom) * dpr;
      return Array.from(c.getContext('2d').getImageData(Math.round(sx), Math.round(sy), 1, 1).data);
    });
    expect(px[0]).toBeGreaterThan(px[1] + 60);
    expect(px[0]).toBeGreaterThan(px[2] + 60);
  });

  test('two-point scale sets feet from a known distance and keeps the first point fixed', async ({ page }) => {
    await addUnderlay(page);
    await page.locator('#btn-underlay-scale').click();
    await expect(page.locator('#hint')).toContainText(/first point/i);
    const before = await state(page, '({...S.underlay})');
    const elementsBefore = await state(page, 'S.elements.length');
    // Pick two world points 200 world px apart (= 5 ft at 40 px/ft); say they are 50 ft apart.
    const a = { x: before.x + 20, y: before.y + 20 }, b = { x: a.x + 200, y: a.y };
    page.once('dialog', d => d.accept('50'));
    const sa = await screenOf(page, a.x, a.y), sb = await screenOf(page, b.x, b.y);
    await page.mouse.click(sa.x, sa.y);
    await expect(page.locator('#hint')).toContainText(/second point/i);
    await page.mouse.click(sb.x, sb.y);
    await expect.poll(() => state(page, 'S.calibrating')).toBe(null);
    const after = await state(page, '({...S.underlay})');
    const z = await state(page, 'S.zoom');
    const k = after.scale / before.scale;
    expect(k).toBeGreaterThan(9.5); expect(k).toBeLessThan(10.5); // 50 ft / 5 ft (clicks are within a pixel)
    // The image pixel under the first click is still under it.
    const imgPx = (u, p) => ({ x: (p.x - u.x) / u.scale, y: (p.y - u.y) / u.scale });
    const ia = imgPx(before, a), ia2 = imgPx(after, a);
    expect(Math.abs(ia.x - ia2.x)).toBeLessThan(1 / z / before.scale + 0.5);
    expect(Math.abs(ia.y - ia2.y)).toBeLessThan(1 / z / before.scale + 0.5);
    // Calibration clicks draw nothing.
    expect(await state(page, 'S.elements.length')).toBe(elementsBefore);
  });

  test('a cancelled distance leaves the scale unchanged', async ({ page }) => {
    await addUnderlay(page);
    const before = await state(page, 'S.underlay.scale');
    await page.locator('#btn-underlay-scale').click();
    page.once('dialog', d => d.dismiss());
    const c = await page.locator('#canvas').boundingBox();
    await page.mouse.click(c.x + c.width / 2 - 50, c.y + c.height / 2);
    await page.mouse.click(c.x + c.width / 2 + 50, c.y + c.height / 2);
    await expect.poll(() => state(page, 'S.calibrating')).toBe(null);
    expect(await state(page, 'S.underlay.scale')).toBe(before);
  });

  test('opacity, autosave restore, job file, and remove', async ({ page }) => {
    await addUnderlay(page);
    await page.locator('#underlay-opacity').fill('0.3');
    expect(await state(page, 'S.underlay.opacity')).toBeCloseTo(0.3, 5);
    expect(await state(page, 'snapshotState().underlay.opacity')).toBeCloseTo(0.3, 5);
    const saved = await state(page, '({...S.underlay})');
    await state(page, 'saveSession()');
    await page.reload();
    await expect(page.locator('#canvas')).toBeVisible();
    expect(await state(page, 'S.underlay')).toEqual(saved);
    await page.locator('#btn-jobinfo').click();
    await page.locator('#btn-underlay-remove').click();
    expect(await state(page, 'S.underlay')).toBe(null);
    expect(await state(page, 'snapshotState().underlay')).toBe(null);
  });

  test('a malformed underlay in a job file is dropped, not drawn', async ({ page }) => {
    const ok = await state(page, `(()=>{
      const st=snapshotState();
      st.underlay={src:'javascript:alert(1)',x:0,y:0,scale:1};applyState(st);const a=S.underlay;
      st.underlay={src:'data:image/png;base64,AAAA',x:0,y:0,scale:-2};applyState(st);const b=S.underlay;
      return a===null&&b===null;})()`);
    expect(ok).toBe(true);
  });
});
