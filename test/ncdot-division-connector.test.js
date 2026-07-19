'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Connector = require('../ncdot-division-connector.js');
const FIXTURES = path.join(__dirname, 'fixtures', 'ncdot-division');
const read = name => fs.readFileSync(path.join(FIXTURES, name), 'utf8');
let passed = 0;

function check(name, fn) {
  try { fn(); passed += 1; console.log('  ok  ' + name); }
  catch (error) { console.error('FAIL ' + name); throw error; }
}

const page12 = Connector.divisionPageUrl(12);
const page10 = Connector.divisionPageUrl(10);
const list12 = Connector.parseDivisionLettings(read('division-list-response.html'), 12, page12);
const list10 = Connector.parseDivisionLettings(read('division-list-second-response.html'), 10, page10);
const fixedTime = '2026-07-19T15:02:13.000Z';
const record12 = Connector.parseLettingDetail(read('letting-detail-response.html'), { ...list12[1], retrievedAt: fixedTime })[0];
const record10 = Connector.parseLettingDetail(read('letting-detail-second-response.html'), { ...list10[0], retrievedAt: fixedTime })[0];

check('retains division identity and normalizes letting dates', () => {
  assert.strictEqual(record12.division, '12');
  assert.strictEqual(record12.lettingDate, '2026-07-14');
  assert.strictEqual(record10.division, '10');
  assert.strictEqual(record10.lettingDate, '2026-07-15');
});
check('retains stable contract and project identity', () => {
  assert.strictEqual(record12.contractId, 'DL00386');
  assert.strictEqual(record12.projectId, '44858.3.13');
  assert.strictEqual(record10.projectId, '50982.3.11');
});
check('keeps a contract suffix out of the WBS project identity', () => {
  const html = '<div class="groupheader">WBS Element: 20S.1013N, 20S.1060N, 40.2.2 Contract 6</div><ul>' +
    '<li><a href="/letting/a.pdf"><div class="title">a.pdf</div><div><strong>Doc. Type:</strong> Proposals</div></a></li></ul>';
  const record = Connector.parseLettingDetail(html, { ...list10[0], retrievedAt: fixedTime })[0];
  assert.strictEqual(record.contractId, 'Contract 6');
  assert.strictEqual(record.projectId, '20S.1013N, 20S.1060N, 40.2.2');
});
check('resolves relative links onto the official origin', () => {
  assert.ok(record12.artifacts.every(item => item.url.startsWith('https://connect.ncdot.gov/')));
});
check('distinguishes bid tabs, plans, proposals, awards, and labeled other artifacts', () => {
  assert.deepStrictEqual(record12.artifacts.map(item => item.type), ['award', 'bid_tab', 'plan', 'proposal', 'other']);
});
check('collapses duplicate artifact links and ignores unsupported extensions', () => {
  assert.strictEqual(record12.artifacts.filter(item => item.type === 'bid_tab').length, 1);
  assert.ok(!record12.artifacts.some(item => item.url.endsWith('.txt')));
});
check('reproduces on a second division and date', () => {
  assert.deepStrictEqual(record10.artifacts.map(item => item.type), ['proposal', 'plan']);
});
check('fails visibly when division list structure changes', () => {
  assert.throws(() => Connector.parseDivisionLettings('<h1>Division 12 Letting</h1>', 12, page12), /structure changed/);
});
check('fails visibly on mismatched division identity', () => {
  assert.throws(() => Connector.parseDivisionLettings(read('division-list-response.html'), 10, page10), /identity/);
});
check('requires no transient secret in fixtures', () => {
  const all = fs.readdirSync(FIXTURES).map(name => fs.readFileSync(path.join(FIXTURES, name), 'utf8')).join('\n');
  assert.ok(!/(FedAuth|rtFa|Authorization|Bearer|X-RequestDigest|Set-Cookie|formDigestValue)/i.test(all));
});
check('matches the expected normalized fixture summary', () => {
  const summary = [record12, record10].map(record => ({
    sourceId: record.sourceId, division: record.division, lettingDate: record.lettingDate,
    ...(record.contractId ? { contractId: record.contractId } : {}), projectId: record.projectId,
    artifactTypes: record.artifacts.map(item => item.type)
  }));
  assert.deepStrictEqual(summary, JSON.parse(read('expected-records.json')));
});

console.log('\nNCDOT Division connector checks passed: ' + passed);
