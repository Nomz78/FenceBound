/* Deterministic NCDOT Division Letting HTML connector. No DOM or credentials. */
'use strict';

const SOURCE_ID = 'ncdot_division_letting';
const OFFICIAL_ORIGIN = 'https://connect.ncdot.gov';
const DIVISION_INDEX_URL = OFFICIAL_ORIGIN + '/letting/Pages/Division.aspx';

function decode(value) {
  return String(value || '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#160;|&nbsp;/g, ' ');
}

function text(value) {
  return decode(String(value || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function officialUrl(raw, base) {
  const url = new URL(decode(raw), base);
  if (url.protocol !== 'https:' || url.hostname !== 'connect.ncdot.gov') {
    throw new Error('Unsupported non-official NCDOT URL: ' + url.href);
  }
  url.hash = '';
  return url.href;
}

function divisionPageUrl(division) {
  const id = String(division);
  if (!/^(?:[1-9]|1[0-4])$/.test(id)) throw new Error('Division must be an integer from 1 through 14');
  return OFFICIAL_ORIGIN + '/letting/Pages/Division' + id + 'Letting.aspx';
}

function normalizeDate(value) {
  const match = String(value || '').match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (!match) throw new Error('Unable to normalize letting date: ' + value);
  return match[1] + '-' + match[2] + '-' + match[3];
}

function parseDivisionIndex(html) {
  const found = new Map();
  const pattern = /<option\b[^>]*value=["']([^"']*Division(\d{1,2})Letting\.aspx)["'][^>]*>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const division = String(Number(match[2]));
    found.set(division, { division, url: officialUrl(match[1], DIVISION_INDEX_URL) });
  }
  if (found.size !== 14) throw new Error('NCDOT Division index structure changed: expected 14 division links, found ' + found.size);
  return Array.from(found.values()).sort((a, b) => Number(a.division) - Number(b.division));
}

function parseDivisionLettings(html, division, pageUrl) {
  const expected = String(division);
  const pageIdentity = text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  if (!new RegExp('Division\\s+' + expected + '\\s+Letting', 'i').test(pageIdentity)) {
    throw new Error('Division page identity missing or changed for Division ' + expected);
  }
  const found = new Map();
  const pattern = /href=["']([^"']*Letting-Details\.aspx\?[^"']*let_type=(\d{1,2})[^"']*let_date=([^"'&]+(?:%20|\s)00:00:00)[^"']*)["'][^>]*>[\s\S]*?<span\b[^>]*class=["']let-name["'][^>]*>([\s\S]*?)<\/span>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const actual = String(Number(match[2]));
    if (actual !== expected) throw new Error('Division identity mismatch: requested ' + expected + ', found ' + actual);
    const lettingDate = normalizeDate(decode(match[3]));
    const detailUrl = officialUrl(match[1].replace(/\s/g, '%20'), pageUrl);
    found.set(lettingDate, { division: expected, lettingDate, detailUrl, label: text(match[4]) });
  }
  if (!found.size) throw new Error('NCDOT Division letting list structure changed: no letting-detail links found');
  return Array.from(found.values()).sort((a, b) => b.lettingDate.localeCompare(a.lettingDate));
}

function artifactType(docType, name) {
  const value = (docType + ' ' + name).toLowerCase();
  if (/bid\s*tab/.test(value)) return 'bid_tab';
  if (/award/.test(value)) return 'award';
  if (/bid summary|bid results/.test(value)) return 'bid_summary';
  if (/proposal/.test(value)) return 'proposal';
  if (/\bplans?\b/.test(value)) return 'plan';
  if (/invitation to bid/.test(value)) return 'invitation_to_bid';
  if (/bid roster/.test(value)) return 'bid_roster';
  if (/notice/.test(value)) return 'notice';
  return 'other';
}

function parseArtifacts(groupHtml, detailUrl) {
  const artifacts = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(groupHtml))) {
    if (!/\.pdf(?:$|[?#])/i.test(decode(match[1]))) continue;
    const body = match[2];
    const name = text((body.match(/class=["']title["'][^>]*>([\s\S]*?)<\/div>/i) || [])[1]) || text(body);
    const docType = text((body.match(/Doc\.\s*Type:<\/strong>\s*([\s\S]*?)(?:<span|<br|<\/div>)/i) || [])[1]);
    const url = officialUrl(match[1], detailUrl);
    if (seen.has(url)) continue;
    seen.add(url);
    artifacts.push({ type: artifactType(docType, name), name, docType: docType || undefined, url });
  }
  return artifacts;
}

function parseLettingDetail(html, context) {
  const detailUrl = context.detailUrl;
  const groups = [];
  const pattern = /<div\b[^>]*class=["'][^"']*groupheader[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<ul\b[^>]*>([\s\S]*?)<\/ul>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const heading = text(match[1]);
    const artifacts = parseArtifacts(match[2], detailUrl);
    if (!artifacts.length) continue;
    const contractMatch = heading.match(/(?:\bContract\s+)?([A-Z]{1,4}\d{3,}|Contract\s+\d+)\b/i);
    const wbsMatch = heading.match(/WBS\s+Element:\s*(.+?)(?:\s+Contract\s+\d+)?$/i);
    const firstDescription = text((match[2].match(/class=["']project-description["'][^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
    const projectMatch = firstDescription.match(/^([\d.]+)\s*-/);
    const contractId = contractMatch ? contractMatch[1].replace(/^Contract\s+/i, 'Contract ') : undefined;
    const projectId = projectMatch ? projectMatch[1] : (wbsMatch ? wbsMatch[1].trim() : undefined);
    groups.push({ contractId, projectId, heading, description: firstDescription || undefined, artifacts });
  }
  if (!groups.length) throw new Error('NCDOT letting-detail structure changed: no artifact groups found');
  const retrievedAt = context.retrievedAt || new Date().toISOString();
  return groups.map(group => ({
    sourceId: SOURCE_ID,
    division: String(context.division),
    lettingDate: normalizeDate(context.lettingDate),
    contractId: group.contractId,
    projectId: group.projectId,
    detailUrl,
    artifacts: group.artifacts,
    retrievedAt,
    extractionMethod: 'html',
    sourceUrl: detailUrl,
    validationState: 'observed_official_html',
    heading: group.heading,
    description: group.description
  }));
}

module.exports = {
  SOURCE_ID, DIVISION_INDEX_URL, divisionPageUrl, officialUrl, normalizeDate,
  parseDivisionIndex, parseDivisionLettings, parseLettingDetail, artifactType
};
