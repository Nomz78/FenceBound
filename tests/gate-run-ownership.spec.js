const { test, expect } = require('@playwright/test');

// Gate/run ownership (2026-10-15 estimator audit, Step 1.3: CAD-02..05, I-F-7, I-F-13).
// A gate belongs to the run it lies on; gate edges share posts with run ends and
// with each other; a run carries and deletes its own gates; line posts are laid
// out per fabric section between gates.

const state = (page, expression) => page.evaluate(source => window.eval(source), expression);
const EV = '({preventDefault(){},stopPropagation(){}})';

async function open(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await state(page, `(()=>{
    S.elements=[];S.materials=[];S.history=[];S.future=[];S.selected=null;
    S.postSpacing=10;S.autoPost=true;S.fenceType='chainlink';S.snapFt=1;
    S.specs=cloneRunSpecs({...S.specs,heightIn:72,postHeightIn:102,embedDepthIn:30,hasMidRail:false,hasTrussRod:false,addons:[]});
    updateUndoButtons();draw();updatePanel();
  })()`);
}

// Draw through the production drawing handler (same path as a pointer release).
async function drawEl(page, type, x1, y1, x2, y2, gateType = 'walk') {
  await state(page, `(()=>{
    S.gateType=${JSON.stringify(gateType)};
    S.drawing={type:${JSON.stringify(type)},start:{x:${x1}*GRID_FT,y:${y1}*GRID_FT},end:{x:${x2}*GRID_FT,y:${y2}*GRID_FT}};
    handleUp(${EV});
  })()`);
}

async function take(page) {
  return state(page, `(()=>{
    const st=getStats(),bom=calcAutoMaterials(),P=computePricing();
    const v=validateProject({requireClient:false,includePricing:false});
    const q=re=>bom.filter(r=>new RegExp(re).test(r.name)).reduce((n,r)=>n+Number(r.qty||0),0);
    return {net:st.netTotalFt,gates:st.gateTotal,gatePosts:q('^Gate Post (?!Concrete)'),gateKits:q('w/ Hardware$'),
      terminal:st.terminalPosts.size,corner:st.cornerPosts.size,ends:st.terminationEnds,
      bars:q('^Tension Bar$'),bands:q('^Tension Band$'),brace:q('^Terminal-size Brace Band$'),
      bolts:q('Carriage Bolt'),railEnds:q('^Rail End'),terminalPostQty:q('^Terminal/Corner Post'),
      postConcrete:q('^Post Concrete'),gateConcrete:q('^Gate Post Concrete'),
      posts:S.elements.filter(e=>e.type==='post'&&e.auto).map(e=>[+(e.pos.x/GRID_FT).toFixed(3),+(e.pos.y/GRID_FT).toFixed(3)]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
      gateGeom:S.elements.filter(e=>e.type==='gate').map(g=>[g.start.x/GRID_FT,g.start.y/GRID_FT,g.end.x/GRID_FT,g.end.y/GRID_FT].map(n=>+n.toFixed(3))),
      errors:v.errors.map(e=>e.code),final:P.isFinalReady,total:P.cents.clientTotal};
  })()`);
}

async function undo(page) { await page.locator('#btn-undo').click(); }

// Screen point of a world point in feet on the canvas.
async function screen(page, xFt, yFt) {
  const box = await page.locator('#canvas').boundingBox();
  const view = await state(page, '({pan:S.pan,zoom:S.zoom})');
  return { x: box.x + view.pan.x + xFt * 40 * view.zoom, y: box.y + view.pan.y + yFt * 40 * view.zoom };
}
async function drag(page, from, to) {
  const a = await screen(page, ...from), b = await screen(page, ...to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
}

test('1 a gate is owned only by the run it lies on; off-run, stacked and oversized gates are errors', async ({ page }) => {
  await open(page);
  await drawEl(page, 'fence', 0, 10, 40, 10);
  const base = await take(page);
  expect(base.final).toBe(true);

  // 20 ft away from the run: refused when drawn (owner ruling F6, 2026-10-29),
  // so nothing is deducted or priced. Off-run gates in older saved jobs still report ORPHAN_GATE.
  await drawEl(page, 'gate', 20, 30, 24, 30);
  let r = await take(page);
  expect({ net: r.net, gates: r.gates, kits: r.gateKits, posts: r.gatePosts }).toEqual({ net: 40, gates: 0, kits: 0, posts: 0 });
  expect(r.errors).not.toContain('ORPHAN_GATE');
  expect(r.final).toBe(true);
  await undo(page);

  // Drawn across the run (perpendicular): not on it, so refused.
  await drawEl(page, 'gate', 22, 8, 22, 12);
  r = await take(page);
  expect({ net: r.net, gates: r.gates, kits: r.gateKits }).toEqual({ net: 40, gates: 0, kits: 0 });
  expect(r.errors).not.toContain('ORPHAN_GATE');
  await undo(page);

  // Stacked gates on the same run: an overlap error; the opening is removed once.
  await drawEl(page, 'gate', 20, 10, 24, 10);
  await drawEl(page, 'gate', 20, 10, 24, 10);
  r = await take(page);
  expect(r.errors).toContain('GATE_OVERLAP');
  expect(r.net).toBe(36);
  expect(r.gatePosts).toBe(2);
  await undo(page); await undo(page);

  // Within the stated tolerance on a diagonal run (0.6 ft off the line): owned.
  await drawEl(page, 'fence', 0, 50, 30, 90);
  await drawEl(page, 'gate', 6, 58, 9, 63);
  r = await take(page);
  expect(r.gates).toBe(1);
  expect(r.errors).not.toContain('ORPHAN_GATE');

  // A gate longer than its run: refused when drawn (its far end is past the 2 ft
  // F6 limit), never deducted to zero and priced. Saved jobs still report GATE_LONGER_THAN_RUN.
  await open(page);
  await drawEl(page, 'fence', 0, 0, 10, 0);
  await drawEl(page, 'gate', 0, 0, 20, 0, 'doubledrive');
  r = await take(page);
  expect(r.errors).not.toContain('GATE_LONGER_THAN_RUN');
  expect({ net: r.net, gates: r.gates, kits: r.gateKits, posts: r.gatePosts, bars: r.bars }).toEqual({ net: 10, gates: 0, kits: 0, posts: 0, bars: 2 });
});

test('2 a gate at a run end, at a corner, or beside another gate shares the post', async ({ page }) => {
  await open(page);
  await drawEl(page, 'fence', 2, 10, 42, 10);
  const base = await take(page);
  await drawEl(page, 'gate', 2, 10, 6, 10);
  const r = await take(page);
  // Three physical posts: one terminal, two gate posts. One fabric section, two ends.
  expect({ terminal: r.terminal, terminalQty: r.terminalPostQty, gatePosts: r.gatePosts, ends: r.ends })
    .toEqual({ terminal: 1, terminalQty: 1, gatePosts: 2, ends: 2 });
  for (const k of ['bars', 'bands', 'brace', 'bolts', 'railEnds']) expect(r[k], k).toBe(base[k]);
  expect(r.postConcrete * 2).toBe(base.postConcrete);

  // Adjacent gates share their common post: 3 gate posts, 2 fabric sections.
  await open(page);
  await drawEl(page, 'fence', 0, 0, 100, 0);
  await drawEl(page, 'gate', 40, 0, 44, 0, 'walk');
  const one = await take(page);
  await drawEl(page, 'gate', 44, 0, 56, 0, 'doubledrive');
  const two = await take(page);
  expect({ gatePosts: two.gatePosts, ends: two.ends, bars: two.bars }).toEqual({ gatePosts: 3, ends: 4, bars: 4 });
  expect(two.gateConcrete * 2).toBe(one.gateConcrete * 3);
  expect(two.net).toBe(84);

  // Gate ending at a corner: the corner post is the gate post.
  await open(page);
  await drawEl(page, 'fence', 0, 0, 20, 0);
  await drawEl(page, 'fence', 20, 0, 20, 20);
  await drawEl(page, 'gate', 16, 0, 20, 0);
  const c = await take(page);
  expect({ terminal: c.terminal, corner: c.corner, gatePosts: c.gatePosts, ends: c.ends, bars: c.bars })
    .toEqual({ terminal: 2, corner: 0, gatePosts: 2, ends: 4, bars: 4 });
});

test('3 moving a run carries its gates; deleting it removes gates and posts; each is one undo', async ({ page }) => {
  await open(page);
  await state(page, 'S.zoom=0.4;S.pan={x:80,y:80};draw()');
  await drawEl(page, 'fence', 0, 0, 24, 0);
  await drawEl(page, 'gate', 10, 0, 14, 0);
  const before = await take(page);
  const elementsBefore = await state(page, 'JSON.stringify(snapshotDoc().elements)');

  // Real pointer drag of the run body with the Move tool.
  await page.locator('[data-tool="move"]').click();
  await drag(page, [5, 0], [5, 6]);
  let r = await take(page);
  expect(r.gateGeom).toEqual([[10, 6, 14, 6]]);
  expect(r.net).toBe(20);
  expect(r.gates).toBe(1);
  expect(r.errors).not.toContain('ORPHAN_GATE');
  expect(r.posts.every(([x, y]) => y === 6 && !(x > 10 && x < 14))).toBe(true);
  await undo(page);
  expect(await state(page, 'JSON.stringify(snapshotDoc().elements)')).toBe(elementsBefore);

  // Stretching the far end around the start rotates the gate with the run.
  await drag(page, [24, 0], [0, 24]);
  r = await take(page);
  expect(r.gateGeom).toEqual([[0, 10, 0, 14]]);
  expect(r.gates).toBe(1);
  expect(r.net).toBe(20);
  await undo(page);
  expect(await take(page)).toEqual(before);

  // Deleting the run removes its gate and automatic posts.
  await state(page, "S.selected=S.elements.findIndex(e=>e.type==='fence');updatePanel()");
  await page.keyboard.press('Delete');
  expect(await state(page, 'S.elements.map(e=>e.type)')).toEqual([]);
  expect((await take(page)).gates).toBe(0);
  await undo(page);
  expect(await state(page, 'JSON.stringify(snapshotDoc().elements)')).toBe(elementsBefore);
});

test('4 line posts are laid out per fabric section and never inside a gate opening', async ({ page }) => {
  await open(page);
  await drawEl(page, 'fence', 0, 0, 42, 0);
  await drawEl(page, 'gate', 15, 0, 27, 0, 'doubledrive');
  const r = await take(page);
  // Sections 0-15 and 27-42, each spaced from its own start at 10 ft.
  expect(r.posts).toEqual([[10, 0], [37, 0]]);

  // The 168 LF reference layout (drive gate 15-27 on the 56 ft back run): a rebuild
  // leaves no line post inside the drive opening and no 1-2 ft bays.
  const back = await state(page, `(()=>{
    S.elements=[];
    const run={type:'fence',start:{x:0,y:56*GRID_FT},end:{x:56*GRID_FT,y:56*GRID_FT},fenceType:'chainlink',
      runId:'fixture-run-2',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10};
    const gates=[
      attachGateToRun({type:'gate',start:{x:5*GRID_FT,y:run.start.y},end:{x:9*GRID_FT,y:run.start.y},gateType:'walk',hinge:'start',swingDir:1},run),
      attachGateToRun({type:'gate',start:{x:15*GRID_FT,y:run.start.y},end:{x:27*GRID_FT,y:run.start.y},gateType:'doubledrive',hinge:'start',swingDir:1},run)];
    S.elements=[run,...autoPostsForRun(run.start,run.end,10,'chainlink',run.runId,run.specs),...gates];
    rebuildRunAutoPosts(run);
    return S.elements.filter(e=>e.type==='post'&&e.auto).map(e=>e.pos.x/GRID_FT).sort((a,b)=>a-b);
  })()`);
  expect(back).toEqual([37, 47]);
});

// Follow-up: a gate the user aims at a run is accepted at every snap setting. On a
// diagonal run, coarse snaps land gate edges up to snapFt*0.71 ft off the line.
test('5 a gate drawn on a diagonal run is owned at every snap setting', async ({ page }) => {
  const snaps = await (async () => { await open(page); return state(page, 'SNAP_OPTIONS'); })();
  const results = [];
  for (const snap of snaps) {
    await open(page);
    await state(page, 'S.zoom=0.25;S.pan={x:80,y:80};S.autoPost=false;draw()');
    await drawEl(page, 'fence', 0, 0, 30, 40);
    await page.locator('#snap-row .chip', { hasText: new RegExp(`^${String(snap).replace('.', '\\.')}'$`) }).click();
    await page.locator('[data-tool="gate"]').click();
    // Aim along the run from 15 ft to 27 ft.
    await drag(page, [9, 12], [16.2, 21.6]);
    const r = await take(page);
    const onLine = await state(page, `(()=>{const g=S.elements.find(e=>e.type==='gate'),run=S.elements.find(e=>e.type==='fence'),ax=runAxis(run);
      return !!g&&ax.off(g.start)<1e-6&&ax.off(g.end)<1e-6;})()`);
    results.push({ snap, gates: r.gates, orphan: r.errors.includes('ORPHAN_GATE'), final: r.final, onLine });
  }
  expect(results).toEqual(snaps.map(snap => ({ snap, gates: 1, orphan: false, final: true, onLine: true })));
});

test('6 saved jobs with slightly off-line gates load owned; far gates stay orphan', async ({ page }) => {
  await open(page);
  const r = await state(page, `(()=>{
    const run={type:'fence',start:{x:0,y:0},end:{x:30*GRID_FT,y:40*GRID_FT},fenceType:'chainlink',runId:'legacy-run',
      specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:null};
    const gate=(start,end,runId)=>({type:'gate',start:{x:start[0]*GRID_FT,y:start[1]*GRID_FT},end:{x:end[0]*GRID_FT,y:end[1]*GRID_FT},
      gateType:'walk',hinge:'start',swingDir:1,fenceType:'chainlink',specs:cloneRunSpecs(S.specs),...(runId?{runId}:{})});
    S.elements=[run,gate([10,10],[20,20],'legacy-run'),gate([12,18],[16,22]),gate([40,10],[44,10],'legacy-run')];
    const saved=JSON.parse(JSON.stringify(snapshotState()));
    applyState(saved);
    const v=validateProject({requireClient:false,includePricing:false});
    const ax=runAxis(S.elements[0]);
    return {owned:S.elements.filter(e=>e.type==='gate').map(g=>!!gateOwnerRun(g)),
      onLine:S.elements.filter(e=>e.type==='gate').slice(0,2).every(g=>ax.off(g.start)<1e-6&&ax.off(g.end)<1e-6),
      orphans:v.errors.filter(e=>e.code==='ORPHAN_GATE').length};
  })()`);
  expect(r).toEqual({ owned: [true, true, false], onLine: true, orphans: 1 });
});
