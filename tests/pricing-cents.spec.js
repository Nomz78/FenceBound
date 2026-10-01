const { test, expect } = require('@playwright/test');

// Regression suite for the integer-cents pricing repair:
//  - C1: the missing 'truss rod connector' cost-DB seam (chain-link with mid
//    rail + truss rod generated an unpriceable auto BOM line, so the job could
//    never validate final-ready).
//  - C2: money math is exact integer cents and deterministic across runs.
//  - C3: the cost editor can add a brand-new material (previously only CSV
//    import could introduce a new cost-DB key).

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// Chain-link with mid rail + truss rod: the configuration that generated the
// unpriceable 'Truss Rod Connector (turnbuckle-style, threaded)' BOM line.
// Truss assemblies are counted from corners + gate posts, so the seed includes
// a walk gate (mirrors the 168 LF fixture's approach).
async function seedTrussRodJob(page) {
  await cleanOpen(page);
  await state(page, `(()=>{
    const specs=cloneRunSpecs(S.specs);
    Object.assign(specs,{heightIn:72,hasTopRail:true,hasMidRail:true,hasTrussRod:true});
    const run={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},
      fenceType:'chainlink',runId:'run_truss_test',specs,postSpacing:10,autoPostSpacing:10};
    const gate=attachGateToRun({type:'gate',start:{x:5*GRID_FT,y:0},end:{x:9*GRID_FT,y:0},
      gateType:'walk',hinge:'start',swingDir:1},run);
    S.elements=[run,gate];
    draw();updatePanel();
  })()`);
}

test('C1 every auto BOM line resolves a cost (truss-rod connector regression)', async ({ page }) => {
  await seedTrussRodJob(page);
  const result = await state(page, `(()=>{
    const P=computePricing();
    const connector=P.matLines.find(l=>/connector/i.test(l.name));
    return{unknown:P.unknown,
      connector:{name:connector&&connector.name,unitCost:connector&&connector.unitCost,qty:connector&&connector.qty},
      isFinalReady:P.isFinalReady,
      unresolved:P.matLines.filter(l=>l.unitCost===null).map(l=>l.name)};
  })()`);
  expect(result.connector.name).toMatch(/connector/i);
  expect(result.unknown).toEqual([]);
  expect(result.unresolved).toEqual([]);
  expect(result.connector.unitCost).toBeGreaterThan(0);
  expect(result.isFinalReady).toBe(true);
});

test('C2 pricing totals are exact integer cents and deterministic', async ({ page }) => {
  await seedTrussRodJob(page);
  const result = await state(page, `(()=>{
    const a=computePricing(),b=computePricing();
    return{centsA:a.cents,clientTotalA:a.clientTotal,
      sameAsB:JSON.stringify(a.cents)===JSON.stringify(b.cents),
      roundedMatch:Math.round(a.clientTotal*100)===a.cents.clientTotal,
      allIntegers:Object.values(a.cents).every(Number.isInteger)};
  })()`);
  expect(result.sameAsB).toBe(true);
  expect(result.allIntegers).toBe(true);
  expect(result.roundedMatch).toBe(true);
  expect(result.centsA.clientTotal).toBeGreaterThan(0);
});

test('C3 cost editor can add a brand-new material', async ({ page }) => {
  await cleanOpen(page);
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-cost-editor').click();
  await page.locator('#ce-new-name').fill('Test Widget');
  await page.locator('#ce-new-cost').fill('4.25');
  await page.locator('#ce-new-unit').selectOption('ea');
  await page.locator('#ce-add-mat').click();
  const staged = await state(page, `({row:!!document.querySelector('[data-cost="test widget"]'),
    inDb:!!COST_DB['test widget']})`);
  expect(staged.row).toBe(true);
  // Staged only: the live rate card changes on Save, as the editor's toast says.
  expect(staged.inDb).toBe(false);
  await page.locator('#ce-save').click();
  const result = await state(page, `({inDb:!!COST_DB['test widget'],lookup:lookupCost('Test Widget'),
    persisted:JSON.parse(localStorage.getItem(COSTDB_KEY)).costs['test widget']})`);
  expect(result.inDb).toBe(true);
  expect(result.lookup).toBe(4.25);
  expect(result.persisted).toEqual({cost:4.25,unit:'ea'});
});

test('C5 cancelling the cost editor discards an added material', async ({ page }) => {
  await cleanOpen(page);
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-cost-editor').click();
  await page.locator('#ce-new-name').fill('Cancelled Widget');
  await page.locator('#ce-new-cost').fill('9.99');
  await page.locator('#ce-add-mat').click();
  await page.locator('#ce-cancel').click();
  const result = await state(page, `({inDb:!!COST_DB['cancelled widget'],lookup:lookupCost('Cancelled Widget')})`);
  expect(result.inDb).toBe(false);
  expect(result.lookup).toBe(null);
});

test('C4 site upcharges keep parity with the pre-cents formula (demo cost is marked up into the client price)', async ({ page }) => {
  await seedTrussRodJob(page);
  const result = await state(page, `(()=>{
    ['uc-demo','uc-slope','uc-urban','uc-harddig'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=true;});
    const P=computePricing();
    // Legacy float formula (pre-cents), rebuilt from the same inputs.
    const stats=getStats();const ft=stats.totalFt||0;
    const priced=P.matLines.filter(l=>l.unitCost!==null);
    const legacyMatCost=priced.reduce((s,l)=>s+l.unitCost*l.qty,0)+ft*3;
    const legacySub=legacyMatCost*(1+MARKUP.materialPct/100)+P.laborCost*(1+MARKUP.laborPct/100);
    const legacyTotal=legacySub*1.15;
    const demoC=Math.round(ft*300);
    return{lines:P.matLines.length,ft,demoC,pct:MARKUP.materialPct,cents:P.cents,
      lineSumC:P.matLines.reduce((s,l)=>s+(l.clientExtC||0),0),
      legacyTotalC:Math.round(legacyTotal*100)};
  })()`);
  expect(result.ft).toBeGreaterThan(0);
  // Demo/haul is a cost: it must appear in client material price at material markup.
  expect(result.cents.matPrice - result.lineSumC)
    .toBe(Math.round(result.demoC*(100+result.pct)/100));
  // Integer-cents totals differ from the float formula only by per-line rounding.
  expect(Math.abs(result.cents.clientTotal - result.legacyTotalC))
    .toBeLessThanOrEqual(result.lines + 4);
  expect(result.cents.profit).toBe(result.cents.clientTotal - result.cents.internalCost);
});
