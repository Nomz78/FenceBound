const { test, expect } = require('@playwright/test');

// Q1t: explicit drawn geometry is independent of the typed-layout generator.
const fixtures = [
  {
    name: 'U: survey wood privacy with an offset walk gate',
    input: { fenceType: 'woodprivacy', height: 72, sides: [50, 50, 50], shape: 'open',
      gates: [{ side: 1, gateType: 'walk', width: 4, offset: 20 }] },
    runs: [[[0, 0], [50, 0]], [[50, 0], [50, 50]], [[50, 50], [0, 50]]],
    gates: [{ side: 1, gateType: 'walk', start: [50, 20], end: [50, 24] }],
  },
  {
    name: 'L: chain link without gates',
    input: { fenceType: 'chainlink', height: 48, sides: [60, 30], shape: 'open', gates: [] },
    runs: [[[0, 0], [60, 0]], [[60, 0], [60, 30]]], gates: [],
  },
  {
    name: 'closed loop: centered double gate',
    input: { fenceType: 'chainlink', height: 72, sides: [40, 30, 40, 30], shape: 'closed',
      gates: [{ side: 2, gateType: 'doubledrive', width: 12 }] },
    runs: [[[0, 0], [40, 0]], [[40, 0], [40, 30]], [[40, 30], [0, 30]], [[0, 30], [0, 0]]],
    gates: [{ side: 2, gateType: 'doubledrive', start: [26, 30], end: [14, 30] }],
  },
  {
    name: 'end gate: flush with the last side endpoint',
    input: { fenceType: 'woodprivacy', height: 72, sides: [50, 30], shape: 'open',
      gates: [{ side: 1, gateType: 'walk', width: 4, offset: 26 }] },
    runs: [[[0, 0], [50, 0]], [[50, 0], [50, 30]]],
    gates: [{ side: 1, gateType: 'walk', start: [50, 26], end: [50, 30] }],
  },
  {
    name: 'two types: per-side fence type and height',
    input: { fenceType: 'woodprivacy', height: 72,
      sides: [{ length: 50, fenceType: 'woodprivacy', height: 72 },
        { length: 30, fenceType: 'chainlink', height: 48 }], shape: 'open', gates: [] },
    runs: [[[0, 0], [50, 0]], [[50, 0], [50, 30]]], gates: [],
  },
];

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
  await page.evaluate(() => window.eval(`
    S.selected=null; S.elements=[]; S.materials=[]; S.autoPost=true;
    ['uc-demo','uc-slope','uc-urban','uc-harddig'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('labor-hours').value='';
  `));
}

async function seedDrawn(page, fixture) {
  await page.evaluate(f => window.eval(`(${function (f) {
    const point = ([x, y]) => ({ x: x * GRID_FT, y: y * GRID_FT });
    const runs = f.runs.map(([start, end], i) => {
      const side = typeof f.input.sides[i] === 'object' ? f.input.sides[i] : {};
      // Same defaults/spec path as type selection and the drawing height handler;
      // commitDrawnSegment clones S.specs and S.postSpacing into a new run.
      selectFenceType(side.fenceType || f.input.fenceType);
      S.specs.heightIn = side.height || f.input.height;
      applyHeightDrivenSpecs();
      updateSpecsForFenceType();
      const run = { type: 'fence', start: point(start), end: point(end),
        fenceType: S.fenceType, runId: 'drawn_q1t_' + i, specs: cloneRunSpecs(S.specs),
        postSpacing: S.postSpacing, autoPostSpacing: S.postSpacing, hinge: 'start', swingDir: 1 };
      S.elements.push(run);
      return run;
    });
    f.gates.forEach(gate => S.elements.push(attachGateToRun({ type: 'gate',
      start: point(gate.start), end: point(gate.end), gateType: gate.gateType,
      hinge: 'start', swingDir: 1 }, runs[gate.side])));
    runs.forEach(rebuildRunAutoPosts);
  }.toString()})(${JSON.stringify(f)})`), fixture);
}

async function snapshot(page) {
  return page.evaluate(() => window.eval(`(${function () {
    const pricing = computePricing();
    const sorted = rows => rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    // Retain every canonical money figure, including per-line display cents and
    // section allocation cents. Geometry IDs and row ordering are not monetary inputs.
    const centsFields = row => Object.fromEntries(Object.entries(row).filter(([key]) => /C$/.test(key)));
    const priced = sorted(pricing.matLines.map(row => ({ name: row.name, unit: row.unit,
      qty: row.qty, pricedQty: row.pricedQty ?? null, pricedUnit: row.pricedUnit ?? null,
      money: centsFields(row) })));
    return {
      bom: sorted(calcAutoMaterials().map(row => ({ name: row.name, unit: row.unit, qty: row.qty }))),
      priced, labor: sorted(pricing.laborLines), cents: pricing.cents, sectionCents: pricing.sectionCents,
    };
  }.toString()})()`));
}

for (const fixture of fixtures) {
  test(`Q1t parity — ${fixture.name}`, async ({ page }) => {
    await cleanOpen(page);
    await seedDrawn(page, fixture);
    const drawn = await snapshot(page);
    expect(drawn.bom.length).toBeGreaterThan(0);
    expect(drawn.labor.length).toBeGreaterThan(0);
    expect(drawn.cents.clientTotal).toBeGreaterThan(0);

    // A fresh job gives each path identical initial defaults/rates and prevents
    // the typed result from passing by retaining the reference job's elements.
    await cleanOpen(page);
    const result = await page.evaluate(input => window.eval(`buildTypedLayout(${JSON.stringify(input)})`), fixture.input);
    expect(result.ok).toBe(true);
    expect(await page.evaluate(() => window.eval('jobLayout()'))).toBe('typed');
    const typed = await snapshot(page);
    expect(typed.bom).toEqual(drawn.bom);
    expect(typed.priced).toEqual(drawn.priced);
    expect(typed.labor).toEqual(drawn.labor);
    expect(typed.cents).toEqual(drawn.cents);
    expect(typed.sectionCents).toEqual(drawn.sectionCents);
  });
}

test('Q1t guard — oversized gate rejects atomically', async ({ page }) => {
  await cleanOpen(page);
  await seedDrawn(page, fixtures[0]);
  const before = await page.evaluate(() => window.eval('JSON.stringify(S.elements)'));
  const result = await page.evaluate(() => window.eval(`buildTypedLayout({
    fenceType:'chainlink',height:48,sides:[10],shape:'open',
    gates:[{side:0,gateType:'walk',width:12}]
  })`));
  expect(result.ok).toBe(false);
  expect(Array.isArray(result.errors)).toBe(true);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.eval('JSON.stringify(S.elements)'))).toBe(before);
});
