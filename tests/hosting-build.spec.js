// Ship item 6: hosting. `npm run build:site` produces the folder a static host
// (Cloudflare Pages / Netlify) publishes. It must hold only the app files
// (index.html + lib/ with bundled jsPDF) and the app must work from it with
// no CDN, so a contractor gets PDFs even when cdnjs is unreachable.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  }).sort();
}

function build() {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'fb-site-'));
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build-site.js'), out], { cwd: ROOT, stdio: 'pipe' });
  return out;
}

test('site build publishes only the app files', () => {
  const out = build();
  expect(listFiles(out)).toEqual(['index.html', 'lib/jspdf-2.5.1.umd.min.js', 'lib/jspdf-LICENSE']);
  expect(fs.readFileSync(path.join(out, 'index.html'))).toEqual(fs.readFileSync(path.join(ROOT, 'index.html')));
});

test('built site loads and has jsPDF with the CDN blocked', async ({ page }) => {
  const out = build();
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/index.html';
    const file = path.join(out, path.normalize(rel));
    if (!file.startsWith(out) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html' : 'application/javascript' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  try {
    await page.route(/cdnjs\.cloudflare\.com/, r => r.abort());
    page.on('dialog', d => d.dismiss());
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => !!(window.jspdf && window.jspdf.jsPDF), null, { timeout: 15000 });
  } finally {
    server.close();
  }
});
