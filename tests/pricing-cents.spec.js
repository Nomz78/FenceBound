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
  const result = await state(page, `({row:!!document.querySelector('[data-cost="test widget"]'),
    inDb:!!COST_DB['test widget'],lookup:lookupCost('Test Widget')})`);
  expect(result.row).toBe(true);
  expect(result.inDb).toBe(true);
  expect(result.lookup).toBe(4.25);
});
