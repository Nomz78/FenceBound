const { test, expect } = require('@playwright/test');

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
      postEmbedIn:{line:18,terminal:30,corner:30,gate:30},
      postEmbedDirty:{line:false,terminal:false,corner:false,gate:false},
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
      // Placement is representational only; the owner-ratified quantity table
      // controls the line-post count without inventing a segmentation rule.
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
    const defaults={footing:JSON.parse(JSON.stringify(FOOTING)),postOD:{...POST_OD_IN},postEmbed:{...POST_EMBED_IN},runPostDia:{...S.specs.postDiaIn},runPostEmbed:{...S.specs.postEmbedIn}};
    const bags=[24,30,36,42].map(depth=>bagsForHole('terminal',undefined,depth));
    FOOTING.bagsByDepthIn[30]=7;POST_OD_IN.gate=4.5;POST_EMBED_IN.gate=36;refreshPostDiaDefaults();saveCostDB();
    FOOTING=JSON.parse(JSON.stringify(DEFAULT_FOOTING));POST_OD_IN={...DEFAULT_POST_OD_IN};POST_EMBED_IN={...DEFAULT_POST_EMBED_IN};refreshPostDiaDefaults();loadCostDB();
    S.specs.postDiaIn.line=9;S.specs.postDiaDirty.line=true;S.specs.postEmbedIn.line=17;S.specs.postEmbedDirty.line=true;
    POST_OD_IN.line=3;POST_EMBED_IN.line=20;refreshPostDiaDefaults();
    const snapshot=snapshotState();
    FOOTING=JSON.parse(JSON.stringify(DEFAULT_FOOTING));POST_OD_IN={...DEFAULT_POST_OD_IN};POST_EMBED_IN={...DEFAULT_POST_EMBED_IN};S.specs=hydrateRunSpecs({...S.specs,postDiaIn:undefined,postDiaDirty:undefined,postEmbedIn:undefined,postEmbedDirty:undefined});
    applyState(snapshot);
    const applied={bags:FOOTING.bagsByDepthIn[30],gateOD:POST_OD_IN.gate,gateEmbed:POST_EMBED_IN.gate,runGateOD:S.specs.postDiaIn.gate,runGateEmbed:S.specs.postEmbedIn.gate,dirtyLineOD:S.specs.postDiaIn.line,dirtyLineEmbed:S.specs.postEmbedIn.line};
    const legacy=JSON.parse(JSON.stringify(snapshot));delete legacy.footing;delete legacy.postODIn;delete legacy.postEmbedIn;delete legacy.specs.postDiaIn;delete legacy.specs.postDiaDirty;delete legacy.specs.postEmbedIn;delete legacy.specs.postEmbedDirty;legacy.specs.embedDepthIn=28;
    applyState(legacy);
    const legacyLoaded={lineOD:S.specs.postDiaIn.line,gateOD:S.specs.postDiaIn.gate,lineEmbed:S.specs.postEmbedIn.line,gateEmbed:S.specs.postEmbedIn.gate};
    return {defaults,bags,restoredBags:FOOTING.bagsByDepthIn[30],restoredGateOD:POST_OD_IN.gate,
      runGateOD:S.specs.postDiaIn.gate,snapshotFooting:snapshot.footing,snapshotPostOD:snapshot.postODIn,snapshotPostEmbed:snapshot.postEmbedIn,applied,legacyLoaded};
  })()`);
  expect(result.defaults.footing).toEqual({
    bagsByDepthIn:{24:2,30:3,36:3,42:4},bagWeightLb:60,
    diaMultiplierAtOrBelow4in:4,diaMultiplierAbove4in:3
  });
  expect(result.defaults.postOD).toEqual({line:2.375,terminal:2.875,corner:2.875,gate:4});
  expect(result.defaults.postEmbed).toEqual({line:18,terminal:30,corner:30,gate:30});
  expect(result.defaults.runPostDia).toEqual(result.defaults.postOD);
  expect(result.defaults.runPostEmbed).toEqual(result.defaults.postEmbed);
  expect(result.bags).toEqual([2,3,3,4]);
  expect(result.restoredBags).toBe(7);
  expect(result.restoredGateOD).toBe(4.5);
  expect(result.runGateOD).toBe(4.5);
  expect(result.snapshotFooting.bagsByDepthIn[30]).toBe(7);
  expect(result.snapshotPostOD.gate).toBe(4.5);
  expect(result.snapshotPostEmbed.gate).toBe(36);
  expect(result.applied).toEqual({bags:7,gateOD:4.5,gateEmbed:36,runGateOD:4.5,runGateEmbed:36,dirtyLineOD:9,dirtyLineEmbed:17});
  expect(result.legacyLoaded).toEqual({lineOD:3,gateOD:4.5,lineEmbed:28,gateEmbed:28});
});

test('168 LF closed-loop quantity diagnostic', async ({ page }) => {
  await seed168LfFixture(page);
  const actual=await state(page, `(()=>{
    const stats=getStats(),bom=calcAutoMaterials();
    const sum=predicate=>bom.filter(predicate).reduce((total,row)=>total+Number(row.qty||0),0);
    const exact=name=>sum(row=>row.name===name);
    return {
      cornerPosts:stats.cornerPosts.size,
      linePosts:stats.linePosts,
      gatePosts:sum(row=>/^Gate Post (?!Concrete)/.test(row.name)),
      tensionBars:exact('Tension Bar'),
      tensionBands:exact('Tension Band'),
      trussRods:exact('Truss Rod'),
      trussConnectors:sum(row=>/truss rod connector/i.test(row.name)),
      terminalBraceBands:sum(row=>/terminal.*brace band|brace band.*terminal/i.test(row.name)),
      fabric:sum(row=>/^Chain Link Fabric/.test(row.name)),
      topRail:exact('Top Rail 1-5/8"'),
      midRail:exact('Mid Rail 1-5/8"'),
      bottomWire:exact('Bottom Tension Wire 9ga'),
      barbedWire:sum(row=>/^Barbed Wire Strand/.test(row.name)),
      railEndCups:sum(row=>/Rail End/.test(row.name)),
      barbArms:sum(row=>/^Barb Arm/.test(row.name)),
      postCaps:exact('Post Cap'),
      lineBraceBands:exact('Line-size Brace Band'),
      terminalPost105:sum(row=>row.name.startsWith("Terminal/Corner Post 10.5'")&&row.name.includes('104" cut')),
      gatePost105:sum(row=>row.name.startsWith("Gate Post 10.5'")&&row.name.includes('104" cut')),
      linePost9Cut87:sum(row=>row.name.startsWith("Line Post 9'")&&row.name.includes('87" cut')),
      wrongLinePostLength:sum(row=>/^Line Post (?!9')/.test(row.name)),
      postConcrete60:exact('Post Concrete (60lb bag)'),
      gateConcrete60:exact('Gate Post Concrete (60lb bag)'),
      concrete80:sum(row=>/Concrete \(80lb bag\)/.test(row.name))
    };
  })()`);
  const expected={
    cornerPosts:4,linePosts:16,gatePosts:4,tensionBars:12,tensionBands:60,
    trussRods:12,trussConnectors:12,terminalBraceBands:24,
    fabric:152,topRail:152,midRail:152,bottomWire:152,barbedWire:456,
    railEndCups:24,barbArms:16,postCaps:8,lineBraceBands:16,
    terminalPost105:4,gatePost105:4,linePost9Cut87:16,wrongLinePostLength:0,
    postConcrete60:12,gateConcrete60:12,concrete80:0
  };
  const deltas=Object.keys(expected).map(item=>({item,expected:expected[item],actual:actual[item],delta:actual[item]-expected[item]}));
  console.log('FIXTURE_168LF_DELTAS',JSON.stringify(deltas.filter(row=>row.delta!==0)));
  for(const row of deltas)expect.soft(row.actual,`${row.item}: expected ${row.expected}, actual ${row.actual}, delta ${row.delta>=0?'+':''}${row.delta}`).toBe(row.expected);

  // Gate positions remain representational; no per-segment line-post placement
  // rule is asserted by this quantity-only fixture.
});
