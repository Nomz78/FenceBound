const { test, expect } = require('@playwright/test');

// Field Truth Lab: a cross-system agreement harness for FenceBound.
//
// The lab does not invent field quantities. It runs saved job fixtures through
// the same runtime seams a contractor quote uses — drawing stats, takeoff/BOM,
// pricing, validation, customer-document lines, and save/load persistence —
// and fails when those views stop agreeing with each other.
//
// Inventory/pricing purpose: every BOM line must resolve to an exact rate-card
// key, order quantities must respect contractor pack sizes, and money must stay
// in exact integer cents from line extensions through the client total.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

const LAB_REPORT_SOURCE = `(()=>{
  const checks=[];
  const add=(id,ok,detail)=>checks.push({id,ok:!!ok,detail:String(detail)});
  const near=(a,b,tol=1e-6)=>Math.abs(a-b)<=tol;
  const sum=(rows,fn)=>rows.reduce((total,row)=>total+fn(row),0);
  const aggregate=(rows,keyFn,qtyFn)=>{
    const out={};
    rows.forEach(row=>{const k=keyFn(row);out[k]=(out[k]||0)+qtyFn(row);});
    return out;
  };
  const sameMap=(a,b)=>{
    const keys=new Set([...Object.keys(a),...Object.keys(b)]);
    return [...keys].every(k=>near(a[k]||0,b[k]||0,1e-6));
  };

  const stats=getStats();
  const bom=calcAutoMaterials();
  const P=computePricing();
  const V=validateProject({requireClient:false});
  const runs=S.elements.filter(el=>el.type==='fence');
  const autoPosts=S.elements.filter(el=>el.type==='post'&&el.auto);
  const runRows=Object.values(stats.byRunId||{});
  const grossFromRuns=sum(runs,run=>dist(run.start,run.end)/GRID_FT);
  const openings=sum(runRows,row=>row.gateOpeningFt||0);
  const netFromSections=sum(runRows,row=>sum(row.sectionFt||[],ft=>ft));

  add('gross-footage',near(stats.totalFt,grossFromRuns),stats.totalFt+' vs '+grossFromRuns);
  add('net-footage',near(stats.netTotalFt,grossFromRuns-openings)&&near(stats.netTotalFt,netFromSections),
    stats.netTotalFt+' vs '+(grossFromRuns-openings)+' / '+netFromSections);
  add('run-sections',runRows.every(row=>near(sum(row.sectionFt||[],ft=>ft),row.netFt)&&row.sections===(row.sectionFt||[]).length&&row.terminationEnds===row.terminalEndCt+row.cornerEndCt+row.gateEndCt),
    JSON.stringify(runRows.map(row=>[row.runId,row.netFt,row.sectionFt,row.terminationEnds])));

  const autoKeys=autoPosts.map(post=>post.runId+'|'+ptKey(post.pos));
  add('post-ownership',autoPosts.every(post=>stats.byRunId[post.runId])&&new Set(autoKeys).size===autoKeys.length&&stats.linePosts===autoPosts.length,
    'linePosts '+stats.linePosts+' autoPosts '+autoPosts.length+' unique '+new Set(autoKeys).size);

  const bomByLine=aggregate(bom,row=>row.name+'|'+row.unit,row=>Number(row.qty||0));
  const pricedByLine=aggregate(P.matLines.filter(line=>line.source!=='manual'),line=>line.name+'|'+line.unit,line=>Number(line.qty||0));
  const unresolved=bom.filter(row=>typeof row.costKey!=='string'||!Object.prototype.hasOwnProperty.call(COST_DB,row.costKey));
  const unpriced=P.matLines.filter(line=>line.source!=='manual'&&Number(line.qty||0)>0&&(line.unitCost===null||line.unitCost===0));
  add('bom-pricing-coverage',sameMap(bomByLine,pricedByLine)&&unresolved.length===0&&unpriced.length===0,
    'unresolved '+JSON.stringify(unresolved.map(r=>r.name))+' unpriced '+JSON.stringify(unpriced.map(l=>l.name)));

  add('pricing-inputs',P.unknown.length===0&&P.invalidInputs.length===0&&P.unitMismatch.length===0&&P.unsupportedTypes.length===0,
    JSON.stringify({unknown:P.unknown,invalidInputs:P.invalidInputs,unitMismatch:P.unitMismatch,unsupportedTypes:P.unsupportedTypes}));

  const orderFailures=P.matLines.filter(line=>{
    if(line.source==='manual')return false;
    if(line.unitCost===null)return true;
    const pack=line.pack||1,order=line.order,pricedQty=line.pricedQty;
    if(!Number.isFinite(order)||!Number.isFinite(pricedQty)||pack<1||order<Number(line.qty||0)-1e-9)return true;
    const packs=order/pack;
    if(Math.abs(packs-Math.round(packs))>1e-6)return true;
    return line.pricedUnit===line.unit?!near(pricedQty,order,1e-6):!near(pricedQty*pack,order,1e-6);
  });
  add('order-quantities',orderFailures.length===0,JSON.stringify(orderFailures.map(l=>[l.name,l.qty,l.pack,l.order,l.pricedQty,l.pricedUnit])));

  const lineExtC=sum(P.matLines,line=>line.extC||0);
  const sectionC=sum(Object.values(P.sectionCents||{}),c=>c);
  const manualClientC=sum(P.matLines.filter(line=>line.source==='manual'),line=>line.clientExtC||0);
  const customer=customerDocumentLines(P,stats);
  const customerC=sum(customer.rows,row=>row.amountC||0);
  add('cents-ledger',Object.values(P.cents).every(Number.isInteger)
    &&P.cents.matCost===lineExtC
    &&P.cents.internalCost===P.cents.matCost+P.cents.laborCost
    &&P.cents.clientSubtotal===P.cents.matPrice+P.cents.laborPrice
    &&P.cents.clientTotal===P.cents.clientSubtotal+P.cents.urbanAdd
    &&P.cents.profit===P.cents.clientTotal-P.cents.internalCost
    &&sectionC+manualClientC===P.cents.clientSubtotal
    &&customerC===customer.totalC&&customer.totalC===P.cents.clientTotal,
    JSON.stringify({lineExtC,sectionC,manualClientC,customerC,cents:P.cents}));

  add('validation-agreement',P.isFinalReady===true&&V.errors.length===0&&stats.unownedGates===0,
    JSON.stringify({final:P.isFinalReady,errors:V.errors.map(e=>e.code),warnings:V.warnings.map(w=>w.code),unownedGates:stats.unownedGates}));

  const before={bom:bomByLine,cents:P.cents,totalFt:stats.totalFt,netTotalFt:stats.netTotalFt,linePosts:stats.linePosts,gatePosts:stats.gatePosts};
  const snapshot=JSON.parse(JSON.stringify(snapshotState()));
  applyState(snapshot);draw();updatePanel();
  const stats2=getStats(),bom2=calcAutoMaterials(),P2=computePricing();
  const after={bom:aggregate(bom2,row=>row.name+'|'+row.unit,row=>Number(row.qty||0)),cents:P2.cents,totalFt:stats2.totalFt,netTotalFt:stats2.netTotalFt,linePosts:stats2.linePosts,gatePosts:stats2.gatePosts};
  add('persistence-roundtrip',sameMap(before.bom,after.bom)&&JSON.stringify(before.cents)===JSON.stringify(after.cents)
    &&near(before.totalFt,after.totalFt)&&near(before.netTotalFt,after.netTotalFt)&&before.linePosts===after.linePosts&&before.gatePosts===after.gatePosts,
    JSON.stringify({before,after}));

  return {
    ok:checks.every(check=>check.ok),
    failures:checks.filter(check=>!check.ok).map(check=>check.id),
    checks,
    totals:{grossFt:stats.totalFt,netFt:stats.netTotalFt,linePosts:stats.linePosts,gatePosts:stats.gatePosts,matCostC:P.cents.matCost,clientTotalC:P.cents.clientTotal},
    validation:{errors:V.errors.map(e=>e.code),warnings:V.warnings.map(w=>w.code)}
  };
})()`;

async function labReport(page, scenario) {
  const report = await state(page, LAB_REPORT_SOURCE);
  return { scenario, ...report };
}

async function expectLabPass(page, scenario) {
  const report = await labReport(page, scenario);
  await test.info().attach(`${scenario}-field-truth-lab.json`, {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json'
  });
  expect(report.failures, JSON.stringify(report.checks, null, 2)).toEqual([]);
  expect(report.ok).toBe(true);
  return report;
}

const seedGatedRun = (type, extra = '') => `(()=>{
  S.elements=[];S.materials=[];S.selected=null;
  selectFenceType(${JSON.stringify(type)});
  const specs=cloneRunSpecs(S.specs);
  ${extra}
  const run={type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},fenceType:${JSON.stringify(type)},
    runId:'lab_run_'+${JSON.stringify(type)},specs,postSpacing:S.postSpacing,autoPostSpacing:S.postSpacing};
  S.elements=[run];
  [['walk',40,44],['doubledrive',70,82]].forEach(([gateType,a,b])=>
    S.elements.push(attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},run)));
  rebuildRunAutoPosts(run);
  draw();updatePanel();
  return null;
})()`;

async function seed168(page) {
  await state(page, `(()=>{
    const points=[{x:0,y:0},{x:0,y:56*GRID_FT},{x:56*GRID_FT,y:56*GRID_FT},{x:56*GRID_FT,y:0}];
    const specs=cloneRunSpecs(S.specs);
    Object.assign(specs,{heightIn:72,postHeightIn:102,embedDepthIn:30,
      postEmbedIn:{line:18,terminal:30,corner:30,gate:30},
      postEmbedDirty:{line:false,terminal:false,corner:false,gate:false},
      hasTopRail:true,hasMidRail:true,hasTrussRod:true,barbStrands:3,barbArm:'angled',
      addons:new Set(['bottom-wire','barbed-wire'])});
    const runs=points.slice(0,-1).map((start,index)=>({type:'fence',start,end:points[index+1],
      fenceType:'chainlink',runId:'lab-168-run-'+(index+1),specs:cloneRunSpecs(specs),postSpacing:10,autoPostSpacing:10}));
    const posts=runs.flatMap(run=>autoPostsForRun(run.start,run.end,10,'chainlink',run.runId,run.specs));
    const y=56*GRID_FT;
    const gates=[
      attachGateToRun({type:'gate',start:{x:5*GRID_FT,y},end:{x:9*GRID_FT,y},gateType:'walk',hinge:'start',swingDir:1},runs[1]),
      attachGateToRun({type:'gate',start:{x:15*GRID_FT,y},end:{x:27*GRID_FT,y},gateType:'doubledrive',hinge:'start',swingDir:1},runs[1])
    ];
    S.elements=[...runs,...posts,...gates];S.materials=[];
    draw();updatePanel();
    return null;
  })()`);
}

test('Field Truth Lab: gated chain-link drawing, BOM, price, validation, and save/load agree', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedGatedRun('chainlink'));
  const report = await expectLabPass(page, 'chainlink-gated-100lf');
  expect(report.totals).toMatchObject({ grossFt: 100, netFt: 84, gatePosts: 4 });
});

test('Field Truth Lab: mixed fence sections keep section prices tied to the client total', async ({ page }) => {
  await cleanOpen(page);
  await state(page, `(()=>{
    const cl=cloneRunSpecs(S.specs);
    Object.assign(cl,{heightIn:72,hasTopRail:true,hasMidRail:true,hasBottomRail:true,hasTrussRod:true});
    const wood=cloneRunSpecs(S.specs);
    Object.assign(wood,{heightIn:72,hasMidRail:true});wood.addons=new Set();
    const a={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},fenceType:'chainlink',runId:'lab_mixed_cl',specs:cl,postSpacing:10,autoPostSpacing:10};
    const b={type:'fence',start:{x:0,y:40*GRID_FT},end:{x:60*GRID_FT,y:40*GRID_FT},fenceType:'woodprivacy',runId:'lab_mixed_wood',specs:wood,postSpacing:8,autoPostSpacing:8};
    S.elements=[a,b];S.materials=[];
    S.elements.push(attachGateToRun({type:'gate',start:{x:20*GRID_FT,y:0},end:{x:24*GRID_FT,y:0},gateType:'walk',hinge:'start',swingDir:1},a));
    rebuildRunAutoPosts(a);rebuildRunAutoPosts(b);
    draw();updatePanel();
    return null;
  })()`);
  const report = await expectLabPass(page, 'mixed-chainlink-woodprivacy');
  expect(report.totals.grossFt).toBe(120);
  expect(report.totals.netFt).toBe(116);
});

test('Field Truth Lab: 168 LF house-terminated fixture stays internally consistent', async ({ page }) => {
  await cleanOpen(page);
  await seed168(page);
  const report = await expectLabPass(page, 'house-terminated-168lf');
  expect(report.totals).toMatchObject({ grossFt: 168, netFt: 152, gatePosts: 4 });
});

test('Field Truth Lab: contractor pack sizes price purchasable order quantities', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedGatedRun('cattlehog'));
  await state(page, `(()=>{COST_DB['hog wire welded panel']={...COST_DB['hog wire welded panel'],pack:16};if(!saveCostDB())throw new Error('save pack');})()`);
  const report = await expectLabPass(page, 'cattlehog-pack-16');
  const hog = await state(page, `(()=>{const l=computePricing().matLines.find(x=>x.name==='Hog Wire Welded Panel (red-top)');
    return {qty:l.qty,pack:l.pack,order:l.order,pricedQty:l.pricedQty,pricedUnit:l.pricedUnit,extC:l.extC};})()`);
  expect(report.ok).toBe(true);
  expect(hog).toMatchObject({ qty: 84, pack: 16, order: 112, pricedQty: 112, pricedUnit: 'lf' });
  expect(hog.extC).toBeGreaterThan(0);
});

test('Field Truth Lab negative control: a missing rate-card key blocks the quote', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedGatedRun('chainlink'));
  await state(page, `delete COST_DB['post concrete bag']`);
  const report = await labReport(page, 'missing-concrete-cost');
  expect(report.ok).toBe(false);
  expect(report.failures).toContain('bom-pricing-coverage');
  expect(report.failures).toContain('pricing-inputs');
  expect(report.failures).toContain('validation-agreement');
  expect(report.validation.errors).toContain('MISSING_COST');
});

test('Field Truth Lab negative control: an orphan gate is not deducted or priced', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedGatedRun('chainlink'));
  await state(page, `S.elements.push({type:'gate',start:{x:10*GRID_FT,y:30*GRID_FT},end:{x:14*GRID_FT,y:30*GRID_FT},gateType:'walk',hinge:'start',swingDir:1})`);
  const report = await labReport(page, 'orphan-gate');
  expect(report.ok).toBe(false);
  expect(report.failures).toContain('validation-agreement');
  expect(report.validation.errors).toContain('ORPHAN_GATE');
});

test('Field Truth Lab negative control: an invalid pack size blocks final-ready pricing', async ({ page }) => {
  await cleanOpen(page);
  await state(page, seedGatedRun('chainlink'));
  await state(page, `COST_DB['wire ties']={...COST_DB['wire ties'],pack:'abc'}`);
  const report = await labReport(page, 'invalid-pack-size');
  expect(report.ok).toBe(false);
  expect(report.failures).toContain('pricing-inputs');
  expect(report.failures).toContain('validation-agreement');
  expect(report.validation.errors).toContain('INVALID_PRICING_INPUT');
});
