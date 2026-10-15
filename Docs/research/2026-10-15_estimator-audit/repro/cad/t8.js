const {open,seg}=require('./lib');
(async()=>{
 for(const [name,vp] of [['ipad-landscape',{width:1180,height:820}],['ipad-portrait',{width:820,height:1180}],['phone',{width:390,height:844}]]){
  const A=await open({ctx:{viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2}});
  const {page,ev,shot,stats,rect}=A;
  const cdp=await page.context().newCDPSession(page);
  const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((p,i)=>({x:p.x,y:p.y,id:i}))});
  console.log(name,'canvas rect',rect);
  await ev('S.zoom=0.5;S.pan={x:30,y:30};draw()');
  // one-finger draw 20ft
  const a=await A.scr(2,4),b=await A.scr(18,4);
  await T('touchStart',[a]);for(let i=1;i<=8;i++)await T('touchMove',[{x:a.x+(b.x-a.x)*i/8,y:a.y}]);await T('touchEnd',[]);
  console.log(name,'after 1-finger draw',await stats());
  await shot('13-'+name+'-after-touch-draw');
  // two-finger tap undo
  await T('touchStart',[{x:a.x,y:a.y+200}]);await T('touchStart',[{x:a.x,y:a.y+200},{x:a.x+100,y:a.y+200}]);await T('touchEnd',[]);
  console.log(name,'after 2-finger tap (undo)',(await stats()).runs);
  if(name==='ipad-landscape'){
    // redraw then move-tool + two finger tap -> no-op undo?
    await seg(ev,'fence',[2,4],[18,4]);
    await page.click('[data-tool=move]');
    const m=await A.scr(9,4);
    const h0=await ev('S.history.length');
    await T('touchStart',[m]);await T('touchStart',[m,{x:m.x+120,y:m.y+60}]);await T('touchEnd',[]);
    console.log('two-finger tap in Move tool starting on a run: history before',h0,'runs after "undo"',(await stats()).runs,'history',await ev('S.history.length'));
    // hit target sizes: post select radius at zoom .5
    console.log('select hit radius world px at zoom .5 =',14/0.5,'screen px=14 (CSS)');
  }
  await A.browser.close();
 }
})();
