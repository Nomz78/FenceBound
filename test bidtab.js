/* Gate: FenceScraper v2.4 bid-tab parser — run: node test_bidtab.js
 * Asserts the parser against the REAL uploaded fixture (L260616), not a mock.
 * Fixture is the array-of-arrays SheetJS would hand us in the browser. */
const assert = require('assert');
const fs = require('fs');
const { parseBidTab, divisionForCounty, scoreRelevance,
        COUNTY_DIVISION, DIVISION_COUNTIES } = require('./bidtab_parser.js');

const rows = JSON.parse(fs.readFileSync(__dirname + '/bidtab_fixture.json', 'utf8'));
let pass = 0;
function check(name, fn) { fn(); pass++; console.log('  ok  ' + name); }

const out = parseBidTab(rows, { retrievedAt: '2026-07-13T00:00:00Z' });
const { items, records, report } = out;

console.log('report:', JSON.stringify(report));

// 1) Structure: 2797 raw rows collapse to the known unique-item count.
check('collapses 2700 item-rows to 1215 unique line items', () => {
  assert.strictEqual(report.itemRows, 2700, 'itemRows');
  assert.strictEqual(report.uniqueItems, 1215, 'uniqueItems');
});

// 2) The >3-bidder repeat blocks were merged, not double-counted.
check('duplicate block-rows folded (2700-1215=1485) and union happened', () => {
  assert.strictEqual(report.mergedItems, report.itemRows - report.uniqueItems);
  assert.strictEqual(report.mergedItems, 1485, 'mergedItems');
  assert.ok(report.blocks >= 2, 'expected multi-block file');
  // proof the union crossed blocks: some items carry more than 3 bidders
  assert.ok(items.some(i => i.bidderCount > 3), 'no >3-bidder item — union failed');
});

// 3) No item exceeds a sane bidder count and none is empty.
check('every emitted item has >=1 bidder', () => {
  assert.ok(items.length > 0);
  assert.ok(items.every(i => i.bidderCount >= 1));
});

// 4) The five-bidder guardrail line is fully assembled on ONE record.
check('C205160 STL BEAM GUARDRAIL unions all 5 bidders on one item', () => {
  const g = items.find(i => i.contract === 'C205160' &&
    i.itemDesc === 'STL BEAM GUARDRAIL' && i.lineNo === '63');
  assert.ok(g, 'guardrail line not found');
  assert.strictEqual(g.bidderCount, 5, 'expected 5 bidders, got ' + g.bidderCount);
  const names = g.bidders.map(b => b.bidder).sort();
  assert.deepStrictEqual(names, [
    'BLYTHE CONSTRUCTION INC', 'CATON CONSTRUCTION GROUP INC', 'SMITH-ROWE, LLC',
    'UNITED INFRASTRUCTURE GROUP INC', 'W C ENGLISH INCORPORATED'
  ]);
  const prices = g.bidders.map(b => b.unitPrice).sort((a,b)=>a-b);
  assert.deepStrictEqual(prices, [24,24,24,26,26.4]);
  assert.strictEqual(g.unit, 'LF');
});

// 5) apparentLowBidder + rank are stamped, exactly one low bidder per item.
check('exactly one apparentLowBidder per item, ranks are 1..n', () => {
  for (const it of items) {
    const recs = records.filter(r => r.contract === it.contract && r.lineNo === it.lineNo);
    assert.strictEqual(recs.filter(r => r.apparentLowBidder).length, 1);
    assert.deepStrictEqual(recs.map(r => r.bidderRank).sort((a,b)=>a-b),
      recs.map((_, i) => i + 1));
  }
});

// 6) County → NCDOT division (user's operating area).
check('county→division: Mecklenburg & Stanly = Div 10, verified', () => {
  assert.deepStrictEqual(divisionForCounty('Mecklenburg'), { division: 10, verified: true });
  assert.deepStrictEqual(divisionForCounty('STANLY'), { division: 10, verified: true });
  assert.deepStrictEqual(divisionForCounty('Forsyth'), { division: 9, verified: true });
});
check('unknown county is flagged, never guessed', () => {
  assert.deepStrictEqual(divisionForCounty('Nowhere'), { division: null, verified: false });
});

// 7) Fence relevance surfaces the adjacent DOT scopes present in this let.
check('relevance flags guardrail / silt fence / safety fence items', () => {
  const rel = items.filter(i => i.relevanceScore > 0);
  assert.ok(rel.some(i => i.itemDesc.includes('GUARDRAIL')));
  assert.ok(rel.some(i => i.itemDesc.includes('SAFETY FENCE')));
  assert.ok(rel.some(i => i.itemDesc.includes('SILT FENCE')));
});

// 8) Records are the flat competitor-price rows we can load into the DB.
check('records = sum of bidders across emitted items (no loss)', () => {
  const expected = items.reduce((n, i) => n + i.bidderCount, 0);
  assert.strictEqual(records.length, expected);
  assert.strictEqual(report.priceRecords, expected);
});

// 9) Numeric hygiene: prices/qty parse to finite numbers or null, never NaN.
check('no NaN in unitPrice / qty', () => {
  for (const r of records) {
    assert.ok(r.unitPrice === null || Number.isFinite(r.unitPrice));
    assert.ok(r.qty === null || Number.isFinite(r.qty));
  }
});

// 10) relevanceMin filter actually narrows the set.
check('relevanceMin filter narrows output', () => {
  const strong = parseBidTab(rows, { relevanceMin: 5 });
  assert.ok(strong.items.length < items.length);
  assert.ok(strong.items.every(i => i.relevanceScore >= 5));
});

// ── TD-019: full county → division map ──────────────────────────────────────

// 11) All 100 NC counties are present exactly once, assigned to a real division.
check('map covers all 100 NC counties, each exactly once, div 1..14', () => {
  const flat = [];
  for (const div of Object.keys(DIVISION_COUNTIES)) {
    const d = Number(div);
    assert.ok(d >= 1 && d <= 14, 'division out of range: ' + div);
    for (const c of DIVISION_COUNTIES[div]) flat.push(c);
  }
  assert.strictEqual(flat.length, 100, 'expected 100 county entries, got ' + flat.length);
  assert.strictEqual(new Set(flat).size, 100, 'a county is listed in two divisions');
  assert.strictEqual(Object.keys(COUNTY_DIVISION).length, 100, 'flat lookup != 100');
});

// 12) Every county now resolves to a non-null division (nothing blank).
check('every NC county resolves to a division', () => {
  for (const c of Object.keys(COUNTY_DIVISION)) {
    const r = divisionForCounty(c);
    assert.ok(Number.isInteger(r.division) && r.division >= 1 && r.division <= 14, c);
  }
});

// 13) All 100 counties are source-verified; home-region Div 10 is exactly five.
check('all 100 counties verified; Div 10 home region = 5 counties', () => {
  const all = Object.keys(COUNTY_DIVISION);
  assert.strictEqual(all.length, 100);
  for (const c of all) assert.strictEqual(divisionForCounty(c).verified, true, c + ' not verified');
  const div10 = DIVISION_COUNTIES[10].slice().sort();
  assert.deepStrictEqual(div10, ['ANSON','CABARRUS','MECKLENBURG','STANLY','UNION']);
});

// 14) The two verification corrections are locked in against regression.
check('Halifax = Div 4 and Richmond = Div 8 (corrected from recall/seed)', () => {
  assert.deepStrictEqual(divisionForCounty('Halifax'), { division: 4, verified: true });
  assert.deepStrictEqual(divisionForCounty('Richmond'), { division: 8, verified: true });
  // Richmond is no longer in Division 10
  assert.ok(!DIVISION_COUNTIES[10].includes('RICHMOND'));
  assert.ok(DIVISION_COUNTIES[8].includes('RICHMOND'));
  // Halifax is no longer in Division 1
  assert.ok(!DIVISION_COUNTIES[1].includes('HALIFAX'));
  assert.ok(DIVISION_COUNTIES[4].includes('HALIFAX'));
  // spot-check a few more against the source table
  assert.strictEqual(divisionForCounty('Wake').division, 5);
  assert.strictEqual(divisionForCounty('Buncombe').division, 13);
  assert.strictEqual(divisionForCounty('New Hanover').division, 3);
  assert.deepStrictEqual(divisionForCounty('Nowhere'), { division: null, verified: false });
});

// 15) Fixture's own county (Forsyth) now stamps a division on every record,
//     and it is one of the verified ones.
check('fixture county Forsyth stamps verified Div 9 on records', () => {
  const forsyth = records.filter(r => String(r.county).toUpperCase() === 'FORSYTH');
  assert.ok(forsyth.length > 0, 'no Forsyth records in fixture');
  assert.ok(forsyth.every(r => r.division === 9 && r.divisionVerified === true));
});

// 16) Case / whitespace robustness for real-world county strings.
check('county lookup tolerates case and surrounding whitespace', () => {
  assert.deepStrictEqual(divisionForCounty('  mecklenburg  '), { division: 10, verified: true });
  assert.deepStrictEqual(divisionForCounty('new hanover'), { division: 3, verified: true });
});

// ── TD-021: relevance word boundaries (no "gate" inside "aggregate") ─────────
check('word boundaries: aggregate scores 0, real gate/fence items still score', () => {
  // false positives gone
  assert.strictEqual(scoreRelevance('AGGREGATE BASE COURSE').score, 0);
  assert.strictEqual(scoreRelevance('SUBDRAIN COARSE AGGREGATE').score, 0);
  assert.strictEqual(scoreRelevance('CLASS IV AGGREGATE STABILIZATION').score, 0);
  // legitimate whole-word hits preserved
  assert.ok(scoreRelevance('SECURITY GATE').score >= 8, 'security gate lost');
  assert.ok(scoreRelevance('SLIDE GATE').score >= 5, 'gate lost');
  assert.ok(scoreRelevance('STL BEAM GUARDRAIL').score >= 5, 'guardrail lost');
  assert.ok(scoreRelevance('CHAIN LINK FENCE').score >= 17, 'chain link fence lost');
  assert.ok(scoreRelevance('TEMPORARY SILT FENCE').score >= 3, 'silt fence lost');
  // real fixture: no item with a genuine fence/guardrail word fell to 0
  const rel = items.filter(i => i.relevanceScore > 0).map(i => i.itemDesc);
  assert.ok(rel.some(d => d.includes('GUARDRAIL')));
  assert.ok(rel.some(d => d.includes('SAFETY FENCE')));
  assert.ok(!items.some(i => i.itemDesc.includes('AGGREGATE') && i.relevanceScore > 0),
    'an AGGREGATE item is still scoring as relevant');
});

console.log(`\nALL ${pass} CHECKS PASSED`);
