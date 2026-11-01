const { test, expect } = require('@playwright/test');
const state = (page, source) => page.evaluate(s => window.eval(s), source);
async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await state(page, `buildTypedLayout({fenceType:'woodprivacy',height:72,sides:[50,50,50],shape:'open',gates:[{side:1,gateType:'walk',width:4,offset:20}]})`);
  await page.click('[data-tab="pricing"]');
}
async function exportEstimate(page) {
  await page.waitForFunction(() => !!window.jspdf);
  await state(page, `(()=>{const Real=window.jspdf.jsPDF;window.jspdf.jsPDF=function(...args){const d=new Real(...args);d.save=()=>{};return d;};try{exportEstimatePDF();}finally{window.jspdf.jsPDF=Real;}})()`);
}
async function edit(page) {
  // Same 4-ft gate, different fabric sections: the existing Move completion
  // marks the layout drawn and rebuilds posts on its owning run.
  await state(page, `(()=>{const i=S.elements.findIndex(e=>e.type==='gate'),g=S.elements[i];S.moving={idx:i,type:'body'};S.moveOrigEl=structuredClone(g);g.start.y+=2*GRID_FT;g.end.y+=2*GRID_FT;handleUp({preventDefault(){},stopPropagation(){}});})()`);
}

test('typed export records quantities; drawing edit shows old/new prices and delta without changing rates', async ({ page }) => {
  await boot(page);
  await exportEstimate(page);
  const before = await state(page, `({total:S.quote.total,layout:S.quote.layout,quantities:S.quote.quantities,pricing:JSON.stringify(S.quote.pricing),card:localStorage.getItem(COSTDB_KEY)})`);
  expect(before.layout).toBe('typed');
  expect(before.quantities).toMatchObject({posts:23,rails:438,pickets:502,panels:0});
  await edit(page);
  const current = await state(page, 'computePricing().clientTotal');
  expect(current).not.toBe(before.total);
  const notice = page.locator('#quote-drawing-notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(`Drawing changed the price: $${before.total.toFixed(2)} → $${current.toFixed(2)}`);
  await expect(notice).toContainText('posts -1');
  await expect(notice).not.toContainText('rails');
  expect(await state(page, 'S.quote.total')).toBe(before.total);
  expect(await state(page, 'JSON.stringify(S.quote.pricing)')).toBe(before.pricing);
  expect(await state(page, 'localStorage.getItem(COSTDB_KEY)')).toBe(before.card);
  await exportEstimate(page);
  await expect(notice).toBeHidden();
  expect(await state(page, 'S.quote.layout')).toBe('drawn');
});

test('notice clears when prices match again and when geometry undo restores typed layout', async ({ page }) => {
  await boot(page); await exportEstimate(page); await edit(page);
  await expect(page.locator('#quote-drawing-notice')).toBeVisible();
  await state(page, `(()=>{const g=S.elements.find(e=>e.type==='gate');g.start.y-=2*GRID_FT;g.end.y-=2*GRID_FT;rebuildRunAutoPosts(fenceRunById(g.runId));updatePricing();})()`);
  await expect(page.locator('#quote-drawing-notice')).toBeHidden();
  await state(page, 'pushHistory()'); await edit(page);
  await expect(page.locator('#quote-drawing-notice')).toBeVisible();
  await state(page, 'doUndo()');
  await expect(page.locator('#quote-drawing-notice')).toBeHidden();
});

test('drawn exports and legacy quotes show no drawing-price notice', async ({ page }) => {
  await boot(page); await state(page, 'markLayoutDrawn()'); await exportEstimate(page); await edit(page);
  await expect(page.locator('#quote-drawing-notice')).toBeHidden();
  await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));delete st.quote.layout;delete st.quote.quantities;applyState(st);updatePricing();})()`);
  expect(await state(page, 'S.quote.layout')).toBeUndefined();
  await expect(page.locator('#quote-drawing-notice')).toBeHidden();
});

test('quote notice metadata survives snapshot/load; malformed fields are dropped without card writes', async ({ page }) => {
  await boot(page); await exportEstimate(page); await edit(page);
  const roundtrip = await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState())),card=localStorage.getItem(COSTDB_KEY);applyState(st);updatePricing();return{quote:S.quote,saved:st.quote,cardUnchanged:card===localStorage.getItem(COSTDB_KEY)};})()`);
  expect(roundtrip.quote.layout).toBe('typed');
  expect(roundtrip.quote.quantities).toEqual(roundtrip.saved.quantities);
  expect(roundtrip.cardUnchanged).toBe(true);
  await expect(page.locator('#quote-drawing-notice')).toBeVisible();
  const bad = await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));st.quote.layout='alien';st.quote.quantities={posts:-1,rails:'20',pickets:null,panels:Infinity,extra:10};applyState(st);updatePricing();return S.quote;})()`);
  expect(bad.layout).toBeUndefined();
  expect(bad.quantities).toBeUndefined();
  await expect(page.locator('#quote-drawing-notice')).toBeHidden();
});
