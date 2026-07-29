const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const PROJECT = 'Phase One Mixed-System Acceptance';
const CUSTOMER = 'FenceBound Test Customer';
const ADDRESS = '100 Acceptance Lane, Albemarle, NC';

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression = 'snapshotState()') {
  return page.evaluate(source => window.eval(source), expression);
}

async function setMetadata(page, project = PROJECT, customer = CUSTOMER, address = ADDRESS) {
  await page.locator('#job-name-display').click();
  await page.locator('#job-name').fill(project);
  await page.locator('#job-name').press('Enter');
  await page.locator('#btn-jobinfo').click();
  await page.locator('#field-customer').fill(customer);
  await page.locator('#field-address').fill(address);
  await page.locator('#close-jobinfo').click();
}

async function setFenceDefaults(page, type, heightIn, spacing) {
  // selectFenceType is production creation logic. It updates defaults only when
  // no fence is selected, exactly as the UI material/style controls do.
  await page.evaluate(key => window.eval(`selectFenceType(${JSON.stringify(key)})`), type);
  await page.locator('[data-tab="specs"]').click();
  await page.locator('#spec-height').selectOption(String(heightIn));
  await page.locator('[data-tab="draw"]').click();
  await page.locator('#spacing-slider').fill(String(spacing));
}

async function drawSegment(page, startX, y, feet, tool = 'fence') {
  await page.locator(`[data-tool="${tool}"]`).click();
  const box = await page.locator('#canvas').boundingBox();
  const view = await state(page, '({pan:S.pan,zoom:S.zoom})');
  // App units are GRID_FT=40 pixels/foot. Canvas CSS position is:
  // screen = canvas origin + pan + world * zoom. Keeping world start at 0
  // makes the drag math independent of devicePixelRatio.
  const x1 = box.x + view.pan.x + startX * 40 * view.zoom;
  const y1 = box.y + view.pan.y + y * 40 * view.zoom;
  const x2 = x1 + feet * 40 * view.zoom;
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y1, { steps: 6 });
  await page.mouse.up();
}

async function selectElement(page, startX, y, feet) {
  // At zoom-to-fit levels, the 14px auto-post hit areas can cover the fence
  // line. Zoom through the real controls so a between-post click selects run.
  for (let i = 0; i < 4; i++) await page.locator('#btn-zoom-in').click();
  await page.locator('[data-tool="select"]').click();
  // Avoid auto-post hit targets (commonly at 6/8/10 ft); 5 ft is clear for
  // the fixture types and is outside the 4 ft walk gate.
  const hitFeet = Math.min(3, feet / 2);
  await page.evaluate(({ startX, y, hitFeet }) => {
    const canvas = document.querySelector('#canvas');
    const rect = canvas.getBoundingClientRect();
    const view = window.eval('({pan:S.pan,zoom:S.zoom})');
    const clientX = rect.left + view.pan.x + (startX + hitFeet) * 40 * view.zoom;
    const clientY = rect.top + view.pan.y + y * 40 * view.zoom;
    canvas.dispatchEvent(new MouseEvent('mousedown', {
      clientX, clientY, button: 0, bubbles: true, cancelable: true,
    }));
  }, { startX, y, hitFeet });
  for (let i = 0; i < 4; i++) await page.locator('#btn-zoom-out').click();
}

async function createFixture(page, { gates = true } = {}) {
  await cleanOpen(page);
  await setMetadata(page);
  for (let i = 0; i < 10; i++) await page.locator('#btn-zoom-out').click();
  const runs = [
    { type: 'chainlink', height: 72, spacing: 10, feet: 60, x: 0, y: 0 },
    { type: 'woodprivacy', height: 72, spacing: 8, feet: 40, x: 0, y: 12 },
    { type: 'vinylprivacy6', height: 72, spacing: 8, feet: 30, x: 0, y: 24 },
    { type: 'ornamental', height: 48, spacing: 6, feet: 25, x: 0, y: 36 },
  ];
  for (const run of runs) {
    await setFenceDefaults(page, run.type, run.height, run.spacing);
    await drawSegment(page, run.x, run.y, run.feet);
  }
  if (gates) {
    // At the fixture's zoom, the app's 26-screen-pixel endpoint magnet spans
    // several feet and would snap a 4 ft gate to a post. Zoom in through the
    // real UI for accurate gate endpoints, then restore the fixture zoom.
    for (let i = 0; i < 7; i++) await page.locator('#btn-zoom-in').click();
    await page.locator('[data-tool="gate"]').click();
    await page.locator('[data-gttype="walk"]').click();
    await drawSegment(page, 4, 0, 4, 'gate');
    await page.locator('[data-tool="gate"]').click();
    await page.locator('[data-gttype="doubledrive"]').click();
    await drawSegment(page, 4, 12, 16, 'gate');
    for (let i = 0; i < 7; i++) await page.locator('#btn-zoom-out').click();
  }
  return runs;
}

function portableRecord(snapshot, computed) {
  const fences = snapshot.elements.filter(e => e.type === 'fence');
  const gates = snapshot.elements.filter(e => e.type === 'gate');
  return {
    runCount: fences.length,
    gateCount: gates.length,
    runs: fences.map(r => ({
      runId: r.runId, type: r.fenceType, height: r.specs.heightIn,
      spacing: r.postSpacing,
    })),
    gateOwners: gates.map(g => g.runId),
    totalFootage: computed.stats.totalFt,
    bom: computed.bom.map(r => ({ name: r.name, qty: r.qty, unit: r.unit })),
    validation: {
      ok: computed.validation.ok,
      errors: computed.validation.errors.map(e => e.code),
      warnings: computed.validation.warnings.map(e => e.code),
    },
    clientTotal: computed.pricing.clientTotal,
  };
}

async function computedRecord(page) {
  return state(page, `({
    stats:getStats(),
    bom:calcAutoMaterials(),
    validation:validateProject(),
    pricing:computePricing()
  })`);
}

test('1 run-spec isolation', async ({ page }) => {
  const runs = await createFixture(page, { gates: false });
  for (const run of runs) {
    await selectElement(page, run.x, run.y, run.feet);
    await expect(page.locator('#spec-height')).toHaveValue(String(run.height));
    await expect(page.locator('#spacing-slider')).toHaveValue(String(run.spacing));
    expect(await state(page, 'selectedFenceRun().fenceType')).toBe(run.type);
  }
  await selectElement(page, 0, 0, 60);
  await page.locator('[data-tab="specs"]').click();
  await page.locator('#spec-height').selectOption('84');
  await selectElement(page, 0, 12, 40);
  await expect(page.locator('#spec-height')).toHaveValue('72');
  await selectElement(page, 0, 0, 60);
  await expect(page.locator('#spec-height')).toHaveValue('84');
});

test('2 new-run defaults remain separate from selected-run edits', async ({ page }) => {
  await createFixture(page, { gates: false });
  await page.locator('[data-tool="fence"]').click(); // tool switch deselects
  await page.locator('[data-tab="specs"]').click();
  await page.locator('#spec-height').selectOption('60');
  await page.locator('[data-tab="draw"]').click();
  await page.locator('#spacing-slider').fill('7');
  const before = await state(page, `snapshotState().elements.filter(e=>e.type==='fence').map(e=>[e.specs.heightIn,e.postSpacing])`);
  expect(before).toEqual([[72, 10], [72, 8], [72, 8], [48, 6]]);
  await drawSegment(page, 0, 48, 10);
  const after = await state(page, `snapshotState().elements.filter(e=>e.type==='fence').map(e=>[e.specs.heightIn,e.postSpacing])`);
  expect(after.slice(0, 4)).toEqual(before);
  expect(after[4]).toEqual([60, 7]);
});

test('3 gate ownership, persistence, and zero-run blocking', async ({ page }) => {
  await createFixture(page);
  const initial = await state(page, `({
    runs:S.elements.filter(e=>e.type==='fence').map(e=>e.runId),
    gates:S.elements.filter(e=>e.type==='gate').map(e=>({owner:e.runId,height:e.specs.heightIn}))
  })`);
  expect(initial.gates.map(g => g.owner)).toEqual(initial.runs.slice(0, 2));
  await selectElement(page, 0, 0, 60);
  await page.locator('[data-tab="specs"]').click();
  await page.locator('#spec-height').selectOption('84');
  const associated = await state(page, `S.elements.filter(e=>e.type==='gate').map(e=>e.runId)`);
  expect(associated).toEqual(initial.gates.map(g => g.owner));
  await state(page, 'saveSession()');
  await page.reload();
  expect(await state(page, `S.elements.filter(e=>e.type==='gate').map(e=>e.runId)`)).toEqual(associated);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#btn-clear').click();
  await page.waitForTimeout(1_200);
  await page.reload();
  await drawSegment(page, 0, 0, 4, 'gate');
  expect(await state(page, `S.elements.filter(e=>e.type==='gate').length`)).toBe(0);
  await expect(page.locator('#app-toast')).toContainText('Draw a fence run before placing a gate');
});

test('4 BOM ownership/isolation and quantity evidence', async ({ page }) => {
  await createFixture(page);
  const bom = await state(page, 'calcAutoMaterials()');
  console.log('BOM_ROWS', JSON.stringify(bom));
  const text = bom.map(r => r.name.toLowerCase()).join('\n');
  expect(text).toContain('chain link');
  expect(text).toMatch(/wood|picket/);
  expect(text).toContain('vinyl');
  expect(text).toMatch(/ornamental|panel/);
  expect(bom.filter(r => /gate post/i.test(r.name)).length).toBeGreaterThanOrEqual(2);
  expect(new Set(bom.filter(r => /post/i.test(r.name)).map(r => r.name)).size).toBeGreaterThan(1);
  for (const row of bom) {
    expect(Number.isFinite(row.qty), `${row.name} quantity`).toBeTruthy();
    expect(row.qty, `${row.name} quantity`).toBeGreaterThan(0);
  }
});

test('5 validation failures and warnings expose issue codes', async ({ page }) => {
  await cleanOpen(page);
  let result = await state(page, 'validateProject()');
  expect(result.errors.map(e => e.code)).toEqual(expect.arrayContaining(['NO_FENCE_RUNS', 'PROJECT_NAME', 'CUSTOMER_NAME', 'JOB_ADDRESS']));
  await setMetadata(page);
  result = await state(page, 'validateProject()');
  expect(result.errors.map(e => e.code)).toContain('NO_FENCE_RUNS');
  await createFixture(page, { gates: false });
  result = await state(page, 'validateProject()');
  expect(result.errors.map(e => e.code)).not.toEqual(expect.arrayContaining(['PROJECT_NAME', 'CUSTOMER_NAME', 'JOB_ADDRESS', 'NO_FENCE_RUNS']));
  for (const [field, code, value] of [
    ['projectName', 'PROJECT_NAME', 'Untitled Job'],
    ['jobCustomer', 'CUSTOMER_NAME', ''],
    ['jobAddress', 'JOB_ADDRESS', ''],
  ]) {
    const invalid = await state(page, `(()=>{const old=S.${field};S.${field}=${JSON.stringify(value)};const r=validateProject({includePricing:false});S.${field}=old;return r;})()`);
    expect(invalid.ok, `${code} blocks estimate`).toBeFalsy();
    expect(invalid.errors.map(e => e.code)).toContain(code);
  }
  await state(page, `(()=>{S.jobCustomer='';return null})()`);
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-gen-estimate').click();
  await expect(page.locator('#validation-overlay')).toContainText('CUSTOMER_NAME');
  await state(page, `(()=>{S.jobCustomer=${JSON.stringify(CUSTOMER)};return null})()`);
  await page.locator('#validation-close').click();
  const missingName = await state(page, `(()=>{Object.keys(COST_DB).forEach(k=>delete COST_DB[k]);return validateProject();})()`);
  expect(missingName.errors.map(e => e.code)).toContain('MISSING_COST');
  const warning = await state(page, `(()=>{const r=S.elements.find(e=>e.type==='fence');r.postSpacing=21;return validateProject({includePricing:false});})()`);
  expect(warning.warnings.map(e => e.code)).toContain('POST_SPACING_HIGH');
  expect(warning.ok).toBeTruthy();
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-validate-job').click();
  await expect(page.locator('#validation-overlay')).toContainText('POST_SPACING_HIGH');
});

test('6 successful validation and client estimate PDF', async ({ page }) => {
  await createFixture(page);
  const validation = await state(page, 'validateProject()');
  console.log('VALIDATION', JSON.stringify(validation));
  expect(validation.ok).toBeTruthy();
  await page.locator('[data-tab="pricing"]').click();
  await page.locator('#btn-validate-job').click();
  await expect(page.locator('#validation-overlay')).toContainText('Validation passed');
  await page.locator('#validation-close').click();
  await page.waitForFunction(() => !!window.jspdf, null, { timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#btn-gen-estimate').click();
  const download = await downloadPromise;
  const pdfPath = path.join(os.tmpdir(), `fencebound-estimate-${Date.now()}.pdf`);
  await download.saveAs(pdfPath);
  expect(fs.statSync(pdfPath).size).toBeGreaterThan(1_000);
  const pdfStrings = execFileSync('/usr/bin/strings', [pdfPath], { encoding: 'utf8' });
  expect(pdfStrings).toContain(PROJECT);
  expect(pdfStrings).toContain(CUSTOMER);
  expect(pdfStrings).toContain(ADDRESS);
  expect(pdfStrings).toContain('Chain Link Installation \\(72" H\\)');
  expect(pdfStrings).toContain('Ornamental Installation \\(48" H\\)');
  expect(pdfStrings).not.toContain('QUICK REFERENCE');
  const pricing = await state(page, 'computePricing()');
  expect(Number.isFinite(pricing.clientTotal)).toBeTruthy();
  expect(pricing.clientTotal).toBeGreaterThan(0);
});

test('7 portable JSON clean round-trip preserves release record', async ({ page }) => {
  await createFixture(page);
  const before = portableRecord(await state(page), await computedRecord(page));
  await page.locator('#btn-jobs').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#do-export').click();
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), `fencebound-portable-${Date.now()}.fencebound.json`);
  await download.saveAs(filePath);
  const exported = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  expect(exported.schemaVersion).toBe(3);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#btn-clear').click();
  await page.waitForTimeout(1_200);
  await page.reload();
  expect((await state(page)).elements).toHaveLength(0);
  await page.locator('#job-file-input').setInputFiles(filePath);
  await expect.poll(() => state(page, `S.elements.filter(e=>e.type==='fence').length`)).toBe(4);
  const after = portableRecord(await state(page), await computedRecord(page));
  console.log('ROUND_TRIP_BEFORE', JSON.stringify(before));
  console.log('ROUND_TRIP_AFTER', JSON.stringify(after));
  expect(after).toEqual(before);
});

test('8 autosave refresh recovery is visible and complete', async ({ page }) => {
  await createFixture(page, { gates: false });
  await setMetadata(page, 'Autosave Recognizable Edit', CUSTOMER, ADDRESS);
  await page.waitForTimeout(1_300);
  await page.reload();
  await expect(page.locator('#job-name-display')).toHaveText('Autosave Recognizable Edit');
  expect(await state(page, `S.elements.filter(e=>e.type==='fence').length`)).toBe(4);
  await expect(page.locator('#app-toast')).toContainText('Session restored');
});

test('9 internal saved-job isolation retains job-specific state', async ({ page }) => {
  await createFixture(page, { gates: false });
  const original = await state(page, `({
    run:snapshotState().elements.find(e=>e.type==='fence'),
    postSpacing:S.postSpacing,
    markup:MARKUP,
    pricing:computePricing().clientTotal
  })`);
  await page.locator('#btn-jobs').click();
  await page.locator('#do-save').click();
  await page.locator('#close-jobs').click();
  await selectElement(page, 0, 0, 60);
  await page.locator('[data-tab="specs"]').click();
  await page.locator('#spec-height').selectOption('120');
  await page.locator('#btn-jobs').click();
  await page.locator('[data-ji="0"]').click();
  const loaded = await state(page, `({
    run:snapshotState().elements.find(e=>e.type==='fence'),
    postSpacing:S.postSpacing,
    markup:MARKUP,
    pricing:computePricing().clientTotal
  })`);
  expect(loaded.run.specs.heightIn).toBe(original.run.specs.heightIn);
  expect(loaded.run.postSpacing).toBe(original.run.postSpacing);
  expect(loaded.postSpacing).toBe(original.postSpacing);
  expect(loaded.markup).toEqual(original.markup);
  expect(loaded.pricing).toBe(original.pricing);
});
