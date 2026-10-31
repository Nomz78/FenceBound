const { test, expect } = require('@playwright/test');

test('F13 hours replace per-LF labor but retain gate install labor in its owning section', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  const result = await page.evaluate(() => window.eval(`(() => {
    const run={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},
      fenceType:'chainlink',runId:'f13-run',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10};
    const gate=attachGateToRun({type:'gate',start:{x:10*GRID_FT,y:0},end:{x:14*GRID_FT,y:0},
      gateType:'walk',hinge:'start',swingDir:1},run);
    S.elements=[run,gate];
    S.materials=[];
    ['uc-demo','uc-slope','uc-urban','uc-harddig'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('labor-hours').value='0.5';
    const priced=computePricing();
    const crewC=Math.round(LABOR.crewHourlyRate*0.5*100);
    const gateC=Math.round(LABOR.gate.walk*100);
    // With only this run, its section must carry all materials and marked-up labor.
    const materialC=priced.matLines.reduce((sum,line)=>sum+line.clientExtC,0);
    return {lines:priced.laborLines,crewC,gateC,laborCostC:priced.cents.laborCost,
      sections:priced.sectionCents,materialC,
      expectedLaborPriceC:Math.round((crewC+gateC)*(1+MARKUP.laborPct/100))};
  })()`));
  expect(result.gateC).toBeGreaterThan(0);
  expect(result.lines.map(line => line.label)).toEqual([
    expect.stringContaining('Crew labor'), expect.stringContaining('Walk Gate install'),
  ]);
  expect(result.lines.map(line => line.extC)).toEqual([result.crewC, result.gateC]);
  expect(result.laborCostC).toBe(result.crewC + result.gateC);
  expect(result.sections).toEqual({ chainlink: result.materialC + result.expectedLaborPriceC });
});
