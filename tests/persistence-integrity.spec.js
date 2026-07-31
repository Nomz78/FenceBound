const { test, expect } = require('@playwright/test');

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
  await state(page, `COST_DB[${JSON.stringify(RATE_KEY)}].cost=222;MARKUP.materialPct=42;saveCostDB()`);
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
