const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// Audit 2026-10-15 F7 / F16 (owner directive "start the fixes", step 1.6):
// each customer-facing section amount must come from that section's own
// material + labor + adders + markup, the sections must reconcile exactly to the
// client total, and the panel and the estimate PDF must show the same amounts.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// Three separate runs (no shared corners): 100 LF chain link, 50 LF ornamental
// with a walk gate, 40 LF wood privacy. Exposes window.__sectionJob(keep) which
// loads either the whole job or only the runs (and their gates) of the listed types.
async function defineJob(page) {
  await state(page, `window.__sectionJob=(keep)=>{
    const mk=(type,y,ft,id)=>{const specs=cloneRunSpecs(S.specs);
      if(FENCE_TYPES[type].defaultHeightIn)specs.heightIn=FENCE_TYPES[type].defaultHeightIn;
      return{type:'fence',start:{x:0,y:y*GRID_FT},end:{x:ft*GRID_FT,y:y*GRID_FT},fenceType:type,runId:id,
        specs,postSpacing:FENCE_TYPES[type].defaultSpacing,autoPostSpacing:FENCE_TYPES[type].defaultSpacing};};
    const runs=[mk('chainlink',0,100,'cds-cl'),mk('ornamental',30,50,'cds-orn'),mk('woodprivacy',60,40,'cds-wood')]
      .filter(r=>!keep||keep.includes(r.fenceType));
    const posts=runs.flatMap(r=>autoPostsForRun(r.start,r.end,r.postSpacing,r.fenceType,r.runId,r.specs));
    const orn=runs.find(r=>r.fenceType==='ornamental');
    const gates=orn?[attachGateToRun({type:'gate',start:{x:10*GRID_FT,y:30*GRID_FT},end:{x:14*GRID_FT,y:30*GRID_FT},
      gateType:'walk',hinge:'start',swingDir:1},orn)]:[];
    S.elements=[...runs,...posts,...gates];
    draw();updatePanel();
  };`);
}

const money = c => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const parseMoney = s => Math.round(Number(String(s).replace(/[^0-9.-]/g, '')) * 100);

// Each section priced on its own: the job reduced to that type's runs and gates.
// Urban is a job-level premium shown as its own line, so standalone uses subtotal.
async function standaloneSubtotals(page) {
  const out = {};
  for (const type of ['chainlink', 'ornamental', 'woodprivacy']) {
    out[type] = await state(page, `(()=>{__sectionJob(['${type}']);return computePricing().cents.clientSubtotal;})()`);
  }
  await state(page, `__sectionJob()`);
  return out;
}

async function panelRows(page) {
  await state(page, `S.showCostView=false;updatePricing()`);
  return page.locator('#price-breakdown .stat-row').evaluateAll(rows => rows.map(r => ({
    text: r.innerText, amount: (r.querySelector('.stat-val') || {}).innerText || ''
  })));
}

async function exportEstimateStrings(page, label) {
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportEstimatePDF()');
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-sections-${label}-${Date.now()}.pdf`);
  await download.saveAs(filePath);
  const strings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  fs.unlinkSync(filePath);
  return strings;
}

test('CDS1 each section amount is that section\'s own price and the sections sum to the total', async ({ page }) => {
  await cleanOpen(page);
  await defineJob(page);
  const own = await standaloneSubtotals(page);
  // Panel client view first (independent of the shared function): each section
  // row shows that section's own price, not a share of the total by length.
  const shown = await panelRows(page);
  for (const [type, label] of [['chainlink', 'Chain Link'], ['ornamental', 'Ornamental'], ['woodprivacy', 'Privacy']]) {
    const row = shown.find(r => r.text.startsWith(label));
    expect(Math.abs(parseMoney(row.amount) - own[type])).toBeLessThanOrEqual(2);
  }
  const doc = await state(page, `(()=>{const P=computePricing();const D=customerDocumentLines(P,getStats());
    return{total:P.cents.clientTotal,rows:D.rows.map(r=>({kind:r.kind,type:r.type,amountC:r.amountC,amount:r.amount})),totalText:D.total};})()`);
  const sections = Object.fromEntries(doc.rows.filter(r => r.kind === 'section').map(r => [r.type, r.amountC]));
  console.log('CDS1', JSON.stringify({ own, sections, total: doc.total }));
  expect(Object.keys(sections)).toEqual(['chainlink', 'ornamental', 'woodprivacy']);
  // A merged BOM line shared by sections (post concrete) is rounded once on the
  // job and once per standalone section, so an own price may differ by a cent.
  for (const type of Object.keys(own)) expect(Math.abs(sections[type] - own[type])).toBeLessThanOrEqual(2);
  expect(doc.rows.reduce((s, r) => s + r.amountC, 0)).toBe(doc.total);
  // The repro: the ornamental section is not shown at a length-blended price.
  const blendedOrnamental = Math.round(doc.total * 50 / 190);
  expect(Math.abs(sections.ornamental - blendedOrnamental)).toBeGreaterThan(100);

  // Panel client view shows the same section amounts.
  const rows = await panelRows(page);
  for (const type of Object.keys(own)) {
    const row = doc.rows.find(r => r.type === type);
    expect(rows.map(r => r.amount)).toContain(money(row.amountC));
    expect(Math.abs(parseMoney(money(row.amountC)) - own[type])).toBeLessThanOrEqual(2);
  }
});

test('CDS2 adders, manual material and urban premium reconcile; panel equals PDF', async ({ page }) => {
  await cleanOpen(page);
  await defineJob(page);
  await state(page, `(()=>{['uc-demo','uc-slope','uc-harddig'].forEach(id=>{document.getElementById(id).checked=true;});})()`);
  const own = await standaloneSubtotals(page);
  await state(page, `(()=>{document.getElementById('uc-urban').checked=true;
    COST_DB['gate latch special']={cost:12.34,unit:'ea'};S.materials=[{name:'Gate Latch Special',qty:'3',unit:'ea',id:7}];
    S.jobCustomer='Section Customer';S.jobAddress='1 Section Way';updatePanel();})()`);
  const doc = await state(page, `(()=>{const P=computePricing();const D=customerDocumentLines(P,getStats());
    return{cents:P.cents,manualC:P.matLines.filter(l=>l.source==='manual').reduce((s,l)=>s+l.clientExtC,0),
      rows:D.rows.map(r=>({kind:r.kind,type:r.type,amountC:r.amountC,amount:r.amount})),totalText:D.total};})()`);
  console.log('CDS2', JSON.stringify({ own, rows: doc.rows, total: doc.cents.clientTotal }));
  const byKind = k => doc.rows.filter(r => r.kind === k);
  // Each section carries its own demo, grade, hard-dig and gate costs.
  for (const s of byKind('section')) expect(Math.abs(s.amountC - own[s.type])).toBeLessThanOrEqual(2);
  expect(byKind('manual').map(r => r.amountC)).toEqual([doc.manualC]);
  expect(byKind('urban').map(r => r.amountC)).toEqual([doc.cents.urbanAdd]);
  expect(doc.cents.urbanAdd).toBeGreaterThan(0);
  // Exact reconciliation in cents, and of the displayed strings (F16).
  expect(doc.rows.reduce((s, r) => s + r.amountC, 0)).toBe(doc.cents.clientTotal);
  expect(doc.totalText).toBe(money(doc.cents.clientTotal));
  expect(doc.rows.reduce((s, r) => s + parseMoney(r.amount), 0)).toBe(parseMoney(doc.totalText));

  // Panel shows every shared row amount and the same total.
  const rows = await panelRows(page);
  for (const r of doc.rows.filter(r => r.kind !== 'urban')) expect(rows.map(x => x.amount)).toContain(r.amount);
  await expect(page.locator('#price-totals')).toContainText(doc.totalText);
  await expect(page.locator('#price-totals')).toContainText(byKind('urban')[0].amount);

  // The estimate PDF shows the same amounts and total.
  const pdf = await exportEstimateStrings(page, 'cds2');
  for (const r of doc.rows) expect(pdf).toContain(r.amount);
  expect(pdf).toMatch(new RegExp(`ESTIMATE TOTAL[\\s\\S]*${doc.totalText.replace(/[$.]/g, '\\$&')}`));
});
