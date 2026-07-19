# FenceBound Pricing Constants — Worksheet → CAD Handoff Spec

**Doc type:** Dev Bible entry · Interface contract
**Revision:** 1.0
**Date:** 2026-07-14
**Owner:** Justin Edwards (Fencebound)
**Producer:** Overhead & Margin Worksheet (`far-out-overhead-worksheet.html`, v3)
**Consumer:** FenceboundCAD (dual-pricing engine)

---

## 1. Purpose & the one rule

The Worksheet is the **single source of truth** for two pricing constants. FenceboundCAD **consumes** them and must **never recompute** them from its own guesses. Overhead, burden, and efficiency are financial facts about the business — they belong in one place, computed once.

> **Rule:** If a number in CAD's pricing chain can be traced back to overhead, revenue, burden, or crew wages, it comes from this handoff. CAD does not re-derive it.

This keeps the two tools honest with each other and means a change to Far-Out's cost structure flows from one edit, not a hunt through two codebases.

---

## 2. The two constants

Everything else in the payload is informational. Only these two drive CAD's price.

### 2.1 `price_divisor` — how margin is held

- **Definition:** `price_divisor = 1 − gross_margin`
- **Use in CAD:** `client_price = direct_cost / price_divisor`
- **Canonical parent:** `gross_margin` (0–1). The Worksheet computes it as `overhead_rate + target_net_profit`, or carries a manual override.
- **Why hand the divisor, not the margin:** CAD multiplies/divides directly, no re-derivation, no float drift, no chance of the markup-vs-margin mistake creeping back in.
- **Valid range:** `0 < price_divisor < 1` (a divisor of 1 = zero margin; ≤ 0 = impossible).

### 2.2 `labor_rate_productive` — the real cost of an hour

- **Definition:** blended average, across crew roles, of
  `wage × (1 + labor_burden_pct) ÷ billable_efficiency`
- **Units:** USD per **productive** (billable) hour — not per paid hour.
- **Use in CAD:** `labor_cost = estimated_labor_hours × labor_rate_productive`
- **Valid range:** `> 0`.

This is the number that replaces raw wages in CAD's labor line. Costing labor at the wage is the single most common way the current estimates run low.

---

## 3. Data contract (payload schema)

Emitted as a JSON object. Field names are stable; add fields only with a version bump.

```json
{
  "schema": "fencebound.pricing_constants",
  "version": "1.0",
  "source": "overhead-margin-worksheet",
  "source_version": "v3",
  "generated_at": "2026-07-14T14:00:00Z",
  "currency": "USD",

  "gross_margin": 0.28,
  "price_divisor": 0.72,
  "markup_on_cost": 0.3889,
  "margin_provenance": "computed",

  "labor_rate_productive": 41.12,

  "overhead_rate": 0.18,
  "target_net_profit": 0.10,
  "labor_rate_paid": 26.73,
  "labor_burden_pct": 0.27,
  "billable_efficiency": 0.65
}
```

| Field | Type | Role | CAD uses for pricing? |
|---|---|---|---|
| `price_divisor` | number (0–1) | **Canonical pricing input** | **Yes** |
| `labor_rate_productive` | number (>0) | **Canonical pricing input** | **Yes** |
| `gross_margin` | number (0–1) | Parent of divisor; display/sanity check | No (verify only) |
| `markup_on_cost` | number | Convenience; display | No |
| `margin_provenance` | `"computed"` \| `"manual_override"` | Provenance flag | No (surface it) |
| `overhead_rate`, `target_net_profit` | number | Breakdown display in CAD | No |
| `labor_rate_paid`, `labor_burden_pct`, `billable_efficiency` | number | Labor breakdown display | No |
| `generated_at` | ISO 8601 | Staleness check | No |
| `source_version` | string | Compatibility | No |

---

## 4. Provenance & override semantics

The Worksheet's target margin can be **computed** (`overhead_rate + target_net_profit`) or a **manual override** set for a specific competitive/premium bid.

- The payload always carries `margin_provenance`.
- CAD **prices identically** either way — divisor is divisor.
- CAD **must surface** provenance in the UI. When `margin_provenance == "manual_override"`, show a badge (e.g. "margin: manual") so the estimator knows the standing target isn't in force. Silent overrides are how a one-off bid margin accidentally becomes the house default.

---

## 5. Where it slots into CAD's pricing engine

CAD already runs material cost → client price → live margin. The handoff feeds two points in that existing flow: the **labor line** (before direct cost is summed) and the **margin step** (the divisor).

```js
// FenceboundCAD — pricing engine. Consume PRICING_CONSTANTS; never recompute.
function priceJobLine(materialCost, laborHours, equipmentCost, PRICING) {
  const labor       = laborHours * PRICING.labor_rate_productive;   // §2.2
  const directCost  = materialCost + labor + equipmentCost;
  const clientPrice = directCost / PRICING.price_divisor;           // §2.1
  const liveMargin  = 1 - directCost / clientPrice;                 // display

  // sanity: liveMargin should equal PRICING.gross_margin within tolerance
  console.assert(Math.abs(liveMargin - PRICING.gross_margin) < 1e-6);

  return { directCost, labor, clientPrice, liveMargin };
}
```

The live-margin readout CAD already shows becomes a **verification**, not a computation: it must equal `gross_margin`. If it doesn't, the divisor was tampered with downstream — fail loudly.

---

## 6. Transport mechanism

Artifact storage is **per-tool** — the Worksheet's saved data does not automatically reach CAD. The handoff is therefore explicit, which is the right call anyway (constants change deliberately, not silently).

**Recommended (matches the Grid Ops config discipline — engine untouched, config is source of truth):**

1. **Worksheet:** add an **Export to CAD** action that emits the §3 payload (copy-to-clipboard and/or download `.json`).
2. **CAD:** a single `PRICING_CONSTANTS` config block near the top of the file — the only place these numbers live. Pasting a new payload updates config; the engine below is never hand-edited.

**Alternative:** CAD exposes a small "Import pricing constants" field that parses pasted JSON into its own `window.storage` key. Better UX, slightly more surface area to maintain.

Either way: **two numbers cross the boundary, by hand, on purpose.**

---

## 7. Validation CAD must enforce (fail loudly)

On import, before pricing anything:

- `schema == "fencebound.pricing_constants"` and `version` is compatible (same major).
- `0 < price_divisor < 1` — else refuse to price, show error.
- `labor_rate_productive > 0` — else refuse to price.
- `generated_at` within a freshness window (suggest **90 days**); older → warn, don't block. Cost structures drift; stale constants underbid.
- If `gross_margin` present, confirm `price_divisor ≈ 1 − gross_margin`; mismatch → reject payload as corrupt.

An invalid payload must **block pricing**, not silently fall back to a default. A wrong number that looks fine is worse than an obvious empty state.

---

## 8. Non-goals

- CAD does **not** compute or store overhead, burden, revenue, or efficiency. It receives their distilled output.
- The Worksheet does **not** do takeoff, material lists, or per-line job pricing. It hands over two constants and stops.
- This spec covers the **pricing constants** interface only — not estimate documents, proposals, or invoice data.

---

## 9. Open items / next steps

1. Build **Export to CAD** in the Worksheet (emit §3 payload).
2. Add the **`PRICING_CONSTANTS` config block** + import path + provenance badge to CAD.
3. Decide refresh cadence — recommend re-running the Worksheet and re-exporting **quarterly**, or immediately on any insurance/comp renewal, wage change, or overhead shift.
4. Once real invoice costs replace estimated material costs in CAD, revisit whether `labor_rate_productive` should ship **per-role** (not just blended) for mixed-crew jobs.

---

## Changelog

- **1.0 (2026-07-14):** Initial contract. Two canonical constants (`price_divisor`, `labor_rate_productive`), payload schema, provenance/override semantics, CAD integration points, transport, validation.
