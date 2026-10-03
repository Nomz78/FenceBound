const { test, expect } = require('@playwright/test');

const state = (page, expression) => page.evaluate(source => window.eval(source), expression);

async function openRun(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await state(page, `(()=>{
    S.elements=[];S.materials=[];S.history=[];S.future=[];S.selected=null;
    S.postSpacing=10;S.autoPost=true;S.fenceType='chainlink';
    S.specs=cloneRunSpecs({...S.specs,heightIn:72,postHeightIn:102,embedDepthIn:30,hasMidRail:false,hasTrussRod:false,addons:[]});
    S.drawing={type:'fence',start:{x:0,y:0},end:{x:42*GRID_FT,y:0}};
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
}

async function record(page) {
  return state(page, `(()=>{
    const stats=getStats(),price=computePricing();
    return {feet:stats.totalFt,netFeet:stats.netTotalFt,linePosts:stats.linePosts,
      positions:S.elements.filter(e=>e.type==='post'&&e.auto).map(e=>[e.pos.x/GRID_FT,e.pos.y/GRID_FT]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
      bom:calcAutoMaterials(),total:price.clientTotal};
  })()`);
}

async function moveElement(page, type, dx, dy) {
  await state(page, `(()=>{
    const idx=S.elements.findIndex(e=>e.type===${JSON.stringify(type)}),el=S.elements[idx];
    pushHistory();S.moving={idx,type:'body'};S.moveOrigEl=JSON.parse(JSON.stringify(el));
    el.start={x:el.start.x+${dx}*GRID_FT,y:el.start.y+${dy}*GRID_FT};
    el.end={x:el.end.x+${dx}*GRID_FT,y:el.end.y+${dy}*GRID_FT};
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
}

async function addGate(page, start = 15, end = 27) {
  await state(page, `(()=>{
    S.gateType='doubledrive';
    S.drawing={type:'gate',start:{x:${start}*GRID_FT,y:0},end:{x:${end}*GRID_FT,y:0}};
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
}

test('unchanged move and repeated translations keep post count and quote stable', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  expect(before.linePosts).toBe(4);
  await moveElement(page,'fence',0,0);
  expect(await record(page)).toEqual(before);
  for(let i=0;i<3;i++) {
    await moveElement(page,'fence',0,2);
    const after=await record(page);
    expect(after.linePosts).toBe(4);
    expect(after.positions).toEqual([10,20,30,40].map(x=>[x,2*(i+1)]));
    expect(after.bom).toEqual(before.bom);
    expect(after.total).toBe(before.total);
  }
});

test('spacing control recalculates selected run and undo/redo restores quantities and price', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await state(page,'S.selected=S.elements.findIndex(e=>e.type===\'fence\');syncSelectedRunToPanel()');
  await page.locator('#spacing-slider').fill('6');
  const after=await record(page);
  expect(after.positions).toEqual([6,12,18,24,30,36].map(x=>[x,0]));
  expect(after.linePosts).toBe(6);
  expect(after.total).toBeGreaterThan(before.total);
  await page.locator('#btn-undo').click();
  expect(await record(page)).toEqual(before);
  await page.locator('#btn-redo').click();
  expect(await record(page)).toEqual(after);
});

test('moving one run preserves another run and manual posts at shared coordinates', async ({ page }) => {
  await openRun(page);
  await state(page,`(()=>{
    const run=S.elements.find(e=>e.type==='fence');
    const other={...run,runId:'other',specs:cloneRunSpecs(run.specs)};
    S.elements.push(other,...autoPostsForRun(other.start,other.end,10,other.fenceType,other.runId,other.specs));
    S.elements.push({type:'post',pos:{x:400,y:0},fenceType:'chainlink',probeManual:true});
  })()`);
  const otherBefore=await state(page,"JSON.stringify(S.elements.filter(e=>e.runId==='other'||e.probeManual))");
  await moveElement(page,'fence',0,2);
  expect(await state(page,"JSON.stringify(S.elements.filter(e=>e.runId==='other'||e.probeManual))")).toBe(otherBefore);
});

test('gate placement and movement remove posts inside opening and restore vacated positions', async ({ page }) => {
  await openRun(page);
  await addGate(page);
  expect((await record(page)).positions).toEqual([[10,0],[30,0],[40,0]]);
  expect((await record(page)).netFeet).toBe(30);
  await moveElement(page,'gate',10,0);
  expect((await record(page)).positions).toEqual([[10,0],[20,0],[40,0]]);
  await page.locator('#btn-undo').click();
  expect((await record(page)).positions).toEqual([[10,0],[30,0],[40,0]]);
  await page.locator('#btn-redo').click();
  expect((await record(page)).positions).toEqual([[10,0],[20,0],[40,0]]);
});

for(const method of ['button','keyboard'])test(`gate deletion through ${method} restores original quantities and price`, async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await addGate(page,10,20);
  expect((await record(page)).positions).toEqual([[30,0],[40,0]]);
  await state(page,"S.selected=S.elements.findIndex(e=>e.type==='gate');updatePanel()");
  if(method==='button')await page.locator('#btn-delete').click();
  else await page.keyboard.press('Delete');
  expect(await record(page)).toEqual(before);
});

test('boundaries do not create materials, and loading preserves saved post coordinates', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await state(page,`(()=>{
    S.drawing={type:'boundary',start:{x:0,y:400},end:{x:1680,y:400}};
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
  expect(await record(page)).toEqual(before);
  await state(page,`(()=>{
    S.elements.find(e=>e.type==='post').pos.x=9*GRID_FT;
    const snapshot=JSON.parse(JSON.stringify(snapshotState()));
    applyState(snapshot);
  })()`);
  expect((await record(page)).positions).toEqual([[9,0],[20,0],[30,0],[40,0]]);
});

test('dragging the spacing value edits the selected run', async ({ page }) => {
  await openRun(page);
  await state(page,"S.selected=0;syncSelectedRunToPanel()");
  const box=await page.locator('#spacing-val').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2-32,box.y+box.height/2);
  await page.mouse.up();
  expect((await record(page)).positions).toEqual([6,12,18,24,30,36].map(x=>[x,0]));
});

for(const method of ['button','keyboard'])test(`copied fence via ${method} owns independent posts and keeps run specifications`, async ({ page }) => {
  await openRun(page);
  await state(page,"S.elements[0].specs.addons.add('barbed-wire');S.selected=0;updatePanel()");
  if(method==='button') {
    await page.locator('#btn-copy').click();await page.locator('#btn-paste').click();
  } else {
    await page.keyboard.press('Control+c');await page.keyboard.press('Control+v');
  }
  const runs=await state(page,"S.elements.filter(e=>e.type==='fence').map(r=>({id:r.runId,addons:[...hydrateRunSpecs(r.specs).addons],posts:S.elements.filter(p=>p.type==='post'&&p.auto&&p.runId===r.runId).length}))");
  expect(new Set(runs.map(r=>r.id)).size).toBe(2);
  expect(runs.map(r=>r.posts)).toEqual([4,4]);
  expect(runs.map(r=>r.addons)).toEqual([['barbed-wire'],['barbed-wire']]);
  const original=await state(page,`JSON.stringify(S.elements.filter(e=>e.runId===${JSON.stringify(runs[0].id)}))`);
  await page.locator('#spacing-slider').fill('6');
  expect(await state(page,`JSON.stringify(S.elements.filter(e=>e.runId===${JSON.stringify(runs[0].id)}))`)).toBe(original);
  expect(await state(page,`S.elements.filter(e=>e.type==='post'&&e.runId===${JSON.stringify(runs[1].id)}).length`)).toBe(6);
});

test('touch spacing scrub uses selected spacing and supports undo', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await state(page,`(()=>{
    S.selected=0;S.postSpacing=12;
    const target=document.getElementById('spacing-val');
    function touch(type,x){
      const event=new Event(type,{bubbles:true,cancelable:true});
      Object.defineProperty(event,'touches',{value:type==='touchend'?[]:[{clientX:x}]});
      target.dispatchEvent(event);
    }
    touch('touchstart',100);touch('touchmove',68);touch('touchend',68);
  })()`);
  expect((await record(page)).positions).toEqual([6,12,18,24,30,36].map(x=>[x,0]));
  await page.locator('#btn-undo').click();
  expect(await record(page)).toEqual(before);
});

test('endpoint stretch rebuilds owned posts and undo restores the quote', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await state(page,`(()=>{
    pushHistory();S.moving={idx:0,type:'endpoint',endpoint:'end'};
    S.moveOrigEl=JSON.parse(JSON.stringify(S.elements[0]));
    S.elements[0].end.x=60*GRID_FT;
    handleUp({preventDefault(){},stopPropagation(){}});
  })()`);
  expect((await record(page)).positions).toEqual([10,20,30,40,50].map(x=>[x,0]));
  await page.locator('#btn-undo').click();
  expect(await record(page)).toEqual(before);
});

test('ambiguous saved run IDs do not delete either set of stored posts', async ({ page }) => {
  await openRun(page);
  const before=await state(page,"JSON.stringify(S.elements.filter(e=>e.type==='post'))");
  await state(page,`(()=>{
    const run=S.elements[0],clone={...run,start:{x:0,y:400},end:{x:1680,y:400},specs:cloneRunSpecs(run.specs)};
    S.elements.push(clone);S.selected=S.elements.length-1;setActivePostSpacing(6);
  })()`);
  expect(await state(page,"JSON.stringify(S.elements.filter(e=>e.type==='post'))")).toBe(before);
  await expect(page.locator('#app-toast')).toContainText('duplicate fence run IDs');
  expect(await state(page,"validateProject({requireClient:false,includePricing:false}).errors.map(e=>e.code)")).toContain('RUN_ID_DUPLICATE');
});

test('type switch restores both type and quantities with one undo', async ({ page }) => {
  await openRun(page);
  const before=await record(page);
  await state(page,"S.selected=0;selectFenceType('woodprivacy')");
  expect((await record(page)).positions).toEqual([8,16,24,32,40].map(x=>[x,0]));
  await page.locator('#btn-undo').click();
  expect(await record(page)).toEqual(before);
});

test('spacing edits preserve a run created with auto-posts off', async ({ page }) => {
  await openRun(page);
  await state(page,"S.elements=S.elements.filter(e=>e.type!=='post');S.elements[0].autoPostSpacing=null;S.selected=0;setActivePostSpacing(6)");
  expect((await record(page)).linePosts).toBe(0);
  expect(await state(page,'S.elements[0].autoPostSpacing')).toBe(null);
});
