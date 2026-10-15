const {open,seg}=require('./lib');
(async()=>{const A=await open();const {ev,stats,bom,shot}=A;
 await ev('S.snapFt=0.5');
 await seg(ev,'fence',[0,0],[10.5,0]);await seg(ev,'fence',[10.5,0],[10.5,10.5]);await seg(ev,'fence',[10.5,10.5],[0,10.5]);await seg(ev,'fence',[0,10.5],[0,0]);
 const b=await bom();console.log('4x10.5 loop',(await stats()).totalFt,'fabric',b['Chain Link Fabric (48")'],'labor line',await ev('computePricing().laborLines[0].label'));
 await ev('S.elements=[];S.zoom=0.9;S.pan={x:60,y:60};draw()');
 await seg(ev,'fence',[2,2],[22,2]);await seg(ev,'gate',[2,2],[6,2],"S.gateType='walk'");await ev('draw()');await shot('06-gate-at-run-end');
 await A.browser.close();})();
