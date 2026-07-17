/* Gate: FenceScraper pure NCDOT discovery helpers — run: node "test discovery pure.js" */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const vm = require('vm');

const BASELINE_HEAD = 'd8d4c08b90432d5649bcd71b78da554918830448';
const TARGET_HTML = 'FenceScraper-v3.0-Validated-Market-Rate-Mapping.html';
let parityCaseCount = 0;

class MiniElement {
  constructor(tag, attrs, text, parentText) {
    this.tag = tag;
    this.attrs = attrs || {};
    this.textContent = text || '';
    this.parentElement = { textContent: parentText || text || '' };
  }
  getAttribute(name) {
    return this.attrs[name] || null;
  }
}

class MiniDocument {
  constructor(html) {
    this.html = html;
  }
  querySelectorAll(selector) {
    if (selector === 'a[href]') return this.links();
    if (selector === 'iframe[src]') return this.voidTags('iframe', 'src');
    if (selector === 'script[src]') return this.voidTags('script', 'src');
    return [];
  }
  links() {
    const out = [];
    const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = re.exec(this.html))) {
      const attrs = parseAttrs(m[1]);
      const text = stripTags(m[2]).replace(/\s+/g, ' ').trim();
      const parentText = nearestParentText(this.html, m.index, re.lastIndex) || text;
      out.push(new MiniElement('a', attrs, text, parentText));
    }
    return out;
  }
  voidTags(tag, attrName) {
    const out = [];
    const re = new RegExp('<' + tag + '\\b([^>]*)>', 'gi');
    let m;
    while ((m = re.exec(this.html))) {
      const attrs = parseAttrs(m[1]);
      if (attrs[attrName]) out.push(new MiniElement(tag, attrs, '', ''));
    }
    return out;
  }
}

class MiniDOMParser {
  parseFromString(html) {
    return new MiniDocument(html);
  }
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([A-Za-z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1]] = htmlDecode(m[2] || m[3] || '');
  return attrs;
}

function stripTags(src) {
  return htmlDecode(String(src || '').replace(/<[^>]+>/g, ' '));
}

function nearestParentText(html, start, end) {
  const tags = ['li', 'td', 'tr', 'p', 'section', 'div', 'body'];
  let best = '';
  let bestLen = Infinity;
  tags.forEach(tag => {
    const re = new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*?<\\/' + tag + '>', 'gi');
    let m;
    while ((m = re.exec(html))) {
      const s = m.index;
      const e = re.lastIndex;
      if (s <= start && e >= end && e - s < bestLen) {
        best = stripTags(m[0]).replace(/\s+/g, ' ').trim();
        bestLen = e - s;
      }
    }
  });
  return best;
}

function htmlDecode(src) {
  return String(src || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

global.DOMParser = MiniDOMParser;

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

const Discovery = require('./fencescraper-discovery-pure.js');
const Baseline = loadBaselineDiscoveryHelpers();
const centralHtml = fs.readFileSync(__dirname + '/fixtures/ncdot-central-discovery.html', 'utf8');
const divisionHtml = fs.readFileSync(__dirname + '/fixtures/ncdot-division-discovery.html', 'utf8');

const parityHtml = [
  '<!doctype html><html><body>',
  '<div class="files">',
  '  <a href="/letting/Central Letting/2026-06-16/L260616 XLS Bid Tabs.xls">L260616 XLS Bid Tabs.xls</a>',
  '  <a href="https://connect.ncdot.gov/letting/Central%20Letting/06-16-2026/Bid%20Tabs%20260616%20Post.pdf?download=1#top">Bid Tabs 260616 Post.pdf</a>',
  '  <a href="/letting/Central Letting/06/16/2026/Fence_Report.xlsx">Fence_Report.xlsx</a>',
  '  <a href="/letting/Central Letting/06-16-2026/Addendum_No_1.pdf">Addendum No 1.pdf</a>',
  '  <a href="/letting/Central Letting/06-16-2026/Invitation_to_Bid.pdf">Invitation to Bid.pdf</a>',
  '  <a href="https://example.com/letting/BidTabs.xls">Off-domain BidTabs.xls</a>',
  '  <a href="mailto:test@example.com">Email</a>',
  '</div>',
  '<section>',
  '  <a href="Letting-Details.aspx?let_type=10&amp;let_date=07/01/2026">Division 10 Letting 07/01/2026</a>',
  '  <a href="Letting-Details.aspx?let_type=10&amp;let_date=07/01/2026">Division 10 Letting duplicate</a>',
  '  <a href="https://connect.ncdot.gov/letting/Pages/Division-Letting-Details.aspx?let_date=2026-07-01">Division Letting Details</a>',
  '  <a href="https://example.com/letting/Pages/Letting-Details.aspx?let_date=2026-07-01">Off-domain Details</a>',
  '</section>',
  '</body></html>'
].join('\n');

function check(name, fn) {
  try {
    fn();
    console.log('  ok  ' + name);
  } catch (err) {
    console.error('FAIL ' + name);
    throw err;
  }
}

function loadBaselineDiscoveryHelpers() {
  const source = childProcess.execFileSync(
    'git',
    ['show', BASELINE_HEAD + ':' + TARGET_HTML],
    { encoding: 'utf8' }
  );
  const names = [
    'normalizeOfficialNcdotUrl',
    'parseDateFromText',
    'scoreNcdotCandidate',
    'extractNcdotCandidates',
    'extractNcdotChildPages',
    'scoreDivisionEndpointCandidate'
  ];
  const code = [
    extractConst(source, 'ND_ALLOWED_HOST'),
    extractConst(source, 'ND_FENCE_TERMS')
  ].concat(names.map(name => extractFunction(source, name))).concat([
    'module.exports = {',
    '  ND_ALLOWED_HOST,',
    '  ND_FENCE_TERMS,',
    '  normalizeOfficialNcdotUrl,',
    '  parseDateFromText,',
    '  scoreNcdotCandidate,',
    '  extractNcdotCandidates,',
    '  extractNcdotChildPages,',
    '  scoreDivisionEndpointCandidate',
    '};'
  ]).join('\n');
  const sandbox = {
    module: { exports: {} },
    DOMParser: MiniDOMParser,
    URL,
    Date: FrozenDate,
    Set,
    Array,
    String,
    Math,
    RegExp
  };
  vm.runInNewContext(code, sandbox, { filename: 'baseline-discovery-helpers.js' });
  return sandbox.module.exports;
}

function extractConst(source, name) {
  const re = new RegExp('const\\s+' + name + '\\s*=\\s*[^;]+;');
  const m = source.match(re);
  if (!m) throw new Error('Unable to extract baseline const ' + name);
  return m[0];
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

function normalizeNondeterminism(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => key === 'discoveredAt' ? '<normalized>' : val));
}

function assertParity(label, fn) {
  parityCaseCount++;
  const actual = normalizeNondeterminism(fn(Discovery));
  const expected = normalizeNondeterminism(fn(Baseline));
  assert.deepStrictEqual(actual, expected, label);
}

function assertRegexParity(label, value) {
  parityCaseCount++;
  assert.strictEqual(Discovery.ND_ALLOWED_HOST.test(value), Baseline.ND_ALLOWED_HOST.test(value), label);
}

check('exports expected helper names and data', () => {
  assert.deepStrictEqual(
    Object.keys(Discovery).sort(),
    [
      'ND_ALLOWED_HOST',
      'ND_FENCE_TERMS',
      'extractNcdotCandidates',
      'extractNcdotChildPages',
      'normalizeOfficialNcdotUrl',
      'parseDateFromText',
      'scoreDivisionEndpointCandidate',
      'scoreNcdotCandidate'
    ].sort()
  );
  assert.ok(Discovery.ND_ALLOWED_HOST.test('connect.ncdot.gov'));
  assert.ok(Discovery.ND_FENCE_TERMS.includes('chain link'));
});

check('baseline parity against committed inline implementation', () => {
  [
    'connect.ncdot.gov',
    'www.ncdot.gov',
    'example.com',
    'evilconnect.ncdot.gov.example.com'
  ].forEach(host => assertRegexParity('ND_ALLOWED_HOST ' + host, host));

  assertParity('ND_FENCE_TERMS', x => x.ND_FENCE_TERMS);

  [
    ' https://connect.ncdot.gov/letting/Pages/default.aspx?x=1#frag ',
    'https://www.ncdot.gov/test?q=1#x',
    'https://example.com/letting/file.xls',
    'mailto:test@example.com',
    'not a url',
    ''
  ].forEach(input => assertParity('normalizeOfficialNcdotUrl ' + input, x => x.normalizeOfficialNcdotUrl(input)));

  [
    'posted 2026-06-16',
    'folder 06-16-2026',
    'folder 06/16/2026',
    'archive L260616 XLS Bid Tabs.xls',
    'no recognizable date'
  ].forEach(input => assertParity('parseDateFromText ' + input, x => x.parseDateFromText(input)));

  [
    ['L260616 XLS Bid Tabs.xls', 'https://connect.ncdot.gov/letting/Central/L260616%20XLS%20Bid%20Tabs.xls', 'chain link fence letting results'],
    ['Bid Tabs 260616 Post.pdf', 'https://connect.ncdot.gov/letting/Central/Bid%20Tabs%20260616%20Post.pdf', 'award package'],
    ['Invitation to Bid', 'https://connect.ncdot.gov/file.pdf', 'award package'],
    ['Plans package', 'https://connect.ncdot.gov/letting/file.pdf', 'ordinary plans']
  ].forEach(args => assertParity('scoreNcdotCandidate ' + args[0], x => x.scoreNcdotCandidate.apply(null, args)));

  assertParity('extractNcdotCandidates full object shape', x => x.extractNcdotCandidates(
    'https://connect.ncdot.gov/letting/Pages/Central.aspx',
    parityHtml
  ));
  assertParity('extractNcdotChildPages duplicates and relative URLs', x => x.extractNcdotChildPages(
    'https://connect.ncdot.gov/letting/Pages/Division.aspx',
    parityHtml
  ));

  [
    { url: 'https://connect.ncdot.gov/divisions/Pages/map.aspx?s=med&d=https://connect.ncdot.gov/letting/Pages/', type: 'iframe', evidence: 'iframe src' },
    { url: 'https://connect.ncdot.gov/letting/Pages/Division.aspx', type: 'link', evidence: 'Division' },
    { url: 'https://connect.ncdot.gov/letting/_api/web/lists/getbytitle(Division%2010%20Letting)/items', type: 'embedded-reference', evidence: 'raw page source' },
    { url: 'https://connect.ncdot.gov/letting/SiteAssets/division-letting.js', type: 'script', evidence: 'script src' }
  ].forEach(input => assertParity('scoreDivisionEndpointCandidate ' + input.url, x => x.scoreDivisionEndpointCandidate(input)));
});

check('baseline parity case count', () => {
  assert.strictEqual(parityCaseCount, 26);
});

check('official NCDOT URLs normalize and hashes are stripped', () => {
  assert.strictEqual(
    Discovery.normalizeOfficialNcdotUrl(' https://connect.ncdot.gov/letting/Pages/default.aspx#frag '),
    'https://connect.ncdot.gov/letting/Pages/default.aspx'
  );
  assert.strictEqual(
    Discovery.normalizeOfficialNcdotUrl('https://www.ncdot.gov/test?q=1#x'),
    'https://www.ncdot.gov/test?q=1'
  );
});

check('off-domain and non-http URLs are rejected', () => {
  assert.strictEqual(Discovery.normalizeOfficialNcdotUrl('https://example.com/letting/file.xls'), null);
  assert.strictEqual(Discovery.normalizeOfficialNcdotUrl('mailto:test@example.com'), null);
  assert.strictEqual(Discovery.normalizeOfficialNcdotUrl('not a url'), null);
});

check('date parser preserves inline behavior', () => {
  assert.strictEqual(Discovery.parseDateFromText('posted 2026-06-16'), '2026-06-16');
  assert.strictEqual(Discovery.parseDateFromText('folder 06-16-2026'), '2026-06-16');
  assert.strictEqual(Discovery.parseDateFromText('folder 06/16/2026'), '2026-06-16');
  assert.strictEqual(Discovery.parseDateFromText('L260616 XLS Bid Tabs.xls'), '2026-06-16');
  assert.strictEqual(Discovery.parseDateFromText('no recognizable date'), '');
});

check('candidate scoring remains identical for representative inputs', () => {
  assert.deepStrictEqual(
    Discovery.scoreNcdotCandidate(
      'L260616 XLS Bid Tabs.xls',
      'https://connect.ncdot.gov/letting/Central/L260616%20XLS%20Bid%20Tabs.xls',
      'chain link fence letting results'
    ),
    {
      score: 100,
      reasons: ['spreadsheet', 'bid tab', 'letting/results', 'fence terms: fence, chain link'],
      matched: ['fence', 'chain link']
    }
  );
  assert.deepStrictEqual(
    Discovery.scoreNcdotCandidate('Invitation to Bid', 'https://connect.ncdot.gov/file.pdf', 'award package'),
    { score: 10, reasons: ['letting/results'], matched: [] }
  );
});

check('candidate extraction returns expected fields and values', () => {
  const out = Discovery.extractNcdotCandidates(
    'https://connect.ncdot.gov/letting/Pages/Central.aspx',
    centralHtml
  );
  assert.deepStrictEqual(out.map(x => x.name), [
    '06-16-2026 Central Letting',
    'L260616 XLS Bid Tabs.xls',
    'Bid Tabs 260616 Post.pdf',
    'Pamlico B-5995 Addendum No.1.pdf',
    'Invitation to Bid'
  ]);
  const sheet = out.find(x => x.name === 'L260616 XLS Bid Tabs.xls');
  assert.strictEqual(sheet.url, 'https://connect.ncdot.gov/letting/Central%20Letting/06-16-2026%20Central%20Letting/L260616%20XLS%20Bid%20Tabs.xls');
  assert.strictEqual(sheet.date, '2026-06-16');
  assert.strictEqual(sheet.score, 90);
  assert.deepStrictEqual(sheet.reasons, ['spreadsheet', 'bid tab', 'letting/results']);
  assert.deepStrictEqual(sheet.matchedTerms, []);
  assert.strictEqual(sheet.selected, true);
  assert.strictEqual(sheet.discoveredAt, '2026-07-16T12:00:00.000Z');
  assert.strictEqual(sheet.status, 'queued');
  assert.strictEqual(out.some(x => /example\.com/.test(x.url)), false);
});

check('relative child-page links resolve and dedupe', () => {
  const out = Discovery.extractNcdotChildPages(
    'https://connect.ncdot.gov/letting/Pages/Division.aspx',
    divisionHtml
  );
  assert.deepStrictEqual(out, [
    'https://connect.ncdot.gov/letting/Pages/Letting-Details.aspx?let_type=10&let_date=07/01/2026'
  ]);
});

check('division endpoint scoring remains identical', () => {
  assert.strictEqual(
    Discovery.scoreDivisionEndpointCandidate({
      url: 'https://connect.ncdot.gov/divisions/Pages/map.aspx?s=med&d=https://connect.ncdot.gov/letting/Pages/',
      type: 'iframe',
      evidence: 'iframe src'
    }),
    90
  );
  assert.strictEqual(
    Discovery.scoreDivisionEndpointCandidate({
      url: 'https://connect.ncdot.gov/letting/Pages/Division.aspx',
      type: 'link',
      evidence: 'Division'
    }),
    20
  );
});

check('helpers do not mutate inputs', () => {
  const html = centralHtml;
  const url = 'https://connect.ncdot.gov/letting/Pages/Central.aspx';
  const candidate = { url: 'https://connect.ncdot.gov/letting/Pages/Division.aspx', type: 'link', evidence: 'Division' };
  const before = JSON.stringify(candidate);
  Discovery.extractNcdotCandidates(url, html);
  Discovery.extractNcdotChildPages(url, html);
  Discovery.scoreDivisionEndpointCandidate(candidate);
  assert.strictEqual(html, centralHtml);
  assert.strictEqual(JSON.stringify(candidate), before);
});

console.log('\nALL DISCOVERY PURE CHECKS PASSED');
