const {open}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,drag,tool,shot,stats,bom}=A;
 const Z='S.zoom=0.5;S.pan={x:80,y:80};draw()';
 await ev(Z);
 // A: closed rectangle 40x30 via mouse
 await drag([2,2],[42,2]);await drag([42,2],[42,32]);await drag([42,32],[2,32]);await drag([2,32],[2,2]);
 const rect=await stats();console.log('A rect 40x30 loop',rect);
 const rb=await bom();console.log('A bom',JSON.stringify(rb));
 console.log('A posts', await ev(`S.elements.filter(e=>e.type==='post').map(p=>[p.pos.x/40,p.pos.y/40])`));
 await shot('04-closed-rectangle-140lf');
 // B: straight 60ft drawn as one vs two collinear segments
 await ev(`S.elements=[];draw()`);
 await drag([2,20],[62,20]);
 const one=await stats(),oneB=await bom();
 await ev(`S.elements=[];draw()`);
 await drag([2,20],[32,20]);await drag([32,20],[62,20]);
 const two=await stats(),twoB=await bom();
 console.log('B one seg',one,'\n two seg',two);
 const diff={};for(const k of new Set([...Object.keys(oneB),...Object.keys(twoB)]))if(oneB[k]!==twoB[k])diff[k]=[oneB[k],twoB[k]];
 console.log('B BOM diff one vs two',diff);
 await ev(`S.zoom=0.6;S.pan={x:40,y:-200};draw()`);
 await shot('05-collinear-two-segments-terminal-at-joint');
 await ev(`S.elements=[];draw()`);await drag([2,20],[62,20]);const p1=await ev('computePricing().clientTotal');await ev(`S.elements=[];draw()`);await drag([2,20],[32,20]);await drag([32,20],[62,20]);const p2=await ev('computePricing().clientTotal');console.log('B price one vs two',p1,p2);
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
