const {open,seg}=require('./lib');
(async()=>{
 const A=await open();
 const {page,ev,shot,stats,bom}=A;
 const fence=(a,b)=>seg(ev,'fence',a,b), gate=(a,b,t='walk')=>seg(ev,'gate',a,b,`S.gateType='${t}'`);
 const reset=()=>ev(`S.elements=[];S.history=[];S.future=[];S.selected=null;draw()`);
 const price=()=>ev('computePricing().clientTotal');
 const diff=(x,y)=>{const d={};for(const k of new Set([...Object.keys(x),...Object.keys(y)]))if(x[k]!==y[k])d[k]=[x[k],y[k]];return d;};
 // B collinear
 await reset();await fence([2,10],[62,10]);const s1=await stats(),b1=await bom(),p1=await price();
 await reset();await fence([2,10],[32,10]);await fence([32,10],[62,10]);const s2=await stats(),b2=await bom(),p2=await price();
 console.log('B one',s1,'\nB two',s2,'\nB bomdiff',diff(b1,b2),'\nB price',p1,p2);
 await ev('S.zoom=0.5;S.pan={x:60,y:60};draw()');await shot('05-collinear-two-segments-terminal-at-joint');
 // B2: 3 segments collinear 60ft also posts
 console.log('B posts x', await ev(`S.elements.filter(e=>e.type==='post').map(p=>p.pos.x/40)`));
 // C gate at run end vs gate mid
 await reset();await fence([2,10],[42,10]);const g0=await bom();
 await gate([2,10],[6,10]);const gEnd=await stats(),gEndB=await bom();
 console.log('C gate at run end stats',gEnd,'\nC bom diff vs no gate',diff(g0,gEndB));
 await ev('S.zoom=0.8;S.pan={x:40,y:-100};draw()');await shot('06-gate-at-run-end');
 // C2 gate mid
 await reset();await fence([2,10],[42,10]);await gate([20,10],[24,10]);
 console.log('C2 gate mid stats',await stats(),'\n posts',await ev(`S.elements.filter(e=>e.type==='post').map(p=>p.pos.x/40)`));
 // D gate off the fence (20ft away) still deducts
 await reset();await fence([2,10],[42,10]);await gate([20,30],[24,30]);
 console.log('D off-run gate stats',await stats(), 'validate', JSON.stringify((await ev('validateProject({requireClient:false,includePricing:false})')).errors.concat((await ev('validateProject({requireClient:false,includePricing:false})')).warnings).map(e=>e.code)));
 await ev('S.zoom=0.6;S.pan={x:40,y:-80};draw()');await shot('07-gate-off-fence-still-deducted');
 // D2 perpendicular gate across the fence
 await reset();await fence([2,10],[42,10]);await gate([20,8],[20,12]);
 console.log('D2 perpendicular gate stats',await stats());
 // E overlapping gates
 await reset();await fence([2,10],[42,10]);await gate([20,10],[24,10]);await gate([20,10],[24,10]);
 console.log('E overlapping duplicate gates',await stats());
 // E2 gate longer than run
 await reset();await fence([2,10],[12,10]);await gate([0,10],[20,10],'doubledrive');
 console.log('E2 gate longer than run',await stats(),JSON.stringify(await bom()).slice(0,300));
 console.log('errors',A.errors.filter(e=>!/jsPDF|TUNNEL/.test(e)));
 await A.browser.close();
})();
