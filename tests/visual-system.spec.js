const { test, expect } = require('@playwright/test');

// REDO 2 (owner authorization 2026-10-30): light field theme by default, a dark theme
// toggle, readable type sizes, labeled header actions and a clear action hierarchy.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

const state = (page, src) => page.evaluate(s => window.eval(s), src);

function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => {
    v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const hexRgb = h => `rgb(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)})`;
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test.beforeEach(async ({ page }) => { await cleanOpen(page); });

test('light field theme is the default and the toggle persists dark', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(luminance(bg)).toBeGreaterThan(0.8);

  await page.locator('#btn-theme').click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
});

test('body text is readable: 11 px minimum and 4.5:1 contrast for secondary text', async ({ page }) => {
  const small = await page.evaluate(() => [...document.querySelectorAll('#header *, #toolbar *, #panel *')]
    .filter(el => el.offsetParent && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
    .filter(el => parseFloat(getComputedStyle(el).fontSize) < 11)
    .map(el => `${el.id || el.className || el.tagName}:${getComputedStyle(el).fontSize}`));
  expect(small).toEqual([]);
  for (const theme of ['light', 'dark']) {
    const c = await page.evaluate(t => {
      document.documentElement.dataset.theme = t;
      const s = getComputedStyle(document.documentElement);
      const probe = document.createElement('div'); document.body.appendChild(probe);
      const rgb = v => { probe.style.color = s.getPropertyValue(v); return getComputedStyle(probe).color; };
      const out = { bg: rgb('--bg'), surface: rgb('--surface'), t2: rgb('--text2'), t3: rgb('--text3') };
      probe.remove(); return out;
    }, theme);
    for (const fg of [c.t2, c.t3]) for (const bg of [c.bg, c.surface])
      expect(contrast(fg, bg), `${theme} ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  }
});

test('header actions are labeled and ordered by importance', async ({ page }) => {
  for (const id of ['btn-fit', 'btn-undo', 'btn-redo', 'btn-jobinfo', 'btn-jobs', 'btn-theme'])
    expect((await page.locator(`#${id}`).innerText()).trim(), id).not.toBe('');
  await expect(page.locator('#btn-pdf')).toHaveClass(/accent/);
  await expect(page.locator('#btn-pdf')).toContainText('Plan PDF');
  await expect(page.locator('#btn-png')).not.toHaveClass(/accent/);
  const neighbors = await page.evaluate(() => {
    const c = document.getElementById('btn-clear');
    return [c.previousElementSibling?.id, c.nextElementSibling?.id];
  });
  expect(neighbors).not.toContain('btn-pdf');
  expect(neighbors).not.toContain('btn-png');
});

test('canvas linework stays visible on the light theme', async ({ page }) => {
  const pal = await state(page, '({sel:canvasPalette().sel,inks:Object.values(FENCE_TYPES).map(t=>ink(t.color))})');
  const white = 'rgb(255,255,255)';
  expect(contrast(hexRgb(pal.sel), white)).toBeGreaterThanOrEqual(3);
  for (const c of pal.inks) expect(contrast(hexRgb(c), white), c).toBeGreaterThanOrEqual(3);
});
