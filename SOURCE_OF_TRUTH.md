# FenceBound source-of-truth map

This repository is the transferable source of truth for FenceBound. GPT and Claude must read this file, the Engineering Bible, and current status before relying on chat memory or external working copies.

The operational session entrance is `START_HERE.md` and the read-only
`npm run session:init` command. `Docs/CURRENT_HANDOFF.md` is the sole current
handoff; dated handoffs remain reference only.

## Authority order

1. `Docs/FenceBound_Engineering_Bible_Edition_1.0.md` is the canonical, frozen Edition 1.0 specification; its matching DOCX is a publication representation.
2. `Docs/authoritative/FenceBound_Engineering_Bible_Edition_1.0_Integrated_Governance_2026-07-17.docx` is the approved integrated governance/factual-correction record that supplements the frozen base. It does not silently rewrite Edition 1.0.
3. Accepted Git source, tests, fixtures, and structured data are authoritative for implemented behavior.
4. `Docs/status/` records verified implementation status but does not amend architecture.
5. Owner decisions explicitly recorded in governance supersede recommendations while preserving the earlier record and stated grounds.

## Classification map

| Classification | Location | Rule |
| --- | --- | --- |
| Authoritative governance | `Docs/` and `Docs/authoritative/` | Read before material work; frozen meaning is not casually edited. |
| Current status | `Docs/status/` | Factual progress record; newer evidence may supersede status details. |
| Active runtime source | repository root modules and HTML applications | Current committed implementation. |
| Structured data, provisional definitions | `data/dt-001/` | Executable and validated; material definitions remain fixture-bounded/provisional where marked. |
| Research evidence | `research/` and `Docs/research/` | Supports conclusions; does not become product judgment or supplier cost. |
| Test evidence | `test/`, `fixtures/`, and root `test *.js` files | Deterministic regression evidence, not production data. |
| Reference specifications | `Docs/reference/` | Context and handoff material; defer to authoritative governance on conflict. |
| Provisional planning | `Docs/planning/` | Punchlists/budgets are not proof of implementation. |
| Execution records | `Docs/execution/` | Preserved prompts/procedures; completed results and current governance take precedence. |
| Frozen prototype | `archive/FenceboundCAD v5.3.4-embedded-project-index.html` | Forensic/private behavior reference only; no edits, releases, or business reliance. |
| Historical superseded documents | repository-root Development Bible Revisions 24/25 and Git history | Retained for provenance; not current authority. |

The completed NCDOT Division connector handoff is preserved at
`Docs/execution/NCDOT_DIVISION_CONNECTOR_HANDOFF.md`; it is an execution record,
not an active-track declaration.

## Active source contracts

- FenceScraper v3.0 is a multi-file application: its HTML requires `fencescraper-discovery-pure.js` and `fencescraper-market-benchmark-pure.js` as siblings.
- `archive/FenceScraper v2 4.html` is retained as a historical predecessor and is not active implementation.
- NCDOT Division Letting uses the isolated `ncdot-division-connector.js` contract and `scripts/probe-ncdot-division.mjs`; it is classified as stable navigable official HTML.
- Bid tabs are market selling-price evidence, never supplier-cost evidence.
- Unknown values are allowed; hidden uncertainty is not.

## Duplicate and stale-copy policy

The Desktop `Far-Out Fencing` workspace remains external history and was not deleted or moved. Its duplicate program versions, `FenceBoun code` copies, source-refresh package, and duplicate archaeology logs are non-authoritative after this consolidation. New work belongs in this Git repository. Do not synchronize changes back by filename alone; use Git history and this authority map.

## Verification entry points

```bash
python3 data/dt-001/validate_dt001.py
node test/ncdot-division-connector.test.js
node "test bidtab.js"
node "test benchmark.js"
node "test discovery pure.js"
node "test market benchmark pure.js"
```

The clean handoff archive is generated from tracked files only after validation, so `.git`, untracked secrets, dependencies, caches, browser profiles, and generated clutter are excluded by construction.
