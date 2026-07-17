/* ============================================================================
 * FenceScraper — Pure NCDOT discovery helpers
 * ----------------------------------------------------------------------------
 * Deterministic helpers extracted from FenceScraper v3.0. No network, storage,
 * DOM mutation, or application state mutation.
 * ==========================================================================*/

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.FenceScraperDiscoveryPure = factory(root);
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  var ND_ALLOWED_HOST = /(^|\.)ncdot\.gov$|(^|\.)connect\.ncdot\.gov$/i;
  var ND_FENCE_TERMS = ['fence','fencing','gate','gates','chain link','woven wire','barbed wire','temporary fence','ornamental','cantilever','guardrail'];

  function parseDocument(html) {
    if (!root.DOMParser) throw new Error('DOMParser is required for HTML extraction');
    return new root.DOMParser().parseFromString(html, 'text/html');
  }

  function normalizeOfficialNcdotUrl(raw) {
    try {
      var u = new URL(String(raw || '').trim());
      if (!/^https?:$/.test(u.protocol) || !ND_ALLOWED_HOST.test(u.hostname)) return null;
      u.hash = '';
      return u.href;
    } catch (_) {
      return null;
    }
  }

  function parseDateFromText(text) {
    var s = String(text || '');
    var m = s.match(/\b(20\d{2})[-_\/.](\d{1,2})[-_\/.](\d{1,2})\b/);
    if (m) return m[1] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
    m = s.match(/\b(\d{1,2})[-_\/.](\d{1,2})[-_\/.](20\d{2})\b/);
    if (m) return m[3] + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
    m = s.match(/\bL(\d{2})(\d{2})(\d{2})\b/i);
    if (m) return '20' + m[1] + '-' + m[2] + '-' + m[3];
    return '';
  }

  function scoreNcdotCandidate(name, href, context) {
    var hay = (name + ' ' + href + ' ' + context).toLowerCase();
    var score = 0;
    var reasons = [];
    if (/\.xlsx?(?:$|[?#])/i.test(href)) {
      score += 35;
      reasons.push('spreadsheet');
    }
    if (/bid\s*tab|bidtab|xls\s+bid\s+tabs/i.test(hay)) {
      score += 45;
      reasons.push('bid tab');
    }
    if (/letting|let\s+results|award|apparent\s+low/i.test(hay)) {
      score += 10;
      reasons.push('letting/results');
    }
    var matched = ND_FENCE_TERMS.filter(function (t) { return hay.includes(t); });
    if (matched.length) {
      score += Math.min(30, matched.length * 10);
      reasons.push('fence terms: ' + matched.slice(0, 3).join(', '));
    }
    return { score: Math.min(100, score), reasons: reasons, matched: matched };
  }

  function extractNcdotCandidates(pageUrl, html) {
    var doc = parseDocument(html);
    var out = [];
    Array.prototype.slice.call(doc.querySelectorAll('a[href]')).forEach(function (a) {
      var href;
      try {
        href = new URL(a.getAttribute('href'), pageUrl).href;
      } catch (_) {
        return;
      }
      var u = normalizeOfficialNcdotUrl(href);
      if (!u) return;
      var name = (a.textContent || '').replace(/\s+/g, ' ').trim() || u.split('/').pop();
      var context = ((a.parentElement && a.parentElement.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 500);
      var isSheet = /\.xlsx?(?:$|[?#])/i.test(u);
      var likely = /bid\s*tab|xls\s+bid\s+tabs/i.test(name + ' ' + context + ' ' + u);
      if (!isSheet && !likely) return;
      var sc = scoreNcdotCandidate(name, u, context);
      out.push({
        url: u,
        name: name,
        sourcePage: pageUrl,
        date: parseDateFromText(name + ' ' + u + ' ' + context),
        score: sc.score,
        reasons: sc.reasons,
        matchedTerms: sc.matched,
        selected: sc.score >= 45,
        discoveredAt: new Date().toISOString(),
        status: 'queued'
      });
    });
    return out;
  }

  function extractNcdotChildPages(pageUrl, html) {
    var doc = parseDocument(html);
    var out = [];
    Array.prototype.slice.call(doc.querySelectorAll('a[href]')).forEach(function (a) {
      var href;
      try {
        href = new URL(a.getAttribute('href'), pageUrl).href;
      } catch (_) {
        return;
      }
      var u = normalizeOfficialNcdotUrl(href);
      if (!u) return;
      var txt = ((a.textContent || '') + ' ' + u).toLowerCase();
      if (/central-letting-details\.aspx|division-letting-details\.aspx|let_date=|letting-details/.test(txt)) out.push(u);
    });
    return Array.from(new Set(out));
  }

  function scoreDivisionEndpointCandidate(c) {
    var t = (c.url + ' ' + c.type + ' ' + c.evidence).toLowerCase();
    var score = 0;
    if (c.type === 'iframe') score += 50;
    if (/division/.test(t)) score += 25;
    if (/letting|contract/.test(t)) score += 15;
    if (/bid|award|tab/.test(t)) score += 10;
    if (/_api|service|feed|json|ashx|asmx|listdata/.test(t)) score += 20;
    if (/\.js(?:\?|$)/.test(t)) score -= 15;
    if (/default\.aspx|division\.aspx$/i.test(c.url)) score -= 20;
    return score;
  }

  return {
    ND_ALLOWED_HOST: ND_ALLOWED_HOST,
    ND_FENCE_TERMS: ND_FENCE_TERMS,
    normalizeOfficialNcdotUrl: normalizeOfficialNcdotUrl,
    parseDateFromText: parseDateFromText,
    scoreNcdotCandidate: scoreNcdotCandidate,
    extractNcdotCandidates: extractNcdotCandidates,
    extractNcdotChildPages: extractNcdotChildPages,
    scoreDivisionEndpointCandidate: scoreDivisionEndpointCandidate
  };
});
