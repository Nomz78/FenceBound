/* ============================================================================
 * FenceScraper — Pure Market Benchmark Book helpers
 * ----------------------------------------------------------------------------
 * Deterministic helpers extracted from FenceScraper v3.0. No DOM access,
 * storage, downloads, rendering, or application state mutation.
 * ==========================================================================*/

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FenceScraperMarketBenchmarkPure = factory();
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  function mbNormalizeUnit(unit) {
    var u = String(unit || '').trim().toUpperCase();
    if (['LF','L.F.','LINEAR FOOT','LINEAR FEET'].includes(u)) return 'LF';
    if (['EA','EACH'].includes(u)) return 'EA';
    if (['SY','S.Y.'].includes(u)) return 'SY';
    if (['LS','L.S.','LUMP SUM'].includes(u)) return 'LS';
    return u || 'UNKNOWN';
  }

  function mbClassify(record) {
    var text = (String(record.itemDesc || '') + ' ' + String(record.itemSubDesc || '')).toLowerCase();
    var unit = mbNormalizeUnit(record.unit);
    var family = 'other';
    var subtype = 'unclassified';
    var asset = 'other';
    var scopeRole = 'unclassified';
    var excludedReason = null;
    var rateCardKey = null;
    var rateCardUse = 'unmapped';

    if (/\bsilt fence\b|\bsafety fence\b|\berosion control\b/.test(text)) {
      family = 'adjacent-scope'; subtype = /silt/.test(text) ? 'silt-fence' : 'safety-fence'; asset = 'excluded';
      scopeRole = 'excluded-adjacent'; excludedReason = 'erosion-control or safety barrier, not contractor perimeter fence';
    } else if (/\bguardrail\b|\bguiderail\b|\bguide rail\b/.test(text)) {
      family = 'adjacent-scope'; subtype = 'guardrail'; asset = 'excluded'; scopeRole = 'excluded-adjacent';
      excludedReason = 'guardrail is tracked separately from fencing';
    } else if (/\bgate\b/.test(text)) {
      family = 'gate'; asset = 'gate'; scopeRole = 'installed-assembly';
      if (/\bdouble\b|\bdual\b|\btwo[- ]leaf\b|\b2[- ]leaf\b/.test(text)) { subtype = 'double-drive'; rateCardKey = 'gate.doubledrive'; }
      else if (/\bcantilever\b/.test(text)) { subtype = 'cantilever'; rateCardKey = 'gate.cantilever'; }
      else if (/\bslide\b|\bsliding\b/.test(text)) { subtype = 'slide'; rateCardKey = 'gate.cantilever'; }
      else if (/\bwalk\b|\bpedestrian\b|\bsingle[- ]leaf\b/.test(text)) { subtype = 'walk'; rateCardKey = 'gate.walk'; }
      else subtype = 'unspecified-gate';
      rateCardUse = unit === 'EA' && rateCardKey ? 'sell-price-comparison' : 'review-required';
    } else if (/chain\s*link|chainlink/.test(text)) {
      family = 'chain-link'; asset = 'fence'; subtype = /vinyl|black/.test(text) ? 'coated' : 'galvanized-or-unspecified';
      if (unit === 'LF') { scopeRole = 'installed-assembly'; rateCardKey = 'fence.chainlink'; rateCardUse = 'sell-price-comparison'; }
      else { scopeRole = 'component'; rateCardKey = /line post/.test(text) ? 'material.line-post' : (/terminal post/.test(text) ? 'material.terminal-corner-post' : null); rateCardUse = 'component-market-evidence'; }
    } else if (/ornamental|aluminum fence|steel fence/.test(text)) {
      family = 'ornamental'; asset = 'fence'; subtype = 'panel-fence';
      if (unit === 'LF') { scopeRole = 'installed-assembly'; rateCardKey = 'fence.ornamental'; rateCardUse = 'sell-price-comparison'; } else { scopeRole = 'component'; rateCardUse = 'review-required'; }
    } else if (/woven wire|field fence|farm fence/.test(text)) {
      family = 'field-fence'; asset = 'fence'; subtype = /reset/.test(text) ? 'woven-wire-reset' : 'woven-wire-new';
      scopeRole = unit === 'LF' ? 'installed-assembly' : 'component'; rateCardKey = 'fence.cattlefield';
      rateCardUse = unit === 'LF' ? 'sell-price-comparison' : 'review-required';
    } else if (/\bbarbed\b/.test(text)) {
      family = 'field-fence'; asset = 'fence'; subtype = 'barbed-wire'; scopeRole = unit === 'LF' ? 'installed-assembly' : 'component';
      rateCardKey = 'fence.cattlefield'; rateCardUse = unit === 'LF' ? 'sell-price-comparison' : 'review-required';
    } else if (/temporary (panel|construction fence)|temp(?:orary)? fence panel/.test(text)) {
      family = 'temporary'; asset = 'fence'; subtype = 'temporary-panels'; scopeRole = unit === 'LF' || unit === 'EA' ? 'installed-assembly' : 'unclassified';
      rateCardKey = 'fence.temporary'; rateCardUse = (unit === 'LF' || unit === 'EA') ? 'sell-price-comparison' : 'review-required';
    } else if (/wooden picket fence|wood privacy fence|shadowbox|split rail/.test(text)) {
      family = 'wood'; asset = 'fence'; subtype = /shadow/.test(text) ? 'shadowbox' : (/split rail/.test(text) ? 'split-rail' : 'picket-or-privacy');
      scopeRole = unit === 'LF' ? 'installed-assembly' : 'component';
      rateCardKey = subtype === 'shadowbox' ? 'fence.woodshadowbox' : (subtype === 'split-rail' ? 'fence.woodsplit3' : 'fence.woodprivacy');
      rateCardUse = unit === 'LF' ? 'sell-price-comparison' : 'review-required';
    } else if (/vinyl fence|pvc fence/.test(text)) {
      family = 'vinyl'; asset = 'fence'; subtype = /split rail/.test(text) ? 'split-rail' : 'privacy-or-unspecified'; scopeRole = unit === 'LF' ? 'installed-assembly' : 'component';
      rateCardKey = subtype === 'split-rail' ? 'fence.vinylsplit3' : 'fence.vinylprivacy6'; rateCardUse = unit === 'LF' ? 'sell-price-comparison' : 'review-required';
    } else if (/\bfence\b|\bfencing\b/.test(text)) {
      family = 'other-fence'; asset = 'fence'; subtype = 'unspecified-fence'; scopeRole = 'unclassified'; rateCardUse = 'review-required';
    }

    var scopeQuality = 'clean-unit-price';
    var confidence = 'high';
    var bundled = false;
    if (excludedReason) { scopeQuality = 'excluded'; confidence = 'excluded'; }
    else if (unit === 'LS') { scopeQuality = 'lump-sum-only'; confidence = 'low'; bundled = true; }
    else if (!record.qty || record.qty <= 0 || record.unitPrice == null) { scopeQuality = 'incomplete'; confidence = 'low'; }
    else if (/including|complete|all necessary|miscellaneous|combination|and gate|fence and/.test(text)) { scopeQuality = 'bundled-or-partial'; confidence = 'medium'; bundled = true; }
    else if (family === 'other' || family === 'other-fence' || subtype.includes('unspecified')) confidence = 'medium';
    if (scopeRole === 'component' && confidence === 'high') confidence = 'medium';
    return {
      family: family,
      subtype: subtype,
      asset: asset,
      unit: unit,
      scopeRole: scopeRole,
      scopeQuality: scopeQuality,
      confidence: confidence,
      bundled: bundled,
      excludedReason: excludedReason,
      rateCardKey: rateCardKey,
      rateCardUse: rateCardUse,
      normalizedKey: [family, subtype, scopeRole, rateCardKey || 'unmapped', unit].join('|')
    };
  }

  function mbQuantile(sorted, q) {
    if (!sorted.length) return null;
    if (sorted.length === 1) return sorted[0];
    var p = (sorted.length - 1) * q;
    var b = Math.floor(p);
    var r = p - b;
    return sorted[b + 1] !== undefined ? sorted[b] + r * (sorted[b + 1] - sorted[b]) : sorted[b];
  }

  function mbRound(v) {
    return v == null ? null : Math.round(v * 100) / 100;
  }

  function mbBuildObservations(records, filters) {
    filters = filters || {};
    var lowOnly = filters.apparentLowOnly;
    var fenceOnly = filters.fenceOnly;
    return (records || []).filter(function (r) {
      return !lowOnly || r.apparentLowBidder;
    }).map(function (r) {
      var c = mbClassify(r);
      return Object.assign({}, r, c, { observationId: [r.source, r.let, r.contract, r.lineNo, r.bidder].join('|') });
    }).filter(function (o) {
      return !fenceOnly || (o.asset === 'fence' || o.asset === 'gate');
    }).filter(function (o) {
      return o.scopeQuality !== 'excluded';
    });
  }

  function buildMarketBenchmarkBookData(records, filters, generatedAt) {
    filters = filters || {};
    var min = Math.max(1, Number(filters.minimumSamples || 2));
    var obs = mbBuildObservations(records, filters);
    var groups = new Map();
    obs.forEach(function (o) {
      if (o.unitPrice == null || !isFinite(o.unitPrice) || o.unitPrice < 0) return;
      var g = groups.get(o.normalizedKey);
      if (!g) {
        g = [];
        groups.set(o.normalizedKey, g);
      }
      g.push(o);
    });
    var benchmarks = [];
    groups.forEach(function (rows, key) {
      if (rows.length < min) return;
      var prices = rows.map(function (r) { return Number(r.unitPrice); }).sort(function (a, b) { return a - b; });
      var q1 = mbQuantile(prices, .25);
      var med = mbQuantile(prices, .5);
      var q3 = mbQuantile(prices, .75);
      var iqr = q3 - q1;
      var clean = rows.filter(function (r) { return r.scopeQuality === 'clean-unit-price'; }).length;
      var outliers = rows.filter(function (r) { return r.unitPrice < q1 - 1.5 * iqr || r.unitPrice > q3 + 1.5 * iqr; }).length;
      var first = rows[0];
      benchmarks.push({
        benchmarkKey: key, family: first.family, subtype: first.subtype, asset: first.asset, scopeRole: first.scopeRole, unit: first.unit, rateCardKey: first.rateCardKey, rateCardUse: first.rateCardUse,
        sampleCount: rows.length, cleanSampleCount: clean, apparentLowCount: rows.filter(function (r) { return r.apparentLowBidder; }).length,
        minimum: mbRound(prices[0]), q1: mbRound(q1), median: mbRound(med), q3: mbRound(q3), maximum: mbRound(prices[prices.length - 1]),
        outlierCount: outliers, contracts: new Set(rows.map(function (r) { return r.contract; })).size, lets: new Set(rows.map(function (r) { return r.let; })).size,
        counties: Array.from(new Set(rows.map(function (r) { return r.county; }).filter(Boolean))).sort(), dateMin: rows.map(function (r) { return r.letDate; }).filter(Boolean).sort()[0] || null,
        dateMax: rows.map(function (r) { return r.letDate; }).filter(Boolean).sort().slice(-1)[0] || null,
        confidence: clean / rows.length >= .75 && rows.length >= 10 && new Set(rows.map(function (r) { return r.contract; })).size >= 3 ? 'high' : (clean / rows.length >= .5 ? 'medium' : 'low'),
        source: 'NCDOT public bid tabs', priceMeaning: 'competitor submitted unit price; not internal cost'
      });
    });
    benchmarks.sort(function (a, b) { return a.family.localeCompare(b.family) || a.subtype.localeCompare(b.subtype) || a.unit.localeCompare(b.unit); });
    return {
      schema: 'fencebound.market-benchmark-book',
      schemaVersion: '1.1',
      generatedAt: generatedAt || new Date().toISOString(),
      filters: { minimumSamples: min, apparentLowOnly: !!filters.apparentLowOnly, fenceOnly: !!filters.fenceOnly },
      benchmarks: benchmarks,
      observations: obs
    };
  }

  return {
    mbNormalizeUnit: mbNormalizeUnit,
    mbClassify: mbClassify,
    mbQuantile: mbQuantile,
    mbRound: mbRound,
    mbBuildObservations: mbBuildObservations,
    buildMarketBenchmarkBookData: buildMarketBenchmarkBookData
  };
});
