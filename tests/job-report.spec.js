const { test, expect } = require('@playwright/test');
const state = (page, source) => page.evaluate(s => window.eval(s), source);

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
});

async function fixture(page) {
  await state(page, `(()=>{
    S.elements=[100,50].map((lf,i)=>({type:'fence',start:{x:0,y:i*100},end:{x:lf*GRID_FT,y:i*100},
      fenceType:'chainlink',runId:'report_'+i,specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}));
    const pricing=clonePricing();pricing.labor.crewHourlyRate=50;pricing.labor.perLF.chainlink=4;
    S.quote={total:2000,frozenAt:'2026-10-31T00:00:00Z',pricing};useQuotePricing();
    S.actuals=sanitizeActuals({days:[
      {date:'2026-10-30',crew:2,start:'08:00',end:'16:00',breakMin:30,done:[{runId:'report_0',stage:'finished'}]},
      {date:'2026-10-31',crew:3,start:'09:00',end:'11:30',breakMin:30,done:[{runId:'report_1',stage:'posts'}]}
    ],materials:[
      {name:'Fabric',estQty:100,estUnitCost:2,qty:110,unitCost:2},
      {name:'Posts',estQty:10,estUnitCost:15,qty:-2,unitCost:10},
      {name:'Hardware',estQty:5,estUnitCost:10,qty:null,unitCost:null}
    ]});
    S.actuals.closedAt='2026-10-31T18:00:00Z';
  })()`);
}

test('fixture report matches hand-calculated figures and changes no state or rates', async ({ page }) => {
  await fixture(page);
  const before = await state(page, 'JSON.stringify({s:S,pricing:clonePricing(),storage:{...localStorage}})');
  expect(await state(page, 'jobReport()')).toEqual({
    materials: { estC: 40000, actC: 20000, linesEntered: 2, lines: 3 }, // 100×2+10×15+5×10; 110×2−2×10.
    labor: { estC: 60000, personHours: 21, actC: 105000, hPerLF: 0.21 }, // 150×4; 2×7.5+3×2=21; 21×50; 21/100.
    installed: { lf: 100, plannedLF: 150, runsFinished: 1, runsTotal: 2 }, // Only the 100 LF run is finished; 100+50 planned.
    revenueC: 200000, quoted: true, // Frozen quote: $2000×100.
    margin: { estC: 100000, actC: 75000, actPct: 37.5 }, // 200000−40000−60000; 200000−20000−105000; 75000/200000×100.
    days: 2, daysWithoutTimes: 0, complete: false, // Two timed days; one blank material line.
    closedAt: '2026-10-31T18:00:00Z', // Echo the close mark.
  });
  expect(await state(page, 'JSON.stringify({s:S,pricing:clonePricing(),storage:{...localStorage}})')).toBe(before);
});

test('empty actuals return zeros and unknown ratios without throwing', async ({ page }) => {
  await state(page, 'S.elements=[];S.materials=[];S.quote=null;S.actuals=emptyActuals()');
  expect(await state(page, 'jobReport()')).toEqual({
    materials: { estC: 0, actC: 0, linesEntered: 0, lines: 0 }, // No lines.
    labor: { estC: 0, personHours: 0, actC: 0, hPerLF: null }, // No work or installed LF.
    installed: { lf: 0, plannedLF: 0, runsFinished: 0, runsTotal: 0 }, // No drawing.
    revenueC: 0, quoted: false, margin: { estC: 0, actC: 0, actPct: null }, // Zero revenue has no margin percentage.
    days: 0, daysWithoutTimes: 0, complete: true, closedAt: null, // No incomplete entries or close mark.
  });
});

test('a day without both times is skipped and counted', async ({ page }) => {
  await fixture(page);
  await state(page, 'S.actuals.days[1].end=null');
  const report = await state(page, 'jobReport()');
  expect(report.labor).toEqual({ estC: 60000, personHours: 15, actC: 75000, hPerLF: 0.15 }); // 2×7.5; 15×50; 15/100.
  expect(report.days).toBe(2); // Both logged days remain.
  expect(report.daysWithoutTimes).toBe(1); // Second day lacks its end.
  expect(report.complete).toBe(false); // Missing time and blank materials.
});

test('a saved quote with no total falls back to the current price', async ({ page }) => {
  await fixture(page);
  await state(page, 'S.quote.total=null');
  const report = await state(page, 'jobReport()');
  expect(report.quoted).toBe(false); // No frozen total to compare against.
  expect(report.revenueC).toBe(await state(page, 'computePricing().cents.clientTotal'));
});

// The app section and the Job report PDF read the same rows (jobReportRows).
const FIXTURE_ROWS = [
  { label: 'Materials', est: '$400.00', act: '$200.00, 2 of 3 lines' },
  { label: 'Labor', est: '$600.00', act: '$1,050.00, 21.0 person-h' }, // 21 h × $50.
  { label: 'Labor rate', est: '-', act: '0.21 h/LF' }, // 21 h / 100 LF.
  { label: 'Installed', est: '150.0 LF', act: '100.0 LF, 1 of 2 runs' },
  { label: 'Price', est: '$2,000.00', act: '$2,000.00' }, // Frozen quote.
  { label: 'Margin', est: '$1,000.00, 50.0%', act: '$750.00, 37.5%' }, // 1000/2000; 750/2000.
];

test('report rows format the fixture figures; the Field tab shows them', async ({ page }) => {
  await fixture(page);
  const rows = await state(page, 'jobReportRows(jobReport())');
  expect(rows.rows).toEqual(FIXTURE_ROWS);
  expect(rows.notes).toEqual(['Incomplete: 1 material line blank.']);
  await page.locator('.ptab[data-tab="field"]').click();
  const section = page.locator('#field-report');
  for (const r of FIXTURE_ROWS) for (const v of [r.label, r.est, r.act]) await expect(section).toContainText(v);
  await expect(section).toContainText('Incomplete: 1 material line blank.');
  await expect(section.locator('#field-report-pdf')).toBeVisible();
});

test('the Job report PDF carries the rows and is not the customer estimate', async ({ page }) => {
  await page.waitForFunction(() => !!window.jspdf);
  await fixture(page);
  const out = await state(page, `(()=>{const calls=[],Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){const doc=new Real(...args);
      doc.save=name=>{calls.push({name,pdf:doc.output()});};return doc;};
    try{exportJobReportPDF();}finally{window.jspdf.jsPDF=Real;}
    return calls;})()`);
  expect(out).toHaveLength(1);
  expect(out[0].name).toMatch(/_JobReport_.*\.pdf$/);
  expect(out[0].pdf).toContain('(JOB REPORT - INTERNAL, NOT FOR THE CUSTOMER)');
  for (const r of FIXTURE_ROWS) for (const v of [r.label, r.est, r.act]) expect(out[0].pdf).toContain(`(${v})`);
  expect(out[0].pdf).toContain('(Incomplete: 1 material line blank.)');
  expect(out[0].pdf).toContain('(Closed 2026-10-31)');
});

test('with no material lines loaded, estimated materials fall back to the quote materials cost', async ({ page }) => {
  await fixture(page);
  await state(page, 'S.actuals.materials=[]');
  const report = await state(page, 'jobReport()');
  const matC = await state(page, 'computePricing().cents.matCost'); // Frozen quote rates, as for labor.
  expect(matC).toBeGreaterThan(0);
  expect(report.materials).toEqual({ estC: matC, actC: 0, linesEntered: 0, lines: 0 });
  expect(report.margin.estC).toBe(200000 - matC - 60000); // Revenue − quoted materials − quoted labor.
  expect(report.complete).toBe(true); // No blank lines; both days timed.
  const rows = await state(page, 'jobReportRows(jobReport())');
  expect(rows.notes).toEqual(['No material lines loaded: estimated materials are the quote materials cost.']);
  expect(await state(page, 'clonePricing().labor.crewHourlyRate')).toBe(50); // Still the quote rates; nothing written.
});
