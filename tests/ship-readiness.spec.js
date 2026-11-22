const { test, expect } = require('@playwright/test');

// Ship item 1 (owner ship-mode directive, 2026-11-22): a first-time contractor's
// Quick Quote → estimate PDF path must work without outside websites and show the job.

async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test('S1 PDF export works when the cdnjs CDN cannot be reached', async ({ page }) => {
  await page.route('https://cdnjs.cloudflare.com/**', route => route.abort());
  await boot(page);
  await page.waitForFunction(() => !!(window.jspdf && window.jspdf.jsPDF), null, { timeout: 5000 });
});

test('S1 building a Quick Quote layout fits the whole job in view', async ({ page }) => {
  await boot(page);
  await page.click('#btn-jobinfo');
  await page.fill('#qq-sides', '60, 80, 60');
  await page.fill('#qq-height', '72');
  await page.click('#qq-build');
  await expect(page.locator('#qq-errors')).toHaveText('');
  const r = await page.evaluate(() => window.eval(`(()=>{
    const c=document.getElementById('canvas'),dpr=window.devicePixelRatio||1,w=c.width/dpr,h=c.height/dpr;
    const pts=S.elements.filter(e=>e.type==='fence').flatMap(e=>[e.start,e.end])
      .map(p=>({x:p.x*S.zoom+S.pan.x,y:p.y*S.zoom+S.pan.y}));
    return {n:pts.length,inside:pts.every(p=>p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h)};
  })()`));
  expect(r.n).toBe(6);
  expect(r.inside).toBe(true);
});
