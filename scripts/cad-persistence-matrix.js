const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');

const URL = 'http://127.0.0.1:8091/index.html';
const RATE_KEY = 'chain link fabric';

const clone = value => JSON.parse(JSON.stringify(value));
const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('matrix HTTP server did not start');
}

async function run() {
  const server = spawn('python3', ['-m', 'http.server', '8091', '--bind', '127.0.0.1'], {
    stdio: 'ignore',
  });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ acceptDownloads: true });
    const evaluate = expression => page.evaluate(source => window.eval(source), expression);
    await page.goto(URL);
    await evaluate('localStorage.clear()');
    await page.reload();

    await evaluate(`(()=>{
      const run=(id,type,y,feet,height=72,spacing=8)=>({
        type:'fence',start:{x:0,y:y*40},end:{x:feet*40,y:y*40},
        fenceType:type,runId:id,postSpacing:spacing,autoPostSpacing:spacing,
        specs:cloneRunSpecs({...S.specs,heightIn:height,addons:new Set()})
      });
      const runs=[
        run('matrix-chain','chainlink',0,60,72,10),
        run('matrix-wood','woodprivacy',12,40,72,8),
        run('matrix-vinyl','vinylprivacy6',24,30,72,8),
        run('matrix-ornamental','ornamental',36,25,48,6)
      ];
      runs[0].specs.addons=new Set(['top-wire','barbed-wire']);
      const gate=(id,owner,type,y,feet)=>({
        type:'gate',start:{x:4*40,y:y*40},end:{x:(4+feet)*40,y:y*40},
        runId:owner.runId,fenceType:owner.fenceType,gateType:type,
        specs:cloneRunSpecs(owner.specs)
      });
      S.elements=[...runs,gate('gate-walk',runs[0],'walk',0,4),gate('gate-drive',runs[1],'doubledrive',12,16)];
      S.labels=[{text:'Matrix label',x:40,y:40,size:14,color:'#fff'}];
      S.materials=[{name:'Post Cap',qty:3,unit:'ea'}];
      S.projectName='Persistence Matrix Mixed System';
      S.jobCustomer='Matrix Customer';S.jobAddress='100 Matrix Lane';S.jobNotes='matrix';
      migrateRunOwnership();draw();updatePanel();updateMatList();
    })()`);
    const baseline = await evaluate('JSON.parse(JSON.stringify(snapshotState()))');
    const baselineCompany = clone(baseline.costs);

    const restore = async () => {
      await evaluate(`(()=>{
        applyState(${JSON.stringify(baseline)});
        S.savedJobs=[];S.history=[];S.future=[];
        COST_DB=${JSON.stringify(baseline.costs)};
        LABOR=${JSON.stringify(baseline.labor)};
        MARKUP=${JSON.stringify(baseline.markup)};
        _pricingFromLoadedProject=false;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(AUTOSAVE_KEY);
        saveCostDB();
        draw();updatePanel();updateMatList();updateDrawers();
      })()`);
    };
    const projectRecord = async () => evaluate(`(()=>{
      const snap=JSON.parse(JSON.stringify(snapshotState()));
      const validation=validateProject();
      return {
        elements:snap.elements,labels:snap.labels,materials:snap.materials,specs:snap.specs,
        metadata:[snap.projectName,snap.jobCustomer,snap.jobAddress,snap.jobNotes],
        validation:{errors:validation.errors.map(x=>x.code),warnings:validation.warnings.map(x=>x.code)},
        bom:calcAutoMaterials().map(x=>[x.name,x.qty,x.unit]),
        totalFootage:getStats().totalFt,
        pricingTotal:computePricing().clientTotal
      };
    })()`);
    const baselineRecord = await projectRecord();
    const sameProject = record => JSON.stringify(record) === JSON.stringify(baselineRecord);
    const saveJob = async () => {
      await page.locator('#btn-jobs').click();
      await page.locator('#do-save').click();
      await page.locator('#close-jobs').click();
    };
    const loadJob = async (index = 0) => {
      await page.locator('#btn-jobs').click();
      await page.locator(`[data-ji="${index}"]`).click();
    };
    const results = [];

    await restore();
    await saveJob(); await loadJob();
    let record = await projectRecord();
    invariant(sameProject(record), 'route 1 project changed');
    results.push({ route: 1, name: 'internal Save → Load', status: 'pass', differences: [] });

    await restore();
    await saveJob(); await loadJob();
    await evaluate(`S.elements.push({...S.elements[0],runId:'matrix-extra',start:{x:0,y:2000},end:{x:400,y:2000},specs:cloneRunSpecs(S.elements[0].specs)})`);
    await loadJob();
    record = await projectRecord();
    invariant(sameProject(record), 'route 2 re-load retained live edit');
    results.push({ route: 2, name: 'Save → Load → edit → Load', status: 'pass', differences: [{ classification: 'changed', detail: 'unsaved extra run discarded as expected' }] });

    await restore();
    await saveJob();
    await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost=444;_pricingFromLoadedProject=false;saveCostDB()`);
    await loadJob();
    invariant((await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost`)) === baselineCompany[RATE_KEY].cost, 'route 3 job pricing not restored');
    invariant((await evaluate(`JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost`)) === 444, 'route 3 company card changed by load');
    results.push({ route: 3, name: 'Save → cost edit → Load', status: 'pass', differences: [{ classification: 'changed', detail: 'company card deliberately changed to 444; loaded project retained quoted price' }] });

    await restore();
    await saveJob();
    await evaluate(`reloadSavedCostDB();COST_DB[${JSON.stringify(RATE_KEY)}].cost=222;saveCostDB()`);
    await loadJob();
    await evaluate('openCostEditor()');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#ce-mat-markup').fill('41');
    await page.locator('#ce-save').click();
    invariant((await evaluate(`JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost`)) === 222, 'route 4 company card overwritten');
    results.push({ route: 4, name: 'old job → editor save → company card', status: 'pass', differences: [{ classification: 'changed', detail: 'save canceled by explicit provenance warning; company card remained 222' }] });

    await restore();
    await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost=222;saveCostDB();
      const old=${JSON.stringify(baseline)};old.costs[${JSON.stringify(RATE_KEY)}].cost=111;applyState(old);saveSession()`);
    await page.reload();
    invariant((await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost`)) === 111, 'route 5 project pricing not restored');
    invariant((await evaluate(`JSON.parse(localStorage.getItem(COSTDB_KEY)).costs[${JSON.stringify(RATE_KEY)}].cost`)) === 222, 'route 5 company card overwritten');
    results.push({ route: 5, name: 'old job → autosave → reload', status: 'pass', differences: [{ classification: 'changed', detail: 'live project price 111 restored; company card remained 222' }] });

    await restore();
    await saveJob();
    await evaluate(`S.labels.push({text:'overwrite edit',x:2,y:2,size:14,color:'#fff'})`);
    await saveJob();
    invariant((await evaluate('S.savedJobs.length')) === 1, 'route 6 created duplicate name');
    invariant((await evaluate(`S.savedJobs[0].labels.some(x=>x.text==='overwrite edit')`)), 'route 6 omitted overwrite edit');
    results.push({ route: 6, name: 'overwrite/resave by project name', status: 'pass', differences: [{ classification: 'changed', detail: 'single record replaced with edited snapshot; no duplicate' }] });

    await restore();
    await saveJob();
    await page.locator('#btn-jobs').click();
    await page.locator('[data-jdel="0"]').click();
    invariant((await evaluate('S.savedJobs.length')) === 0, 'route 7 memory delete failed');
    invariant(JSON.parse(await evaluate(`localStorage.getItem(STORAGE_KEY)`)).length === 0, 'route 7 durable delete failed');
    results.push({ route: 7, name: 'internal delete', status: 'pass', differences: [{ classification: 'changed', detail: 'selected saved record removed from memory and storage' }] });

    await restore();
    const portable = await evaluate('JSON.stringify(snapshotState())');
    await evaluate(`applyState(JSON.parse(${JSON.stringify(portable)}))`);
    record = await projectRecord();
    invariant(sameProject(record), 'route 8 portable round trip changed project');
    results.push({ route: 8, name: 'portable Export → clean Import', status: 'pass', differences: [] });

    await restore();
    await evaluate('saveSession()');
    await page.reload();
    record = await projectRecord();
    invariant(sameProject(record), 'route 9 autosave refresh changed project');
    results.push({ route: 9, name: 'autosave → refresh', status: 'pass', differences: [] });

    await restore();
    await evaluate(`(()=>{
      const legacy=${JSON.stringify(baseline)};
      legacy.schemaVersion=1;
      legacy.elements.forEach(el=>{delete el.runId;if(el.specs)el.specs.addons=['top-wire','barbed-wire'];});
      applyState(JSON.parse(JSON.stringify(legacy)));
    })()`);
    const migrated = await evaluate(`({
      runIds:S.elements.filter(x=>x.type==='fence').every(x=>!!x.runId),
      gateOwners:S.elements.filter(x=>x.type==='gate').every(x=>!!x.runId&&!!fenceRunById(x.runId)),
      addons:S.elements.filter(x=>x.type==='fence').every(x=>x.specs.addons instanceof Set)
    })`);
    invariant(migrated.runIds && migrated.gateOwners && migrated.addons, 'route 10 migration incomplete');
    results.push({ route: 10, name: 'legacy schema/run/gate migration', status: 'pass', differences: [{ classification: 'changed', detail: 'missing run IDs and gate ownership migrated; add-ons hydrated to Set' }] });

    await restore();
    await saveJob(); await loadJob();
    const bomBefore = await evaluate(`JSON.stringify(calcAutoMaterials())`);
    await evaluate(`pushHistory();S.labels.push({text:'undo action',x:2,y:2,size:14,color:'#fff'});doUndo();doRedo();doUndo()`);
    invariant(await evaluate(`S.elements[0].specs.addons instanceof Set&&S.elements[0].specs.addons.has('top-wire')&&S.elements[0].specs.addons.has('barbed-wire')`), 'route 11 add-ons lost');
    invariant((await evaluate(`JSON.stringify(calcAutoMaterials())`)) === bomBefore, 'route 11 BOM changed');
    results.push({ route: 11, name: 'undo/redo before and after load', status: 'pass', differences: [] });

    await restore();
    await evaluate('openCostEditor()');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#ce-export').click();
    const download = await downloadPromise;
    const pricePath = await download.path();
    await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost=999;_pricingFromLoadedProject=false;saveCostDB()`);
    await page.locator('#ce-import-file').setInputFiles(pricePath);
    await page.waitForFunction(key => window.eval(`COST_DB[${JSON.stringify(key)}].cost`) !== 999, RATE_KEY);
    invariant((await evaluate(`COST_DB[${JSON.stringify(RATE_KEY)}].cost`)) === baselineCompany[RATE_KEY].cost, 'route 12 price import mismatch');
    results.push({ route: 12, name: 'cost-editor Export → Import', status: 'pass', differences: [{ classification: 'changed', detail: 'temporary 999 edit replaced by exported rate-card value' }] });

    console.log(JSON.stringify({
      fixture: { systems: 4, gates: 2, labels: 1, manualMaterials: 1, runAddons: 2 },
      compared: ['full snapshot', 'reference identity', 'validation codes', 'BOM rows', 'total footage', 'pricing total', 'company rate card'],
      results,
    }, null, 2));
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
