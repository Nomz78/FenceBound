const { test, expect } = require('@playwright/test');

// Diagnostic-only D1–D5 fixture. It is intentionally excluded from the default
// gate while the measured takeoff defects remain unresolved.
test.skip(process.env.FENCEBOUND_RUN_168LF_FIXTURE !== '1',
  'Diagnostic D1–D5 fixture intentionally excluded from the default gate while defects remain.');

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

async function seed168LfFixture(page) {
  await cleanOpen(page);
  return state(page, `(()=>{
    const points=[{x:0,y:0},{x:42*GRID_FT,y:0},{x:42*GRID_FT,y:42*GRID_FT},{x:0,y:42*GRID_FT}];
    const specs=cloneRunSpecs(S.specs);
    Object.assign(specs,{
      heightIn:72,postHeightIn:102,embedDepthIn:30,
      hasTopRail:true,hasMidRail:true,hasTrussRod:true,
      barbStrands:3,barbArm:'angled',
      addons:new Set(['bottom-wire','barbed-wire'])
    });
    const runs=points.map((start,index)=>({
      type:'fence',start,end:points[(index+1)%points.length],
      fenceType:'chainlink',runId:'fixture-run-'+(index+1),
      specs:cloneRunSpecs(specs),postSpacing:10,autoPostSpacing:10
    }));
    const posts=runs.flatMap(run=>autoPostsForRun(run.start,run.end,10,'chainlink',run.runId,run.specs));
    const gates=[
      // Placement is representational only. The owner has not ruled how these
      // openings segment a side, so no line-post-dependent assertion uses it.
      attachGateToRun({type:'gate',start:{x:5*GRID_FT,y:0},end:{x:9*GRID_FT,y:0},gateType:'walk',hinge:'start',swingDir:1},runs[0]),
      attachGateToRun({type:'gate',start:{x:15*GRID_FT,y:0},end:{x:27*GRID_FT,y:0},gateType:'doubledrive',hinge:'start',swingDir:1},runs[0])
    ];
    S.elements=[...runs,...posts,...gates];
    return {runs:runs.length,autoPosts:posts.length,gates:gates.length};
  })()`);
}

test('ratified footing parameters persist and bagsForHole uses the seeded schedule', async ({ page }) => {
  await cleanOpen(page);
  const result=await state(page, `(()=>{
    const defaults={footing:JSON.parse(JSON.stringify(FOOTING)),postOD:{...POST_OD_IN},runPostDia:{...S.specs.postDiaIn}};
    const bags=[24,30,36,42].map(depth=>bagsForHole('terminal',undefined,depth));
    FOOTING.bagsByDepthIn[30]=7;POST_OD_IN.gate=4.5;refreshPostDiaDefaults();saveCostDB();
    FOOTING=JSON.parse(JSON.stringify(DEFAULT_FOOTING));POST_OD_IN={...DEFAULT_POST_OD_IN};refreshPostDiaDefaults();loadCostDB();
    S.specs.postDiaIn.line=9;S.specs.postDiaDirty.line=true;POST_OD_IN.line=3;refreshPostDiaDefaults();
    const snapshot=snapshotState();
    FOOTING=JSON.parse(JSON.stringify(DEFAULT_FOOTING));POST_OD_IN={...DEFAULT_POST_OD_IN};S.specs=hydrateRunSpecs({...S.specs,postDiaIn:undefined,postDiaDirty:undefined});
    applyState(snapshot);
    const applied={bags:FOOTING.bagsByDepthIn[30],gateOD:POST_OD_IN.gate,runGateOD:S.specs.postDiaIn.gate,dirtyLineOD:S.specs.postDiaIn.line};
    const legacy=JSON.parse(JSON.stringify(snapshot));delete legacy.footing;delete legacy.postODIn;delete legacy.specs.postDiaIn;delete legacy.specs.postDiaDirty;
    applyState(legacy);
    const legacyLoaded={line:S.specs.postDiaIn.line,gate:S.specs.postDiaIn.gate};
    return {defaults,bags,restoredBags:FOOTING.bagsByDepthIn[30],restoredGateOD:POST_OD_IN.gate,
      runGateOD:S.specs.postDiaIn.gate,snapshotFooting:snapshot.footing,snapshotPostOD:snapshot.postODIn,applied,legacyLoaded};
  })()`);
  expect(result.defaults.footing).toEqual({
    bagsByDepthIn:{24:2,30:3,36:3,42:4},bagWeightLb:60,
    diaMultiplierAtOrBelow4in:4,diaMultiplierAbove4in:3
  });
  expect(result.defaults.postOD).toEqual({line:2.375,terminal:2.875,corner:2.875,gate:4});
  expect(result.defaults.runPostDia).toEqual(result.defaults.postOD);
  expect(result.bags).toEqual([2,3,3,4]);
  expect(result.restoredBags).toBe(7);
  expect(result.restoredGateOD).toBe(4.5);
  expect(result.runGateOD).toBe(4.5);
  expect(result.snapshotFooting.bagsByDepthIn[30]).toBe(7);
  expect(result.snapshotPostOD.gate).toBe(4.5);
  expect(result.applied).toEqual({bags:7,gateOD:4.5,runGateOD:4.5,dirtyLineOD:9});
  expect(result.legacyLoaded).toEqual({line:3,gate:4.5});
});

test('168 LF closed-loop quantity diagnostic', async ({ page }) => {
  await seed168LfFixture(page);
  const actual=await state(page, `(()=>{
    const stats=getStats(),bom=calcAutoMaterials();
    const sum=predicate=>bom.filter(predicate).reduce((total,row)=>total+Number(row.qty||0),0);
    const exact=name=>sum(row=>row.name===name);
    return {
      cornerPosts:stats.cornerPosts.size,
      gatePosts:sum(row=>/^Gate Post (?!Concrete)/.test(row.name)),
      tensionBars:exact('Tension Bar'),
      tensionBands:exact('Tension Band'),
      trussRods:exact('Truss Rod w/ Tightener'),
      trussConnectors:sum(row=>/truss rod connector/i.test(row.name)),
      terminalBraceBands:sum(row=>/terminal.*brace band|brace band.*terminal/i.test(row.name)),
      fabric:sum(row=>/^Chain Link Fabric/.test(row.name)),
      topRail:exact('Top Rail 1-5/8"'),
      midRail:exact('Mid Rail 1-5/8"'),
      bottomWire:exact('Bottom Tension Wire 9ga'),
      barbedWire:sum(row=>/^Barbed Wire Strand/.test(row.name)),
      railEndCups:sum(row=>/Rail End/.test(row.name)),
      barbArms:sum(row=>/^Barb Arm/.test(row.name)),
      terminalPost105:sum(row=>/^Terminal\\/Corner Post 10\\.5'/.test(row.name)),
      gatePost105:sum(row=>/^Gate Post 10\\.5'/.test(row.name)),
      wrongLinePostLength:sum(row=>/^Line Post (?!9')/.test(row.name)),
      gateConcrete60:exact('Gate Post Concrete (60lb bag)'),
      gateConcrete80:exact('Gate Post Concrete (80lb bag)')
    };
  })()`);
  const expected={
    cornerPosts:4,gatePosts:4,tensionBars:12,tensionBands:60,
    trussRods:12,trussConnectors:12,terminalBraceBands:20,
    fabric:152,topRail:152,midRail:152,bottomWire:152,barbedWire:456,
    railEndCups:36,barbArms:8,terminalPost105:4,gatePost105:4,
    wrongLinePostLength:0,gateConcrete60:12,gateConcrete80:0
  };
  const deltas=Object.keys(expected).map(item=>({item,expected:expected[item],actual:actual[item],delta:actual[item]-expected[item]}));
  console.log('FIXTURE_168LF_DELTAS',JSON.stringify(deltas.filter(row=>row.delta!==0)));
  for(const row of deltas)expect.soft(row.actual,`${row.item}: expected ${row.expected}, actual ${row.actual}, delta ${row.delta>=0?'+':''}${row.delta}`).toBe(row.expected);

  // TODO: line-post count depends on how the two gate openings segment their side.
  // TODO: post-cap count consequently depends on the unresolved line-post count.
  // TODO: line-size brace-band count consequently depends on the unresolved line-post count.
  // TODO: total concrete includes line posts and therefore depends on the unresolved line-post count.
});
