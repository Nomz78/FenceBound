const {open,seg}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,shot,stats,bom,scr}=A;
 const fence=(a,b)=>seg(ev,'fence',a,b), gate=(a,b,t='walk')=>seg(ev,'gate',a,b,`S.gateType='${t}'`);
 const reset=()=>ev(`S.elements=[];S.history=[];S.future=[];S.selected=null;S.zoom=0.6;S.pan={x:60,y:60};draw()`);
 const val=async()=>{const v=await ev('validateProject({requireClient:false,includePricing:false})');return v.errors.concat(v.warnings).map(e=>e.code);};
 // F: move fence body by real mouse with gate on it
 await reset();await fence([2,10],[42,10]);await gate([20,10],[24,10]);
 await page.click('[data-tool=move]');
 let p=await scr(10,10),q=await scr(10,25);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:10});await page.mouse.up();
 console.log('F after body move', await stats(), 'gate', await ev(`JSON.stringify(S.elements.find(e=>e.type==='gate'))`).then(s=>JSON.parse(s)).then(g=>[g.start.x/40,g.start.y/40,g.end.x/40,g.end.y/40]), 'posts',await ev(`S.elements.filter(e=>e.type==='post').map(p=>[p.pos.x/40,p.pos.y/40])`),'validate',await val());
 await shot('08-move-run-leaves-gate-behind');
 // G: shared corner endpoint drag via Move tool
 await reset();await fence([2,2],[30,2]);await fence([30,2],[30,20]);
 await page.click('[data-tool=move]');
 p=await scr(30,2);q=await scr(34,6);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:8});await page.mouse.up();
 console.log('G after dragging shared corner', await stats(), await ev(`S.elements.filter(e=>e.type==='fence').map(f=>[f.start.x/40,f.start.y/40,f.end.x/40,f.end.y/40])`));
 await shot('09-drag-corner-disconnects-runs');
 // H: delete a run -> orphan posts/gate
 await reset();await fence([2,10],[42,10]);await gate([20,10],[24,10]);
 await page.click('[data-tool=select]');
 p=await scr(8,10);await page.mouse.click(p.x,p.y);
 console.log('H selected type',await ev('S.elements[S.selected]?.type'));
 await page.click('#btn-delete');
 console.log('H after delete', await stats(), 'elements', await ev(`S.elements.map(e=>e.type)`), 'bom', JSON.stringify(await bom()),'validate',await val());
 await shot('10-deleted-run-leaves-orphan-posts-gate');
 // I: escape during move wipes addons
 await reset();await fence([2,10],[42,10]);
 await ev(`(()=>{const r=S.elements.find(e=>e.type==='fence');r.specs.addons=new Set(['bottom-wire','barbed-wire']);})()`);
 console.log('I addons before', await ev(`[...S.elements.find(e=>e.type==='fence').specs.addons]`), JSON.stringify(await bom()).match(/Barb[^,]*/g));
 await page.click('[data-tool=move]');
 p=await scr(10,10);q=await scr(10,14);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:5});
 await page.keyboard.press('Escape');await page.mouse.up();
 console.log('I addons after Esc', await ev(`(()=>{const a=S.elements.find(e=>e.type==='fence').specs.addons;return {isSet:a instanceof Set,val:JSON.stringify(a instanceof Set?[...a]:a)}})()`));
 let bomI; try{bomI=JSON.stringify(await bom());}catch(e){bomI='THROW '+e.message.slice(0,200);} console.log('I bom after esc',bomI);
 try{console.log('I pricing after esc',await ev('computePricing().clientTotal'));}catch(e){console.log('I pricing THROW',e.message.slice(0,200));}
 console.log('I validate',await val());
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
