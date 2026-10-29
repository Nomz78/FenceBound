const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

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

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function seedPlainRun(page) {
  await state(page, `(()=>{
    const run={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},fenceType:'chainlink',
      runId:'run_f3',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10};
    S.elements=[run];draw();updatePanel();updatePricing();
  })()`);
}

const badgeText = page => state(page, "document.getElementById('price-totals').textContent");

// F3: the totals badge read FINAL-READY whenever every BOM line had a cost,
// even with validation errors open and the shipped placeholder rate card.
test('F3 badge is not FINAL-READY with validation errors and placeholder pricing', async ({ page }) => {
  await cleanOpen(page);
  await seedPlainRun(page);
  expect(await state(page, 'computePricing().isFinalReady')).toBe(true);
  expect(await state(page, 'validateProject().ok')).toBe(false);
  expect(await state(page, 'usingSeedPrices()')).toBe(true);
  const badge = await badgeText(page);
  expect(badge).not.toContain('FINAL-READY');
  expect(badge).toContain('Pricing complete · not verified');
});

test('F3 badge is FINAL-READY once validation passes on a saved rate card', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{COMPANY={...DEFAULT_COMPANY,name:'FenceBound Test Company'};saveCompany();saveCostDB();
    S.projectName='F3 Job';S.jobCustomer='F3 Customer';S.jobAddress='1 Test Lane';})()`);
  await seedPlainRun(page);
  expect(await state(page, 'usingSeedPrices()')).toBe(false);
  expect(await state(page, 'validateProject().ok')).toBe(true);
  expect(await badgeText(page)).toContain('FINAL-READY');
});

async function estimateStrings(page, label) {
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportEstimatePDF()');
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-${label}-${Date.now()}.pdf`);
  await download.saveAs(filePath);
  const strings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  fs.unlinkSync(filePath);
  return strings;
}

async function seedVerifiedJob(page, saveRateCard) {
  await cleanOpen(page);
  await state(page, `(()=>{COMPANY={...DEFAULT_COMPANY,name:'FenceBound Test Company'};saveCompany();
    ${saveRateCard ? 'saveCostDB();' : ''}
    S.projectName='F4 Job';S.jobCustomer='F4 Customer';S.jobAddress='1 Test Lane';})()`);
  await seedPlainRun(page);
  expect(await state(page, 'validateProject().ok')).toBe(true);
}

// F4: a job that passed validation exported a customer estimate on the
// shipped placeholder rate card with no warning on the PDF.
test('F4 estimate PDF on placeholder pricing carries the NOT FULLY VERIFIED stamp', async ({ page }) => {
  await seedVerifiedJob(page, false);
  expect(await state(page, 'usingSeedPrices()')).toBe(true);
  const strings = await estimateStrings(page, 'f4-placeholder');
  expect(strings).toContain('NOT FULLY VERIFIED');
  expect(strings).toContain('placeholder');
});

test('F4 estimate PDF on a saved rate card is not stamped', async ({ page }) => {
  await seedVerifiedJob(page, true);
  expect(await state(page, 'usingSeedPrices()')).toBe(false);
  const strings = await estimateStrings(page, 'f4-saved');
  expect(strings).not.toContain('NOT FULLY VERIFIED');
});

// F7: cosmetic findings from the audit.
test('F7a estimate PDF formats dollars with thousands separators like the app', async ({ page }) => {
  await seedVerifiedJob(page, true);
  const appTotal = await state(page, "(()=>{const v=computePricing().clientTotal;return '$'+v.toLocaleString('en-US',{maximumFractionDigits:0});})()");
  expect(appTotal).toMatch(/^\$\d{1,3}(,\d{3})+$/);
  const strings = await estimateStrings(page, 'f7a');
  expect(strings).toContain(`(${appTotal})`);
  expect(strings).not.toMatch(/\$\d{4,}/);
});

test('F7b canvas draws a single 0\' label at the origin', async ({ page }) => {
  await cleanOpen(page);
  const zeros = await state(page, `(()=>{
    const ctx=document.getElementById('canvas').getContext('2d'),orig=ctx.fillText;let n=0;
    ctx.fillText=function(t,...rest){if(t==="0'")n++;return orig.call(this,t,...rest);};
    try{draw();}finally{ctx.fillText=orig;}
    return n;
  })()`);
  expect(zeros).toBe(1);
});

test('F7c plan PDF legend lists only fence types used in the job', async ({ page }) => {
  await seedVerifiedJob(page, true);
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const labels = await state(page, "Object.fromEntries(Object.entries(FENCE_TYPES).map(([k,v])=>[k,v.label]))");
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportPDF()');
  const filePath = path.join(os.tmpdir(), `fencebound-f7c-${Date.now()}.pdf`);
  await (await downloadPromise).saveAs(filePath);
  const strings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  fs.unlinkSync(filePath);
  expect(strings).toContain(`(${labels.chainlink})`);
  const unused = Object.entries(labels).filter(([k]) => k !== 'chainlink').map(([, label]) => `(${label})`);
  expect(unused.filter(label => strings.includes(label))).toEqual([]);
});

// F5: a gate post on a run end was counted twice (end post + gate post), and that
// run end also took fabric-end hardware although the run's fabric stops at the gate.
async function seedGateJob(page, runs, gates) {
  await cleanOpen(page);
  return state(page, `(()=>{
    const F=GRID_FT,P=([x,y])=>({x:x*F,y:y*F});
    S.elements=${JSON.stringify(runs)}.map(([a,b],i)=>({type:'fence',start:P(a),end:P(b),fenceType:'chainlink',
      runId:'run_f5_'+i,specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}));
    ${JSON.stringify(gates)}.forEach(([i,a,b])=>S.elements.push(attachGateToRun(
      {type:'gate',start:P(a),end:P(b),gateType:'walk',hinge:'start',swingDir:1},S.elements[i])));
    S.elements.filter(el=>el.type==='fence').forEach(rebuildRunAutoPosts);
    const st=getStats(),qty=re=>calcAutoMaterials().filter(it=>new RegExp(re).test(it.name)).reduce((s,it)=>s+it.qty,0);
    return{endPosts:st.terminalPosts.size+st.cornerPosts.size,gatePosts:st.gatePosts,ends:st.terminationEnds,
      endPostQty:qty('^Terminal/Corner Post '),gatePostQty:qty('^Gate Post \\\\d'),tensionBars:qty('^Tension Bar$')};
  })()`);
}

test('F5 gate post on a run end replaces the end post and takes no fabric-end hardware', async ({ page }) => {
  const r = await seedGateJob(page, [[[0, 0], [60, 0]]], [[0, [0, 0], [4, 0]]]);
  expect(r.endPosts).toBe(1);
  expect(r.endPostQty).toBe(1);
  expect(r.gatePosts).toBe(2);
  expect(r.gatePostQty).toBe(2);
  expect(r.ends).toBe(2);
  expect(r.tensionBars).toBe(2);
});

test('F5 gate post on a corner keeps the other run\'s fabric end', async ({ page }) => {
  const r = await seedGateJob(page, [[[0, 60], [0, 0]], [[-60, 0], [0, 0]]], [[1, [0, 0], [-4, 0]]]);
  expect(r.endPosts).toBe(2);
  expect(r.endPostQty).toBe(2);
  expect(r.gatePosts).toBe(2);
  expect(r.gatePostQty).toBe(2);
  expect(r.ends).toBe(4);
});

test('F5 mid-run gate counting is unchanged', async ({ page }) => {
  const r = await seedGateJob(page, [[[0, 0], [60, 0]]], [[0, [20, 0], [24, 0]]]);
  expect(r.endPosts).toBe(2);
  expect(r.endPostQty).toBe(2);
  expect(r.gatePosts).toBe(2);
  expect(r.gatePostQty).toBe(2);
  expect(r.ends).toBe(4);
  expect(r.tensionBars).toBe(4);
});

// F5 (plan PDF): the post summary omitted gate posts, so Total Posts disagreed
// with the materials list (owner ruling 2026-10-29: show them and include them).
test('F5 plan PDF post summary shows gate posts and matches the materials list', async ({ page }) => {
  await seedVerifiedJob(page, true);
  const listed = await state(page, `(()=>{
    const run=S.elements.find(el=>el.type==='fence');
    S.elements.push(attachGateToRun({type:'gate',start:{x:20*GRID_FT,y:0},end:{x:24*GRID_FT,y:0},
      gateType:'walk',hinge:'start',swingDir:1},run));
    rebuildRunAutoPosts(run);draw();updatePanel();
    return calcAutoMaterials().filter(it=>/^(Line|Terminal\\/Corner|Gate) Post \\d/.test(it.name)).reduce((s,it)=>s+it.qty,0);
  })()`);
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportPDF()');
  const filePath = path.join(os.tmpdir(), `fencebound-f5-plan-${Date.now()}.pdf`);
  await (await downloadPromise).saveAs(filePath);
  const strings = execFileSync('/usr/bin/strings', [filePath], { encoding: 'utf8' });
  fs.unlinkSync(filePath);
  expect(strings).toContain('(Gate: 2)');
  expect(strings).toContain(`(Total Posts: ${listed})`);
});
