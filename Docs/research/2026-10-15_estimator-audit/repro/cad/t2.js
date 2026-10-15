const {open}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,drag,tool,shot,stats,bom}=A;
 await ev('S.zoom=0.4;draw()');
 await drag([2,2],[44,2]);
 console.log('42ft run',await stats());
 console.log('bom',JSON.stringify(await bom()));
 console.log('posts x',await ev(`S.elements.filter(e=>e.type==='post').map(p=>p.pos.x/40)`));
 const p=await A.scr(2,6),q=await A.scr(44,6);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:10});
 const pc=await ev(`(()=>{const l=dist(S.drawing.start,S.drawing.end);return {lenFt:l/40,previewLabelPosts:Math.max(0,Math.floor(l/(S.postSpacing*40))-1),dotsDrawn:autoPostsForRun(S.drawing.start,S.drawing.end,S.postSpacing,S.fenceType).length}})()`);
 console.log('preview',pc);
 await ev('S.zoom=1.2;S.pan={x:-1500,y:-50};draw()');
 await shot('02-preview-42ft-label-vs-dots');
 await page.keyboard.press('Escape'); await page.mouse.up();
 // mouseup outside canvas
 await ev('S.zoom=0.4;S.pan={x:80,y:80};draw()');
 const a=await A.scr(2,10);
 await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(1300,500,{steps:5});await page.mouse.up();
 console.log('after release over panel: drawing still active?', await ev('!!S.drawing'));
 await page.mouse.move(a.x+200,a.y+100,{steps:3});
 await shot('03-stuck-rubberband-after-release-outside');
 await page.mouse.down();await page.mouse.up();
 console.log('after next click', await stats());
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
