/* ============================================================================
 * FenceScraper v2.4 — NCDOT Bid-Tab Parser & Competitor-Price Normalizer
 * TD-019: county→division map — all 100 NC counties, source-verified against
 *   NCDOT primary references (2026-07-13); corrected Halifax (Div 4) and
 *   Richmond (Div 8). TD-021: relevance matching uses word boundaries.
 *   Functional changes — candidate for a v2.5 version stamp in the next Bible
 *   touch.
 * ----------------------------------------------------------------------------
 * Deterministic, vendor-independent. No LLM, no network at parse time.
 * Input:  array-of-arrays (rows) exactly as produced by
 *           XLSX.utils.sheet_to_json(ws, { header: 1, raw: true })
 *         on an NCDOT "L###### XLS Bid Tabs.xls" file (Central or Division let).
 * Output: { items, records, report }
 *           - items:   one object per real line item (bidders merged across blocks)
 *           - records: one flat competitor-price row per (item × bidder)
 *           - report:  counts for the import summary (imported/merged/skipped)
 *
 * These files are HEADERLESS and FLAT: contract+project fields repeat on every
 * row, then item fields, then bidders in repeating 5-wide blocks from column 25.
 * Contracts with >3 bidders repeat their whole item list in a second/third
 * "block" (col 2 = block counter), each block carrying up to 3 more bidders.
 * The item identity is (let | contract | lineNo); bidders are UNIONED across
 * blocks. Getting this wrong double-counts jobs and drops bidders past #3.
 * ==========================================================================*/

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BidTab = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Column map (0-based indices into each row array) ──────────────────────
  var COL = {
    let: 0, block: 1, letDate: 2, letTime: 3, contractSeq: 4, contract: 5,
    wbs: 6, tip: 7, funding: 8, county: 9, projLenMi: 10, /* 11 flag */
    workType: 12, projLocation: 13, controlNumber: 14, section: 15,
    lineNo: 16, /* 17 catIdx */ category: 18, itemDesc: 19, itemSubDesc: 20,
    qty: 21, unit: 22, /* 23 unitDup */ bidderStart: 24
  };
  var BIDDER_STRIDE = 5; // [name, "CITY, ST", unitPrice, extAmount, flag]

  // ── Fence-relevance rules (extended for DOT vocabulary) ───────────────────
  // Tuned for a fence contractor: chain link / ornamental / gates score highest;
  // guardrail / guiderail / silt & safety fence are adjacent scopes worth seeing.
  var RELEVANCE_RULES = [
    ['chain link', 10], ['chainlink', 10], ['ornamental', 8], ['security gate', 8],
    ['fence', 7], ['fencing', 7], ['gate', 5], ['guardrail', 5], ['guiderail', 5],
    ['guide rail', 5], ['barbed', 5], ['woven wire', 4], ['safety fence', 4],
    ['silt fence', 3], ['32 31 00', 8], ['866', 2]
  ];
  var STRONG_FENCE = /\b(chain\s*link|chainlink|ornamental fence|woven wire|barbed wire|security gate|fence, )\b/i;

  // Word-boundary matching (TD-021): substring matching scored "gate" inside
  // "agGATEgate" etc. Each term is now matched on \b...\b boundaries so only
  // whole-word/number hits count. Terms are letters/digits/spaces, so the
  // boundaries sit at the outer edges (internal spaces match literally).
  function reEscape(x) { return String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RELEVANCE_REGEX = RELEVANCE_RULES.map(function (r) {
    return new RegExp('\\b' + reEscape(r[0]) + '\\b', 'i');
  });

  function scoreRelevance(text) {
    var t = String(text || ''), score = 0, terms = [];
    for (var i = 0; i < RELEVANCE_RULES.length; i++) {
      if (RELEVANCE_REGEX[i].test(t)) {
        score += RELEVANCE_RULES[i][1]; terms.push(RELEVANCE_RULES[i][0]);
      }
    }
    return { score: score, matchedTerms: terms };
  }

  // ── NC county → NCDOT Highway Division map (TD-019, verified) ──────────────
  // ALL 100 NC counties, source-verified against NCDOT primary references:
  //   • NCDOT "County / Division / District Guide" (connect.ncdot.gov), and
  //   • NCDOT "Division Traffic Engineer Contact Information" (upd. 2026-01-28).
  // Retrieved and reconciled 2026-07-13. Two prior recall errors were corrected
  // against the source and are called out here to prevent regressions:
  //   – HALIFAX: was Division 1 → correct Division 4.
  //   – RICHMOND: was seeded Division 10 → correct Division 8 (Div 10 home
  //     region is Anson, Cabarrus, Mecklenburg, Stanly, Union — five counties).
  // Every county below is source-verified, so divisionForCounty returns
  // verified:true for any hit. Unknown / misspelled names return
  // {division:null, verified:false} — nothing is guessed. The gate asserts full
  // 100-county coverage, no duplicate assignment, and these two corrections.
  var DIVISION_COUNTIES = {
    1:  ['BERTIE','CAMDEN','CHOWAN','CURRITUCK','DARE','GATES','HERTFORD','HYDE',
         'MARTIN','NORTHAMPTON','PASQUOTANK','PERQUIMANS','TYRRELL','WASHINGTON'],
    2:  ['BEAUFORT','CARTERET','CRAVEN','GREENE','JONES','LENOIR','PAMLICO','PITT'],
    3:  ['BRUNSWICK','DUPLIN','NEW HANOVER','ONSLOW','PENDER','SAMPSON'],
    4:  ['EDGECOMBE','HALIFAX','JOHNSTON','NASH','WAYNE','WILSON'],
    5:  ['DURHAM','FRANKLIN','GRANVILLE','PERSON','VANCE','WAKE','WARREN'],
    6:  ['BLADEN','COLUMBUS','CUMBERLAND','HARNETT','ROBESON'],
    7:  ['ALAMANCE','CASWELL','GUILFORD','ORANGE','ROCKINGHAM'],
    8:  ['CHATHAM','HOKE','LEE','MONTGOMERY','MOORE','RANDOLPH','RICHMOND','SCOTLAND'],
    9:  ['DAVIDSON','DAVIE','FORSYTH','ROWAN','STOKES'],
    10: ['ANSON','CABARRUS','MECKLENBURG','STANLY','UNION'],
    11: ['ALLEGHANY','ASHE','AVERY','CALDWELL','SURRY','WATAUGA','WILKES','YADKIN'],
    12: ['ALEXANDER','CATAWBA','CLEVELAND','GASTON','IREDELL','LINCOLN'],
    13: ['BUNCOMBE','BURKE','MADISON','MCDOWELL','MITCHELL','RUTHERFORD','YANCEY'],
    14: ['CHEROKEE','CLAY','GRAHAM','HAYWOOD','HENDERSON','JACKSON','MACON','POLK',
         'SWAIN','TRANSYLVANIA']
  };

  // Flatten division→counties into a county→division lookup. The whole table is
  // source-verified, so membership alone implies verified:true.
  var COUNTY_DIVISION = Object.create(null);
  (function () {
    var divs = Object.keys(DIVISION_COUNTIES);
    for (var d = 0; d < divs.length; d++) {
      var list = DIVISION_COUNTIES[divs[d]];
      for (var c = 0; c < list.length; c++) COUNTY_DIVISION[list[c]] = Number(divs[d]);
    }
  })();

  function divisionForCounty(county) {
    if (!county) return { division: null, verified: false };
    var key = String(county).trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(COUNTY_DIVISION, key))
      return { division: COUNTY_DIVISION[key], verified: true };
    return { division: null, verified: false };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function s(v) { return v == null ? '' : String(v).trim(); }
  function num(v) {
    if (v == null || v === '') return null;
    var n = Number(String(v).replace(/[$,\s]/g, ''));
    return isFinite(n) ? n : null;
  }
  function looksLikeLocation(v) { return typeof v === 'string' && v.indexOf(',') !== -1; }

  // Parse the repeating 5-wide bidder blocks starting at COL.bidderStart.
  function parseBidders(row) {
    var out = [], col = COL.bidderStart;
    while (col < row.length) {
      var name = row[col], loc = row[col + 1];
      if (s(name) && looksLikeLocation(loc)) {
        out.push({
          bidder: s(name),
          bidderLoc: s(loc),
          unitPrice: num(row[col + 2]),
          extAmount: num(row[col + 3])
        });
        col += BIDDER_STRIDE;
      } else break; // trailing timestamp / blanks → done
    }
    return out;
  }

  function isItemRow(row) {
    return s(row[COL.contract]) && s(row[COL.controlNumber]) &&
           s(row[COL.lineNo]) && s(row[COL.itemDesc]);
  }

  /* Main entry point.
   * opts.relevanceMin  : drop records scoring below this (default 0 = keep all)
   * opts.strongOnly    : keep only rows matching STRONG_FENCE (default false)
   * opts.retrievedAt   : ISO timestamp stamped on every record
   */
  function parseBidTab(rows, opts) {
    opts = opts || {};
    var retrievedAt = opts.retrievedAt || new Date().toISOString();
    var relevanceMin = opts.relevanceMin || 0;

    var itemMap = Object.create(null); // key -> item (bidders unioned)
    var order = [];
    var blocks = {}, itemRows = 0, skipped = 0;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r] || [];
      if (!isItemRow(row)) { skipped++; continue; }
      itemRows++;
      blocks[s(row[COL.block]) || '1'] = true;

      var let_ = s(row[COL.let]),
          contract = s(row[COL.contract]),
          lineNo = s(row[COL.lineNo]),
          key = let_ + '|' + contract + '|' + lineNo;

      var item = itemMap[key];
      if (!item) {
        var county = s(row[COL.county]);
        var dv = divisionForCounty(county);
        var descFull = [s(row[COL.itemDesc]), s(row[COL.itemSubDesc])].filter(Boolean).join(' ');
        var rel = scoreRelevance([s(row[COL.category]), descFull].join(' '));
        item = itemMap[key] = {
          source: 'NCDOT',
          let: let_, letDate: s(row[COL.letDate]), contract: contract,
          county: county, division: dv.division, divisionVerified: dv.verified,
          controlNumber: s(row[COL.controlNumber]), section: s(row[COL.section]),
          lineNo: lineNo, category: s(row[COL.category]),
          itemDesc: s(row[COL.itemDesc]), itemSubDesc: s(row[COL.itemSubDesc]),
          unit: s(row[COL.unit]), qty: num(row[COL.qty]),
          workType: s(row[COL.workType]), projLocation: s(row[COL.projLocation]),
          relevanceScore: rel.score, matchedTerms: rel.matchedTerms,
          strongFence: STRONG_FENCE.test(descFull),
          bidders: [], _seen: Object.create(null),
          retrievedAt: retrievedAt
        };
        order.push(key);
      }
      // union bidders across blocks, dedupe by bidder name
      var bs = parseBidders(row);
      for (var b = 0; b < bs.length; b++) {
        var nm = bs[b].bidder.toUpperCase();
        if (!item._seen[nm]) { item._seen[nm] = 1; item.bidders.push(bs[b]); }
      }
    }

    // finalize: rank bidders (block-1 order ≈ contract total ascending → #1 = apparent low)
    var items = [], records = [];
    for (var i = 0; i < order.length; i++) {
      var it = itemMap[order[i]];
      delete it._seen;
      it.bidderCount = it.bidders.length;
      if (it.relevanceScore < relevanceMin) continue;
      if (opts.strongOnly && !it.strongFence) continue;
      items.push(it);
      for (var j = 0; j < it.bidders.length; j++) {
        var bd = it.bidders[j];
        records.push({
          source: it.source, let: it.let, letDate: it.letDate,
          contract: it.contract, county: it.county,
          division: it.division, divisionVerified: it.divisionVerified,
          controlNumber: it.controlNumber, section: it.section, lineNo: it.lineNo,
          itemDesc: it.itemDesc, itemSubDesc: it.itemSubDesc, unit: it.unit, qty: it.qty,
          bidder: bd.bidder, bidderLoc: bd.bidderLoc,
          unitPrice: bd.unitPrice, extAmount: bd.extAmount,
          bidderRank: j + 1, apparentLowBidder: j === 0,
          relevanceScore: it.relevanceScore, matchedTerms: it.matchedTerms,
          strongFence: it.strongFence, retrievedAt: it.retrievedAt
        });
      }
    }

    return {
      items: items,
      records: records,
      report: {
        blocks: Object.keys(blocks).length,
        itemRows: itemRows,
        uniqueItems: order.length,
        mergedItems: itemRows - order.length,
        emitted: items.length,
        priceRecords: records.length,
        skippedRows: skipped
      }
    };
  }

  return {
    parseBidTab: parseBidTab,
    scoreRelevance: scoreRelevance,
    divisionForCounty: divisionForCounty,
    COL: COL, RELEVANCE_RULES: RELEVANCE_RULES,
    COUNTY_DIVISION: COUNTY_DIVISION,
    DIVISION_COUNTIES: DIVISION_COUNTIES
  };
});
