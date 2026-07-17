/* Gate: FenceScraper pure Market Benchmark Book helpers — run: node "test market benchmark pure.js" */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const vm = require('vm');

const BASELINE_HEAD = '65919dd510905e791a6f369e50dc60fcb8ce437d';
const TARGET_HTML = 'FenceScraper-v3.0-Validated-Market-Rate-Mapping.html';
let parityCaseCount = 0;
let pass = 0;

const RealDate = Date;
class FrozenDate extends RealDate {
  constructor(...args) {
    if (args.length) return new RealDate(...args);
    return new RealDate('2026-07-16T12:00:00.000Z');
  }
  static now() {
    return new RealDate('2026-07-16T12:00:00.000Z').getTime();
  }
}
FrozenDate.parse = RealDate.parse;
FrozenDate.UTC = RealDate.UTC;

global.Date = FrozenDate;

const Market = require('./fencescraper-market-benchmark-pure.js');
const fixtureRecords = JSON.parse(fs.readFileSync(__dirname + '/fixtures/market-benchmark-records.json', 'utf8'));
const Baseline = loadBaselineMarketBenchmarkHelpers();

function check(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ok  ' + name);
  } catch (err) {
    console.error('FAIL ' + name);
    throw err;
  }
}

function loadBaselineMarketBenchmarkHelpers() {
  const source = childProcess.execFileSync(
    'git',
    ['show', BASELINE_HEAD + ':' + TARGET_HTML],
    { encoding: 'utf8' }
  );
  const names = [
    'mbNormalizeUnit',
    'mbClassify',
    'mbQuantile',
    'mbRound',
    'mbBuildObservations',
    'buildMarketBenchmarkBook'
  ];
  const code = names.map(name => extractFunction(source, name)).concat([
    'module.exports = {',
    '  mbNormalizeUnit,',
    '  mbClassify,',
    '  mbQuantile,',
    '  mbRound,',
    '  mbBuildObservations,',
    '  buildMarketBenchmarkBook,',
    '  setRecords(records) { state.bidtab.records = records; },',
    '  setFilters(filters) { document.setFilters(filters); },',
    '  getMarketBook() { return state.marketBook; }',
    '};'
  ]).join('\n');
  const sandbox = {
    module: { exports: {} },
    state: { bidtab: { records: [] }, marketBook: { schemaVersion: '1.1', generatedAt: null, benchmarks: [], observations: [] } },
    document: makeDocumentShim(),
    renderMarketBenchmarkBook: function () {},
    Date: FrozenDate,
    Map,
    Set,
    Array,
    Object,
    String,
    Number,
    Math,
    RegExp,
    isFinite
  };
  vm.runInNewContext(code, sandbox, { filename: 'baseline-market-benchmark-helpers.js' });
  return sandbox.module.exports;
}

function makeDocumentShim() {
  let filters = { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true };
  return {
    setFilters(next) {
      filters = Object.assign({}, filters, next || {});
    },
    getElementById(id) {
      if (id === 'mb-min') return { value: filters.minimumSamples };
      if (id === 'mb-low-only') return { checked: !!filters.apparentLowOnly };
      if (id === 'mb-fence-only') return { checked: !!filters.fenceOnly };
      return null;
    }
  };
}

function extractFunction(source, name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Unable to extract baseline function ' + name);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error('Unclosed baseline function ' + name);
}

function normalizeBook(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => key === 'generatedAt' ? '<normalized>' : val));
}

function assertParity(label, fn) {
  parityCaseCount++;
  const actual = normalizeBook(fn(Market));
  const expected = normalizeBook(fn(Baseline));
  assert.deepStrictEqual(actual, expected, label);
}

function baselineBook(records, filters) {
  Baseline.setRecords(records);
  Baseline.setFilters(filters);
  Baseline.buildMarketBenchmarkBook();
  return Baseline.getMarketBook();
}

function marketBook(records, filters) {
  return Market.buildMarketBenchmarkBookData(records, filters, '2026-07-16T12:00:00.000Z');
}

check('exports expected helper names', () => {
  assert.deepStrictEqual(
    Object.keys(Market).sort(),
    [
      'buildMarketBenchmarkBookData',
      'mbBuildObservations',
      'mbClassify',
      'mbNormalizeUnit',
      'mbQuantile',
      'mbRound'
    ].sort()
  );
});

check('baseline parity against committed inline implementation', () => {
  ['LF', 'L.F.', 'linear feet', 'EA', 'Each', 'SY', 'S.Y.', 'LS', 'Lump Sum', '', null, 'ton'].forEach(input => {
    assertParity('mbNormalizeUnit ' + input, x => x.mbNormalizeUnit(input));
  });

  [
    { itemDesc: 'SILT FENCE', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'STL BEAM GUARDRAIL', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'DOUBLE DRIVE GATE', unit: 'EA', qty: 1, unitPrice: 1 },
    { itemDesc: 'CANTILEVER GATE', unit: 'EA', qty: 1, unitPrice: 1 },
    { itemDesc: 'WALK GATE', unit: 'EA', qty: 1, unitPrice: 1 },
    { itemDesc: 'CHAIN LINK LINE POST', unit: 'EA', qty: 1, unitPrice: 1 },
    { itemDesc: 'ORNAMENTAL ALUMINUM FENCE', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'WOVEN WIRE FENCE RESET', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'BARBED WIRE FENCE', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'TEMPORARY CONSTRUCTION FENCE PANEL', unit: 'EA', qty: 1, unitPrice: 1 },
    { itemDesc: 'WOOD PRIVACY FENCE', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'SHADOWBOX FENCE', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'VINYL FENCE SPLIT RAIL', unit: 'LF', qty: 1, unitPrice: 1 },
    { itemDesc: 'FENCE AND GATE COMPLETE', unit: 'LS', qty: 1, unitPrice: 1 },
    { itemDesc: 'AGGREGATE BASE COURSE', unit: 'TON', qty: 1, unitPrice: 1 }
  ].forEach(record => assertParity('mbClassify ' + record.itemDesc, x => x.mbClassify(record)));

  [
    [[], .5],
    [[10], .5],
    [[10, 20], .25],
    [[10, 20, 30, 100], .25],
    [[10, 20, 30, 100], .5],
    [[10, 20, 30, 100], .75]
  ].forEach(args => assertParity('mbQuantile ' + JSON.stringify(args), x => x.mbQuantile(args[0], args[1])));

  [null, 0, 1.234, 1.235, -1.235].forEach(input => assertParity('mbRound ' + input, x => x.mbRound(input)));

  [
    { minimumSamples: 1, apparentLowOnly: false, fenceOnly: false },
    { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true },
    { minimumSamples: 1, apparentLowOnly: true, fenceOnly: true },
    { minimumSamples: 3, apparentLowOnly: false, fenceOnly: true }
  ].forEach(filters => {
    assertParity('mbBuildObservations ' + JSON.stringify(filters), x => {
      if (x === Baseline) {
        x.setRecords(fixtureRecords);
        x.setFilters(filters);
        return x.mbBuildObservations();
      }
      return x.mbBuildObservations(fixtureRecords, filters);
    });
    parityCaseCount++;
    assert.deepStrictEqual(
      normalizeBook(marketBook(fixtureRecords, filters)),
      normalizeBook(baselineBook(fixtureRecords, filters)),
      'buildMarketBenchmarkBookData ' + JSON.stringify(filters)
    );
  });
});

check('baseline parity case count', () => {
  assert.strictEqual(parityCaseCount, 46);
});

check('benchmark schema and grouping are stable', () => {
  const book = marketBook(fixtureRecords, { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true });
  assert.strictEqual(book.schema, 'fencebound.market-benchmark-book');
  assert.strictEqual(book.schemaVersion, '1.1');
  assert.deepStrictEqual(book.filters, { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true });
  const chain = book.benchmarks.find(b => b.benchmarkKey === 'chain-link|galvanized-or-unspecified|installed-assembly|fence.chainlink|LF');
  assert.ok(chain, 'chain-link benchmark missing');
  assert.strictEqual(chain.sampleCount, 5);
  assert.strictEqual(chain.cleanSampleCount, 4);
  assert.strictEqual(chain.apparentLowCount, 2);
  assert.strictEqual(chain.minimum, 30);
  assert.strictEqual(chain.q1, 40);
  assert.strictEqual(chain.median, 50);
  assert.strictEqual(chain.q3, 70);
  assert.strictEqual(chain.maximum, 100);
  assert.strictEqual(chain.contracts, 4);
  assert.strictEqual(chain.lets, 4);
  assert.deepStrictEqual(chain.counties, ['Mecklenburg', 'Stanly', 'Union']);
  assert.strictEqual(chain.dateMin, '2026-01-01');
  assert.strictEqual(chain.dateMax, '2026-03-01');
  assert.strictEqual(chain.confidence, 'medium');
});

check('classification protects Rate Card as advisory data only', () => {
  const walk = Market.mbClassify({ itemDesc: 'WALK GATE', unit: 'EA', qty: 1, unitPrice: 450 });
  assert.strictEqual(walk.rateCardKey, 'gate.walk');
  assert.strictEqual(walk.rateCardUse, 'sell-price-comparison');
  const silt = Market.mbClassify({ itemDesc: 'SILT FENCE', unit: 'LF', qty: 1, unitPrice: 3 });
  assert.strictEqual(silt.scopeQuality, 'excluded');
  const book = marketBook(fixtureRecords, { minimumSamples: 1, apparentLowOnly: false, fenceOnly: true });
  assert.ok(book.benchmarks.every(b => !Object.prototype.hasOwnProperty.call(b, 'rateCardPrice')));
});

check('helpers do not mutate inputs', () => {
  const before = JSON.stringify(fixtureRecords);
  Market.mbBuildObservations(fixtureRecords, { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true });
  Market.buildMarketBenchmarkBookData(fixtureRecords, { minimumSamples: 2, apparentLowOnly: false, fenceOnly: true }, '2026-07-16T12:00:00.000Z');
  assert.strictEqual(JSON.stringify(fixtureRecords), before);
});

console.log('\nALL ' + pass + ' MARKET BENCHMARK PURE CHECKS PASSED');
