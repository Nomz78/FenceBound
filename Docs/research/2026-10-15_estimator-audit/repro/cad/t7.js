const {open,seg}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,shot,stats,bom,scr,rect}=A;
 const fence=(a,b)=>seg(ev,'fence',a,b), gate=(a,b,t='walk')=>seg(ev,'gate',a,b,`S.gateType='${t}'`);
 await ev(`S.zoom=1`);
 // P wheel zoom anchor
 await ev(`S.zoom=1;S.pan={x:80,y:80};draw()`);
 await fence([2,2],[12,2]);
 const cx=rect.x+700,cy=rect.y+500;
 const before=await ev(`({wx:(${700}-S.pan.x)/S.zoom/40,wy:(${500}-S.pan.y)/S.zoom/40})`);
 await page.mouse.move(cx,cy);await page.mouse.wheel(0,-300);await page.waitForTimeout(200);
 const after=await ev(`({z:S.zoom,wx:(${700}-S.pan.x)/S.zoom/40,wy:(${500}-S.pan.y)/S.zoom/40})`);
 console.log('P world point under cursor before/after wheel',before,after);
 // Q zoom limits / grid label
 // R 7-24-25 triangle float posts
 await ev(`S.elements=[];draw()`);await fence([0,0],[14,48]);
 console.log('R 14x48 (50ft) run', await stats(), await ev(`S.elements.filter(e=>e.type==='post').map(p=>[+(p.pos.x/40).toFixed(3),+(p.pos.y/40).toFixed(3)])`));
 // S save/load + undo after load
 await ev(`S.elements=[];S.history=[];draw()`);
 await ev(`S.projectName='Job A';S.jobCustomer='Alice'`);await fence([2,2],[22,2]);
 await page.click('#btn-jobs');await page.click('#do-save');await page.waitForTimeout(100);
 await ev(`S.projectName='Job B';S.jobCustomer='Bob';S.elements=[];S.history=[];`);await fence([2,2],[2,32]);await fence([2,32],[30,32]);
 await ev('updateDrawers()');await page.click('#do-save');
 const jobs=await ev('S.savedJobs.map(j=>j.name)');console.log('S saved',jobs);
 // load job A (index of Job A)
 const idx=jobs.indexOf('Job A');
 await page.click(`[data-ji="${idx}"]`);await page.waitForTimeout(100);
 console.log('S after load A',await ev(`({name:S.projectName,cust:S.jobCustomer,runs:S.elements.filter(e=>e.type==='fence').length,ft:getStats().totalFt})`));
 await page.click('#btn-undo');
 console.log('S after UNDO of load',await ev(`({name:S.projectName,cust:S.jobCustomer,runs:S.elements.filter(e=>e.type==='fence').length,ft:getStats().totalFt})`));
 // T: same-name save overwrite
 await ev(`S.projectName='Untitled Job';S.savedJobs=[];S.showJobs=true;updateDrawers()`);
 await page.click('#do-save');await ev(`S.elements=[];draw();S.showJobs=true;updateDrawers()`);await fence([0,0],[5,0]);await page.click('#do-save');
 console.log('T saving two different Untitled Job drawings ->',await ev('S.savedJobs.length'),'saved job(s)');
 await page.click('#close-jobs').catch(()=>{});
 // U autosave restore after reload
 await ev(`S.elements=[];S.projectName='Restore test';draw()`);await fence([1,1],[41,1]);await gate([10,1],[14,1]);
 await ev('saveSession()');await page.reload();await page.waitForTimeout(400);
 console.log('U after reload',await stats());
 // V undo/redo chain
 await ev(`S.elements=[];S.history=[];S.future=[];draw();updateUndoButtons()`);
 await fence([0,0],[20,0]);await fence([20,0],[20,20]);await gate([5,0],[9,0]);
 const s3=await stats();await page.click('#btn-undo');const s2=await stats();await page.click('#btn-undo');const s1=await stats();await page.click('#btn-redo');await page.click('#btn-redo');const s3b=await stats();
 console.log('V undo/redo',s3.els,s2.els,s1.els,s3b.els, JSON.stringify(s3)===JSON.stringify(s3b));
 // W spec change undo
 await ev(`S.history=[];updateUndoButtons();S.selected=S.elements.findIndex(e=>e.type==='fence');syncSelectedRunToPanel()`);
 await page.click('.ptab[data-tab=specs]');
 await page.selectOption('#spec-height','72').catch(e=>console.log('sel err',e.message.slice(0,80)));
 console.log('W after height change history len',await ev('S.history.length'), 'run height',await ev(`S.elements.find(e=>e.type==='fence').specs.heightIn`));
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
