const {open}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,drag,tool,shot,stats,bom}=A;
 await shot('01-initial');
 console.log('default specs', await ev('JSON.stringify({h:S.specs.heightIn,addons:[...S.specs.addons],tool:S.tool,snap:S.snapFt,sp:S.postSpacing})'));
 // single straight 42ft run with real mouse
 await drag([2,2],[44,2]);
 console.log('42ft run',await stats());
 console.log('bom',JSON.stringify(await bom()));
 // preview label check: start drawing and hover
 const p=await A.scr(2,6),q=await A.scr(44,6);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:10});
 await shot('02-preview-42ft-label');
 const pc=await ev(`(()=>{const l=dist(S.drawing.start,S.drawing.end);return {lenFt:l/40,previewLabelPosts:Math.max(0,Math.floor(l/(S.postSpacing*40))-1),dotsDrawn:autoPostsForRun(S.drawing.start,S.drawing.end,S.postSpacing,S.fenceType).length}})()`);
 console.log('preview',pc);
 await page.keyboard.press('Escape'); await page.mouse.up();
 console.log('after esc',await stats());
 console.log('errors',A.errors);
 await A.browser.close();
})();
