const {open,seg}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,shot,stats,bom,scr}=A;
 const fence=(a,b)=>seg(ev,'fence',a,b), gate=(a,b,t='walk')=>seg(ev,'gate',a,b,`S.gateType='${t}'`);
 const reset=()=>ev(`S.elements=[];S.history=[];S.future=[];S.selected=null;S.autoPost=true;S.zoom=0.6;S.pan={x:60,y:60};draw()`);
 const val=async()=>{const v=await ev('validateProject({requireClient:false,includePricing:false})');return v.errors.concat(v.warnings).map(e=>e.code);};
 // J: T-junction starting at a line post (snap targets posts) via mouse
 await reset();await fence([2,2],[42,2]);
 await page.click('[data-tool=fence]');
 let p=await scr(22.3,2.4),q=await scr(22,20);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:8});await page.mouse.up();
 console.log('J T-junction from line post', await stats(), await ev(`S.elements.filter(e=>e.type==='post').map(p=>[p.pos.x/40,p.pos.y/40,p.runId.slice(-5)])`));
 await ev('S.zoom=1.2;S.pan={x:-300,y:20};draw()');await shot('11-T-junction-line-post-plus-terminal');
 // J2: T-junction mid-span not on a post
 await reset();await fence([2,2],[42,2]);await fence([17,2],[17,20]);
 console.log('J2 T mid-span', await stats());
 // K manual post
 await reset();await fence([2,2],[42,2]);const k0=await bom();
 await page.click('[data-tool=post]');p=await scr(17,2);await page.mouse.click(p.x,p.y);
 const k1=await bom();console.log('K manual post added; elements',await ev(`S.elements.filter(e=>e.type==='post').length`),'bom identical?',JSON.stringify(k0)===JSON.stringify(k1),'stats',await stats());
 // L autopost off
 await reset();await ev(`S.autoPost=false`);await fence([2,2],[102,2]);
 console.log('L autopost off 100ft', await stats(), 'validate',await val(), JSON.stringify(await bom()).slice(0,200));
 // M near-miss corner at high zoom/fine snap
 await reset();await ev(`S.snapFt=0.1`);
 await fence([2,2],[30,2]);await fence([30.3,2],[30.3,20]);
 console.log('M near-miss joint 0.3ft gap', await stats());
 await ev(`S.snapFt=1`);
 // N diagonal float: 45deg runs and 3-4-5
 await reset();await fence([0,0],[30,40]);console.log('N 3-4-5 50ft diag', await stats());
 await reset();await fence([0,0],[10,10]);console.log('N 45deg 10x10', await stats(), 'fabric', (await bom())['Chain Link Fabric (48")'],'label',await ev(`ftLbl(dist(S.elements[0].start,S.elements[0].end))`));
 // N2: posts landing exactly on end due to float -> check a range of lengths
 const bad=await ev(`(()=>{const out=[];for(let L=10;L<=200;L+=10)for(const deg of [0,15,30,33.69,45,60,90,135]){const r=deg*Math.PI/180;const s={x:0,y:0},e={x:Math.cos(r)*L*40,y:Math.sin(r)*L*40};const ps=autoPostsForRun(s,e,10,'chainlink');const last=ps[ps.length-1];if(last&&dist(last.pos,e)<1)out.push([L,deg,ps.length]);}return out;})()`);
 console.log('N2 line post coincident with end (float)',bad);
 // O angle lock closing a loop
 await reset();await ev(`S.angleLock=true`);
 await fence([2,2],[32,2]);await fence([32,2],[32,15]);
 await page.click('[data-tool=fence]');
 p=await scr(32,15);q=await scr(2,2);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:8});await page.mouse.up();
 console.log('O angle-lock close attempt', await stats(), await ev(`S.elements.filter(e=>e.type==='fence').map(f=>[f.start.x/40,f.start.y/40,f.end.x/40,f.end.y/40])`));
 await shot('12-angle-lock-cannot-close-loop');
 await ev(`S.angleLock=false`);
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
