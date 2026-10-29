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
