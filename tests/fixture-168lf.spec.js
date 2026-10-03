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

// Authoritative D1–D5 reference job (v5.4.0 supplement, "D1–D5 regression
// reference job"): a 168 LF square backyard tying into the house at both ends.
// Three 56 LF runs form the U; the house is the fourth side. That gives two
// house terminals (one fabric end each), two corners (two ends each) and four
// gate posts (one end each): ten fabric termination ends.
async function seed168LfFixture(page) {
  await cleanOpen(page);
  return state(page, `(()=>{
    const points=[{x:0,y:0},{x:0,y:56*GRID_FT},{x:56*GRID_FT,y:56*GRID_FT},{x:56*GRID_FT,y:0}];
    const specs=cloneRunSpecs(S.specs);
    Object.assign(specs,{
      heightIn:72,postHeightIn:102,embedDepthIn:30,
      postEmbedIn:{line:18,terminal:30,corner:30,gate:30},
      postEmbedDirty:{line:false,terminal:false,corner:false,gate:false},
      hasTopRail:true,hasMidRail:true,hasTrussRod:true,
      barbStrands:3,barbArm:'angled',
      addons:new Set(['bottom-wire','barbed-wire'])
    });
    const runs=points.slice(0,-1).map((start,index)=>({
      type:'fence',start,end:points[index+1],
      fenceType:'chainlink',runId:'fixture-run-'+(index+1),
      specs:cloneRunSpecs(specs),postSpacing:10,autoPostSpacing:10
    }));
    const posts=runs.flatMap(run=>autoPostsForRun(run.start,run.end,10,'chainlink',run.runId,run.specs));
    const y=56*GRID_FT;
    const gates=[
      attachGateToRun({type:'gate',start:{x:5*GRID_FT,y},end:{x:9*GRID_FT,y},gateType:'walk',hinge:'start',swingDir:1},runs[1]),
      attachGateToRun({type:'gate',start:{x:15*GRID_FT,y},end:{x:27*GRID_FT,y},gateType:'doubledrive',hinge:'start',swingDir:1},runs[1])
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
  // Owner 4 ft residential default (2026-10-02): 2-1/2" nominal terminals/gates, 1-5/8" line.
  expect(result.defaults.postOD).toEqual({line:1.625,terminal:2.375,corner:2.375,gate:2.375});
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

test('168 LF house-terminated reference job matches the authoritative takeoff', async ({ page }) => {
  await seed168LfFixture(page);
  const actual=await state(page, `(()=>{
    const stats=getStats(),bom=calcAutoMaterials();
    const sum=predicate=>bom.filter(predicate).reduce((total,row)=>total+Number(row.qty||0),0);
    const exact=name=>sum(row=>row.name===name);
    return {
      terminalPosts:stats.terminalPosts.size,
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
      concrete80:sum(row=>/Concrete \(80lb bag\)/.test(row.name)),
      wireTies:exact('Wire Ties 9ga'),
      hogRings:exact('Hog Rings')
    };
  })()`);
  // Known-correct values from the authoritative supplement. Per fabric end:
  // 1 tension bar; (fabric ft - 1) tension bands; 2 terminal brace bands + 2
  // rail-end cups for framing; 1 terminal band for bottom wire; 1 terminal band
  // per barbed strand; 1 line-size band + 1 rail-end cup for the mid rail.
  // 6-plus-1 carries zero post caps. Items the supplement does not list are
  // logged, not asserted.
  const expected={
    terminalPosts:2,cornerPosts:2,gatePosts:4,tensionBars:10,tensionBands:50,
    terminalBraceBands:60,lineBraceBands:10,railEndCups:30,postCaps:0,
    fabric:152,topRail:152,midRail:152,bottomWire:152,barbedWire:456,
    terminalPost105:4,gatePost105:4,wrongLinePostLength:0,
    gateConcrete60:12,concrete80:0
  };
  console.log('FIXTURE_168LF_UNASSERTED',JSON.stringify({linePosts:actual.linePosts,trussRods:actual.trussRods,
    trussConnectors:actual.trussConnectors,barbArms:actual.barbArms,wireTies:actual.wireTies,hogRings:actual.hogRings,linePost9Cut87:actual.linePost9Cut87,postConcrete60:actual.postConcrete60}));
  const deltas=Object.keys(expected).map(item=>({item,expected:expected[item],actual:actual[item],delta:actual[item]-expected[item]}));
  console.log('FIXTURE_168LF_DELTAS',JSON.stringify(deltas.filter(row=>row.delta!==0)));
  for(const row of deltas)expect.soft(row.actual,`${row.item}: expected ${row.expected}, actual ${row.actual}, delta ${row.delta>=0?'+':''}${row.delta}`).toBe(row.expected);

  // Gate positions remain representational; no per-segment line-post placement
  // rule is asserted by this quantity-only fixture.
});

test('unchecking Top Rail removes top rail and sleeves from the takeoff', async ({ page }) => {
  await cleanOpen(page);
  const result=await state(page, `(()=>{
    const specs=cloneRunSpecs(S.specs);specs.hasTopRail=false;
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:40*GRID_FT,y:0},fenceType:'chainlink',
      runId:'no-top-rail',specs,postSpacing:10,autoPostSpacing:10}];
    return calcAutoMaterials().filter(row=>/^Top Rail/.test(row.name)).map(row=>row.name);
  })()`);
  // Owner ruling 2026-10-02: top rail is standard; a run without it is a spec
  // change, so the takeoff must at least stop ordering top rail.
  expect(result).toEqual([]);
});

// Owner field rules (2026-10-02): default chain link is 4 ft with top rail and
// bottom tension wire. Per fabric end: (height ft - 1) tension bands; one
// terminal brace band + one rail-end cup per rail (top, mid, bottom); one
// terminal brace band per tension wire (bottom, top) and per barbed strand;
// the mid rail also lands on the first line post (line-size band + cup).
async function perEnd(page, mutate) {
  return state(page, `(()=>{
    const specs=cloneRunSpecs(S.specs);(${mutate})(specs);
    S.elements=[{type:'fence',start:{x:0,y:0},end:{x:40*GRID_FT,y:0},fenceType:'chainlink',
      runId:'per-end',specs,postSpacing:10,autoPostSpacing:10}];
    const bom=calcAutoMaterials(),q=name=>bom.filter(r=>r.name===name).reduce((t,r)=>t+r.qty,0);
    return {ends:getStats().terminationEnds,tensionBands:q('Tension Band'),
      terminalBands:q('Terminal-size Brace Band'),lineBands:q('Line-size Brace Band'),
      cups:q('Rail End (Loop Cap)'),bottomRail:q('Bottom Rail 1-5/8"'),topRail:q('Top Rail 1-5/8"')};
  })()`);
}

test('default chain link is the owner 4 ft residential spec', async ({ page }) => {
  await cleanOpen(page);
  const defaults=await state(page, `({heightIn:S.specs.heightIn,top:S.specs.hasTopRail,mid:S.specs.hasMidRail,
    bottomWire:S.specs.addons.has('bottom-wire'),postOD:{...POST_OD_IN}})`);
  expect(defaults).toEqual({heightIn:48,top:true,mid:false,bottomWire:true,
    postOD:{line:1.625,terminal:2.375,corner:2.375,gate:2.375}});
  const r=await perEnd(page,'s=>{}');
  expect(r.ends).toBe(2);
  expect({tensionBands:r.tensionBands/2,terminalBands:r.terminalBands/2,cups:r.cups/2,lineBands:r.lineBands})
    .toEqual({tensionBands:3,terminalBands:2,cups:1,lineBands:0});
});

test('every rail gets a band and cup per end; every tension wire gets a band per end', async ({ page }) => {
  await cleanOpen(page);
  const r=await perEnd(page,`s=>{s.hasMidRail=true;s.hasBottomRail=true;s.addons.add('bottom-wire');s.addons.add('top-wire');}`);
  // top, mid, bottom rail + bottom wire + top wire = 5 terminal bands per end;
  // cups: 3 rails + mid rail at the first line post = 4 per end.
  expect({terminalBands:r.terminalBands/2,cups:r.cups/2,lineBands:r.lineBands/2}).toEqual({terminalBands:5,cups:4,lineBands:1});
  expect(r.bottomRail).toBe(40);
  const bare=await perEnd(page,`s=>{s.hasTopRail=false;s.hasMidRail=false;s.addons.clear();s.addons.add('top-wire');}`);
  // No top rail is a spec change: top wire takes a band, no rail means no cup.
  expect({terminalBands:bare.terminalBands/2,cups:bare.cups,topRail:bare.topRail}).toEqual({terminalBands:1,cups:0,topRail:0});
});

// Owner fastening rules (2026-10-03): 5 fasteners per bay (post-to-post span)
// on every horizontal element the fabric is fastened to, regardless of
// spacing: wire ties on rails, hog rings on tension wire and razor ribbon.
// Line posts take (height ft - 1) ties, matching the tension-band rule.
async function fastening(page, mutate, gates=[]) {
  return state(page, `(()=>{
    const specs=cloneRunSpecs(S.specs);(${mutate})(specs);
    const run={type:'fence',start:{x:0,y:0},end:{x:40*GRID_FT,y:0},fenceType:'chainlink',
      runId:'fasten',specs,postSpacing:10,autoPostSpacing:10};
    const posts=autoPostsForRun(run.start,run.end,10,'chainlink',run.runId,run.specs);
    const gs=${JSON.stringify(gates)}.map(([a,b])=>attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},
      end:{x:b*GRID_FT,y:0},gateType:'walk',hinge:'start',swingDir:1},run));
    S.elements=[run,...posts,...gs];
    const bom=calcAutoMaterials(),q=name=>bom.filter(r=>r.name===name).reduce((t,r)=>t+r.qty,0);
    return {linePosts:getStats().linePosts,ties:q('Wire Ties 9ga'),hogRings:q('Hog Rings'),
      hogCost:lookupCost('Hog Rings')};
  })()`);
}

test('wire ties and hog rings follow the per-bay and per-line-post rules', async ({ page }) => {
  await cleanOpen(page);
  // Default 4 ft: top rail + bottom wire. 40 LF at 10 ft = 3 line posts, 4 bays.
  const base=await fastening(page,'s=>{}');
  expect(base.linePosts).toBe(3);
  expect(base.ties).toBe(5*4 + 3*3);     // top rail 5/bay + 3 ties per line post
  expect(base.hogRings).toBe(5*4);       // bottom wire 5/bay
  expect(base.hogCost).not.toBeNull();   // priceable, so the job can validate
  // Mid rail adds a tied rail; razor ribbon adds a fastened element.
  const more=await fastening(page,`s=>{s.hasMidRail=true;s.addons.add('razor-ribbon');}`);
  expect(more.ties).toBe(2*5*4 + 3*3);
  expect(more.hogRings).toBe(2*5*4);
  // A gate splits the run into two fabric sections: bays = line posts + sections.
  const gated=await fastening(page,'s=>{}',[[18,22]]);
  const bays=gated.linePosts+2;
  expect(gated.ties).toBe(5*bays + gated.linePosts*3);
  expect(gated.hogRings).toBe(5*bays);
});
