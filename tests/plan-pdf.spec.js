const { test, expect } = require('@playwright/test');

async function capture(page, length = 60, zoom = 1) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => !!window.jspdf);
  return page.evaluate(({ length, zoom }) => window.eval(`(()=>{
    COMPANY={...DEFAULT_COMPANY,name:'Oak Ridge Fencing',phone:'555-0100',email:'crew@example.com',accent:'#245638'};
    S.projectName='Scale job';S.jobCustomer='Customer';S.jobAddress='1 Test Lane';
    S.elements=[{type:'fence',start:{x:-20*GRID_FT,y:10*GRID_FT},end:{x:(${length}-20)*GRID_FT,y:10*GRID_FT},
      fenceType:'chainlink',runId:'pdf_run',specs:cloneRunSpecs(S.specs),postSpacing:10,autoPostSpacing:10}];
    S.zoom=${zoom};S.pan={x:9999,y:-9999};draw();
    const calls=[],Real=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...args){
      const doc=new Real(...args);
      ['setFillColor','setDrawColor','setTextColor','rect','line','text','addImage'].forEach(name=>{
        const original=doc[name];doc[name]=function(...a){calls.push({name,args:a});return original.apply(this,a);};
      });
      doc.save=()=>{calls.push({name:'pdfOutput',args:[doc.output()]});};return doc;
    };
    try{exportPDF();}finally{window.jspdf.jsPDF=Real;}
    return calls;
  })()`), { length, zoom });
}

test('REDO4 plan has a white page and dark vector linework', async ({ page }) => {
  const calls = await capture(page);
  const background = calls.findIndex(c => c.name === 'rect' && c.args[0] === 0 && c.args[1] === 0 && c.args[2] > 270 && c.args[3] > 210 && c.args[4] === 'F');
  expect(background).toBeGreaterThan(0);
  expect(calls[background - 1]).toEqual({ name: 'setFillColor', args: [255, 255, 255] });
  expect(calls.filter(c => c.name === 'addImage')).toHaveLength(0);
  expect(calls.some(c => c.name === 'setDrawColor' && c.args.every(v => v <= 140))).toBe(true);
});

test('REDO4 plan header uses the existing contractor profile', async ({ page }) => {
  const calls = await capture(page);
  const texts = calls.filter(c => c.name === 'text');
  const header = texts.find(c => String(c.args[0]) === 'Oak Ridge Fencing');
  expect(header).toBeTruthy();
  expect(header.args[2]).toBeLessThan(20);
  const pdf=calls.find(c=>c.name==='pdfOutput').args[0];
  expect(pdf).toContain('(Oak Ridge Fencing)');
  expect(pdf).not.toContain('(FENCEBOUND)');
  expect(texts.some(c => String(c.args[0]).includes('555-0100  |  crew@example.com'))).toBe(true);
  expect(texts.filter(c => /fencebound/i.test(String(c.args[0]))).every(c => /made with/i.test(String(c.args[0])) && c.args[2] > 200)).toBe(true);
  expect(calls.some(c => c.name === 'setTextColor' && JSON.stringify(c.args) === '[36,86,56]')).toBe(true);
});

for (const [length, zoom] of [[60, 0.2], [600, 3]]) {
  test(`REDO4 scale bar matches a ${length} ft run within 1% at zoom ${zoom}`, async ({ page }) => {
    const calls = await capture(page, length, zoom);
    const label = calls.find(c => c.name === 'text' && /^Scale: 0 \/ [\d.]+ \/ [\d.]+ ft$/.test(c.args[0]));
    expect(label).toBeTruthy();
    const feet = Number(label.args[0].match(/\/ ([\d.]+) ft$/)[1]);
    const lines = calls.filter(c => c.name === 'line').map(c => c.args);
    const bar = lines.find(a => a[0] === label.args[1] && Math.abs(a[1] - (label.args[2] - 4)) < 0.01 && a[1] === a[3] && a[2] > a[0]);
    expect(bar).toBeTruthy();
    const run = lines.filter(a => a[1] === a[3]).sort((a,b) => (b[2]-b[0])-(a[2]-a[0]))
      .find(a => a[1] > 30 && a[1] < 180 && a[0] > 5 && a[2] < 198);
    expect(run).toBeTruthy();
    expect(Math.abs((bar[2]-bar[0]) / feet / ((run[2]-run[0])/length) - 1)).toBeLessThan(0.01);
  });
}
