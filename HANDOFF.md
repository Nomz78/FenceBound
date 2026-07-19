# FenceBound handoff

Read `SOURCE_OF_TRUTH.md` first. This Git branch contains the completed NCDOT Division Letting evidence/connector work and the consolidated approved project context needed by GPT or Claude.

## NCDOT outcome

- Classification: B, stable navigable official HTML.
- Browser/session dependency: none observed; anonymous HTTPS GETs reproduce the route.
- Primary proof: Division 12, letting 2026-07-14, contract `DL00386`, WBS `44858.3.13`, including official award and bid-tab artifacts.
- Independent proof: Division 10, letting 2026-07-15.
- Probe: `node scripts/probe-ncdot-division.mjs --division 12 --date 2026-07-14`.
- Evidence: `research/ncdot-division/`.
- Connector/tests: `ncdot-division-connector.js` and `test/ncdot-division-connector.test.js`.

## Verification

The handoff was gated with:

```bash
python3 data/dt-001/validate_dt001.py
node test/ncdot-division-connector.test.js
node "test bidtab.js"
node "test benchmark.js"
node "test discovery pure.js"
node "test market benchmark pure.js"
git diff --check
```

Expected totals are DT-001 validation for 18 materials/20 mappings/2 price records/3 fixtures; 11 Division connector checks; 18 bid-tab checks; 8 benchmark checks; all discovery-pure checks; and all 6 market-benchmark-pure checks.

## Claude cold-review package

Provide Claude with:

- the feature-branch commit range relative to `origin/main`;
- `git log --oneline origin/main..HEAD`;
- `git diff --stat origin/main..HEAD` and `git diff origin/main..HEAD`;
- `research/ncdot-division/`;
- `test/fixtures/ncdot-division/`;
- exact validation output;
- `SOURCE_OF_TRUTH.md` and this handoff.

Review priorities: HTML parser failure behavior, contract/project identity extraction, artifact classification, absence of credential material, and whether the isolated connector should later be surfaced in the existing FenceScraper UI. UI integration remains optional and was not mixed into this narrow implementation.

## Archive contract

The handoff ZIP is produced with `git archive`, so it contains committed source only and excludes `.git`, dependencies, caches, secrets, browser profiles, raw HAR files, and untracked/generated clutter.
