const { test, expect } = require('@playwright/test');

// Estimator audit 2026-10-15, Step 1.4 "Job-state isolation": one test per
// repaired item (pricing F5/F6, CAD-01, CAD-12, CAD-13, inventory F-6).

const COSTDB_KEY = 'fencebound_costdb_v1';
const UC_IDS = ['uc-demo', 'uc-slope', 'uc-urban', 'uc-harddig'];

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  page.on('dialog', dialog => dialog.accept());
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// One chain-link run of `lengthFt` drawn through production handleUp.
async function drawRun(page, y, lengthFt) {
  await state(page, `(()=>{S.tool='fence';S.drawing={type:'fence',start:{x:0,y:${y}*GRID_FT},end:{x:${lengthFt}*GRID_FT,y:${y}*GRID_FT}};
    handleUp({preventDefault(){},stopPropagation(){}});draw();updatePanel();})()`);
}

async function setJob(page, name, customer) {
  await state(page, `(()=>{S.projectName=${JSON.stringify(name)};S.jobCustomer=${JSON.stringify(customer)};syncSpecInputs();})()`);
}

async function openJobs(page) {
  if (!(await state(page, 'S.showJobs'))) await page.locator('#btn-jobs').click();
  await expect(page.locator('#do-save')).toBeVisible();
}

async function saveJob(page) {
  await openJobs(page);
  await page.locator('#do-save').click();
}

async function loadJob(page, name) {
  await openJobs(page);
  const idx = await state(page, `S.savedJobs.findIndex(j=>j.name===${JSON.stringify(name)})`);
  expect(idx, `saved job ${name}`).toBeGreaterThanOrEqual(0);
  await page.locator(`[data-ji="${idx}"]`).click();
}

async function clearCanvas(page) {
  await page.locator('#btn-clear').click();
}

async function pricingInputs(page) {
  return state(page, `({uc:${JSON.stringify(UC_IDS)}.map(id=>document.getElementById(id).checked),hours:document.getElementById('labor-hours').value})`);
}

test('1 per-job upcharges and hours override are saved with the job, restored on load, and reset by Clear', async ({ page }) => {
  await cleanOpen(page);
  await setJob(page, 'Job B', 'Bob');
  await drawRun(page, 2, 50);
  await saveJob(page);

  await clearCanvas(page);
  await setJob(page, 'Job A', 'Alice');
  await drawRun(page, 2, 100);
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#uc-demo').check();
  await page.locator('#uc-urban').check();
  await page.locator('#labor-hours').fill('12');
  const quotedA = await state(page, 'computePricing().clientTotal');
  await saveJob(page);

  await clearCanvas(page);
  expect(await pricingInputs(page)).toEqual({ uc: [false, false, false, false], hours: '' });

  await loadJob(page, 'Job A');
  expect(await pricingInputs(page)).toEqual({ uc: [true, false, true, false], hours: '12' });
  expect(await state(page, 'computePricing().clientTotal')).toBe(quotedA);

  await loadJob(page, 'Job B');
  expect(await pricingInputs(page)).toEqual({ uc: [false, false, false, false], hours: '' });
});

test('2 Clear after viewing a loaded job returns to the company rate card without writing it', async ({ page }) => {
  await cleanOpen(page);
  // A saved company rate card that differs from the shipped defaults.
  await state(page, `localStorage.setItem('${COSTDB_KEY}',JSON.stringify({costs:{'chain link fabric':{cost:3.33,unit:'lf'}},markup:{materialPct:40,laborPct:40}}))`);
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  const companyCard = await state(page, `localStorage.getItem('${COSTDB_KEY}')`);
  await drawRun(page, 2, 100);
  const companyTotal = await state(page, 'computePricing().clientTotal');

  // A saved job carrying its own (cheaper) prices.
  await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));
    Object.keys(st.costs).forEach(k=>{st.costs[k]={...st.costs[k],cost:+(st.costs[k].cost/2).toFixed(2)};});
    st.markup={...st.markup,materialPct:10,laborPct:10};
    S.savedJobs=[{...st,id:1,name:'Old Job',projectName:'Old Job',savedAt:'then'}];
    localStorage.setItem(STORAGE_KEY,JSON.stringify(S.savedJobs));})()`);
  await clearCanvas(page);
  await loadJob(page, 'Old Job');
  expect(await state(page, '_pricingFromLoadedProject')).toBe(true);
  expect(await state(page, 'computePricing().clientTotal')).not.toBe(companyTotal);

  await clearCanvas(page);
  await drawRun(page, 2, 100);
  expect(await state(page, '_pricingFromLoadedProject')).toBe(false);
  expect(await state(page, 'computePricing().clientTotal')).toBe(companyTotal);
  expect(await state(page, `localStorage.getItem('${COSTDB_KEY}')`)).toBe(companyCard);
});

test('3 loading a job clears undo history, so Undo cannot produce a mixed job that Save writes over another', async ({ page }) => {
  await cleanOpen(page);
  await setJob(page, 'Job A', 'Alice');
  await drawRun(page, 2, 20);
  await saveJob(page);
  await clearCanvas(page);
  await setJob(page, 'Job B', 'Bob');
  await drawRun(page, 2, 30);
  await drawRun(page, 6, 30);
  await saveJob(page);

  await loadJob(page, 'Job A');
  expect(await state(page, 'S.history.length+S.future.length')).toBe(0);
  await expect(page.locator('#btn-undo')).toBeDisabled();
  await state(page, 'doUndo()');
  expect(await state(page, `({name:S.projectName,cust:S.jobCustomer,runs:S.elements.filter(e=>e.type==='fence').length})`))
    .toEqual({ name: 'Job A', cust: 'Alice', runs: 1 });

  await saveJob(page);
  const runsByName = await state(page, `Object.fromEntries(S.savedJobs.map(j=>[j.name,j.elements.filter(e=>e.type==='fence').length]))`);
  expect(runsByName).toEqual({ 'Job A': 1, 'Job B': 2 });
});

test('4 Escape during a Move drag restores the run exactly, add-ons included', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `S.zoom=1;S.pan={x:80,y:80};draw()`);
  await drawRun(page, 2, 10);
  await state(page, `(()=>{const run=S.elements.find(e=>e.type==='fence');run.specs.addons=new Set(['bottom-wire','barbed-wire']);draw();updatePanel();})()`);
  const before = await state(page, 'JSON.stringify(snapshotDoc())');
  const bomBefore = await state(page, 'calcAutoMaterials().map(i=>i.name+":"+i.qty)');

  await page.locator('[data-tool="move"]').click();
  const box = await page.locator('#canvas').boundingBox();
  const at = async (fx, fy) => {
    const st = await state(page, '({x:S.pan.x,y:S.pan.y,z:S.zoom})');
    return { x: box.x + st.x + fx * 40 * st.z, y: box.y + st.y + fy * 40 * st.z };
  };
  const a = await at(5, 2), b = await at(8, 5);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 6 });
  expect(await state(page, 'S.moving&&S.moving.type')).toBe('body');
  await page.keyboard.press('Escape');
  await page.mouse.up();

  expect(await state(page, 'JSON.stringify(snapshotDoc())')).toBe(before);
  expect(await state(page, `[...S.elements.find(e=>e.type==='fence').specs.addons]`)).toEqual(['bottom-wire', 'barbed-wire']);
  expect(await state(page, 'calcAutoMaterials().map(i=>i.name+":"+i.qty)')).toEqual(bomBefore);
});

test('5 switching fence type and back leaves the specs for later runs unchanged', async ({ page }) => {
  await cleanOpen(page);
  const before = await state(page, 'JSON.stringify(serializeRunSpecs(S.specs))');
  expect(await state(page, 'S.specs.hasTopRail&&S.specs.addons.has("bottom-wire")')).toBe(true);
  for (const other of ['ornamental', 'woodprivacy']) {
    // selectFenceType is the single switch behind the type bar, presets and picker.
    await state(page, `selectFenceType('${other}')`);
    expect(await state(page, 'S.fenceType')).toBe(other);
    await state(page, `selectFenceType('chainlink')`);
    expect(await state(page, 'S.fenceType')).toBe('chainlink');
    expect(await state(page, 'JSON.stringify(serializeRunSpecs(S.specs))'), `round trip via ${other}`).toBe(before);
  }
  await drawRun(page, 2, 50);
  const names = await state(page, 'calcAutoMaterials().map(i=>i.name)');
  expect(names).toContain('Top Rail 1-5/8"');
  expect(names).toContain('Bottom Tension Wire 9ga');
});

test('6 saving a new job under an existing name does not overwrite the saved job', async ({ page }) => {
  await cleanOpen(page);
  expect(await state(page, 'S.projectName')).toBe('Untitled Job');
  await drawRun(page, 2, 20);
  await saveJob(page);
  await clearCanvas(page);
  await drawRun(page, 2, 35);
  await saveJob(page);
  expect(await state(page, 'S.savedJobs.map(j=>j.name).sort()')).toEqual(['Untitled Job', 'Untitled Job (2)']);
  expect(await state(page, 'S.projectName')).toBe('Untitled Job (2)');
  await expect(page.locator('#job-name-display')).toHaveText('Untitled Job (2)');
  const lengths = await state(page, `Object.fromEntries(S.savedJobs.map(j=>[j.name,j.elements.filter(e=>e.type==='fence').map(e=>Math.round(Math.hypot(e.end.x-e.start.x,e.end.y-e.start.y)/GRID_FT))]))`);
  expect(lengths).toEqual({ 'Untitled Job': [20], 'Untitled Job (2)': [35] });

  // Re-saving the job that is open updates it in place.
  await drawRun(page, 6, 5);
  await saveJob(page);
  expect(await state(page, 'S.savedJobs.length')).toBe(2);
  expect(await state(page, `S.savedJobs.find(j=>j.name==='Untitled Job (2)').elements.filter(e=>e.type==='fence').length`)).toBe(2);
});

test('7 a job saved before job ids existed keeps its identity: load then Save updates it in place', async ({ page }) => {
  await cleanOpen(page);
  await setJob(page, 'Legacy Job', 'Lee');
  await drawRun(page, 2, 25);
  // A record as written before ef58957: no `id`, no `jobId`.
  await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));delete st.jobId;
    localStorage.setItem(STORAGE_KEY,JSON.stringify([{...st,name:'Legacy Job',savedAt:'then'}]));})()`);
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  await loadJob(page, 'Legacy Job');
  await drawRun(page, 6, 10);
  await saveJob(page);
  const saved = await state(page, `S.savedJobs.map(j=>({name:j.name,runs:j.elements.filter(e=>e.type==='fence').length,hasId:j.id!=null}))`);
  expect(saved).toEqual([{ name: 'Legacy Job', runs: 2, hasId: true }]);
  expect(await state(page, `JSON.parse(localStorage.getItem(STORAGE_KEY)).map(j=>j.name)`)).toEqual(['Legacy Job']);
});

test('8 Clear starts a clean job, and Undo of Clear cannot let Save overwrite the old job', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{S.projectName='Job A';S.jobCustomer='Alice';S.jobAddress='1 A St';S.jobNotes='gate code 12';
    S.materials=[{name:'Special Post Cap',qty:4,unit:'ea'}];syncSpecInputs();updateMatList();})()`);
  await drawRun(page, 2, 20);
  await saveJob(page);
  const storedA = await state(page, `JSON.stringify(S.savedJobs.find(j=>j.name==='Job A'))`);

  await clearCanvas(page);
  expect(await state(page, `({n:S.projectName,c:S.jobCustomer,a:S.jobAddress,o:S.jobNotes,m:S.materials.length,e:S.elements.length})`))
    .toEqual({ n: 'Untitled Job', c: '', a: '', o: '', m: 0, e: 0 });
  await expect(page.locator('#job-name-display')).toHaveText('Untitled Job');

  await state(page, 'doUndo()');
  expect(await state(page, `S.elements.filter(e=>e.type==='fence').length`)).toBe(1);
  await saveJob(page);
  expect(await state(page, `JSON.stringify(S.savedJobs.find(j=>j.name==='Job A'))`)).toBe(storedA);
  expect(await state(page, 'S.savedJobs.length')).toBe(2);
});
