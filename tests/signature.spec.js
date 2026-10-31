// REDO 6c — built-in signature pad. The customer signs a frozen quote (drawn
// signature, typed name, date); the signature lives in S.quote, is dropped
// with the quote, and is drawn into the estimate PDF.
const { test, expect } = require('@playwright/test');

const RATE_KEY = 'chain link fabric';
const K = JSON.stringify(RATE_KEY);

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function setCard(page, cost) {
  await state(page, `(()=>{const c=readSavedCostDB();const d=c.status==='loaded'?c.data:{costs:{},labor:DEFAULT_LABOR,markup:DEFAULT_MARKUP};
    d.costs[${K}]={cost:${cost},unit:'lf'};localStorage.setItem(COSTDB_KEY,JSON.stringify(d));})()`);
}

async function seedRun(page) {
  await state(page, `(()=>{
    S.projectName='Signature Job';S.jobCustomer='Signature Customer';S.jobAddress='1 Signature Way';
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},fenceType:'chainlink',runId:'run_signature',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    draw();updatePanel();
  })()`);
}

async function exportEstimate(page) {
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const download = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportEstimatePDF()');
  await download;
  await state(page, `(()=>{const ov=document.getElementById('validation-overlay');if(ov)ov.style.display='none';})()`);
}

// The quote note sits in the pricing panel, off screen at the test viewport
// (the 6b Re-price tests click it the same way).
const clickSign = page => state(page, `document.getElementById('btn-sign').click()`);

async function sign(page, name) {
  await clickSign(page);
  const box = await page.locator('#sig-canvas').boundingBox();
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 15, { steps: 5 });
  await page.mouse.move(box.x + box.width - 20, box.y + box.height - 15, { steps: 5 });
  await page.mouse.up();
  await page.locator('#sig-name').fill(name);
  await page.locator('#sig-accept').click();
}

async function quotedJob(page) {
  await cleanOpen(page);
  await setCard(page, 2.22);
  await page.reload();
  await seedRun(page);
  await exportEstimate(page);
}

const addSecondRun = page => state(page,
  `S.elements.push({...S.elements[0],start:{x:0,y:100},end:{x:400,y:100},runId:'run_more'});draw();updatePanel();updatePricing()`);

test('Sign shows only on a quote; a drawn, named signature is stored in the quote and Saved Jobs', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  expect(await state(page, `document.getElementById('quote-price-note').style.display`)).toBe('none');
  await state(page, 'S.showJobs=true;updateDrawers()');
  await page.locator('#do-save').click();
  await exportEstimate(page);

  await clickSign(page);
  await expect(page.locator('#sig-accept')).toBeDisabled();
  await page.locator('#sig-cancel').click();
  await sign(page, '  Pat Customer  ');
  const sig = await state(page, 'S.quote.signature');
  expect(sig.image).toMatch(/^data:image\/png;base64,/);
  expect(sig.name).toBe('Pat Customer');
  expect(typeof sig.signedAt).toBe('string');
  expect(sig.total).toBe(await state(page, 'S.quote.total'));
  await expect(page.locator('#quote-price-text')).toContainText('Signed by Pat Customer');

  expect(await state(page, 'snapshotState().quote.signature')).toEqual(sig);
  expect(await state(page, `JSON.parse(localStorage.getItem(STORAGE_KEY)).find(r=>r.id===S.jobId).quote.signature`)).toEqual(sig);
  await state(page, 'saveSession()');
  await page.reload();
  expect(await state(page, 'S.quote&&S.quote.signature&&S.quote.signature.name')).toBe('Pat Customer');
});

test('signing is refused when the job changed since the last estimate export', async ({ page }) => {
  await quotedJob(page);
  await addSecondRun(page);
  await clickSign(page);
  await expect(page.locator('#app-toast')).toContainText('export the estimate again');
  await expect(page.locator('#sig-canvas')).toBeHidden();
  expect(await state(page, 'S.quote.signature||null')).toBeNull();
});

test('Remove signature, Re-price and Clear drop the signature', async ({ page }) => {
  await quotedJob(page);
  await sign(page, 'Pat Customer');
  page.once('dialog', d => d.accept());
  await clickSign(page);
  expect(await state(page, 'S.quote.signature||null')).toBeNull();

  await sign(page, 'Pat Customer');
  page.once('dialog', d => d.accept());
  await state(page, `document.getElementById('btn-reprice').click()`);
  expect(await state(page, 'S.quote')).toBeNull();

  await exportEstimate(page);
  await sign(page, 'Pat Customer');
  page.once('dialog', d => d.accept());
  await state(page, `document.getElementById('btn-clear').click()`);
  expect(await state(page, 'S.quote')).toBeNull();
});

test('a signed export draws the signature; an export after the job changed drops it', async ({ page }) => {
  await quotedJob(page);
  await sign(page, 'Pat Customer');
  await state(page, `(()=>{const api=window.jspdf.jsPDF.API,orig=api.addImage;window.__sigDrawn=0;
    api.addImage=function(img,...rest){if(S.quote&&S.quote.signature&&img===S.quote.signature.image)window.__sigDrawn++;return orig.call(this,img,...rest);};})()`);
  await exportEstimate(page);
  expect(await state(page, 'window.__sigDrawn')).toBe(1);
  expect(await state(page, 'S.quote.signature.name')).toBe('Pat Customer');

  await addSecondRun(page);
  await exportEstimate(page);
  await expect(page.locator('#app-toast')).toContainText('signature removed');
  expect(await state(page, 'S.quote.signature||null')).toBeNull();
  expect(await state(page, 'window.__sigDrawn')).toBe(1);
});

test('loading a job keeps only a valid PNG signature within the size cap', async ({ page }) => {
  await quotedJob(page);
  await sign(page, 'Pat Customer');
  const good = await state(page, 'JSON.parse(JSON.stringify(snapshotState()))');
  const load = async mutate => state(page, `(()=>{const st=${JSON.stringify(good)};(${mutate})(st.quote.signature);
    applyState(st);return S.quote.signature?S.quote.signature.name:null;})()`);
  expect(await load('s=>{}')).toBe('Pat Customer');
  expect(await load(`s=>{s.image='data:image/svg+xml;base64,PHN2Zy8+'}`)).toBeNull();
  expect(await load(`s=>{s.image='data:image/png;base64,'+'A'.repeat(SIGNATURE_MAX_CHARS)}`)).toBeNull();
  expect(await load(`s=>{s.name='   '}`)).toBeNull();
  expect(await load(`s=>{s.total='12'}`)).toBeNull();
  expect(await state(page, 'S.quote&&typeof S.quote.total')).toBe('number');
});
