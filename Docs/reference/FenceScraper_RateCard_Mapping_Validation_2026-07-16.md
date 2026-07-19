# FenceScraper Market Benchmark → Rate Card Validation

**Date:** 2026-07-16  
**Source letting:** L260616 NCDOT XLS Bid Tabs  
**Fixture provenance:** browser-equivalent array-of-arrays generated from the uploaded workbook  
**Parser gate:** 18/18 checks passed

## Parser validation

- 2,700 raw item rows
- 1,215 unique pay items after repeated bidder-block merging
- 6,851 bidder unit-price records
- 1,485 duplicate block rows correctly folded
- No NaN quantities or prices
- Apparent-low bidder and bidder rank preserved
- Full 100-county NCDOT division mapping passed

## Classifier corrections made

1. `gate` now uses a whole-word match. It no longer matches **aggregate**.
2. Temporary silt fence and safety fence are excluded from temporary-panel benchmarks.
3. Guardrail remains adjacent intelligence but is excluded from fence sell-rate mapping.
4. Installed assemblies and individual components are separated.
5. Component groups include their Rate Card key, preventing line posts and terminal posts from being pooled together.
6. High confidence now requires observations across at least three contracts, not many bidder rows from one contract.

## Valid sell-rate comparisons from this letting

| NCDOT scope | Benchmark | Sample | Contracts | Market median | Rate Card field | Current Rate Card | Interpretation |
|---|---|---:|---:|---:|---|---:|---|
| Vinyl-coated chain-link fence, 72-inch fabric | Installed assembly / LF | 11 | 1 | $30.00/LF | `fence.chainlink` | $22.37/LF base | Useful signal, but not direct parity. NCDOT scope is 6-foot coated fabric; Rate Card baseline is 4-foot generic chain link. |
| Woven wire fence, 47-inch, new | Installed assembly / LF | 6 | 1 | $10.00/LF | `fence.cattlefield` | $8.68/LF | Reasonably close. Still only one contract and may reflect DOT requirements, mobilization, and public-work burden. |
| Woven wire fence reset | Installed assembly / LF | 6 | 1 | $14.50/LF | `fence.cattlefield` | $8.68/LF | Must remain a separate removal/reset scope. It should not overwrite new-install pricing. |
| Wooden picket fence, 36-inch | Installed assembly / LF | 2 | 1 | $48.20/LF | `fence.woodprivacy` | $42.21/LF | Weak comparison. Different height/style and only two observations. Manual review required. |

## Component evidence

The letting contains separate EA prices for vinyl-coated chain-link line posts and terminal posts. These are retained as **component market evidence**, not treated as installed fence rates or distributor costs.

## Gate result

No genuine gate pay items were found in this letting. The prior CY and TON “gate” benchmarks were false matches from words containing **aggregate** and have been eliminated.

## Confidence conclusion

This file proves the pipeline and provides several useful market signals, but it does not yet support high-confidence statewide rates. Every valid benchmark comes from one letting and one contract per scope. High confidence requires multiple contracts and preferably multiple letting dates, divisions, and agencies.

## Locked rule

Market benchmarks compare against sell prices. They never overwrite verified material costs, internal labor, overhead, or markup automatically.
