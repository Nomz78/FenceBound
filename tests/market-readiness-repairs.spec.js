const { test, expect } = require('@playwright/test');

const state = (page, source) => page.evaluate(code => window.eval(code), source);
const upload = (page, selector, payload) => page.locator(selector).setInputFiles({
  name: 'regression.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)),
});

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
});

test('MR1 automatic fabric rejects a CSV roll price without a roll length', async ({ page }) => {
  await state(page, `(()=>{
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},
      fenceType:'chainlink',runId:'mr1',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    openCsvImporter([['Material','Price','Unit'],['Chain Link Fabric','160','roll']]);
  })()`);
  await page.locator('#cs-apply').click();
  const result = await state(page, `(()=>{const p=computePricing();return {
    line:p.matLines.find(l=>l.costKey==='chain link fabric'),final:p.isFinalReady,
    errors:validateProject({requireClient:false}).errors.map(e=>e.code)};})()`);
  expect(result.line.qty).toBe(100);
  expect(result.line.unitCost).toBeNull();
  expect(result.line.extC).toBe(0);
  expect(result.final).toBe(false);
  expect(result.errors).toContain('UNIT_MISMATCH');
  const aliases = await state(page, `(()=>{COST_DB['chain link fabric']={cost:1.60,unit:'feet'};
    const p=computePricing();return {line:p.matLines.find(l=>l.costKey==='chain link fabric'),mismatch:p.unitMismatch};})()`);
  expect(aliases.line.extC).toBe(16000);
  expect(aliases.mismatch).toEqual([]);
});

async function borrowedPrices(page) {
  await state(page, `(()=>{
    COST_DB['chain link fabric']={cost:222,unit:'lf'};saveCostDB();
    COST_DB['chain link fabric']={cost:111,unit:'coil'};LABOR.crewHourlyRate=777;
    FOOTING.bagWeightLb=99;POST_OD_IN.line=9;POST_EMBED_IN.line=90;
    _pricingFromLoadedProject=true;openCostEditor();
  })()`);
}
const pricingSnapshot = `JSON.stringify({costs:COST_DB,labor:LABOR,markup:MARKUP,footing:FOOTING,
  od:POST_OD_IN,embed:POST_EMBED_IN,specs:serializeRunSpecs(S.specs),
  provenance:_pricingFromLoadedProject,stored:localStorage.getItem(COSTDB_KEY)})`;

test('MR2 JSON price import with a quote open changes only the company card (REDO 6b)', async ({ page }) => {
  await state(page, `(()=>{
    COST_DB['chain link fabric']={cost:222,unit:'lf'};saveCostDB();
    COST_DB['chain link fabric']={cost:111,unit:'coil'};LABOR.crewHourlyRate=777;
    S.quote={frozenAt:'then',total:null,pricing:clonePricing()};_pricingFromLoadedProject=true;openCostEditor();
  })()`);
  const quote = await state(page, 'JSON.stringify(S.quote)');
  expect(await state(page, `COST_DB['chain link fabric']`)).toEqual({ cost: 222, unit: 'lf' });
  let confirmations = 0;
  page.on('dialog', async dialog => { confirmations++; await dialog.dismiss(); });
  await upload(page, '#ce-import-file', { markup: { materialPct: 40 } });
  await expect(page.locator('#app-toast')).toContainText('Prices imported');
  expect(await state(page, `JSON.parse(localStorage.getItem(COSTDB_KEY)).markup.materialPct`)).toBe(40);
  await page.locator('#ce-cancel').click();
  expect(confirmations).toBe(0);
  expect(await state(page, 'JSON.stringify(S.quote)')).toBe(quote);
  expect(await state(page, `COST_DB['chain link fabric']`)).toEqual({ cost: 111, unit: 'coil' });
  expect(await state(page, `LABOR.crewHourlyRate`)).toBe(777);
});

test('MR3 partial JSON import merges onto company prices and uses company units for legacy numbers', async ({ page }) => {
  await borrowedPrices(page);
  page.on('dialog', dialog => dialog.accept());
  await upload(page, '#ce-import-file', { markup: { materialPct: 40 } });
  await expect(page.locator('#app-toast')).toContainText('Prices imported');
  expect(await state(page, `COST_DB['chain link fabric']`)).toEqual({ cost: 222, unit: 'lf' });
  expect(await state(page, `_pricingFromLoadedProject`)).toBe(false);
  expect(await state(page, `LABOR.crewHourlyRate`)).not.toBe(777);
  expect(await state(page, `JSON.parse(localStorage.getItem(COSTDB_KEY)).costs['chain link fabric'].cost`)).toBe(222);
  await upload(page, '#ce-import-file', { costs: { 'chain link fabric': 2.5 } });
  await expect(page.locator('#ce-import-file')).toHaveValue('');
  await expect(page.locator('#app-toast')).toContainText('Prices imported');
  expect(await state(page, `COST_DB['chain link fabric']`)).toEqual({ cost: 2.5, unit: 'lf' });
});

test('MR4 failed JSON persistence restores all live pricing and provenance', async ({ page }) => {
  await borrowedPrices(page);
  const before = await state(page, pricingSnapshot);
  await state(page, `(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){
    if(k===COSTDB_KEY)throw new Error('injected quota');return original.call(this,k,v);};})()`);
  page.on('dialog', dialog => dialog.accept());
  await upload(page, '#ce-import-file', { costs: { 'chain link fabric': 5 }, labor: { crewHourlyRate: 10 },
    markup: { materialPct: 40 }, footing: { bagWeightLb: 20 }, postODIn: { line: 3 }, postEmbedIn: { line: 40 } });
  await expect(page.locator('#app-toast')).toContainText(/failed/i);
  expect(await state(page, pricingSnapshot)).toBe(before);
});

const completeSnapshot = `JSON.stringify({state:S,pricing:JSON.parse(${pricingSnapshot}),
  defaults:_defaultTypeSpecs,inputs:readJobPricingInputs(),auto:localStorage.getItem(AUTOSAVE_KEY)},
  (k,v)=>v instanceof Set?{set:[...v]}:v)`;

for (const failure of ['malformed addons', 'render failure', 'storage failure', 'legacy render failure']) {
  test(`MR5 portable import is atomic after ${failure}`, async ({ page }) => {
    await borrowedPrices(page);
    const incoming = await state(page, `(()=>{
      S.projectName='Accepted job';S.jobCustomer='Original customer';S.jobId=123;
      S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},
        fenceType:'chainlink',runId:'accepted',specs:cloneRunSpecs(S.specs),postSpacing:10}];
      S.selected=0;S.labels=[{text:'Preserve label',x:10,y:20}];pushHistory();
      S.future=[snapshotDoc()];
      window.__acceptedRun=S.elements[0];_runTypeSpecs.set(S.elements[0],{woodprivacy:cloneRunSpecs(S.specs)});
      syncSpecInputs();updateDrawers();
      document.getElementById('uc-demo').checked=true;document.getElementById('labor-hours').value='12';
      _defaultTypeSpecs={chainlink:cloneRunSpecs(S.specs)};
      saveSession();
      const st=JSON.parse(JSON.stringify(snapshotState()));
      st.projectName='Incoming';st.jobCustomer='Other customer';st.jobId=456;
      st.costs={'chain link fabric':{cost:9,unit:'lf'},'incoming only':{cost:4,unit:'ea'}};st.footing.bagWeightLb=10;
      st.postODIn.line=3;st.postEmbedIn.line=40;st.siteUpcharges={};st.laborHours='2';
      return st;
    })()`);
    const before = await state(page, completeSnapshot);
    if (failure === 'malformed addons') incoming.specs.addons = {};
    if (failure === 'legacy render failure') delete incoming.specs;
    if (failure.includes('render failure')) await state(page, `(()=>{const original=updateMatList;
      updateMatList=()=>{updateMatList=original;throw new Error('injected render failure');};})()`);
    if (failure === 'storage failure') await state(page, `(()=>{const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k===AUTOSAVE_KEY)throw new Error('injected quota');return original.call(this,k,v);};})()`);
    await upload(page, '#job-file-input', incoming);
    await expect(page.locator('#app-toast')).toContainText('Import failed');
    expect(await state(page, completeSnapshot)).toBe(before);
    expect(await state(page, `S.elements[0]===window.__acceptedRun&&!!_runTypeSpecs.get(S.elements[0]).woodprivacy`)).toBe(true);
    await expect(page.locator('#job-name-display')).toHaveText('Accepted job');
    await expect(page.locator('#uc-demo')).toBeChecked();
    await expect(page.locator('#labor-hours')).toHaveValue('12');
  });
}

test('MR7 successful portable import persists incoming job and clears old undo/redo', async ({ page }) => {
  const incoming = await state(page, `(()=>{pushHistory();S.future=[snapshotDoc()];
    const st=JSON.parse(JSON.stringify(snapshotState()));st.projectName='Accepted import';return st;})()`);
  await upload(page, '#job-file-input', incoming);
  await expect(page.locator('#app-toast')).toContainText('Imported "Accepted import"');
  expect(await state(page, `[S.projectName,S.history.length,S.future.length,
    JSON.parse(localStorage.getItem(AUTOSAVE_KEY)).projectName]`)).toEqual(['Accepted import', 0, 0, 'Accepted import']);
});

test('MR8 corrupt company storage is not silently overwritten by JSON import', async ({ page }) => {
  await borrowedPrices(page);
  await state(page, `localStorage.setItem(COSTDB_KEY,'{broken')`);
  const before = await state(page, pricingSnapshot);
  page.on('dialog', dialog => dialog.accept());
  await upload(page, '#ce-import-file', { markup: { materialPct: 40 } });
  await expect(page.locator('#app-toast')).toContainText('Saved rate card is corrupt');
  expect(await state(page, pricingSnapshot)).toBe(before);
});

test('MR9 a display failure after JSON prices commit reports the saved result accurately', async ({ page }) => {
  await borrowedPrices(page);
  page.on('dialog', dialog => dialog.accept());
  await state(page, `(()=>{const original=refreshPostDiaDefaults;refreshPostDiaDefaults=()=>{
    refreshPostDiaDefaults=original;throw new Error('injected display failure');};})()`);
  await upload(page, '#ce-import-file', { markup: { materialPct: 40 } });
  await expect(page.locator('#app-toast')).toContainText('Prices saved');
  expect(await state(page, `JSON.parse(localStorage.getItem(COSTDB_KEY)).markup.materialPct`)).toBe(40);
  expect(await state(page, `_pricingFromLoadedProject`)).toBe(false);
});

for (const example of [
  { rate: 0.014, qty: 1000, pct: 35, cost: 1400, client: 1890 },
  { rate: 0.004, qty: 1000, pct: 0, cost: 400, client: 400 },
  { rate: 1.005, qty: 1, pct: 0, cost: 101, client: 101 },
  { rate: 0.014, qty: 2.5, pct: 0, cost: 4, client: 4 },
]) {
  test(`MR6 extends decimal rate ${example.rate} x ${example.qty} before rounding cents`, async ({ page }) => {
    const result = await state(page, `(()=>{
      COST_DB['test hardware']={cost:${example.rate},unit:'ea'};
      S.materials=[{name:'Test hardware',qty:${example.qty},unit:'ea'}];
      MARKUP.materialPct=${example.pct};
      const p=computePricing();return {line:p.matLines[0],cents:p.cents,final:p.isFinalReady};
    })()`);
    expect(result.line.extC).toBe(example.cost);
    expect(result.line.clientExtC).toBe(example.client);
    expect(result.line.unitCost).toBe(example.rate);
    expect(result.cents.matCost).toBe(example.cost);
    expect(result.cents.matPrice).toBe(example.client);
    expect(result.final).toBe(true);
    expect(Object.values(result.cents).every(Number.isInteger)).toBe(true);
  });
}

// Coverage added in REDO r5: MR5 predates the 6b quote store and the 6c
// signature. A failed import with a quoted, signed job open restores both.
for (const failure of ['render failure', 'storage failure']) {
  test(`MR5 portable import is atomic with a quoted, signed job open after ${failure}`, async ({ page }) => {
    await state(page, `(()=>{
      S.projectName='Quoted job';S.jobCustomer='Quoted customer';
      S.elements=[{type:'fence',start:{x:0,y:0},end:{x:400,y:0},fenceType:'chainlink',runId:'quoted',
        specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
      COST_DB['chain link fabric'].cost=7.77;_pricingFromLoadedProject=true;
      const total=computePricing().clientTotal;
      S.quote={frozenAt:'2026-10-30T00:00:00.000Z',total,pricing:clonePricing(),
        signature:{image:'data:image/png;base64,AAAA',name:'Pat',signedAt:'2026-10-30T00:00:00.000Z',total}};
      draw();updatePanel();updatePricing();saveSession();
    })()`);
    const incoming = await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));
      st.projectName='Incoming';st.quote={frozenAt:'2026-01-01T00:00:00.000Z',total:1};
      st.costs={'chain link fabric':{cost:1,unit:'lf'}};return st;})()`);
    const snapshot = `JSON.stringify({quote:S.quote,live:COST_DB['chain link fabric'].cost,
      provenance:_pricingFromLoadedProject,total:computePricing().clientTotal,
      note:document.getElementById('quote-price-text').textContent,auto:localStorage.getItem(AUTOSAVE_KEY)})`;
    const before = await state(page, snapshot);
    if (failure === 'render failure') await state(page, `(()=>{const original=updateMatList;
      updateMatList=()=>{updateMatList=original;throw new Error('injected render failure');};})()`);
    else await state(page, `(()=>{const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k===AUTOSAVE_KEY)throw new Error('injected quota');return original.call(this,k,v);};})()`);
    await upload(page, '#job-file-input', incoming);
    await expect(page.locator('#app-toast')).toContainText('Import failed');
    expect(await state(page, snapshot)).toBe(before);
    expect(await state(page, `COST_DB['chain link fabric'].cost`)).toBe(7.77);
    await expect(page.locator('#quote-price-text')).toContainText('Signed by Pat');
  });
}
