/* Gate: FenceScraper Benchmark View (TD-020) — run: node test_benchmark.js
 * Builds the benchmark view over the REAL L260616 fixture and asserts:
 *   - observed-market basis is real and sane
 *   - RSMeans reports unavailable and NEVER fabricates a price
 *   - the empty state renders as a label, never "$0"
 *   - the CSI crosswalk is present but flagged unverified
 *   - when a licensed store IS provided, prices drop in with no rewiring */
const assert = require('assert');
const fs = require('fs');
const { parseBidTab } = require('./bidtab_parser.js');
const { buildBenchmark, crosswalkCSI, formatBenchmarkCell, rsMeans } = require('./benchmark.js');

const rows = JSON.parse(fs.readFileSync(__dirname + '/bidtab_fixture.json', 'utf8'));
const { records } = parseBidTab(rows, { retrievedAt: '2026-07-13T00:00:00Z' });
const view = buildBenchmark(records, { asOf: '2026-07-13T00:00:00Z' }); // no rsmeans store today

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('  ok  ' + name); }
const rowByKey = (k) => view.rows.find(r => r.benchKey === k);

console.log('report:', JSON.stringify(view.report));

// 1) Observed-market basis is real and internally sane.
check('observed-market rows are finite and ordered low<=median<=high, n>=1', () => {
  assert.ok(view.rows.length > 0);
  for (const r of view.rows) {
    const o = r.providers['observed-market'];
    assert.strictEqual(o.available, true);
    assert.ok(Number.isFinite(o.low) && Number.isFinite(o.median) && Number.isFinite(o.high));
    assert.ok(o.low <= o.median && o.median <= o.high, r.benchKey);
    assert.ok(o.n >= 1 && o.nItems >= 1);
  }
});

// 2) Concrete anchor: the guardrail line pools across the whole let (the point
//    of a benchmark). Values verified against the fixture; C205160's own
//    5-bidder line ($24–$26.40) must sit inside this pooled range.
check('STL BEAM GUARDRAIL|LF pools to low=24 median=26 high=38 n=25 over 5 jobs', () => {
  const g = rowByKey('STL BEAM GUARDRAIL|LF');
  assert.ok(g, 'guardrail benchmark row missing');
  const o = g.providers['observed-market'];
  assert.strictEqual(o.low, 24);
  assert.strictEqual(o.median, 26);
  assert.strictEqual(o.high, 38);
  assert.strictEqual(o.n, 25);
  assert.strictEqual(o.nItems, 5);
  assert.ok(o.low <= 24 && o.high >= 26.4, 'pooled range must contain C205160 line');
});

// 3) RSMeans fabricates nothing while unlicensed: no price fields, anywhere.
check('rsmeans is unavailable and carries NO numeric price on any row', () => {
  assert.strictEqual(view.providers.rsmeans.available, false);
  assert.strictEqual(view.report.rsmeansAvailable, false);
  for (const r of view.rows) {
    const rm = r.providers['rsmeans'];
    assert.strictEqual(rm.available, false, r.benchKey);
    for (const f of ['low', 'median', 'high', 'mean']) {
      assert.ok(rm[f] === undefined, 'rsmeans leaked ' + f + ' on ' + r.benchKey);
    }
  }
});

// 4) Empty state renders as a label, NEVER as $0 / 0.
check('empty rsmeans cell renders "not licensed yet", never a zero price', () => {
  for (const r of view.rows) {
    const cell = formatBenchmarkCell(r.providers['rsmeans']);
    assert.strictEqual(cell.empty, true);
    assert.strictEqual(cell.numeric, false);
    assert.strictEqual(cell.text, 'not licensed yet');
    assert.ok(!/\$?\b0(\.0+)?\b/.test(cell.text), 'zero-like text leaked');
  }
  // and the observed cell of the guardrail row DOES render a real range
  const g = rowByKey('STL BEAM GUARDRAIL|LF');
  const oc = formatBenchmarkCell(g.providers['observed-market']);
  assert.strictEqual(oc.numeric, true);
  assert.strictEqual(oc.text, '$24.00\u2013$38.00');
});

// 5) CSI crosswalk present on real items, but flagged verified:false.
check('CSI crosswalk maps real items and stays unverified', () => {
  assert.deepStrictEqual(
    { c: crosswalkCSI('STL BEAM GUARDRAIL').csiCode, v: crosswalkCSI('STL BEAM GUARDRAIL').verified },
    { c: '34 71 13', v: false });
  assert.strictEqual(crosswalkCSI('SAFETY FENCE').csiCode, '01 56 26');
  assert.strictEqual(crosswalkCSI('TEMPORARY SILT FENCE').csiCode, '31 25 00');
  assert.strictEqual(crosswalkCSI('WOVEN WIRE FENCE 47" FAB').csiCode, '32 31 26');
  assert.strictEqual(crosswalkCSI('CHAIN LINK FENCE').csiCode, '32 31 13');
  // every crosswalked row is unverified until confirmed against MasterFormat
  for (const r of view.rows) {
    if (r.csiCode) assert.strictEqual(r.csiVerified, false, r.benchKey);
  }
});

// 6) Uncrosswalked items are left null, never guessed into a fence code.
check('non-fence items (aggregate false-positive) get csiCode null', () => {
  const agg = rowByKey('SUBDRAIN COARSE AGGREGATE|CY');
  if (agg) assert.strictEqual(agg.csiCode, null); // 'ag-GATE-' fooled relevance, not the crosswalk
  assert.strictEqual(crosswalkCSI('AGGREGATE BASE COURSE').csiCode, null);
  assert.ok(view.report.crosswalked >= 1 && view.report.uncrosswalked >= 1);
  assert.strictEqual(view.report.crosswalked + view.report.uncrosswalked, view.rows.length);
});

// 7) Deterministic: same input → identical view.
check('buildBenchmark is deterministic', () => {
  const again = buildBenchmark(records, { asOf: '2026-07-13T00:00:00Z' });
  assert.deepStrictEqual(again, view);
});

// 8) Wiring proof: a LICENSED store drops prices straight into the guardrail row.
check('licensed RSMeans store resolves by CSI with no rewiring', () => {
  const store = { available: true, byCsi: {
    '34 71 13': { low: 20, median: 22, high: 25, unit: 'LF', asOf: '2026-01-01' }
  }};
  const licensed = buildBenchmark(records, { asOf: '2026-07-13T00:00:00Z', rsmeansStore: store });
  const g = licensed.rows.find(r => r.benchKey === 'STL BEAM GUARDRAIL|LF');
  const rm = g.providers['rsmeans'];
  assert.strictEqual(rm.available, true);
  assert.strictEqual(rm.found, true);
  assert.strictEqual(rm.low, 20);
  assert.strictEqual(rm.high, 25);
  const cell = formatBenchmarkCell(rm);
  assert.strictEqual(cell.numeric, true);
  assert.strictEqual(cell.text, '$20.00\u2013$25.00');
  // a CSI code with no RSMeans line reports found:false, still no fabricated price
  const miss = rsMeans(store).lookup('99 99 99');
  assert.strictEqual(miss.found, false);
  assert.ok(miss.low === undefined);
});

console.log(`\nALL ${pass} CHECKS PASSED`);
