#!/usr/bin/env node
'use strict';

// Read-only FenceBound session initializer. It intentionally uses only Node's
// standard library and synchronous reads so it can run before dependencies are installed.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const out = process.stdout;
const issues = { blocked: [], drift: [], warning: [] };
const say = line => out.write(`${line}\n`);
const add = (level, message) => issues[level].push(message);
const git = args => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (_) {
    return null;
  }
};

function findRoot(start) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const root = findRoot(process.cwd());
if (!root) {
  console.error('BLOCKED: no Git repository root found.');
  process.exitCode = 2;
  return;
}

const relExists = rel => fs.existsSync(path.join(root, rel.split('#')[0]));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const requiredTier1 = ['START_HERE.md', 'Docs/CURRENT_HANDOFF.md', 'CURRENT_STATE.json', 'PROJECT-INSTRUCTIONS.md'];
const statePath = path.join(root, 'CURRENT_STATE.json');
let state = null;
try {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
} catch (error) {
  add('blocked', `CURRENT_STATE.json is missing or invalid JSON: ${error.message}`);
}

const branch = git(['branch', '--show-current']);
const head = git(['rev-parse', 'HEAD']);
const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
const porcelain = git(['status', '--porcelain']);
const clean = porcelain === '';
const aheadBehindText = upstream ? git(['rev-list', '--left-right', '--count', `HEAD...${upstream}`]) : null;
const aheadBehind = aheadBehindText ? aheadBehindText.split(/\s+/).map(Number) : null;

requiredTier1.forEach(file => {
  if (!relExists(file)) add('blocked', `missing Tier 1 file: ${file}`);
});

let runtimeVersion = null;
let runtimeSchema = null;
if (state && relExists(state.canonicalRuntime)) {
  const runtime = read(state.canonicalRuntime);
  runtimeVersion = (runtime.match(/const\s+APP_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1] || null;
  runtimeSchema = Number((runtime.match(/schemaVersion\s*:\s*(\d+)/) || [])[1]) || null;
  if (!runtimeVersion) add('blocked', `APP_VERSION was not found in ${state.canonicalRuntime}`);
  if (!runtimeSchema) add('blocked', `schemaVersion was not found in ${state.canonicalRuntime}`);
} else if (state) {
  add('blocked', `canonical runtime is missing: ${state.canonicalRuntime}`);
}

let handoff = '';
let metadata = {};
if (relExists('Docs/CURRENT_HANDOFF.md')) {
  handoff = read('Docs/CURRENT_HANDOFF.md');
  const block = (handoff.match(/<!-- SESSION_METADATA\n([\s\S]*?)\n-->/) || [])[1];
  if (!block) add('blocked', 'CURRENT_HANDOFF metadata block is missing');
  else block.split('\n').forEach(line => {
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (match) metadata[match[1]] = match[2];
  });
}

if (state) {
  if (branch !== state.branch) add('drift', `branch mismatch: actual ${branch || '(detached)'}, recorded ${state.branch}`);
  if (runtimeVersion !== state.applicationVersion) add('drift', `application version mismatch: runtime ${runtimeVersion}, state ${state.applicationVersion}`);
  if (String(runtimeSchema) !== String(state.schemaVersion)) add('drift', `schema mismatch: runtime ${runtimeSchema}, state ${state.schemaVersion}`);
  if (upstream !== state.upstream) add('warning', `upstream mismatch: actual ${upstream || 'none'}, recorded ${state.upstream || 'none'}`);
  if (!clean) add('warning', 'worktree is dirty');

  const recordedHead = state.head;
  if (head !== recordedHead) {
    const parent = git(['rev-parse', `${head}^`]);
    const allowed = new Set([
      'CURRENT_STATE.json', 'Docs/CURRENT_HANDOFF.md',
      'Docs/development/DEVELOPER_LOG.md'
    ]);
    const changed = parent === recordedHead ? (git(['diff', '--name-only', `${recordedHead}..${head}`]) || '').split('\n').filter(Boolean) : [];
    const datedHandoffsOnly = changed.filter(file => file.startsWith('Docs/handoffs/')).every(file => /^Docs\/handoffs\/\d{4}-\d{2}-\d{2}__.+\.md$/.test(file));
    const closeoutOnly = parent === recordedHead && changed.every(file => allowed.has(file) || file.startsWith('Docs/handoffs/')) && datedHandoffsOnly;
    if (!closeoutOnly) add('drift', `recorded HEAD ${recordedHead} does not match actual HEAD ${head}`);
  }
  if (metadata.testedHead && metadata.testedHead !== String(state.testedHead)) add('drift', 'CURRENT_HANDOFF testedHead disagrees with CURRENT_STATE');
  if (metadata.applicationVersion && metadata.applicationVersion !== runtimeVersion) add('drift', 'CURRENT_HANDOFF applicationVersion disagrees with runtime');
  if (metadata.schemaVersion && metadata.schemaVersion !== String(runtimeSchema)) add('drift', 'CURRENT_HANDOFF schemaVersion disagrees with runtime');
  if (state.gate && state.gate.status === 'PASS' && state.gate.head !== state.testedHead) add('drift', 'recorded PASS gate was run against a different commit');

  const linkedPaths = [
    state.engineeringBible && state.engineeringBible.path,
    state.systemAtlas && state.systemAtlas.path,
    state.projectInstructions,
    state.currentHandoff
  ].filter(Boolean);
  linkedPaths.forEach(file => { if (!relExists(file)) add('blocked', `state file points to missing path: ${file}`); });
}

if (relExists('START_HERE.md')) {
  const start = read('START_HERE.md');
  const links = [...start.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]);
  links.filter(link => !/^[a-z]+:/i.test(link)).forEach(link => {
    const decoded = decodeURIComponent(link).split('#')[0];
    if (decoded && !relExists(decoded)) add('drift', `START_HERE link target is missing: ${link}`);
  });
}

if (state && relExists(state.engineeringBible.path)) {
  const docx = state.engineeringBible.path.replace(/\.md$/, '.docx');
  if (!relExists(docx)) add('warning', `Engineering Bible generated representation is missing: ${docx}`);
  else {
    const sourceCommit = git(['log', '-1', '--format=%H', '--', state.engineeringBible.path]);
    const generatedCommit = git(['log', '-1', '--format=%H', '--', docx]);
    if (sourceCommit !== generatedCommit) add('warning', 'Engineering Bible source and generated DOCX were last changed in different commits');
  }
}

if (aheadBehind) {
  const [ahead, behind] = aheadBehind;
  if (ahead || behind) add('drift', `local/upstream divergence: ahead ${ahead}, behind ${behind} (based on local refs; no fetch performed)`);
}

if (state) (state.knownDrift || []).forEach(item => add('warning', `known: ${item}`));

let status = 'READY';
if (issues.blocked.length) status = 'BLOCKED';
else if (issues.drift.length) status = 'DRIFT DETECTED';
else if (issues.warning.length) status = 'WARNING';

say('FENCEBOUND SESSION INITIALIZATION');
say(`Status: ${status}`);
say(`Repository root: ${root}`);
say(`Branch: ${branch || '(detached)'}`);
say(`HEAD: ${head || 'unknown'}`);
say(`Upstream: ${upstream || 'none'}`);
say(`Worktree: ${clean ? 'clean' : 'dirty'}`);
say(`Canonical runtime: ${state ? state.canonicalRuntime : 'unknown'}`);
say(`Application version: ${runtimeVersion || 'not verified'}`);
say(`Schema version: ${runtimeSchema || 'not verified'}`);
say(`Handoff: ${metadata.testedHead && state && metadata.testedHead === state.testedHead ? 'metadata agrees with state' : 'not verified'}`);

for (const level of ['blocked', 'drift', 'warning']) {
  if (!issues[level].length) continue;
  say(`\n${level.toUpperCase()}:`);
  issues[level].forEach(item => say(`- ${item}`));
}

const bootstrap = (handoff.match(/<!-- BOOTSTRAP_START -->\n([\s\S]*?)\n<!-- BOOTSTRAP_END -->/) || [])[1];
if (bootstrap) {
  say('\n' + bootstrap.trim());
} else {
  add('blocked', 'CURRENT_HANDOFF bootstrap block is missing');
  say('\nBootstrap unavailable.');
  status = 'BLOCKED';
}

if (status === 'BLOCKED') process.exitCode = 2;
else if (status === 'DRIFT DETECTED') process.exitCode = 1;
