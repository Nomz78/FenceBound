const { test, expect } = require('@playwright/test');

// Regression suite for exact-key pricing (2026-10-15 estimator audit F1, F2,
// inventory F-1, F-2). Every auto BOM line is priced from exactly one rate-card
// key; there is no fuzzy name fallback.
//  - E1: concrete is priced from 'post concrete bag', never from 'post' or
//    'gate post'.
//  - E2: wood rails, chain-link rails and the two brace-band sizes price from
//    separate keys, seeded at the price they resolved to before the repair.
//  - E3: an unknown material is a MISSING_COST validation error, not a price.
//  - E4: every BOM line for every fence type, gate type and add-on resolves to
//    an exact rate-card key.
//  - E5: pricing does not depend on rate-card key insertion order.

async function cleanOpen(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#canvas')).toBeVisible();
}

async function state(page, expression) {
  return page.evaluate(source => window.eval(source), expression);
}

// One run of the given type with a gate of each type attached to it, and
// every rail, truss and add-on switched on so each BOM branch emits all lines.
const seedAllLinesSource = (type, arm = 'vertical') => `(()=>{
  const specs=cloneRunSpecs(S.specs);
  Object.assign(specs,{heightIn:72,hasTopRail:true,hasMidRail:true,hasBottomRail:true,
    hasTrussRod:true,hasFaceBoard:true,barbStrands:3,barbArm:${JSON.stringify(arm)}});
  specs.addons=new Set(Object.keys(ADDON_DEFS));
  const run={type:'fence',start:{x:0,y:0},end:{x:120*GRID_FT,y:0},
    fenceType:${JSON.stringify(type)},runId:'run_exact_'+${JSON.stringify(type)},specs,postSpacing:8,autoPostSpacing:8};
  const gates=[['walk',10,14],['doubledrive',40,56],['cantilever',80,96]].map(([gateType,a,b])=>
    attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},run));
  S.elements=[run,...gates];S.materials=[];
  draw();updatePanel();
})()`;

async function seedMixedJob(page) {
  // A chain-link run with every rail and a wood privacy run, plus a walk gate.
  await state(page, `(()=>{
    const cl=cloneRunSpecs(S.specs);
    Object.assign(cl,{heightIn:72,hasTopRail:true,hasMidRail:true,hasBottomRail:true,hasTrussRod:true});
    const wood=cloneRunSpecs(S.specs);
    Object.assign(wood,{heightIn:72,hasMidRail:true});wood.addons=new Set();
    const a={type:'fence',start:{x:0,y:0},end:{x:60*GRID_FT,y:0},fenceType:'chainlink',
      runId:'run_exact_cl',specs:cl,postSpacing:10,autoPostSpacing:10};
    const b={type:'fence',start:{x:0,y:40*GRID_FT},end:{x:60*GRID_FT,y:40*GRID_FT},fenceType:'woodprivacy',
      runId:'run_exact_wood',specs:wood,postSpacing:8,autoPostSpacing:8};
    const gate=attachGateToRun({type:'gate',start:{x:20*GRID_FT,y:0},end:{x:24*GRID_FT,y:0},
      gateType:'walk',hinge:'start',swingDir:1},a);
    S.elements=[a,b,gate];S.materials=[];
    draw();updatePanel();
  })()`);
}

const unitOf = (page, pattern) => state(page,
  `(()=>{const l=computePricing().matLines.find(x=>${pattern}.test(x.name));return l?l.unitCost:'absent';})()`);

test('E1 concrete is priced from the post concrete bag key, not from post or gate post', async ({ page }) => {
  await cleanOpen(page);
  await seedMixedJob(page);
  const seed = await state(page, `({bag:COST_DB['post concrete bag'].cost,post:COST_DB['post'].cost,gatePost:COST_DB['gate post'].cost})`);
  expect(await unitOf(page, '/^Post Concrete/')).toBe(seed.bag);
  expect(await unitOf(page, '/^Gate Post Concrete/')).toBe(seed.bag);

  // Editing the concrete entry moves both concrete lines.
  await state(page, `COST_DB['post concrete bag'].cost=7.25`);
  expect(await unitOf(page, '/^Post Concrete/')).toBe(7.25);
  expect(await unitOf(page, '/^Gate Post Concrete/')).toBe(7.25);

  // Editing the wood post or the gate post does not touch concrete.
  await state(page, `COST_DB['post'].cost=99;COST_DB['gate post'].cost=98`);
  expect(await unitOf(page, '/^Post Concrete/')).toBe(7.25);
  expect(await unitOf(page, '/^Gate Post Concrete/')).toBe(7.25);
  expect(await unitOf(page, '/^Post 4x4/')).toBe(99);
  expect(await unitOf(page, /^Gate Post \d/.toString())).toBe(98);
});

test('E2 wood rails, chain-link rails and brace-band sizes price from separate keys', async ({ page }) => {
  await cleanOpen(page);
  await seedMixedJob(page);
  // New keys are seeded at the exact price each line resolved to before the repair.
  const seeded = await state(page, `(()=>{const k=['wood top rail','wood mid rail','wood bottom rail','bottom rail',
    'terminal size brace band','line size brace band'];return Object.fromEntries(k.map(x=>[x,DEFAULT_COST_DB[x]&&DEFAULT_COST_DB[x].cost]));})()`);
  expect(seeded).toEqual({'wood top rail':1.85,'wood mid rail':1.85,'wood bottom rail':4.2,
    'bottom rail':4.2,'terminal size brace band':0.8,'line size brace band':0.8});
  const before = await state(page, `(()=>{const P=computePricing();return Object.fromEntries(P.matLines.map(l=>[l.name,l.unitCost]));})()`);
  expect(before['2x4 Top Rail']).toBe(1.85);
  expect(before['2x4 Mid Rail']).toBe(1.85);
  expect(before['2x4 Bottom Rail']).toBe(4.2);
  expect(before['Top Rail 1-5/8"']).toBe(1.85);
  expect(before['Mid Rail 1-5/8"']).toBe(1.85);
  expect(before['Bottom Rail 1-5/8"']).toBe(4.2);

  // Each rate-card entry moves exactly one material.
  await state(page, `COST_DB['top rail'].cost=50;COST_DB['mid rail'].cost=51;COST_DB['bottom rail'].cost=52;
    COST_DB['wood top rail'].cost=60;COST_DB['wood mid rail'].cost=61;COST_DB['wood bottom rail'].cost=62;
    COST_DB['terminal size brace band'].cost=3;COST_DB['line size brace band'].cost=4`);
  const after = await state(page, `(()=>{const P=computePricing();return Object.fromEntries(P.matLines.map(l=>[l.name,l.unitCost]));})()`);
  expect(after['Top Rail 1-5/8"']).toBe(50);
  expect(after['Mid Rail 1-5/8"']).toBe(51);
  expect(after['Bottom Rail 1-5/8"']).toBe(52);
  expect(after['2x4 Top Rail']).toBe(60);
  expect(after['2x4 Mid Rail']).toBe(61);
  expect(after['2x4 Bottom Rail']).toBe(62);
  expect(after['Terminal-size Brace Band']).toBe(3);
  expect(after['Line-size Brace Band']).toBe(4);

  // A saved rate card from before the split has none of the new keys: each new
  // key inherits the saved price of the shared key its line was charged from.
  const merged = await state(page, `(()=>{
    localStorage.setItem(COSTDB_KEY,JSON.stringify({costs:{'top rail':{cost:2.5,unit:'lf'},'bottom rail':{cost:5,unit:'lf'},'brace band':{cost:1,unit:'ea'}}}));
    reloadSavedCostDB();
    return{top:COST_DB['top rail'].cost,woodTop:COST_DB['wood top rail'].cost,woodBottom:COST_DB['wood bottom rail'].cost,
      clBottom:COST_DB['bottom rail'].cost,term:COST_DB['terminal size brace band'].cost,line:COST_DB['line size brace band'].cost,
      unknown:computePricing().unknown};
  })()`);
  expect(merged).toEqual({top:2.5,woodTop:2.5,woodBottom:5,clBottom:5,term:1,line:1,unknown:[]});
});

test('E3 an unknown material is a validation error, not a borrowed price', async ({ page }) => {
  await cleanOpen(page);
  await seedMixedJob(page);
  const manual = await state(page, `(()=>{
    S.materials=[{name:'Post Hole Digger Rental',qty:'1',unit:'ea',id:1},{name:'Line Post Cap Special',qty:'2',unit:'ea',id:2}];
    const P=computePricing();const v=validateProject({requireClient:false});
    return{lines:P.matLines.filter(l=>l.source==='manual').map(l=>[l.name,l.unitCost,l.extC]),
      unknown:P.unknown,isFinalReady:P.isFinalReady,
      missing:v.errors.filter(e=>e.code==='MISSING_COST').map(e=>e.message)};
  })()`);
  expect(manual.lines).toEqual([['Post Hole Digger Rental',null,0],['Line Post Cap Special',null,0]]);
  expect(manual.unknown).toEqual(['Post Hole Digger Rental','Line Post Cap Special']);
  expect(manual.isFinalReady).toBe(false);
  expect(manual.missing).toHaveLength(2);

  // A manual line whose name is an exact rate-card key still prices.
  expect(await state(page, `(()=>{S.materials=[{name:'Post Cap',qty:'2',unit:'ea',id:3}];
    const l=computePricing().matLines.find(x=>x.source==='manual');return l.unitCost===COST_DB['post cap'].cost;})()`)).toBe(true);

  // An auto line whose key is missing from the rate card is an error, not priced as another item.
  const auto = await state(page, `(()=>{S.materials=[];delete COST_DB['post concrete bag'];
    const P=computePricing();const v=validateProject({requireClient:false});
    return{concrete:P.matLines.filter(l=>/Concrete/.test(l.name)).map(l=>l.unitCost),
      isFinalReady:P.isFinalReady,missing:v.errors.filter(e=>e.code==='MISSING_COST').length};
  })()`);
  expect(auto.concrete).toEqual([null, null]);
  expect(auto.isFinalReady).toBe(false);
  expect(auto.missing).toBe(2);
});

test('E4 every BOM line for every fence type, gate type and add-on resolves to an exact key', async ({ page }) => {
  await cleanOpen(page);
  const types = await state(page, 'Object.keys(FENCE_TYPES)');
  expect(types.length).toBeGreaterThan(10);
  const arms = await state(page, `[...document.querySelectorAll('#barb-arm option')].map(o=>o.value)`);
  const cases = [...types.map(type => [type, 'vertical']), ...arms.map(arm => ['chainlink', arm])];
  const failures = [];
  const seen = new Set();
  for (const [type, arm] of cases) {
    await state(page, seedAllLinesSource(type, arm));
    const lines = await state(page, `(()=>{const P=computePricing();
      return P.matLines.map(l=>({name:l.name,costKey:l.costKey,unitCost:l.unitCost,
        exact:typeof l.costKey==='string'&&Object.prototype.hasOwnProperty.call(COST_DB,l.costKey)&&COST_DB[l.costKey].cost===l.unitCost}));})()`);
    expect(lines.length, `${type} produced no BOM`).toBeGreaterThan(0);
    lines.forEach(line => {
      seen.add(line.name);
      if (!line.exact) failures.push(`${type}/${arm}: ${line.name} -> ${line.costKey} (${line.unitCost})`);
    });
  }
  console.log('E4_LINES', seen.size);
  expect(failures).toEqual([]);
});

test('E5 pricing is independent of rate-card key insertion order', async ({ page }) => {
  await cleanOpen(page);
  await seedMixedJob(page);
  const result = await state(page, `(()=>{
    const forward=computePricing();
    COST_DB=Object.fromEntries(Object.entries(COST_DB).reverse());
    const reversed=computePricing();
    return{same:JSON.stringify(forward.cents)===JSON.stringify(reversed.cents)&&
      JSON.stringify(forward.matLines.map(l=>l.unitCost))===JSON.stringify(reversed.matLines.map(l=>l.unitCost)),
      forward:forward.cents.clientTotal,reversed:reversed.cents.clientTotal};
  })()`);
  expect(result.same, JSON.stringify(result)).toBe(true);
});

// The pre-repair resolver, kept only as a reference for what each line was
// charged before the upgrade (exact normalized key, brace-band alias, trailing
// word trim, then prefix match in key order).
const LEGACY_RESOLVE = `(name,db)=>{
  const k=normalizeMatKey(name);
  if(db[k])return db[k].cost;
  if((k==='terminal size brace band'||k==='line size brace band')&&db['brace band'])return db['brace band'].cost;
  const parts=k.split(' ');
  for(let n=Math.min(5,parts.length);n>=2;n--){const sub=parts.slice(0,n).join(' ');if(db[sub])return db[sub].cost;}
  for(const dbk in db){if(dbk.startsWith(k+' ')||k.startsWith(dbk+' '))return db[dbk].cost;}
  return null;}`;

test('E6 an upgraded saved rate card keeps every customised line price', async ({ page }) => {
  await cleanOpen(page);
  // A pre-split saved card: the old key set ('brace band' shared, no split keys),
  // every price customised to a distinct value.
  const result = await state(page, `(()=>{
    const split=['wood top rail','wood mid rail','wood bottom rail','terminal size brace band','line size brace band'];
    const old={};let i=0;
    Object.entries(DEFAULT_COST_DB).forEach(([k,v])=>{
      if(k==='terminal size brace band')old['brace band']={cost:0.8,unit:'ea'};
      if(!split.includes(k))old[k]={...v};
    });
    Object.values(old).forEach(v=>{v.cost=Math.round((v.cost+0.37+(i++)*0.11)*100)/100;});
    localStorage.setItem(COSTDB_KEY,JSON.stringify({costs:old}));
    reloadSavedCostDB();
    const legacy=${LEGACY_RESOLVE};
    const diffs=[];let lines=0;
    for(const type of Object.keys(FENCE_TYPES)){
      ${seedAllLinesSource('__TYPE__').replace(/^\(\(\)=>\{/, '').replace(/\}\)\(\)$/, '').replace(/"__TYPE__"/g, 'type')}
      computePricing().matLines.forEach(l=>{
        if(/Concrete/.test(l.name))return; // concrete was mispriced; its change is the defect repair
        lines++;
        // C0b wood owner plan: 4x4 gate posts now intentionally use the wood
        // post key; preserve its customised value, not the former pipe-post rate.
        const before=/^Gate Post 4x4x/.test(l.name)?old.post.cost:legacy(l.name,old);
        if(before!==l.unitCost)diffs.push(type+': '+l.name+' '+before+' -> '+l.unitCost);
      });
    }
    return{lines,diffs:[...new Set(diffs)]};
  })()`);
  expect(result.lines).toBeGreaterThan(100);
  expect(result.diffs).toEqual([]);
});

test('E7 CSV import lands each emitted BOM line name on its exact cost key', async ({ page }) => {
  await cleanOpen(page);
  await seedMixedJob(page);
  await state(page, `(()=>{
    openCsvImporter([['Description','Cost'],['2x4 Top Rail','3.10'],['2x4 Mid Rail','3.20'],['2x4 Bottom Rail','3.30'],
      ['Top Rail 1-5/8"','2.10'],['Mid Rail 1-5/8"','2.20'],['Bottom Rail 1-5/8"','2.30'],['Post Concrete (60lb bag)','5.75']]);
  })()`);
  await page.locator('#cs-apply').click();
  const prices = await state(page, `(()=>{const P=computePricing();return{
    lines:Object.fromEntries(P.matLines.map(l=>[l.name,l.unitCost])),
    keys:{post:COST_DB['post'].cost,orphans:['post concrete','top rail 1 5 8'].filter(k=>k in COST_DB)}};})()`);
  expect(prices.lines['2x4 Top Rail']).toBe(3.1);
  expect(prices.lines['2x4 Mid Rail']).toBe(3.2);
  expect(prices.lines['2x4 Bottom Rail']).toBe(3.3);
  expect(prices.lines['Top Rail 1-5/8"']).toBe(2.1);
  expect(prices.lines['Mid Rail 1-5/8"']).toBe(2.2);
  expect(prices.lines['Bottom Rail 1-5/8"']).toBe(2.3);
  expect(prices.lines['Post Concrete (60lb bag)']).toBe(5.75);
  expect(prices.lines['Gate Post Concrete (60lb bag)']).toBe(5.75);
  expect(prices.keys.orphans).toEqual([]);
});

test('E8 the CSV name mapping agrees with every emitted BOM line costKey', async ({ page }) => {
  await cleanOpen(page);
  const types = await state(page, 'Object.keys(FENCE_TYPES)');
  const arms = await state(page, `[...document.querySelectorAll('#barb-arm option')].map(o=>o.value)`);
  const mismatches = [];
  for (const [type, arm] of [...types.map(t => [t, 'vertical']), ...arms.map(a => ['chainlink', a])]) {
    await state(page, seedAllLinesSource(type, arm));
    const rows = await state(page, `(()=>{const r=csvBuildPreview([['Description','Cost'],...calcAutoMaterials().map(it=>[it.name,'1'])],{name:0,cost:1,unit:-1},true,'last');
      return calcAutoMaterials().map(it=>[it.name,it.costKey,(r.entries.find(e=>e.sources.includes(it.name))||{}).key]);})()`);
    rows.forEach(([name, costKey, csvKey]) => { if (costKey !== csvKey) mismatches.push(`${name}: ${costKey} vs ${csvKey}`); });
  }
  expect([...new Set(mismatches)]).toEqual([]);
});
