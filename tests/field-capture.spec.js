// Field capture P1 (FIELD_CAPTURE_DESIGN_2026-10-31 §2-3): the drawing is the
// timesheet. A day is logged on the phone by Start day and taps on runs (posts
// set, then finished) and gates; S.actuals rides with the job snapshot.
const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function seedJob(page) {
  await state(page, `(()=>{
    S.projectName='Field Job';S.pan={x:80,y:80};S.zoom=1;
    S.elements=[
      {type:'fence',start:{x:0,y:100},end:{x:250,y:100},fenceType:'chainlink',runId:'run_a',
        specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10},
      {type:'fence',start:{x:0,y:180},end:{x:250,y:180},fenceType:'chainlink',runId:'run_b',
        specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10},
      {type:'gate',start:{x:150,y:100},end:{x:190,y:100},gateType:'walk',runId:'run_a'}];
    draw();updatePanel();
  })()`);
}

// Tap a world point on the canvas with a finger.
async function tapWorld(page, x, y) {
  const p = await state(page, `(()=>{const r=document.getElementById('canvas').getBoundingClientRect();
    return{x:r.left+S.pan.x+${x}*S.zoom,y:r.top+S.pan.y+${y}*S.zoom};})()`);
  await page.touchscreen.tap(p.x, p.y);
}

async function openField(page) {
  await page.locator('.ptab[data-tab="field"]').tap();
  await expect(page.locator('#tab-field')).toBeVisible();
}

const days = page => state(page, 'JSON.parse(JSON.stringify(S.actuals.days))');

// One logged day: run_a finished (two taps), run_b posts set, the gate done.
async function logDay(page) {
  await seedJob(page);
  await openField(page);
  await page.locator('#field-start').tap();
  await tapWorld(page, 60, 100);
  await tapWorld(page, 60, 100);
  await tapWorld(page, 60, 180);
  await tapWorld(page, 170, 100);
}

function expectLoggedDay(d) {
  expect(d).toHaveLength(1);
  expect(d[0].crew).toBe(2);
  expect(d[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(d[0].start).toMatch(/^\d{2}:\d{2}$/);
  expect(d[0].done).toEqual([{ runId: 'run_a', stage: 'finished' }, { runId: 'run_b', stage: 'posts' }]);
  expect(d[0].gatesDone).toHaveLength(1);
}

test.describe('field capture P1', () => {
  test.beforeEach(async ({ page }) => { await cleanOpen(page); });

  test('a day logged by taps on the phone survives reload', async ({ page }) => {
    await logDay(page);
    expectLoggedDay(await days(page));
    // Taps mark progress; they do not edit the drawing or its history.
    expect(await state(page, `S.elements.filter(e=>e.type==='fence').length`)).toBe(2);
    expect(await state(page, 'S.history.length')).toBe(0);
    await state(page, 'saveSession()');
    await page.reload();
    expectLoggedDay(await days(page));
    expect(await state(page, `S.elements.find(e=>e.type==='gate').gateId`))
      .toBe((await days(page))[0].gatesDone[0]);
  });

  test('a third tap clears the run; End day records the end time', async ({ page }) => {
    await seedJob(page);
    await openField(page);
    await page.locator('#field-start').tap();
    for (let i = 0; i < 3; i++) await tapWorld(page, 60, 100);
    expect((await days(page))[0].done).toEqual([]);
    await page.locator('#field-end').tap();
    expect((await days(page))[0].end).toMatch(/^\d{2}:\d{2}$/);
  });

  test('a run set on an earlier day goes straight to finished', async ({ page }) => {
    await seedJob(page);
    await state(page, `(()=>{S.actuals={crewDefault:3,days:[{date:'2026-10-01',crew:3,start:'07:00',end:'15:00',
      breakMin:30,tags:[],note:'',done:[{runId:'run_a',stage:'posts'}],gatesDone:[]}]};})()`);
    await openField(page);
    await page.locator('#field-start').tap();
    await tapWorld(page, 60, 100);
    const d = await days(page);
    expect(d).toHaveLength(2);
    expect(d[1].crew).toBe(3);
    expect(d[1].done).toEqual([{ runId: 'run_a', stage: 'finished' }]);
  });

  test('the log survives Save, Clear and loading the saved job', async ({ page }) => {
    await logDay(page);
    await state(page, `(()=>{document.getElementById('btn-jobs').click();document.getElementById('do-save').click();})()`);
    await state(page, `(()=>{window.confirm=()=>true;document.getElementById('btn-clear').click();})()`);
    expect(await days(page)).toEqual([]);
    await state(page, `(()=>{updateDrawers();document.querySelector('[data-ji="0"]').click();})()`);
    expectLoggedDay(await days(page));
  });

  test('the log survives portable export and import, and Re-price', async ({ page }) => {
    await logDay(page);
    const file = await state(page, 'JSON.stringify(snapshotState())');
    await state(page, `(()=>{window.confirm=()=>true;document.getElementById('btn-clear').click();})()`);
    await page.locator('#job-file-input').setInputFiles({
      name: 'field.fencebound.json', mimeType: 'application/json', buffer: Buffer.from(file) });
    await expect.poll(() => state(page, 'S.projectName')).toBe('Field Job');
    expectLoggedDay(await days(page));
    // Actuals sit beside the quote, not inside it: dropping the quote keeps them.
    await state(page, `S.quote={frozenAt:'2026-10-01T00:00:00Z',total:1,pricing:clonePricing()}`);
    await state(page, `(()=>{S.quote=null;useCompanyRateCard();})()`);
    expectLoggedDay(await days(page));
  });

  test('an actuals-only session restores at boot', async ({ page }) => {
    // Seeded before boot: a reload's own pagehide autosave would overwrite it.
    const session = await state(page, `JSON.stringify({...snapshotState(),elements:[],
      actuals:{crewDefault:4,days:[{date:'2026-10-02',crew:4,start:'07:00',end:null,breakMin:0,tags:['rain'],
        note:'rained out',done:[],gatesDone:[]}]}})`);
    await page.addInitScript(s => localStorage.setItem('fencebound_v2_session', s), session);
    await page.reload();
    const d = await days(page);
    expect(d).toHaveLength(1);
    expect(d[0].note).toBe('rained out');
  });

  test('bad actuals are dropped field by field and the job still loads', async ({ page }) => {
    await seedJob(page);
    const bad = {
      crewDefault: 99,
      days: [
        { date: '2026-10-03', crew: 0, start: '25:00', end: '16:30', breakMin: -5, tags: ['rock', 'lava', 7],
          note: 'x'.repeat(600), done: [{ runId: 'run_a', stage: 'posts' }, { runId: 'run_gone', stage: 'posts' },
            { runId: 'run_b', stage: 'painted' }, { runId: 'run_a', stage: 'finished' }],
          gatesDone: ['gate_gone', 5] },
        { date: 'yesterday', crew: 2 },
        'not a day',
        { date: '2026-02-30', crew: 2 },
      ],
    };
    const loaded = await state(page, `(()=>{applyState({...snapshotState(),actuals:${JSON.stringify(bad)}});
      return{name:S.projectName,runs:S.elements.filter(e=>e.type==='fence').length,a:JSON.parse(JSON.stringify(S.actuals))};})()`);
    expect(loaded.name).toBe('Field Job');
    expect(loaded.runs).toBe(2);
    expect(loaded.a.crewDefault).toBe(2);
    expect(loaded.a.days).toHaveLength(1);
    const d = loaded.a.days[0];
    expect(d.crew).toBe(2);
    expect(d.start).toBeNull();
    expect(d.end).toBe('16:30');
    expect(d.breakMin).toBe(0);
    expect(d.tags).toEqual(['rock']);
    expect(d.note).toHaveLength(500);
    expect(d.done).toEqual([{ runId: 'run_a', stage: 'posts' }]);
    expect(d.gatesDone).toEqual([]);
    for (const junk of [null, 'x', 5, { days: 'x' }]) {
      expect(await state(page, `(()=>{applyState({...snapshotState(),actuals:${JSON.stringify(junk)}});
        return JSON.parse(JSON.stringify(S.actuals));})()`)).toEqual({ crewDefault: 2, days: [], materials: [], closedAt: null });
    }
  });

  test('the Field tab says "not saved" when the last write failed', async ({ page }) => {
    await seedJob(page);
    await openField(page);
    await expect(page.locator('#field-save-flag')).toBeHidden();
    await state(page, `(()=>{window._origSet=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k===AUTOSAVE_KEY)throw new Error('injected quota');return _origSet.call(this,k,v);};})()`);
    await page.locator('#field-start').tap();
    await expect(page.locator('#field-save-flag')).toBeVisible();
    await expect(page.locator('#field-save-flag')).toContainText('not saved');
    await state(page, 'Storage.prototype.setItem=_origSet');
    await tapWorld(page, 60, 100);
    await expect(page.locator('#field-save-flag')).toBeHidden();
  });

  test('field progress never writes the company rate card', async ({ page }) => {
    const before = await state(page, 'localStorage.getItem(COSTDB_KEY)');
    await logDay(page);
    expect(await state(page, 'localStorage.getItem(COSTDB_KEY)')).toBe(before);
  });
});
