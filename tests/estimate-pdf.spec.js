const { test, expect } = require('@playwright/test');

async function quote(page, options = {}) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => !!window.jspdf);
  return page.evaluate(options => window.eval(`(()=>{
    COMPANY={...DEFAULT_COMPANY,name:'Quote Fixture',depositPct:35,validityDays:14,
      terms:${JSON.stringify(options.longTerms ? Array.from({length:150},(_,i)=>`Existing company term ${i+1}`).join('\n') : 'Deposit {DEPOSIT}%; valid {VALIDITY} days from {DATE}.')}};
    const mk=(type,y,ft,id,height)=>{const specs=cloneRunSpecs(S.specs);specs.heightIn=height;
      return {type:'fence',start:{x:0,y:y*GRID_FT},end:{x:ft*GRID_FT,y:y*GRID_FT},
        fenceType:type,runId:id,specs,postSpacing:10,autoPostSpacing:10};};
    const runs=[mk('chainlink',0,100,'quote-cl',72),mk('woodprivacy',30,40,'quote-wood',84)];
    const gate=attachGateToRun({type:'gate',start:{x:10*GRID_FT,y:0},end:{x:14*GRID_FT,y:0},gateType:'walk',hinge:'start',swingDir:1},runs[0]);
    S.elements=[...runs,...runs.flatMap(r=>autoPostsForRun(r.start,r.end,r.postSpacing,r.fenceType,r.runId,r.specs)),gate];
    S.jobCustomer='Quote Customer';S.projectName='Quote fixture';
    const stats=getStats(),P=computePricing(),D=customerDocumentLines(P,stats);
    const scope=runs.map(r=>{const s=stats.byRunId[r.runId];return {
      label:FENCE_TYPES[r.fenceType].label,ft:stats.fence[r.fenceType].toFixed(1),height:r.specs.heightIn,
      posts:s.lineCt+s.termCt+s.cornerCt+(r===runs[0]?(stats.gatePostsByGate.get(gate)||0):0)};});
    const calls=[],Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){const doc=new Real(...args);
      ['text','rect','line','addImage'].forEach(name=>{const original=doc[name];doc[name]=function(...a){
        calls.push({name,args:a,page:doc.internal.getCurrentPageInfo().pageNumber});return original.apply(this,a);};});
      doc.save=()=>{calls.push({name:'output',args:[doc.output()]});};return doc;};
    try{exportEstimatePDF();}finally{window.jspdf.jsPDF=Real;}
    return {calls,scope,gateLabel:GATE_TYPES.walk.label,total:D.total,amounts:D.rows.map(r=>r.amount),
      deposit:'$'+Number((P.clientTotal*.35).toFixed(0)).toLocaleString('en-US'),
      valid:new Date(Date.now()+14*86400000).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
  })()`), options);
}

test('REDO5 scope matches material statistics and lists gate widths', async ({ page }) => {
  const q=await quote(page),pdf=q.calls.find(c=>c.name==='output').args[0];
  expect(pdf).toContain('(SCOPE OF WORK)');
  for(const r of q.scope) expect(pdf).toContain(`(${r.label}: ${r.ft} LF | Height: ${r.height}" | Posts: ${r.posts})`);
  expect(pdf).toContain(`(${q.gateLabel}: 4.0 ft wide)`);
  for(const amount of [...q.amounts,q.total]) expect(pdf).toContain(amount);
});

test('REDO5 estimate includes a framed vector drawing and scale bar', async ({ page }) => {
  const q=await quote(page),pdf=q.calls.find(c=>c.name==='output').args[0];
  expect(pdf).toContain('(PROJECT DRAWING)');
  const scale=q.calls.find(c=>c.name==='text'&&/^Scale: 0 \/ /.test(c.args[0]));
  expect(scale).toBeTruthy();
  expect(q.calls.some(c=>c.name==='rect'&&c.page===scale.page&&c.args[2]>150&&c.args[3]>150)).toBe(true);
  expect(q.calls.filter(c=>c.name==='addImage')).toHaveLength(0);
});

test('REDO5 existing terms, deposit, validity and signature survive multi-page terms', async ({ page }) => {
  const q=await quote(page,{longTerms:true}),pdf=q.calls.find(c=>c.name==='output').args[0];
  expect(pdf).toContain(`35% Deposit Due at Signing: ${q.deposit}`);
  expect(pdf).toContain(`Valid Until: ${q.valid}`);
  expect(pdf).toContain('(Existing company term 150)');
  expect(pdf).toContain('(Client Signature)');
  expect(pdf).toContain('(Date)');
  expect(pdf).toContain('NOT FULLY VERIFIED');
  for(const c of q.calls.filter(c=>c.name==='text')) expect(c.args[2]).toBeLessThan(279);
});
