const { test, expect } = require('@playwright/test');
const fs = require('fs');

// HANDOFF.md C3: exported order quantities must equal the materials panel.
// Exercise real downloads, including PDF text, without substituting the exporter.
const state = (page, source) => page.evaluate(s => window.eval(s), source);
async function seed(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await state(page, `(()=>{
    S.elements=[];S.materials=[];S.projectName='Order Test';
    selectFenceType('cattlehog');
    const run={type:'fence',start:{x:0,y:0},end:{x:100*GRID_FT,y:0},
      fenceType:'cattlehog',runId:'order-export',specs:cloneRunSpecs(S.specs),
      postSpacing:S.postSpacing,autoPostSpacing:S.postSpacing};
    S.elements.push(run);
    [['walk',40,44],['doubledrive',70,82]].forEach(([gateType,a,b])=>
      S.elements.push(attachGateToRun({type:'gate',start:{x:a*GRID_FT,y:0},end:{x:b*GRID_FT,y:0},gateType,hinge:'start',swingDir:1},run)));
    rebuildRunAutoPosts(run);
    COST_DB['hog wire welded panel']={...COST_DB['hog wire welded panel'],pack:16,waste:10};
    draw();updatePanel();updateMatList();
  })()`);
  await page.locator('[data-tab="materials"]').click();
}
async function download(page, id) {
  await expect(page.locator(id)).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.locator(id).click();
  const file = await pending;
  const saved=test.info().outputPath(file.suggestedFilename());
  await file.saveAs(saved);
  return { name: file.suggestedFilename(), text: fs.readFileSync(saved, 'utf8') };
}
function csvRows(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
    }else if(c===','&&!quoted){row.push(cell);cell='';}
    else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  return rows;
}
async function panelRows(page) {
  return page.locator('#auto-mat-list .mat-row, #mat-list .mat-row').evaluateAll(rows => rows.map(r => ({
    name:r.querySelector('.mat-name').textContent,
    needed:r.querySelector('.mat-need').textContent.replace('need ',''),
    order:r.querySelector('.mat-order').textContent.replace('order ','')
  })));
}
// jsPDF's uncompressed text operators; decode PDF string escapes, not HTML.
const pdfTokens = text => [...text.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g)]
  .map(m => m[1].replace(/\\([\\()])/g,'$1'));

test('MO1 CSV matches displayed orders, including per-section packs and waste, without changing pricing', async ({ page }) => {
  await seed(page);
  const before=await state(page,'JSON.stringify(computePricing().cents)');
  const readiness=await page.locator('#validation-status').innerHTML();
  const rows=await panelRows(page);
  const output=await download(page,'#btn-order-csv');
  expect(output.name).toBe('Order_Test_material_order.csv');
  const csv=csvRows(output.text);
  expect(csv[0]).toEqual(['Item','Needed','Order','Unit','Pack size','Waste (%)']);
  expect(csv.slice(1).map(r=>({name:r[0],needed:r[1],order:r[2]+' '+r[3]}))).toEqual(rows);
  // 40/26/18 ft sections with 10% waste: 48 + 32 + 32 = 112 lf.
  expect(csv).toContainEqual(['Hog Wire Welded Panel (red-top)','84','112','lf','16','10']);
  expect(output.text).not.toMatch(/price|cost|\$/i);
  expect(await state(page,'JSON.stringify(computePricing().cents)')).toBe(before);
  expect(await page.locator('#validation-status').innerHTML()).toBe(readiness);
});

test('MO2 CSV groups matching manual items, preserves units and safely quotes names even without prices', async ({ page }) => {
  await seed(page);
  await state(page, `(()=>{
    S.materials=[{name:'Special, "clip"\\nlarge',qty:2,unit:'ea'},
      {name:'Special, "clip"\\nlarge',qty:3,unit:'ea'},
      {name:'Special, "clip"\\nlarge',qty:1,unit:'box'},
      {name:'=1+1',qty:4,unit:'ea'},
      {name:'Wire ties',qty:6,unit:'ea'},
      {name:'Wire ties',qty:7,unit:'ea'}];
    COST_DB['wire ties']={...COST_DB['wire ties'],pack:10,waste:10};
    updateMatList();
  })()`);
  const displayed=await panelRows(page);
  expect(displayed.slice(-2).map(r=>r.order)).toEqual(['10 ea','10 ea']);
  const rows=csvRows((await download(page,'#btn-order-csv')).text);
  expect(rows).toContainEqual(['Special, "clip"\nlarge','5','5','ea','1','0']);
  expect(rows).toContainEqual(['Special, "clip"\nlarge','1','1','box','1','0']);
  expect(rows).toContainEqual(["'=1+1",'4','4','ea','1','0']);
  // Preserve each existing manual line's rounding; do not reround the grouped order.
  expect(rows).toContainEqual(['Wire ties','13','20','ea','10','10']);
});

test('MO3 PDF contains the same item/order pairs as the panel and has no prices', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#btn-order-pdf')).toBeVisible();
  await page.waitForFunction(()=>!!window.jspdf);
  const rows=await panelRows(page);
  const output=await download(page,'#btn-order-pdf');
  expect(output.name).toBe('Order_Test_material_order.pdf');
  expect(output.text.startsWith('%PDF-')).toBe(true);
  const tokens=pdfTokens(output.text);
  expect(tokens).toContain('MATERIAL ORDER');
  expect(tokens).toContain('Order Test');
  for(const row of rows){
    const at=tokens.indexOf(row.name);
    expect(at,row.name).toBeGreaterThan(-1);
    expect(tokens.slice(at+1,at+4)).toEqual([row.needed,...row.order.split(' ')]);
  }
  expect(tokens.join(' ')).not.toMatch(/\$|UNIT PRICE|AMOUNT/);
});

test('MO4 PDF paginates long lists and wraps descriptions without dropping the last item', async ({ page }) => {
  await seed(page);
  await state(page, `(()=>{
    S.materials=Array.from({length:90},(_,i)=>({name:'Special order item '+String(i).padStart(3,'0')+' with a long description that needs wrapping onto another line',qty:i+1,unit:'ea'}));
    updateMatList();
  })()`);
  await expect(page.locator('#btn-order-pdf')).toBeVisible();
  await page.waitForFunction(()=>!!window.jspdf);
  const output=await download(page,'#btn-order-pdf');
  const tokens=pdfTokens(output.text);
  const pages=(output.text.match(/\/Type \/Page\b/g)||[]).length;
  expect(pages).toBeGreaterThan(2);
  expect(tokens.filter(t=>t==='MATERIAL ORDER')).toHaveLength(pages);
  expect(tokens.filter(t=>t==='Job: Order Test')).toHaveLength(pages);
  expect(tokens.indexOf('Order Test')).toBeLessThan(tokens.indexOf('ITEM'));
  for(let i=0;i<90;i++)expect(tokens.some(t=>t.startsWith('Special order item '+String(i).padStart(3,'0')))).toBe(true);
  expect(tokens).toContain('90');
});

test('MO5 exports flag an unrecognized layout while retaining unpriced manual materials', async ({ page }) => {
  await seed(page);
  await state(page, `(()=>{
    S.elements[0].fenceType='unknown-legacy-style';
    S.materials=[{name:'Unpriced custom latch',qty:3,unit:'ea'}];updateMatList();
  })()`);
  const csv=(await download(page,'#btn-order-csv')).text;
  expect(csv).toContain('NOT FULLY VERIFIED');
  expect(csvRows(csv)).toContainEqual(['Unpriced custom latch','3','3','ea','1','0']);
  await page.waitForFunction(()=>!!window.jspdf);
  const pdf=(await download(page,'#btn-order-pdf')).text;
  expect(pdfTokens(pdf)).toContain('NOT FULLY VERIFIED');
  expect(pdfTokens(pdf)).toContain('Unpriced custom latch');
});

test('MO6 invalid quantities, packs and waste cannot become apparently valid orders', async ({ page }) => {
  await seed(page);
  const downloads=[];page.on('download',d=>downloads.push(d));
  for(const mutation of [
    `S.materials=[{name:'Bad item',qty:-1,unit:'ea'}]`,
    `S.materials=[];COST_DB['hog wire welded panel'].pack=0`,
    `COST_DB['hog wire welded panel'].pack=16;COST_DB['hog wire welded panel'].waste='bad'`
  ]){
    await state(page,mutation);
    for(const id of ['#btn-order-csv','#btn-order-pdf']){
      await expect(page.locator(id)).toBeVisible();
      await page.locator(id).click();
      await expect(page.locator('#app-toast')).toContainText('Check material quantities, pack sizes and waste');
    }
  }
  expect(downloads).toHaveLength(0);
});

test('MO7 same-name automatic and manual items keep differing pack rules, and group matching rules after rounding', async ({ page }) => {
  await seed(page);
  const item='Post Concrete (60lb bag)';
  await state(page,`(()=>{
    S.materials=[{name:${JSON.stringify(item)},qty:1,unit:'bag'}];
    COST_DB['post concrete bag']={...COST_DB['post concrete bag'],pack:3,waste:10};
    COST_DB['post concrete']={cost:null,unit:'bag',pack:5,waste:0};
    updatePanel();
  })()`);
  let rows=csvRows((await download(page,'#btn-order-csv')).text).filter(r=>r[0]===item);
  expect(rows).toEqual([[item,'4','6','bag','3','10'],[item,'1','5','bag','5','0']]);
  await state(page,`COST_DB['post concrete']={cost:null,unit:'bag',pack:3,waste:10};updateMatList()`);
  rows=csvRows((await download(page,'#btn-order-csv')).text).filter(r=>r[0]===item);
  expect(rows).toEqual([[item,'5','9','bag','3','10']]);
});

test('MO8 a single description longer than a page retains every word and its quantity once', async ({ page }) => {
  await seed(page);
  const words=Array.from({length:800},(_,i)=>'word'+String(i).padStart(4,'0'));
  await state(page,`S.materials=[{name:${JSON.stringify(words.join(' '))},qty:12345,unit:'ea'}];updateMatList()`);
  await expect(page.locator('#btn-order-pdf')).toBeVisible();
  await page.waitForFunction(()=>!!window.jspdf);
  const pdf=(await download(page,'#btn-order-pdf')).text;
  const tokens=pdfTokens(pdf);
  expect((pdf.match(/\/Type \/Page\b/g)||[]).length).toBeGreaterThan(2);
  expect(tokens.join(' ').match(/word\d{4}/g)).toEqual(words);
  expect(tokens.filter(t=>t==='12345')).toHaveLength(2); // needed and order
});
