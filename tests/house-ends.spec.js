const { test, expect } = require('@playwright/test');
const fs = require('fs');

const state = (page, expression) => page.evaluate(source => window.eval(source), expression);

async function openRun(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await state(page, `(()=>{
    S.elements=[];S.history=[];S.future=[];S.selected=null;
    S.projectName='House ends';S.fenceType='chainlink';S.postSpacing=10;S.autoPost=true;
    S.drawing={type:'fence',start:{x:0,y:0},end:{x:40*GRID_FT,y:0}};
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
  await selectRun(page);
}

async function selectRun(page, index = 0) {
  await state(page, `S.selected=S.elements.indexOf(S.elements.filter(e=>e.type==='fence')[${index}]);syncSelectedRunToPanel();updatePanel()`);
}

async function mark(page, end = 'start', type = 'house') {
  await expect(page.locator('#run-end-controls')).toBeVisible();
  await page.locator(`#run-${end}-type`).selectOption(type);
}

async function takeoff(page) {
  return state(page, `(()=>{const s=getStats();return {bom:calcAutoMaterials(),total:computePricing().clientTotal,
    terminal:s.terminalPosts.size,corner:s.cornerPosts.size,ends:s.terminationEnds,feet:s.netTotalFt};})()`);
}

test('house ends keep posts, concrete and hardware; each end can be changed and undone independently', async ({ page }) => {
  await openRun(page);
  const before=await takeoff(page);
  expect(before.terminal).toBe(2);
  await mark(page);
  await mark(page,'end');
  await expect(page.locator('#run-end-controls')).toContainText('within 3" of the wall');
  expect(await takeoff(page)).toEqual(before);
  await page.locator('#btn-undo').click();
  await selectRun(page);
  await expect(page.locator('#run-start-type')).toHaveValue('house');
  await expect(page.locator('#run-end-type')).toHaveValue('post');
  await page.locator('#btn-redo').click();
  await selectRun(page);
  await expect(page.locator('#run-end-type')).toHaveValue('house');
  await mark(page,'start','post');
  await expect(page.locator('#run-end-type')).toHaveValue('house');
  expect(await takeoff(page)).toEqual(before);
});

test('house ends survive autosave and real job-file export/import without changing the takeoff', async ({ page }) => {
  await openRun(page);
  await mark(page);
  await mark(page,'end');
  const before=await takeoff(page);
  // Wait for the actual debounced autosave, then restore on boot.
  await expect.poll(()=>state(page, `JSON.parse(localStorage.getItem(AUTOSAVE_KEY)||'{}').elements?.[0]?.endEndType`)).toBe('house');
  await page.reload();
  await selectRun(page);
  await expect(page.locator('#run-start-type')).toHaveValue('house');
  await expect(page.locator('#run-end-type')).toHaveValue('house');
  expect(await takeoff(page)).toEqual(before);
  await page.locator('#btn-jobs').click();
  const downloading=page.waitForEvent('download');
  await page.locator('#do-export').click();
  const download=await downloading;
  const bytes=fs.readFileSync(await download.path());
  const saved=JSON.parse(bytes.toString());
  expect(saved.elements[0].startEndType).toBe('house');
  expect(saved.elements[0].endEndType).toBe('house');
  if(await page.locator('#validation-close').isVisible())await page.locator('#validation-close').click();
  await state(page,'S.showJobs=false;updateDrawers()');
  await mark(page,'end','post');
  await page.locator('#job-file-input').setInputFiles({name:'house.fencebound.json',mimeType:'application/json',buffer:bytes});
  await expect.poll(()=>state(page,'S.elements[0].endEndType')).toBe('house');
  await selectRun(page);
  await expect(page.locator('#run-end-type')).toHaveValue('house');
  expect(await takeoff(page)).toEqual(before);
});

test('Saved Jobs isolate house markings; copied runs retain them and legacy jobs default to normal posts', async ({ page }) => {
  await openRun(page);
  await mark(page);
  await page.locator('#btn-jobs').click();
  await page.locator('#do-save').click();
  await state(page,'S.showJobs=false;updateDrawers()');
  await mark(page,'start','post');
  await page.locator('#btn-jobs').click();
  await page.locator('[data-ji="0"]').click();
  await selectRun(page);
  await expect(page.locator('#run-start-type')).toHaveValue('house');
  await page.locator('#btn-copy').click();
  await page.locator('#btn-paste').click();
  await expect(page.locator('#run-start-type')).toHaveValue('house');
  await mark(page,'start','post');
  await selectRun(page,0);
  await expect(page.locator('#run-start-type')).toHaveValue('house');
  // An older job must not inherit a house marking from the active job.
  const legacy=await state(page, `(()=>{const s=JSON.parse(JSON.stringify(snapshotState()));
    s.elements.forEach(e=>{delete e.startEndType;delete e.endEndType;});return s;})()`);
  await page.locator('#job-file-input').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await expect.poll(()=>state(page,'S.selected')).toBe(null);
  await selectRun(page);
  await expect(page.locator('#run-start-type')).toHaveValue('post');
  await expect(page.locator('#run-end-type')).toHaveValue('post');
});

test('canvas identifies the marked endpoint and new runs do not inherit house ends', async ({ page }) => {
  await openRun(page);
  await mark(page,'end');
  const labels=await state(page, `(()=>{
    const ctx=document.getElementById('canvas').getContext('2d'),labels=[],fill=ctx.fillText;
    ctx.fillText=function(text,...args){labels.push(text);return fill.call(this,text,...args);};
    try{draw();}finally{ctx.fillText=fill;}
    return labels;
  })()`);
  expect(labels).toContain('B · House/wall');
  expect(labels).not.toContain('A · House/wall');
  await state(page, `S.selected=null;S.drawing={type:'fence',start:{x:0,y:20*GRID_FT},end:{x:40*GRID_FT,y:20*GRID_FT}};handleUp({preventDefault(){},stopPropagation(){}})`);
  await selectRun(page,1);
  await expect(page.locator('#run-start-type')).toHaveValue('post');
  await expect(page.locator('#run-end-type')).toHaveValue('post');
  await page.locator('[data-tool="boundary"]').click();
  await expect(page.locator('#run-end-controls')).toBeHidden();
});

test('unrecognized saved end types are reported and can be repaired through the control', async ({ page }) => {
  await openRun(page);
  const errors=await state(page, `S.elements[0].startEndType='wall-without-post';validateProject({includePricing:false,requireClient:false}).errors.map(e=>e.code)`);
  expect(errors).toContain('END_TYPE');
  // Null is also invalid; selecting the legacy/default post setting must
  // repair it, rather than treating null as an already-correct default.
  await state(page,'S.elements[0].startEndType=null;syncSelectedRunToPanel()');
  await mark(page,'start','post');
  expect(await state(page, 'validateProject({includePricing:false,requireClient:false}).errors.map(e=>e.code)')).not.toContain('END_TYPE');
});
