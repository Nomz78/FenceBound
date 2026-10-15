const { chromium } = require('/home/user/FenceBound/node_modules/playwright');
const probes = require(process.argv[2]);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const out = {};
  for (const p of probes) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    page.on('dialog', d => d.accept());
    await page.goto('http://localhost:8765/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(300);
    try { out[p.name] = await page.evaluate(src => window.eval(src), PRE + p.expr); }
    catch (e) { out[p.name] = 'ERR ' + e.message.slice(0, 300); }
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
const PRE = `
function mkRun(type,lenFt,opts={},x0=0,y0=0,id){
  const specs=cloneRunSpecs(S.specs);Object.assign(specs,opts);
  const run={type:'fence',start:{x:x0*GRID_FT,y:y0*GRID_FT},end:{x:(x0+lenFt)*GRID_FT,y:y0*GRID_FT},fenceType:type,runId:id||('run_'+type+x0+'_'+y0),specs,postSpacing:FENCE_TYPES[type]?.postSpacing||10,autoPostSpacing:FENCE_TYPES[type]?.postSpacing||10};
  return run;}
function seed(runs,gates=[]){S.elements=[...runs];gates.forEach(g=>S.elements.push(attachGateToRun(g,runs[0])));runs.forEach(r=>{try{rebuildRunAutoPosts(r)}catch(e){}});draw();updatePanel();}
function keyOf(name){const k=normalizeMatKey(name);if(COST_DB[k])return k;if((k==='terminal size brace band'||k==='line size brace band')&&COST_DB['brace band'])return 'brace band(alias)';const parts=k.split(' ');for(let n=Math.min(5,parts.length);n>=2;n--){const sub=parts.slice(0,n).join(' ');if(COST_DB[sub])return 'A:'+sub;}for(const dbk in COST_DB){if(dbk.startsWith(k+' ')||k.startsWith(dbk+' '))return 'B:'+dbk;}return null;}
`;
