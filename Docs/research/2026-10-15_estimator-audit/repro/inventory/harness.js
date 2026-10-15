const { chromium } = require('/home/user/FenceBound/node_modules/playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#canvas');
  // install helpers
  await page.evaluate(() => {
    window.resolveKey = function (name) {
      const k = normalizeMatKey(name);
      if (COST_DB[k]) return k;
      if ((k === 'terminal size brace band' || k === 'line size brace band') && COST_DB['brace band']) return 'brace band';
      const parts = k.split(' ');
      for (let n = Math.min(5, parts.length); n >= 2; n--) { const sub = parts.slice(0, n).join(' '); if (COST_DB[sub]) return sub; }
      for (const dbk in COST_DB) { if (dbk.startsWith(k + ' ') || k.startsWith(dbk + ' ')) return dbk; }
      return null;
    };
    // build(key,height,lenFt,gates=[[a,b,type]],opts)
    window.build = function (key, heightIn, lenFt, gates = [], opts = {}) {
      localStorage.clear();
      S.elements = []; S.selected = null; S.materials = [];
      S.specs = hydrateRunSpecs({ ...S.specs, addons: ['bottom-wire'], postDirty: false, embedDirty: false, midRailUserSet: false,
        postEmbedDirty: { line: false, terminal: false, corner: false, gate: false } });
      selectFenceType(key);
      if (heightIn) { S.specs.heightIn = heightIn; applyHeightDrivenSpecs({ specs: S.specs }); }
      if (opts.mutate) opts.mutate(S.specs);
      const spacing = opts.spacing || S.postSpacing;
      const pts = opts.points || [{ x: 0, y: 0 }, { x: lenFt * GRID_FT, y: 0 }];
      const runs = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const runId = 'r' + i, specs = cloneRunSpecs(S.specs);
        const run = { type: 'fence', start: pts[i], end: pts[i + 1], fenceType: key, runId, specs, postSpacing: spacing, autoPostSpacing: opts.noAuto ? null : spacing };
        S.elements.push(run); runs.push(run);
        if (!opts.noAuto) S.elements.push(...autoPostsForRun(run.start, run.end, spacing, key, runId, specs));
      }
      gates.forEach(([a, b, gt, ri]) => {
        const run = runs[ri || 0];
        const dx = (run.end.x - run.start.x), dy = (run.end.y - run.start.y), L = Math.hypot(dx, dy);
        const P = f => ({ x: run.start.x + dx * f * GRID_FT / L, y: run.start.y + dy * f * GRID_FT / L });
        const g = attachGateToRun({ type: 'gate', start: P(a), end: P(b), gateType: gt, hinge: 'start', swingDir: 1 }, run);
        S.elements.push(g); rebuildRunAutoPosts(run);
      });
      const st = getStats(), bom = calcAutoMaterials();
      return {
        key, heightIn: S.specs.heightIn, spacing, postHeightIn: S.specs.postHeightIn, embed: { ...S.specs.postEmbedIn }, mid: S.specs.hasMidRail, addons: [...S.specs.addons],
        stats: { totalFt: st.totalFt, netFt: st.netTotalFt, term: st.terminalPosts.size, corner: st.cornerPosts.size, line: st.linePosts, ends: st.terminationEnds, gates: st.gateTotal },
        linePostPositions: S.elements.filter(e => e.type === 'post').map(p => +(p.pos.x / GRID_FT).toFixed(2)),
        bom: bom.map(r => ({ name: r.name, qty: r.qty, unit: r.unit, key: resolveKey(r.name), dbUnit: (COST_DB[resolveKey(r.name)] || {}).unit, cost: lookupCost(r.name) })),
        pricing: (() => { const P = computePricing(); return { matCost: P.matCost, laborCost: P.laborCost, total: P.clientTotal, unknown: P.unknown }; })()
      };
    };
  });
  const out = {};
  const scenarios = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (const [name, src] of Object.entries(scenarios)) {
    try { out[name] = await page.evaluate(s => window.eval(s), src); }
    catch (e) { out[name] = { error: e.message }; }
  }
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  await browser.close();
})();
