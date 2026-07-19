# FenceBound
FenceBound is a contractor-focused CAD and estimating platform built for the fencing industry. It transforms drawings into layouts, material takeoffs, pricing, proposals, and installation documents, reducing repetitive work while improving estimate accuracy, speed, and consistency.

Start with [`SOURCE_OF_TRUTH.md`](SOURCE_OF_TRUTH.md) for authority, file classifications, frozen assets, verification commands, and the GPT/Claude handoff contract.

## FenceScraper v3.0+ Deployment Contract

FenceScraper v3.0 and later are multi-file applications. `FenceScraper-v3.0-Validated-Market-Rate-Mapping.html` requires these sibling files with preserved relative paths:

- `fencescraper-discovery-pure.js`
- `fencescraper-market-benchmark-pure.js`

The HTML must not be copied, archived, deployed, or distributed without both sibling modules. Release/package workflows must preserve all three files together. A future build/export process may generate a standalone bundled artifact, but the canonical development source remains modular.

## NCDOT Division Letting connector

The evidence-derived Division Letting source contract is `ncdot_division_letting`. It uses stable official HTML, has no credential dependency, and remains isolated from Central discovery behavior.

```bash
node scripts/probe-ncdot-division.mjs --division 12 --date 2026-07-14
node test/ncdot-division-connector.test.js
```
