#!/usr/bin/env node
// Ship item 6: build the folder a static host publishes (Cloudflare Pages / Netlify).
// Copies only what index.html loads at runtime: index.html and lib/ (bundled jsPDF).
// Usage: node scripts/build-site.js [outDir]   (default: dist/, which is gitignored)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLISH = ['index.html', 'lib'];
const out = path.resolve(ROOT, process.argv[2] || 'dist');

if (out === ROOT || ROOT.startsWith(out + path.sep)) {
  console.error('build-site: refusing to write over the repository: ' + out);
  process.exit(1);
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const item of PUBLISH) {
  fs.cpSync(path.join(ROOT, item), path.join(out, item), { recursive: true });
}
console.log('build-site: wrote ' + PUBLISH.join(', ') + ' to ' + out);
