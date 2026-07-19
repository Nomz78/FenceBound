#!/usr/bin/env node
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Connector = require('../ncdot-division-connector.js');

function argumentsFrom(argv) {
  const values = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--division') values.division = argv[++i];
    else if (argv[i] === '--date') values.date = argv[++i];
    else throw new Error('Unsupported argument: ' + argv[i]);
  }
  if (!values.division) throw new Error('Usage: node scripts/probe-ncdot-division.mjs --division 1..14 [--date YYYY-MM-DD]');
  Connector.divisionPageUrl(values.division);
  if (values.date && !/^20\d{2}-\d{2}-\d{2}$/.test(values.date)) throw new Error('--date must use YYYY-MM-DD');
  return values;
}

async function getHtml(url) {
  let response;
  try { response = await fetch(url, { headers: { Accept: 'text/html' }, redirect: 'follow' }); }
  catch (error) { throw new Error('Network failure for ' + url + ': ' + error.message); }
  const contentType = response.headers.get('content-type') || '';
  process.stderr.write(JSON.stringify({ sourceUrl: url, finalUrl: response.url, status: response.status, contentType }) + '\n');
  if (!response.ok) throw new Error('Official NCDOT request failed with HTTP ' + response.status + ': ' + url);
  if (!/^text\/html\b/i.test(contentType)) throw new Error('Unexpected content type from ' + url + ': ' + contentType);
  return response.text();
}

async function main() {
  const args = argumentsFrom(process.argv.slice(2));
  const pageUrl = Connector.divisionPageUrl(args.division);
  const listHtml = await getHtml(pageUrl);
  let lettings = Connector.parseDivisionLettings(listHtml, args.division, pageUrl);
  if (args.date) lettings = lettings.filter(item => item.lettingDate === args.date);
  if (!lettings.length) throw new Error('No observed letting matched Division ' + args.division + (args.date ? ' on ' + args.date : ''));
  const records = [];
  for (const letting of lettings) {
    const detailHtml = await getHtml(letting.detailUrl);
    records.push(...Connector.parseLettingDetail(detailHtml, letting));
  }
  process.stdout.write(JSON.stringify(records, null, 2) + '\n');
}

main().catch(error => { process.stderr.write('ERROR: ' + error.message + '\n'); process.exitCode = 1; });
