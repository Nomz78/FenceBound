const { chromium, devices } = require('/home/user/FenceBound/node_modules/playwright-core');
const SHOTS=__dirname+'/shots/';
async function open(opts={}){
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await browser.newContext(opts.ctx||{viewport:{width:1400,height:900}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.type()+': '+m.text());});
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('dialog',d=>d.accept(opts.prompt||undefined));
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  const ev=(src)=>page.evaluate(s=>window.eval(s),src);
  const rect=await page.evaluate(()=>{const r=document.getElementById('canvas').getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height};});
  // world ft -> screen
  const scr=async(fx,fy)=>{const st=await ev('({px:S.pan.x,py:S.pan.y,z:S.zoom})');return{x:rect.x+st.px+fx*40*st.z,y:rect.y+st.py+fy*40*st.z};};
  const drag=async(a,b,steps=12)=>{const p=await scr(...a),q=await scr(...b);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps});await page.mouse.up();};
  const click=async(a)=>{const p=await scr(...a);await page.mouse.click(p.x,p.y);};
  const tool=async(t)=>{await page.click(`[data-tool=${t}]`);};
  const shot=async(n)=>{await page.screenshot({path:SHOTS+n+'.png'});return SHOTS+n+'.png';};
  const stats=()=>ev(`(()=>{const s=getStats();return{totalFt:+s.totalFt.toFixed(3),netFt:+s.netTotalFt.toFixed(3),term:s.terminalPosts.size,corner:s.cornerPosts.size,line:s.linePosts,gates:s.gateTotal,gatePosts:s.gatePosts,runs:S.elements.filter(e=>e.type==='fence').length,els:S.elements.length}})()`);
  const bom=()=>ev(`Object.fromEntries(calcAutoMaterials().map(i=>[i.name,i.qty]))`);
  return {browser,page,errors,ev,scr,drag,click,tool,shot,stats,bom,rect};
}
module.exports={open};
// programmatic draw through production handleUp (same path tests use)
module.exports.seg=(ev,type,a,b,extra='')=>ev(`(()=>{${extra};S.tool='${type}';S.drawing={type:'${type}',start:{x:${a[0]}*GRID_FT,y:${a[1]}*GRID_FT},end:{x:${b[0]}*GRID_FT,y:${b[1]}*GRID_FT}};handleUp({preventDefault(){},stopPropagation(){}});updatePanel();})()`);
