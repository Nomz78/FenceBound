/* ============================================================================
 * FenceScraper — Benchmark View data layer (TD-020)
 * ----------------------------------------------------------------------------
 * A benchmark row has TWO price bases behind one shape:
 *   • observed-market  (NCDOT)  — real bidder unit prices from the bid-tab
 *                                 parser. Deterministic, available today.
 *   • published-reference (RSMeans) — licensed cost data, ABSENT until the
 *                                 license is active. Ships as a dataset adapter
 *                                 over an empty store: reports available:false
 *                                 and never fabricates a price.
 * Both providers align on a CSI MasterFormat code so RSMeans lines drop into a
 * structure already wired to observed items when the license lands.
 *
 * Consistent with ADR-008/ADR-013: the reference provider is optional; its
 * absence renders a labeled empty state and disables nothing.
 * ==========================================================================*/

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Benchmark = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── CSI MasterFormat crosswalk (TD-020) ────────────────────────────────────
  // Maps NCDOT item descriptions → CSI MasterFormat codes. MasterFormat's
  // NUMBERING is an open standard; the RSMeans COST DATA keyed to it is what's
  // licensed. Every entry is verified:false — a working draft recalled from
  // reference, NOT yet confirmed against an official MasterFormat listing.
  // Confirm before treating any code as authoritative. Same two-tier trust
  // model as the county→division map. Rules are ordered specific → generic;
  // first match wins, so "safety fence" / "silt fence" resolve before the
  // generic fence fallback.
  var CSI_RULES = [
    [/\bchain\s*link\b/i,                            '32 31 13', 'Chain Link Fences and Gates'],
    [/\b(ornamental|decorative)\b/i,                 '32 31 19', 'Decorative Metal Fences and Gates'],
    [/\bwoven\s*wire\b|\bwire fence\b|\bbarbed\b/i,   '32 31 26', 'Wire Fences and Gates'],
    [/\bwood(en)?\s*fence\b/i,                        '32 31 29', 'Wood Fences and Gates'],
    [/\bguard\s*rail\b|\bguardrail\b|\bguide\s*rail\b|\bguiderail\b/i, '34 71 13', 'Vehicle Barriers'],
    [/\bsilt fence\b/i,                              '31 25 00', 'Erosion and Sedimentation Controls'],
    [/\bsafety fence\b/i,                            '01 56 26', 'Temporary Fencing'],
    [/\bfenc(e|ing)\b/i,                             '32 31 00', 'Fences and Gates'] // generic fallback
  ];

  function crosswalkCSI(itemDesc) {
    var t = String(itemDesc || '');
    for (var i = 0; i < CSI_RULES.length; i++) {
      if (CSI_RULES[i][0].test(t)) {
        return { csiCode: CSI_RULES[i][1], csiTitle: CSI_RULES[i][2],
                 verified: false, matched: true };
      }
    }
    return { csiCode: null, csiTitle: null, verified: false, matched: false };
  }

  // ── Stats over a price list ─────────────────────────────────────────────────
  function stats(prices) {
    var xs = [];
    for (var i = 0; i < prices.length; i++) {
      var p = prices[i];
      if (typeof p === 'number' && isFinite(p)) xs.push(p);
    }
    if (!xs.length) return null;
    xs.sort(function (a, b) { return a - b; });
    var n = xs.length, mid = Math.floor(n / 2);
    var median = (n % 2) ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
    var sum = 0;
    for (var k = 0; k < n; k++) sum += xs[k];
    return { low: xs[0], high: xs[n - 1], median: median, mean: sum / n, n: n };
  }

  // ── Provider 1: ObservedMarket (real, deterministic) ────────────────────────
  // Pools bidder unit prices from parser `records`, keyed by (itemDesc | unit)
  // so EA and LF of the same item never merge. Attaches the CSI crosswalk.
  function observedMarket(records, opts) {
    opts = opts || {};
    var asOf = opts.asOf || new Date().toISOString();
    var groups = Object.create(null), order = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i] || {};
      if (r.unitPrice == null || !isFinite(r.unitPrice)) continue;
      var desc = String(r.itemDesc || '').trim();
      var unit = String(r.unit || '').trim();
      if (!desc) continue;
      var key = desc.toUpperCase() + '|' + unit.toUpperCase();
      var g = groups[key];
      if (!g) { g = groups[key] = { desc: desc, unit: unit, prices: [], items: Object.create(null) }; order.push(key); }
      g.prices.push(r.unitPrice);
      g.items[String(r.contract) + '|' + String(r.lineNo)] = 1;
    }
    var out = [];
    for (var o = 0; o < order.length; o++) {
      var gg = groups[order[o]];
      var st = stats(gg.prices);
      if (!st) continue; // never emit a stat block with zero observations
      var cw = crosswalkCSI(gg.desc);
      out.push({
        basis: 'observed-market', source: 'NCDOT',
        benchKey: order[o], itemDesc: gg.desc, unit: gg.unit,
        csiCode: cw.csiCode, csiTitle: cw.csiTitle, csiVerified: cw.verified,
        available: true,
        low: st.low, median: st.median, high: st.high, mean: st.mean,
        n: st.n, nItems: Object.keys(gg.items).length,
        asOf: asOf
      });
    }
    return out;
  }

  // ── Provider 2: RSMeans (empty until licensed) ──────────────────────────────
  // Dataset adapter over a local store. Empty store → available:false and NO
  // price fields, ever. It is structurally incapable of returning a number
  // while unlicensed. When a licensed store is imported, lookups resolve by CSI
  // code with real low/median/high — no consumer rewiring required.
  function rsMeans(store) {
    store = store || { available: false, byCsi: {} };
    var avail = !!store.available;
    var byCsi = store.byCsi || {};
    return {
      basis: 'published-reference', source: 'RSMeans', available: avail,
      lookup: function (csiCode) {
        if (!avail)
          return { basis: 'published-reference', source: 'RSMeans', available: false, csiCode: csiCode };
        var hit = csiCode && Object.prototype.hasOwnProperty.call(byCsi, csiCode) ? byCsi[csiCode] : null;
        if (!hit)
          return { basis: 'published-reference', source: 'RSMeans', available: true, found: false, csiCode: csiCode };
        return {
          basis: 'published-reference', source: 'RSMeans', available: true, found: true, csiCode: csiCode,
          low: hit.low, median: (hit.median != null ? hit.median : null), high: hit.high,
          unit: hit.unit, asOf: hit.asOf
        };
      }
    };
  }

  // ── View-model builder ──────────────────────────────────────────────────────
  // One row per observed item; each provider is either stats or a labeled
  // empty state. opts.rsmeansStore is omitted/empty today → RSMeans unavailable.
  function buildBenchmark(records, opts) {
    opts = opts || {};
    var asOf = opts.asOf || new Date().toISOString();
    var observed = observedMarket(records, { asOf: asOf });
    var rs = rsMeans(opts.rsmeansStore);
    var rows = [];
    for (var i = 0; i < observed.length; i++) {
      var o = observed[i];
      rows.push({
        benchKey: o.benchKey, itemDesc: o.itemDesc, unit: o.unit,
        csiCode: o.csiCode, csiTitle: o.csiTitle, csiVerified: o.csiVerified,
        providers: {
          'observed-market': {
            available: true, source: 'NCDOT',
            low: o.low, median: o.median, high: o.high, mean: o.mean,
            n: o.n, nItems: o.nItems, asOf: o.asOf
          },
          'rsmeans': rs.lookup(o.csiCode) // available:false + no price while unlicensed
        }
      });
    }
    return {
      rows: rows,
      providers: {
        'observed-market': { available: true },
        'rsmeans': { available: rs.available }
      },
      asOf: asOf,
      report: {
        rows: rows.length,
        observedItems: observed.length,
        crosswalked: rows.filter(function (r) { return !!r.csiCode; }).length,
        uncrosswalked: rows.filter(function (r) { return !r.csiCode; }).length,
        rsmeansAvailable: rs.available
      }
    };
  }

  // ── Render helper ───────────────────────────────────────────────────────────
  // Empty state is a first-class outcome: it returns a label, NEVER "$0".
  // Any consumer must route provider cells through this so the unlicensed
  // RSMeans column can never masquerade as a real zero price.
  function formatBenchmarkCell(p, fmt) {
    fmt = fmt || function (n) { return '$' + Number(n).toFixed(2); };
    if (!p || p.available === false) return { text: 'not licensed yet', empty: true, numeric: false };
    if (p.found === false)           return { text: 'no CSI match', empty: true, numeric: false };
    if (p.low == null || p.high == null) return { text: '\u2014', empty: true, numeric: false };
    var body = (p.low === p.high) ? fmt(p.low) : fmt(p.low) + '\u2013' + fmt(p.high);
    return { text: body, empty: false, numeric: true };
  }

  return {
    crosswalkCSI: crosswalkCSI,
    observedMarket: observedMarket,
    rsMeans: rsMeans,
    buildBenchmark: buildBenchmark,
    formatBenchmarkCell: formatBenchmarkCell,
    CSI_RULES: CSI_RULES,
    stats: stats
  };
});
