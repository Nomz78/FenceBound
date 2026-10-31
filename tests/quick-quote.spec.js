const { test, expect } = require('@playwright/test');

// Quick quote Q1 (owner ruling 2026-10-31): typed sides build a schematic layout
// priced by the existing takeoff. Parity with drawn jobs: tests/quick-quote-parity.spec.js.

const U = { fenceType: 'woodprivacy', height: 72, sides: [50, 50, 50], shape: 'open',
  gates: [{ side: 1, gateType: 'walk', width: 4, offset: 20 }] };

async function boot(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}
const state = (page, source) => page.evaluate(s => window.eval(s), source);
const build = (page, spec) => state(page, `buildTypedLayout(${JSON.stringify(spec)})`);

test('Q1 typed sides build right-angle runs, gates and auto posts', async ({ page }) => {
  await boot(page);
  expect(await build(page, U)).toEqual({ ok: true });
  const r = await state(page, `(()=>{
    const ft=p=>[p.x/GRID_FT,p.y/GRID_FT];
    const runs=S.elements.filter(e=>e.type==='fence'),gates=S.elements.filter(e=>e.type==='gate');
    return{runs:runs.map(e=>[ft(e.start),ft(e.end),e.fenceType,e.specs.heightIn]),
      gates:gates.map(g=>[ft(g.start),ft(g.end),g.gateType,g.runId===runs[1].runId]),
      line:S.elements.filter(e=>e.type==='post'&&e.auto).length,ids:new Set(runs.map(e=>e.runId)).size,
      layout:jobLayout(),total:getStats().totalFt};
  })()`);
  expect(r.runs).toEqual([[[0, 0], [50, 0], 'woodprivacy', 72], [[50, 0], [50, 50], 'woodprivacy', 72],
    [[50, 50], [0, 50], 'woodprivacy', 72]]);
  expect(r.gates).toEqual([[[50, 20], [50, 24], 'walk', true]]);
  expect(r.line).toBe(17);
  expect(r.ids).toBe(3);
  expect(r.layout).toBe('typed');
  expect(r.total).toBeCloseTo(150, 6);
});

test('Q1 closed shape adds the closing side; unclosable or bad input is refused untouched', async ({ page }) => {
  await boot(page);
  expect(await build(page, { fenceType: 'chainlink', sides: [40, 30, 40], shape: 'closed' })).toEqual({ ok: true });
  expect(await state(page, `S.elements.filter(e=>e.type==='fence').map(e=>[e.end.x/GRID_FT,e.end.y/GRID_FT])`))
    .toEqual([[40, 0], [40, 30], [0, 30], [0, 0]]);
  const before = await state(page, 'JSON.stringify(S.elements)');
  for (const bad of [
    { fenceType: 'chainlink', sides: [40, 30, 20], shape: 'closed' },
    { fenceType: 'chainlink', sides: [10], gates: [{ side: 0, gateType: 'doubledrive', width: 16 }] },
    { fenceType: 'chainlink', sides: [10, 10], gates: [{ side: 4, gateType: 'walk' }] },
    { fenceType: 'chainlink', sides: [20], gates: [{ side: 0, gateType: 'walk', offset: 2 }, { side: 0, gateType: 'walk', offset: 4 }] },
    { fenceType: 'nope', sides: [10] },
    { fenceType: 'chainlink', sides: [0] },
  ]) {
    const res = await build(page, bad);
    expect(res.ok).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  }
  expect(await state(page, 'JSON.stringify(S.elements)')).toBe(before);
});

test('Q1 typed layout shows the banner, warns in validation and titles the plan PDF', async ({ page }) => {
  await boot(page);
  await page.waitForFunction(() => !!window.jspdf);
  await expect(page.locator('#layout-banner')).toBeHidden();
  await build(page, U);
  await expect(page.locator('#layout-banner')).toBeVisible();
  await expect(page.locator('#layout-banner')).toHaveText('Typed footage — not to scale');
  const v = await state(page, 'validateProject({requireClient:false})');
  expect(v.warnings.map(w => w.code)).toContain('LAYOUT_TYPED');
  expect(v.errors.map(w => w.code)).not.toContain('LAYOUT_TYPED');
  const texts = await state(page, `(()=>{
    const calls=[],Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){const doc=new Real(...args),t=doc.text;
      doc.text=function(...a){calls.push([].concat(a[0]).join(' '));return t.apply(this,a);};doc.save=()=>{};return doc;};
    try{exportPDF();}finally{window.jspdf.jsPDF=Real;}
    return calls;
  })()`);
  expect(texts).toContain('SCHEMATIC — NOT TO SCALE');
});

test('Q1 first geometry edit makes the layout drawn; undo and save/load keep the flag', async ({ page }) => {
  await boot(page);
  await build(page, U);
  // Save/load round trip keeps a typed layout typed.
  expect(await state(page, `(()=>{const st=JSON.parse(JSON.stringify(snapshotState()));applyState(st);return jobLayout();})()`)).toBe('typed');
  // Drawing a new run is a geometry edit.
  await state(page, `commitDrawnSegment('fence',{x:0,y:80*GRID_FT},{x:10*GRID_FT,y:80*GRID_FT})`);
  expect(await state(page, 'jobLayout()')).toBe('drawn');
  await expect(page.locator('#layout-banner')).toBeHidden();
  await state(page, 'doUndo()');
  expect(await state(page, 'jobLayout()')).toBe('typed');
  // Deleting a side is a geometry edit too.
  await state(page, `(()=>{pushHistory();S.selected=S.elements.findIndex(e=>e.type==='fence');deleteSelectedElement();})()`);
  expect(await state(page, 'jobLayout()')).toBe('drawn');
  expect(await state(page, `S.elements.some(e=>e.schematic)`)).toBe(false);
});

test('Q1 the Job drawer builds a typed layout from the sides form', async ({ page }) => {
  await boot(page);
  await page.click('#btn-jobinfo');
  await page.selectOption('#qq-type', 'woodprivacy');
  await page.fill('#qq-height', '72');
  await page.fill('#qq-sides', '50, 50, 50');
  await page.selectOption('#qq-shape', 'open');
  await page.fill('#qq-gates', '2, walk, 4, 20');
  await page.click('#qq-build');
  expect(await state(page, 'jobLayout()')).toBe('typed');
  expect(await state(page, `S.elements.filter(e=>e.type==='gate').map(g=>[g.start.x/GRID_FT,g.start.y/GRID_FT])`))
    .toEqual([[50, 20]]);
  await page.fill('#qq-sides', '50, x');
  await page.click('#qq-build');
  await expect(page.locator('#qq-errors')).toContainText('Side 2');
});
