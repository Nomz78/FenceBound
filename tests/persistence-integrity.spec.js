const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RATE_KEY = 'chain link fabric';

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function seedRun(page, name = 'Persistence Test Job') {
  await state(page, `(()=>{
    S.projectName=${JSON.stringify(name)};
    S.jobCustomer='Persistence Customer';
    S.jobAddress='100 Persistence Lane';
    S.elements=[{
      type:'fence',start:{x:0,y:0},end:{x:400,y:0},
      fenceType:'chainlink',runId:'run_persistence_test',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10
    }];
    draw();updatePanel();
  })()`);
}

async function seedEstimateState(page) {
  await seedRun(page, 'Estimate Error Coverage');
  await state(page, `(()=>{
    S.jobCustomer='Estimate Test Customer';
    S.jobAddress='100 Estimate Test Lane';
    const run=S.elements[0];
    run.specs.heightIn=72;run.specs.postHeightIn=108;run.specs.embedDepthIn=36;
    run.specs.addons=new Set();run.postSpacing=10;run.autoPostSpacing=10;
    draw();updatePanel();
  })()`);
}

async function exportEstimateAndRead(page, label) {
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const pageErrors=[];
  const onPageError=error=>pageErrors.push(error.message);
  page.on('pageerror',onPageError);
  const downloadPromise=page.waitForEvent('download', { timeout: 10_000 });
  await state(page, 'exportEstimatePDF()');
  const download=await downloadPromise;
  const filePath=path.join(os.tmpdir(),`fencebound-estimate-error-${label}-${Date.now()}.pdf`);
  await download.saveAs(filePath);
  page.off('pageerror',onPageError);
  return{
    bytes:fs.readFileSync(filePath),
    strings:execFileSync('/usr/bin/strings',[filePath],{encoding:'utf8'}),
    pageErrors
  };
}

async function importMalformedProject(page, mutate) {
  const portable=await state(page,'JSON.parse(JSON.stringify(snapshotState()))');
  portable.projectName='Pricing Runtime Export Test';
  portable.jobCustomer='Pricing Runtime Customer';
  portable.jobAddress='100 Runtime Test Lane';
  portable.elements=[{
    type:'fence',start:{x:0,y:0},end:{x:400,y:0},fenceType:'chainlink',
    runId:'run_pricing_runtime',postSpacing:10,autoPostSpacing:10,
    specs:{...portable.specs,addons:[]}
  }];
  mutate(portable.elements[0]);
  await page.locator('#job-file-input').setInputFiles({
    name:'pricing-runtime.fencebound.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(portable))
  });
  await expect.poll(()=>state(page,'S.projectName')).toBe('Pricing Runtime Export Test');
  expect(await state(page,"validateProject().errors.map(item=>item.code)")).toContain('PRICING_RUNTIME');
}

async function saveCurrentJob(page) {
  await page.locator('#btn-jobs').click();
  await page.locator('#do-save').click();
  await page.locator('#close-jobs').click();
}

async function loadJob(page, index = 0) {
  await page.locator('#btn-jobs').click();
  await page.locator(`[data-ji="${index}"]`).click();
}

async function editMarkupAndSave(page, value, onDialog) {
  if (onDialog) page.once('dialog', onDialog);
  await state(page, 'openCostEditor()');
  await page.locator('#ce-mat-markup').fill(String(value));
  await page.locator('#ce-save').click();
}

test('T-P1 loaded project pricing cannot silently replace the company rate card', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page, 'Historical Quote');
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=111;MARKUP.materialPct=31`);
  await saveCurrentJob(page);
  // Cross a real persistence boundary so this case isolates D-1 from D-3's
  // save-side reference leak.
  await state(page, 'saveSession()');
  await page.reload();
  page.once('dialog', dialog => dialog.accept());
  await state(page, 'openCostEditor()');
  await page.locator(`[data-cost="${RATE_KEY}"]`).fill('222');
  await page.locator('#ce-mat-markup').fill('42');
  await page.locator('#ce-save').click();
  await loadJob(page);

  let warning = '';
  await editMarkupAndSave(page, 32, dialog => {
    warning = dialog.message();
    dialog.dismiss();
  });
  const observed = await state(page, `({
    live:COST_DB[${JSON.stringify(RATE_KEY)}].cost,
    stored:JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost
  })`);
  console.log('D1_1A', JSON.stringify({ ...observed, warning }));
  expect(observed.live).toBe(111);
  expect(observed.stored).toBe(222);
  expect(warning).toContain('company rate card');

  await state(page, 'openCostEditor()');
  await expect(page.locator('#ce-reload-rate-card')).toBeVisible();
  await page.locator('#ce-reload-rate-card').click();
  expect(await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost`)).toBe(222);
});

test('T-P2 autosave boot restore preserves the company store and project provenance', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page, 'Autosaved Historical Quote');
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=222;saveCostDB()`);
  await state(page, `(()=>{
    const historical=snapshotState();
    historical.costs[${JSON.stringify(RATE_KEY)}]={...historical.costs[${JSON.stringify(RATE_KEY)}],cost:111};
    applyState(historical);
    saveSession();
  })()`);
  await page.reload();
  const observed = await state(page, `({
    live:COST_DB[${JSON.stringify(RATE_KEY)}].cost,
    stored:JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost,
    provenance:typeof _pricingFromLoadedProject==='boolean'?_pricingFromLoadedProject:null
  })`);
  console.log('D1_1B', JSON.stringify(observed));
  expect(observed.live).toBe(111);
  expect(observed.stored).toBe(222);
  expect(observed.provenance).toBe(true);
});

test('T-P3 ordinary cost-editor save still updates the company rate card', async ({ page }) => {
  await cleanOpen(page);
  const before = await state(page, `typeof _pricingFromLoadedProject==='boolean'?_pricingFromLoadedProject:null`);
  await editMarkupAndSave(page, 47);
  const observed = await state(page, `({
    live:MARKUP.materialPct,
    stored:JSON.parse(localStorage.getItem(COSTDB_KEY)).markup.materialPct,
    provenance:typeof _pricingFromLoadedProject==='boolean'?_pricingFromLoadedProject:null
  })`);
  console.log('D1_NORMAL_SAVE', JSON.stringify({ before, ...observed }));
  expect(before).toBe(false);
  expect(observed).toEqual({ live: 47, stored: 47, provenance: false });
});

test('T-P4 cost-editor save reports a localStorage write failure', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      if(key===COSTDB_KEY)throw new DOMException('quota','QuotaExceededError');
      return original.call(this,key,value);
    };
  })()`);
  await editMarkupAndSave(page, 48);
  await expect(page.locator('#app-toast')).toContainText('Save failed — storage full or blocked');
  await expect(page.locator('#cost-editor')).toBeVisible();
});

test('F1 failed deliberate pricing write preserves loaded-project provenance', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=222;saveCostDB()`);
  await state(page, `(()=>{
    const historical=snapshotState();
    historical.costs[${JSON.stringify(RATE_KEY)}].cost=111;
    applyState(historical);
    const original=Storage.prototype.setItem;
    window.__restoreRateCardWrite=()=>{Storage.prototype.setItem=original;};
    Storage.prototype.setItem=function(key,value){
      if(key===COSTDB_KEY)throw new DOMException('quota','QuotaExceededError');
      return original.call(this,key,value);
    };
  })()`);

  let firstConfirmation = '';
  await editMarkupAndSave(page, 41, dialog => {
    firstConfirmation = dialog.message();
    dialog.accept();
  });
  const afterFailure = await state(page, `({
    stored:JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost,
    provenance:_pricingFromLoadedProject
  })`);

  await state(page, '__restoreRateCardWrite()');
  let nextConfirmation = '';
  await editMarkupAndSave(page, 42, dialog => {
    nextConfirmation = dialog.message();
    dialog.dismiss();
  });

  expect(firstConfirmation).toContain('company rate card');
  expect(afterFailure).toEqual({ stored: 222, provenance: true });
  expect(nextConfirmation).toContain('company rate card');
  expect(await state(page, `JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost`)).toBe(222);
});

test('T-P5 pricing provenance clears when applied state contains no pricing', async ({ page }) => {
  await cleanOpen(page);
  const observed = await state(page, `(()=>{
    const priced=snapshotState();
    applyState(priced);
    const afterPriced=_pricingFromLoadedProject;
    const withoutPricing=JSON.parse(JSON.stringify(priced));
    delete withoutPricing.costs;delete withoutPricing.labor;delete withoutPricing.markup;
    applyState(withoutPricing);
    return {afterPriced,afterWithoutPricing:_pricingFromLoadedProject};
  })()`);
  expect(observed).toEqual({ afterPriced: true, afterWithoutPricing: false });
});

test('T-P6 rate-card reload distinguishes missing and corrupt storage', async ({ page }) => {
  await cleanOpen(page);
  await state(page, 'openCostEditor()');
  await page.locator('#ce-reload-rate-card').click();
  await expect(page.locator('#app-toast')).toContainText('No saved rate card found');

  await state(page, `localStorage.setItem(COSTDB_KEY,'{broken json');openCostEditor()`);
  await page.locator('#ce-reload-rate-card').click();
  await expect(page.locator('#app-toast')).toContainText('Saved rate card is corrupt');
});

test('T-U1 undo and redo preserve run add-ons as a Set and preserve BOM', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  const before = await state(page, `(()=>{
    const run=S.elements[0];
    run.specs.addons=new Set(['top-wire','barbed-wire']);
    const bom=calcAutoMaterials().map(r=>[r.name,r.qty,r.unit]);
    pushHistory();
    S.labels.push({text:'later action',x:1,y:1,size:14,color:'#fff'});
    return bom;
  })()`);
  await state(page, 'doUndo()');
  const afterUndo = await state(page, `(()=>{
    const a=S.elements[0].specs.addons;
    let bom=null,error=null;
    try{bom=calcAutoMaterials().map(r=>[r.name,r.qty,r.unit]);}catch(e){error=e.message;}
    return {type:Object.prototype.toString.call(a),value:a instanceof Set?[...a]:a,bom,error};
  })()`);
  await state(page, 'doRedo()');
  const afterRedo = await state(page, `(()=>{
    const a=S.elements[0].specs.addons;
    let bom=null,error=null;
    try{bom=calcAutoMaterials().map(r=>[r.name,r.qty,r.unit]);}catch(e){error=e.message;}
    return {isSet:a instanceof Set,value:a instanceof Set?[...a]:a,bom,error};
  })()`);
  console.log('D2_UNDO', JSON.stringify({ before, afterUndo, afterRedo }));
  expect(afterUndo.type).toBe('[object Set]');
  expect(afterUndo.value).toEqual(['top-wire', 'barbed-wire']);
  expect(afterUndo.bom).toEqual(before);
  expect(afterRedo.isSet).toBe(true);
  expect(afterRedo.value).toEqual(['top-wire', 'barbed-wire']);
  expect(afterRedo.bom).toEqual(before);
});

test('T10 saved-job pricing is isolated from later in-place cost edits', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=111`);
  await saveCurrentJob(page);
  await state(page, 'openCostEditor()');
  await page.locator(`[data-cost="${RATE_KEY}"]`).fill('222');
  await page.locator('#ce-save').click();
  const observed = await state(page, `({
    live:COST_DB[${JSON.stringify(RATE_KEY)}].cost,
    saved:S.savedJobs[0].costs[${JSON.stringify(RATE_KEY)}].cost
  })`);
  console.log('D3_3A', JSON.stringify(observed));
  expect(observed).toEqual({ live: 222, saved: 111 });
});

test('T11 saved-job labels and manual materials are isolated from later edits', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  await state(page, `S.labels=[{text:'saved label',x:1,y:2,size:14,color:'#fff'}];
    S.materials=[{name:'saved row',qty:1,unit:'ea'}]`);
  await saveCurrentJob(page);
  const observed = await state(page, `(()=>{
    S.labels.push({text:'later label',x:3,y:4,size:14,color:'#fff'});
    S.materials.push({name:'temporary row',qty:2,unit:'ea'});
    const afterAdd={labels:S.savedJobs[0].labels.map(x=>x.text),materials:S.savedJobs[0].materials.map(x=>x.name)};
    S.materials.splice(0,1);
    const afterRemove={labels:S.savedJobs[0].labels.map(x=>x.text),materials:S.savedJobs[0].materials.map(x=>x.name)};
    return {afterAdd,afterRemove};
  })()`);
  console.log('D3_3B_3C', JSON.stringify(observed));
  expect(observed.afterAdd).toEqual({ labels: ['saved label'], materials: ['saved row'] });
  expect(observed.afterRemove).toEqual({ labels: ['saved label'], materials: ['saved row'] });
});

test('T12 saved-job elements are isolated after load and later live edits', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page);
  await saveCurrentJob(page);
  await loadJob(page);
  const observed = await state(page, `(()=>{
    S.elements.push({...S.elements[0],runId:'run_later',start:{x:0,y:80},end:{x:400,y:80},specs:cloneRunSpecs(S.elements[0].specs)});
    return {live:S.elements.length,saved:S.savedJobs[0].elements.length};
  })()`);
  await loadJob(page);
  const loadedAgain = await state(page, 'S.elements.length');
  console.log('D3_3D', JSON.stringify({ ...observed, loadedAgain }));
  expect(observed).toEqual({ live: 2, saved: 1 });
  expect(loadedAgain).toBe(1);
});

test('T13 unrelated delete cannot durably persist a contaminated saved job', async ({ page }) => {
  await cleanOpen(page);
  await seedRun(page, 'Job A');
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=111`);
  await saveCurrentJob(page);
  await state(page, `S.projectName='Job B'`);
  await saveCurrentJob(page);
  await loadJob(page, 1);
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=222`);
  await page.locator('#btn-jobs').click();
  await page.locator('[data-jdel="0"]').click();
  await page.reload();
  const observed = await state(page, `(()=>{
    const jobs=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {count:jobs.length,cost:jobs[0].costs[${JSON.stringify(RATE_KEY)}].cost};
  })()`);
  console.log('D3_3E', JSON.stringify(observed));
  expect(observed).toEqual({ count: 1, cost: 111 });
});

test('T-E1 invalid estimate and plan PDFs export with a recipient-visible warning', async ({ page }) => {
  await cleanOpen(page);
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });

  await page.locator('[data-tab="pricing"]').click();
  const estimateDownload = page.waitForEvent('download', { timeout: 10_000 });
  await page.locator('#btn-gen-estimate').click();
  const estimate = await estimateDownload;
  const estimatePath = path.join(os.tmpdir(), `fencebound-unverified-estimate-${Date.now()}.pdf`);
  await estimate.saveAs(estimatePath);
  const estimateStrings = execFileSync('/usr/bin/strings', [estimatePath], { encoding: 'utf8' });
  expect(estimateStrings).toContain('NOT FULLY VERIFIED');

  const overlay = page.locator('#validation-overlay');
  if (await overlay.isVisible()) await page.locator('#validation-close').click();
  const planDownload = page.waitForEvent('download', { timeout: 10_000 });
  await page.locator('#btn-pdf').click();
  const plan = await planDownload;
  const planPath = path.join(os.tmpdir(), `fencebound-unverified-plan-${Date.now()}.pdf`);
  await plan.saveAs(planPath);
  const planStrings = execFileSync('/usr/bin/strings', [planPath], { encoding: 'utf8' });
  expect(planStrings).toContain('NOT FULLY VERIFIED');
});

test('T-E2 invalid portable JSON exports with a recipient-visible warning', async ({ page }) => {
  await cleanOpen(page);
  await page.locator('#btn-jobs').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#do-export').click();
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-unverified-${Date.now()}.json`);
  await download.saveAs(filePath);
  const exported = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  expect(exported.exportWarning.message).toContain('NOT FULLY VERIFIED');
  expect(exported.exportWarning.unverified).toEqual(expect.arrayContaining([
    expect.stringContaining('project name'),
    expect.stringContaining('customer name'),
    expect.stringContaining('property address'),
  ]));
});

test('R13 known manual material joins the existing marked-up material total',async({page})=>{
  await cleanOpen(page);
  await seedRun(page,'Manual Material Pricing');
  const observed=await state(page,`(()=>{
    S.materials=[];
    const before=computePricing();
    const unit=lookupCost('Post Cap');
    S.materials=[{name:'Post Cap',qty:'2',unit:'ea',id:1}];
    const after=computePricing();
    const manual=after.matLines.find(line=>line.source==='manual');
    const equivalentAuto=after.matLines.find(line=>line.source!=='manual'&&line.name==='Post Cap');
    return{before:before.clientTotal,after:after.clientTotal,unit,markup:MARKUP.materialPct,manual,equivalentAuto};
  })()`);
  const expectedDelta=observed.unit*2*(1+observed.markup/100);
  expect(observed.after-observed.before).toBeCloseTo(expectedDelta,10);
  expect(observed.manual).toMatchObject({name:'Post Cap',qty:2,unit:'ea',unitCost:observed.unit,ext:observed.unit*2});
  expect(observed.manual.clientUnitCost).toBe(observed.equivalentAuto.clientUnitCost);
});

test('R14 unknown manual material uses existing MISSING_COST behavior',async({page})=>{
  await cleanOpen(page);
  await seedRun(page,'Unknown Manual Material');
  const observed=await state(page,`(()=>{
    S.materials=[{name:'Uncatalogued Manual Widget',qty:'3',unit:'ea',id:2}];
    const pricing=computePricing(),validation=validateProject();
    const manual=pricing.matLines.find(line=>line.source==='manual');
    return{manual,unknown:pricing.unknown,isFinalReady:pricing.isFinalReady,
      codes:validation.errors.map(item=>item.code),totals:[pricing.matCost,pricing.matPrice,pricing.clientSubtotal,pricing.clientTotal,pricing.marginPct]};
  })()`);
  expect(observed.manual).toMatchObject({name:'Uncatalogued Manual Widget',qty:3,unitCost:null,ext:0});
  expect(observed.unknown).toContain('Uncatalogued Manual Widget');
  expect(observed.isFinalReady).toBe(false);
  expect(observed.codes).toContain('MISSING_COST');
  expect(observed.totals.every(Number.isFinite)).toBe(true);
});

for(const quantityCase of [
  {input:'',expected:0,label:'empty'},
  {input:'abc',expected:0,label:'non-numeric'},
  {input:'0',expected:0,label:'zero'},
  {input:'12.5',expected:12.5,label:'decimal'},
  {input:'-4',expected:0,label:'negative'},
]){
  test(`R13a manual ${quantityCase.label} quantity normalizes safely`,async({page})=>{
    await cleanOpen(page);
    await seedRun(page,`Manual Quantity ${quantityCase.label}`);
    const observed=await state(page,`(()=>{
      S.materials=[{name:'Post Cap',qty:${JSON.stringify(quantityCase.input)},unit:'ea',id:3}];
      const pricing=computePricing(),manual=pricing.matLines.find(line=>line.source==='manual');
      return{qty:manual&&manual.qty,ext:manual&&manual.ext,unit:lookupCost('Post Cap'),
        totals:[pricing.matCost,pricing.matPrice,pricing.clientSubtotal,pricing.clientTotal,pricing.marginPct]};
    })()`);
    expect(observed.qty).toBe(quantityCase.expected);
    expect(observed.ext).toBeCloseTo(observed.unit*quantityCase.expected,10);
    expect(observed.totals.every(Number.isFinite)).toBe(true);
  });
}

test('R15 zero manual rows preserve the pre-fix estimate total exactly',async({page})=>{
  await cleanOpen(page);
  await seedRun(page,'Auto Pricing Identity');
  const serialized=await state(page,`(()=>{S.materials=[];return JSON.stringify(computePricing().clientTotal);})()`);
  console.log('R15_PARENT_TOTAL',serialized);
  expect(serialized).toBe('382.01');
});

test('R16 manual material is visible on the estimate PDF',async({page})=>{
  await cleanOpen(page);
  await seedRun(page,'Manual Estimate Visibility');
  await state(page,`S.materials=[{name:'Post Cap Special',qty:'2',unit:'ea',id:4}]`);
  const visibleAmount=await state(page,`computePricing().matLines.find(line=>line.source==='manual').clientExt.toFixed(2)`);
  const pdf=await exportEstimateAndRead(page,'manual-material-visible');
  expect(pdf.pageErrors).toEqual([]);
  expect(pdf.strings).toContain('Post Cap Special');
  expect(pdf.strings).toContain('2 ea');
  expect(pdf.strings).toContain(`$${visibleAmount}`);
});

test('R18 negative manual quantity is rejected at UI entry',async({page})=>{
  await cleanOpen(page);
  await page.locator('[data-tab="materials"]').click();
  await page.locator('#mat-name').fill('Post Cap');
  await page.locator('#mat-qty').fill('-2');
  await page.locator('#mat-unit').selectOption('ea');
  await page.locator('#btn-add-mat').click();
  await expect(page.locator('#app-toast')).toContainText('Quantity cannot be negative');
  expect(await state(page,'S.materials.length')).toBe(0);
});

test('R18a loaded negative manual quantity remains a zero-price backstop',async({page})=>{
  await cleanOpen(page);
  await seedRun(page,'Loaded Negative Quantity');
  const observed=await state(page,`(()=>{
    const loaded=JSON.parse(JSON.stringify(snapshotState()));
    loaded.materials=[{name:'Post Cap',qty:'-3',unit:'ea',id:5}];
    applyState(loaded);
    const pricing=computePricing(),manual=pricing.matLines.find(line=>line.source==='manual');
    return{qty:manual.qty,ext:manual.ext,
      totals:[pricing.matCost,pricing.matPrice,pricing.clientSubtotal,pricing.clientTotal,pricing.marginPct]};
  })()`);
  expect(observed.qty).toBe(0);
  expect(observed.ext).toBe(0);
  expect(observed.totals.every(Number.isFinite)).toBe(true);
});

const estimateErrorCases=[
  ['NO_FENCE_RUNS',`S.elements=[]`],
  ['PROJECT_NAME',`S.projectName='Untitled Job'`],
  ['CUSTOMER_NAME',`S.jobCustomer=''`],
  ['JOB_ADDRESS',`S.jobAddress=''`],
  ['RUN_ID_MISSING',`delete S.elements[0].runId`],
  ['RUN_ID_DUPLICATE',`S.elements.push({...S.elements[0],start:{x:0,y:400},end:{x:400,y:400},specs:cloneRunSpecs(S.elements[0].specs)})`],
  ['FENCE_TYPE',`S.elements[0].fenceType='unknown-style'`],
  ['RUN_LENGTH',`S.elements[0].end={...S.elements[0].start}`],
  ['HEIGHT',`S.elements[0].specs.heightIn=0`],
  ['POST_HEIGHT',`S.elements[0].specs.postHeightIn=0`],
  ['EMBEDMENT',`S.elements[0].specs.embedDepthIn=-1`],
  ['POST_SPACING',`S.elements[0].postSpacing=0;S.elements[0].autoPostSpacing=0`],
  ['ORPHAN_GATE',`S.elements.push({type:'gate',start:{x:0,y:0},end:{x:160,y:0},runId:'missing-run',gateType:'walk',fenceType:'chainlink',specs:cloneRunSpecs(S.elements[0].specs)})`],
  ['GATE_TYPE',`S.elements.push({type:'gate',start:{x:0,y:0},end:{x:160,y:0},runId:S.elements[0].runId,gateType:'unknown-gate',fenceType:'chainlink',specs:cloneRunSpecs(S.elements[0].specs)})`],
  ['GATE_WIDTH',`S.elements.push({type:'gate',start:{x:0,y:0},end:{x:0,y:0},runId:S.elements[0].runId,gateType:'walk',fenceType:'chainlink',specs:cloneRunSpecs(S.elements[0].specs)})`],
  ['NO_BOM',`S.elements=[]`],
  ['MISSING_COST',`Object.keys(COST_DB).forEach(k=>delete COST_DB[k])`],
  ['ZERO_COST',`Object.values(COST_DB).forEach(v=>v.cost=0)`],
  ['TOTAL_INVALID',`MARKUP.materialPct=-100;MARKUP.laborPct=-100`],
];

for(const [code,mutation] of estimateErrorCases){
  test(`F2 estimate remains renderable for ${code}`,async({page})=>{
    await cleanOpen(page);
    await seedEstimateState(page);
    await state(page,mutation);
    const errors=await state(page,'validateProject().errors.map(item=>item.code)');
    expect(errors).toContain(code);
    const pdf=await exportEstimateAndRead(page,code.toLowerCase());
    expect(pdf.pageErrors,`${code} threw while exporting`).toEqual([]);
    expect(pdf.strings).not.toMatch(/NaN|undefined/);
    expect(pdf.strings).toContain('ESTIMATE TOTAL');
    expect(pdf.strings).toMatch(/ESTIMATE TOTAL[\s\S]*\$[0-9]/);
  });
}

test('F3 warning caps customer-facing details and estimate remains one page',async({page})=>{
  await cleanOpen(page);
  await seedEstimateState(page);
  await state(page,`(()=>{
    S.projectName='Untitled Job';S.jobCustomer='';S.jobAddress='';
    const run=S.elements[0];delete run.runId;run.fenceType='unknown-style';
    run.end={...run.start};run.specs.heightIn=0;run.specs.postHeightIn=0;
    run.specs.embedDepthIn=-1;run.postSpacing=0;run.autoPostSpacing=0;
  })()`);
  const warning=await state(page,'projectExportWarning(validateProject())');
  expect(warning.unverified).toHaveLength(5);
  expect(warning.unverified[4]).toMatch(/^And \d+ more items? need review\.$/);
  expect(warning.unverified.join(' ')).not.toMatch(/run ID|unknown-style|ADDON_STATE|PRICING_RUNTIME/);
  const pdf=await exportEstimateAndRead(page,'warning-cap');
  const pageObjects=(pdf.bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
  expect(pageObjects).toBe(1);
});

test('F4 plan warning occupies reserved space above the drawing',async({page})=>{
  await cleanOpen(page);
  await page.waitForFunction(()=>!!window.jspdf,null,{timeout:20_000});
  await state(page,`(()=>{
    window.__planExportGeometry={};
    const originalWarning=drawPdfValidationWarning;
    drawPdfValidationWarning=function(doc,validation,x,y,width){
      const height=originalWarning(doc,validation,x,y,width);
      window.__planExportGeometry.warning={x,y,width,height};return height;
    };
    const originalAddImage=window.jspdf.jsPDF.API.addImage;
    window.jspdf.jsPDF.API.addImage=function(data,format,x,y,width,height){
      window.__planExportGeometry.drawing={x,y,width,height};
      return originalAddImage.apply(this,arguments);
    };
  })()`);
  const downloadPromise=page.waitForEvent('download',{timeout:10_000});
  await state(page,'exportPDF()');
  await downloadPromise;
  const geometry=await state(page,'window.__planExportGeometry');
  expect(geometry.warning.height).toBeGreaterThan(0);
  expect(geometry.warning.y+geometry.warning.height).toBeLessThanOrEqual(geometry.drawing.y);
});

for(const malformed of [
  {name:'null start',mutate:run=>{run.start=null;}},
  {name:'constructor fence type',mutate:run=>{run.fenceType='constructor';}},
  {name:'toString fence type',mutate:run=>{run.fenceType='toString';}},
]){
  test(`R9 all exports survive imported ${malformed.name}`,async({page})=>{
    await cleanOpen(page);
    await page.waitForFunction(()=>!!window.jspdf,null,{timeout:20_000});
    await importMalformedProject(page,malformed.mutate);

    const estimate=await exportEstimateAndRead(page,`r9-${malformed.name.replace(/\s+/g,'-')}`);
    expect(estimate.pageErrors).toEqual([]);
    expect(estimate.strings).toContain('NOT FULLY VERIFIED');
    expect(estimate.strings).toContain('Pricing could not be calculated');
    expect(estimate.strings).toContain('NOT CALCULATED');
    expect(estimate.strings).not.toMatch(/NaN|undefined/);

    if(await page.locator('#validation-overlay').isVisible())await page.locator('#validation-close').click();
    const planPromise=page.waitForEvent('download',{timeout:10_000});
    await state(page,'exportPDF()');
    const plan=await planPromise;
    const planPath=path.join(os.tmpdir(),`fencebound-r9-plan-${Date.now()}.pdf`);
    await plan.saveAs(planPath);
    const planStrings=execFileSync('/usr/bin/strings',[planPath],{encoding:'utf8'});
    expect(planStrings).toContain('NOT FULLY VERIFIED');
    expect(planStrings).toContain('Pricing could not be calculated');
    expect(planStrings).not.toMatch(/NaN|undefined/);

    if(await page.locator('#validation-overlay').isVisible())await page.locator('#validation-close').click();
    await page.locator('#btn-jobs').click();
    const portablePromise=page.waitForEvent('download',{timeout:10_000});
    await page.locator('#do-export').click();
    const portableDownload=await portablePromise;
    const portablePath=path.join(os.tmpdir(),`fencebound-r9-portable-${Date.now()}.json`);
    await portableDownload.saveAs(portablePath);
    const exported=JSON.parse(fs.readFileSync(portablePath,'utf8'));
    expect(exported.exportWarning.unverified.join(' ')).toContain('Pricing could not be calculated');
    expect(exported.exportWarning.unverified.join(' ')).toContain('materials, labor, and the estimate total were not priced');
    expect(JSON.stringify(exported)).not.toMatch(/NaN|undefined/);
  });
}
